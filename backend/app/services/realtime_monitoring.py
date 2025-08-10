"""
Real-time monitoring service for A/B tests and recommendation performance.
Provides live updates, alerts, and automatic stopping conditions.
"""

import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from dataclasses import dataclass
import websockets
from collections import defaultdict

from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus
from app.models.analytics import RecommendationEvent, ABTestMetrics, EventType
from app.services.ab_testing_framework import ABTestingFramework, StatisticalAnalyzer
from app.core.celery import celery_app
from app.core.database import get_db

logger = logging.getLogger(__name__)


@dataclass
class AlertRule:
    """Alert rule configuration."""
    name: str
    condition: Callable[[Dict[str, Any]], bool]
    severity: str  # 'low', 'medium', 'high', 'critical'
    message: str
    cooldown_minutes: int = 60


@dataclass
class PerformanceAlert:
    """Performance alert."""
    rule_name: str
    test_id: int
    severity: str
    message: str
    timestamp: datetime
    data: Dict[str, Any]


class RealTimeMonitor:
    """Real-time monitoring system for A/B tests."""
    
    def __init__(self):
        self.active_monitors: Dict[int, Dict[str, Any]] = {}  # test_id -> monitor_config
        self.alert_rules: List[AlertRule] = []
        self.alert_history: List[PerformanceAlert] = []
        self.websocket_connections: Dict[str, Any] = {}
        
        self._setup_default_alert_rules()
    
    def _setup_default_alert_rules(self):
        """Setup default alert rules for A/B test monitoring."""
        
        self.alert_rules = [
            AlertRule(
                name="early_significance",
                condition=lambda data: (
                    data.get("sample_progress", 0) > 0.1 and
                    data.get("statistical_significance", False) and
                    data.get("winning_probability", 0) > 0.95
                ),
                severity="medium",
                message="Early statistical significance detected. Consider stopping test.",
                cooldown_minutes=60
            ),
            
            AlertRule(
                name="low_traffic",
                condition=lambda data: (
                    data.get("hours_running", 0) > 24 and
                    data.get("sample_progress", 0) < 0.05
                ),
                severity="high",
                message="Very low traffic detected. Test may take too long to complete.",
                cooldown_minutes=120
            ),
            
            AlertRule(
                name="conversion_rate_drop",
                condition=lambda data: (
                    data.get("hours_running", 0) > 6 and
                    all(v.get("conversion_rate", 0) < 0.01 for v in data.get("variants", []))
                ),
                severity="high",
                message="All variants showing very low conversion rates. Check implementation.",
                cooldown_minutes=30
            ),
            
            AlertRule(
                name="high_bounce_rate",
                condition=lambda data: (
                    data.get("sample_size", 0) > 100 and
                    any(v.get("bounce_rate", 0) > 0.8 for v in data.get("variants", []))
                ),
                severity="medium",
                message="High bounce rate detected in one or more variants.",
                cooldown_minutes=60
            ),
            
            AlertRule(
                name="test_duration_exceeded",
                condition=lambda data: (
                    data.get("days_running", 0) > data.get("max_duration_days", 30)
                ),
                severity="critical",
                message="Test has exceeded maximum duration. Consider stopping.",
                cooldown_minutes=1440  # 24 hours
            ),
            
            AlertRule(
                name="variant_performance_divergence",
                condition=lambda data: self._check_performance_divergence(data),
                severity="medium",
                message="Significant performance divergence between variants detected.",
                cooldown_minutes=180
            ),
            
            AlertRule(
                name="sample_ratio_imbalance",
                condition=lambda data: self._check_sample_imbalance(data),
                severity="low",
                message="Sample allocation imbalance detected between variants.",
                cooldown_minutes=120
            )
        ]
    
    def _check_performance_divergence(self, data: Dict[str, Any]) -> bool:
        """Check if variant performance is diverging significantly."""
        variants = data.get("variants", [])
        if len(variants) < 2:
            return False
        
        conversion_rates = [v.get("conversion_rate", 0) for v in variants if v.get("sample_size", 0) > 50]
        if len(conversion_rates) < 2:
            return False
        
        # Calculate coefficient of variation
        import numpy as np
        cv = np.std(conversion_rates) / np.mean(conversion_rates) if np.mean(conversion_rates) > 0 else 0
        return cv > 0.5  # 50% variation
    
    def _check_sample_imbalance(self, data: Dict[str, Any]) -> bool:
        """Check for sample allocation imbalance."""
        variants = data.get("variants", [])
        if len(variants) < 2:
            return False
        
        sample_sizes = [v.get("sample_size", 0) for v in variants]
        total_samples = sum(sample_sizes)
        
        if total_samples < 100:
            return False
        
        # Check if any variant has < 30% or > 70% of total samples
        expected_ratio = 1.0 / len(variants)
        for size in sample_sizes:
            ratio = size / total_samples
            if ratio < expected_ratio * 0.6 or ratio > expected_ratio * 1.4:
                return True
        
        return False
    
    async def start_monitoring(self, test_id: int, db: AsyncSession) -> Dict[str, Any]:
        """Start monitoring an A/B test."""
        
        # Get test details
        ab_test = await db.get(ABTest, test_id)
        if not ab_test:
            return {"error": "Test not found"}
        
        if ab_test.status != ABTestStatus.RUNNING:
            return {"error": "Test is not running"}
        
        # Setup monitoring configuration
        monitor_config = {
            "test_id": test_id,
            "started_at": datetime.utcnow(),
            "check_interval_minutes": 5,
            "alert_config": {
                "enabled": True,
                "rules": [rule.name for rule in self.alert_rules]
            },
            "auto_stop_config": {
                "enabled": ab_test.auto_stop_enabled,
                "early_stopping_threshold": ab_test.early_stopping_threshold,
                "max_duration_days": ab_test.max_duration_days
            }
        }
        
        self.active_monitors[test_id] = monitor_config
        
        # Schedule monitoring task
        celery_app.send_task(
            "monitor_ab_test_realtime",
            args=[test_id],
            countdown=300  # Start monitoring in 5 minutes
        )
        
        return {
            "success": True,
            "monitor_config": monitor_config,
            "message": f"Real-time monitoring started for test {test_id}"
        }
    
    async def stop_monitoring(self, test_id: int) -> Dict[str, Any]:
        """Stop monitoring an A/B test."""
        
        if test_id in self.active_monitors:
            del self.active_monitors[test_id]
            
            # Cancel scheduled monitoring tasks (would need task ID tracking in real implementation)
            
            return {
                "success": True,
                "message": f"Monitoring stopped for test {test_id}"
            }
        
        return {"error": "Test is not being monitored"}
    
    async def check_test_performance(self, test_id: int, db: AsyncSession) -> Dict[str, Any]:
        """Check current performance and trigger alerts if needed."""
        
        ab_framework = ABTestingFramework(db)
        
        # Get current test results
        results = await ab_framework.get_ab_test_results(test_id)
        
        if "error" in results:
            return results
        
        # Extract monitoring data
        ab_test = await db.get(ABTest, test_id)
        monitoring_data = self._extract_monitoring_data(ab_test, results)
        
        # Check alert rules
        triggered_alerts = []
        for rule in self.alert_rules:
            if rule.condition(monitoring_data):
                # Check cooldown
                if not self._is_in_cooldown(rule.name, test_id):
                    alert = PerformanceAlert(
                        rule_name=rule.name,
                        test_id=test_id,
                        severity=rule.severity,
                        message=rule.message,
                        timestamp=datetime.utcnow(),
                        data=monitoring_data
                    )
                    triggered_alerts.append(alert)
                    self.alert_history.append(alert)
        
        # Check auto-stop conditions
        auto_stop_recommendation = None
        if ab_test.auto_stop_enabled and monitoring_data.get("sample_progress", 0) > 0.1:
            early_stop = results.get("early_stop_recommendation")
            if early_stop and early_stop.get("should_stop"):
                auto_stop_recommendation = early_stop
        
        # Send real-time updates via WebSocket
        await self._send_realtime_update(test_id, {
            "test_id": test_id,
            "timestamp": datetime.utcnow().isoformat(),
            "performance_data": monitoring_data,
            "alerts": [self._alert_to_dict(alert) for alert in triggered_alerts],
            "auto_stop_recommendation": auto_stop_recommendation
        })
        
        return {
            "test_id": test_id,
            "monitoring_data": monitoring_data,
            "alerts": triggered_alerts,
            "auto_stop_recommendation": auto_stop_recommendation,
            "next_check_in": 300  # 5 minutes
        }
    
    def _extract_monitoring_data(self, ab_test: ABTest, results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract monitoring data from test results."""
        
        started_at = ab_test.started_at or datetime.utcnow()
        time_running = datetime.utcnow() - started_at
        
        stats = results.get("statistical_analysis", {})
        variants_data = results.get("variants", [])
        
        return {
            "test_id": ab_test.id,
            "status": ab_test.status,
            "hours_running": time_running.total_seconds() / 3600,
            "days_running": time_running.days,
            "max_duration_days": ab_test.max_duration_days,
            "sample_progress": stats.get("sample_progress", 0),
            "total_sample_size": stats.get("total_sample_size", 0),
            "required_sample_size": stats.get("required_sample_size", 1000),
            "statistical_significance": stats.get("overall_significance", False),
            "winning_probability": max(
                (comp.get("bayesian", {}).get("probability_variant_better", 0) 
                 for comp in stats.get("comparisons", [])),
                default=0
            ),
            "variants": [{
                "id": v["id"],
                "name": v["name"],
                "is_control": v["is_control"],
                "sample_size": v["views"],
                "conversion_rate": v["conversion_rate"],
                "bounce_rate": v["bounce_rate"],
                "conversions": v["conversions"]
            } for v in variants_data]
        }
    
    def _is_in_cooldown(self, rule_name: str, test_id: int) -> bool:
        """Check if alert rule is in cooldown period."""
        
        cooldown_rule = next((r for r in self.alert_rules if r.name == rule_name), None)
        if not cooldown_rule:
            return False
        
        # Check recent alerts for this rule and test
        cutoff_time = datetime.utcnow() - timedelta(minutes=cooldown_rule.cooldown_minutes)
        
        recent_alerts = [
            alert for alert in self.alert_history
            if (alert.rule_name == rule_name and 
                alert.test_id == test_id and 
                alert.timestamp > cutoff_time)
        ]
        
        return len(recent_alerts) > 0
    
    def _alert_to_dict(self, alert: PerformanceAlert) -> Dict[str, Any]:
        """Convert alert to dictionary for JSON serialization."""
        return {
            "rule_name": alert.rule_name,
            "test_id": alert.test_id,
            "severity": alert.severity,
            "message": alert.message,
            "timestamp": alert.timestamp.isoformat(),
            "data": alert.data
        }
    
    async def _send_realtime_update(self, test_id: int, update_data: Dict[str, Any]):
        """Send real-time update via WebSocket."""
        
        # In a real implementation, this would send to connected WebSocket clients
        logger.info(f"Real-time update for test {test_id}: {json.dumps(update_data, default=str)}")
        
        # Store latest update for clients that connect later
        self._store_latest_update(test_id, update_data)
    
    def _store_latest_update(self, test_id: int, update_data: Dict[str, Any]):
        """Store latest update for new WebSocket connections."""
        # This would typically use Redis or similar
        pass
    
    async def get_monitoring_status(self, test_id: int) -> Dict[str, Any]:
        """Get current monitoring status for a test."""
        
        if test_id not in self.active_monitors:
            return {"error": "Test is not being monitored"}
        
        monitor_config = self.active_monitors[test_id]
        recent_alerts = [
            alert for alert in self.alert_history
            if alert.test_id == test_id and 
               alert.timestamp > datetime.utcnow() - timedelta(hours=24)
        ]
        
        return {
            "test_id": test_id,
            "monitoring_active": True,
            "started_at": monitor_config["started_at"].isoformat(),
            "check_interval_minutes": monitor_config["check_interval_minutes"],
            "alert_rules_active": len(monitor_config["alert_config"]["rules"]),
            "recent_alerts": len(recent_alerts),
            "last_check": datetime.utcnow().isoformat()  # Would be actual last check time
        }
    
    async def get_alert_history(self, test_id: Optional[int] = None, hours: int = 24) -> List[Dict[str, Any]]:
        """Get alert history for monitoring."""
        
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        filtered_alerts = [
            alert for alert in self.alert_history
            if alert.timestamp > cutoff_time and (test_id is None or alert.test_id == test_id)
        ]
        
        # Sort by timestamp (most recent first)
        filtered_alerts.sort(key=lambda x: x.timestamp, reverse=True)
        
        return [self._alert_to_dict(alert) for alert in filtered_alerts]


class PerformanceDashboard:
    """Real-time performance dashboard for A/B tests."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.monitor = RealTimeMonitor()
    
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data."""
        
        # Get active tests
        active_tests_query = select(ABTest).where(ABTest.status == ABTestStatus.RUNNING)
        active_tests = (await self.db.execute(active_tests_query)).scalars().all()
        
        # Get recent completed tests
        recent_completed_query = select(ABTest).where(
            and_(
                ABTest.status == ABTestStatus.COMPLETED,
                ABTest.completed_at >= datetime.utcnow() - timedelta(days=7)
            )
        ).order_by(desc(ABTest.completed_at)).limit(10)
        
        recent_completed = (await self.db.execute(recent_completed_query)).scalars().all()
        
        # Calculate summary metrics
        total_active_tests = len(active_tests)
        total_completed_tests = len(recent_completed)
        
        # Get recent alerts
        recent_alerts = await self.monitor.get_alert_history(hours=24)
        
        # Performance metrics
        performance_metrics = await self._calculate_performance_metrics()
        
        # System health
        system_health = await self._check_system_health()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "active_tests": [{
                "id": test.id,
                "name": test.name,
                "type": test.test_type,
                "started_at": test.started_at.isoformat() if test.started_at else None,
                "variants_count": len(test.variants),
                "monitoring_active": test.id in self.monitor.active_monitors
            } for test in active_tests],
            "recent_completed_tests": [{
                "id": test.id,
                "name": test.name,
                "type": test.test_type,
                "completed_at": test.completed_at.isoformat() if test.completed_at else None,
                "winner_found": test.statistical_significance_reached,
                "duration_days": (test.completed_at - test.started_at).days if test.started_at and test.completed_at else 0
            } for test in recent_completed],
            "summary_metrics": {
                "total_active_tests": total_active_tests,
                "total_completed_last_week": total_completed_tests,
                "total_alerts_24h": len(recent_alerts),
                "high_priority_alerts": len([a for a in recent_alerts if a["severity"] in ["high", "critical"]])
            },
            "performance_metrics": performance_metrics,
            "recent_alerts": recent_alerts,
            "system_health": system_health
        }
    
    async def _calculate_performance_metrics(self) -> Dict[str, Any]:
        """Calculate overall performance metrics."""
        
        # Get recent recommendation events
        recent_date = datetime.utcnow() - timedelta(days=7)
        
        events_query = select(RecommendationEvent).where(
            RecommendationEvent.created_at >= recent_date
        )
        events = (await self.db.execute(events_query)).scalars().all()
        
        # Calculate metrics
        total_recommendations = len([e for e in events if e.event_type == EventType.RECOMMENDATION_SHOWN])
        total_clicks = len([e for e in events if e.event_type == EventType.RECOMMENDATION_CLICKED])
        total_conversions = len([e for e in events if e.event_type == EventType.CONVERSION])
        
        return {
            "total_recommendations_7d": total_recommendations,
            "total_clicks_7d": total_clicks,
            "total_conversions_7d": total_conversions,
            "overall_ctr": total_clicks / total_recommendations if total_recommendations > 0 else 0,
            "overall_cvr": total_conversions / total_clicks if total_clicks > 0 else 0,
            "recommendations_per_day": total_recommendations / 7
        }
    
    async def _check_system_health(self) -> Dict[str, Any]:
        """Check overall system health."""
        
        # Check database connectivity
        try:
            await self.db.execute(select(1))
            db_healthy = True
        except Exception:
            db_healthy = False
        
        # Check monitoring system
        monitoring_healthy = len(self.monitor.active_monitors) >= 0  # Basic check
        
        # Check for any critical alerts
        recent_critical = await self.monitor.get_alert_history(hours=1)
        critical_alerts = [a for a in recent_critical if a["severity"] == "critical"]
        
        return {
            "overall_status": "healthy" if db_healthy and monitoring_healthy and not critical_alerts else "degraded",
            "database_connection": "healthy" if db_healthy else "error",
            "monitoring_system": "healthy" if monitoring_healthy else "error",
            "critical_alerts": len(critical_alerts),
            "last_health_check": datetime.utcnow().isoformat()
        }


# Global monitor instance
realtime_monitor = RealTimeMonitor()


# Celery tasks for real-time monitoring
@celery_app.task
def monitor_ab_test_realtime(test_id: int):
    """Real-time monitoring task for A/B tests."""
    logger.info(f"Running real-time monitoring check for test {test_id}")
    
    # In a real implementation, this would:
    # 1. Get database session
    # 2. Call realtime_monitor.check_test_performance()
    # 3. Handle any alerts or auto-stop conditions
    # 4. Schedule next check
    
    # Schedule next monitoring check
    if test_id in realtime_monitor.active_monitors:
        celery_app.send_task(
            "monitor_ab_test_realtime",
            args=[test_id],
            countdown=300  # Check again in 5 minutes
        )


@celery_app.task
def cleanup_monitoring_data():
    """Clean up old monitoring data and alerts."""
    logger.info("Cleaning up old monitoring data")
    
    # Remove alerts older than 7 days
    cutoff_time = datetime.utcnow() - timedelta(days=7)
    realtime_monitor.alert_history = [
        alert for alert in realtime_monitor.alert_history
        if alert.timestamp > cutoff_time
    ]


@celery_app.task
def generate_monitoring_report():
    """Generate daily monitoring report."""
    logger.info("Generating daily monitoring report")
    # Implementation would generate and send monitoring report