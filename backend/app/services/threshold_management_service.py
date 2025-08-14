"""
Threshold Management Service for Story 3.5
One-click threshold updates with rollback capability and change impact assessment.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
import json

from app.services.sla_performance_analysis_service import SLAPerformanceAnalysisService
from app.services.sla_threshold_optimizer import SLAThresholdOptimizer, ThresholdOptimizationRecommendation

logger = logging.getLogger(__name__)


class ThresholdChangeStatus(Enum):
    """Status of threshold change operations."""
    PENDING = "pending"
    APPLIED = "applied"
    MONITORING = "monitoring"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class ChangeType(Enum):
    """Types of threshold changes."""
    OPTIMIZATION = "optimization"
    MANUAL = "manual"
    A_B_TEST = "ab_test"
    EMERGENCY = "emergency"
    ROLLBACK = "rollback"


class RollbackTrigger(Enum):
    """Rollback trigger types."""
    MANUAL = "manual"
    AUTOMATIC = "automatic"
    VIOLATION_RATE = "violation_rate"
    PERFORMANCE_DEGRADATION = "performance_degradation"
    BUSINESS_IMPACT = "business_impact"


@dataclass
class ThresholdChangeRequest:
    """Request for threshold change."""
    service_type: str
    current_threshold: float
    proposed_threshold: float
    change_type: ChangeType
    justification: str
    requested_by: str
    rollback_criteria: List[str]
    monitoring_duration_hours: int = 48
    auto_rollback_enabled: bool = True


@dataclass
class ImpactAssessment:
    """Impact assessment for threshold change."""
    expected_violation_rate_change: float
    performance_impact_estimate: float
    affected_services: List[str]
    risk_level: str  # 'low', 'medium', 'high'
    confidence_score: float
    business_impact_score: float
    rollback_feasibility: str


@dataclass
class ThresholdChangeRecord:
    """Record of threshold change with full audit trail."""
    change_id: str
    service_type: str
    previous_threshold: float
    new_threshold: float
    change_type: ChangeType
    status: ThresholdChangeStatus
    requested_by: str
    requested_at: datetime
    applied_at: Optional[datetime]
    rollback_at: Optional[datetime]
    impact_assessment: ImpactAssessment
    actual_impact: Optional[Dict[str, float]]
    rollback_criteria: List[str]
    monitoring_metrics: List[Dict[str, Any]]
    justification: str


@dataclass
class RollbackOperation:
    """Rollback operation details."""
    rollback_id: str
    original_change_id: str
    trigger: RollbackTrigger
    trigger_metrics: Dict[str, float]
    rollback_threshold: float
    executed_at: datetime
    success: bool
    impact_after_rollback: Optional[Dict[str, float]]


class ThresholdManagementService:
    """
    Service for managing SLA threshold changes with rollback capabilities.
    Provides one-click updates with comprehensive monitoring and safety features.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.performance_analysis_service = SLAPerformanceAnalysisService(db)
        self.threshold_optimizer = SLAThresholdOptimizer(db)
        
        # Change tracking
        self.active_changes: Dict[str, ThresholdChangeRecord] = {}
        self.rollback_history: List[RollbackOperation] = []
        
        # Configuration
        self.monitoring_interval_minutes = 15
        self.max_monitoring_duration_hours = 168  # 1 week
        self.violation_rate_threshold = 0.25  # 25% violation rate triggers rollback
        self.performance_degradation_threshold = 0.3  # 30% performance drop
        
        # Initialize background monitoring
        asyncio.create_task(self._start_background_monitoring())
    
    async def request_threshold_change(
        self, 
        request: ThresholdChangeRequest
    ) -> Tuple[str, ImpactAssessment]:
        """
        Request a threshold change with impact assessment.
        
        Args:
            request: Threshold change request details
            
        Returns:
            Tuple of (change_id, impact_assessment)
        """
        try:
            # Generate unique change ID
            change_id = f"tc_{int(datetime.utcnow().timestamp())}_{request.service_type}"
            
            # Perform impact assessment
            impact_assessment = await self._assess_change_impact(request)
            
            # Create change record
            change_record = ThresholdChangeRecord(
                change_id=change_id,
                service_type=request.service_type,
                previous_threshold=request.current_threshold,
                new_threshold=request.proposed_threshold,
                change_type=request.change_type,
                status=ThresholdChangeStatus.PENDING,
                requested_by=request.requested_by,
                requested_at=datetime.utcnow(),
                applied_at=None,
                rollback_at=None,
                impact_assessment=impact_assessment,
                actual_impact=None,
                rollback_criteria=request.rollback_criteria,
                monitoring_metrics=[],
                justification=request.justification
            )
            
            # Store change record
            await self._store_change_record(change_record)
            self.active_changes[change_id] = change_record
            
            logger.info(f"Threshold change requested: {change_id} for {request.service_type}")
            return change_id, impact_assessment
            
        except Exception as e:
            logger.error(f"Failed to request threshold change: {e}")
            raise
    
    async def apply_threshold_change(self, change_id: str) -> bool:
        """
        Apply approved threshold change.
        
        Args:
            change_id: ID of the change to apply
            
        Returns:
            True if change applied successfully
        """
        try:
            change_record = self.active_changes.get(change_id)
            if not change_record:
                raise ValueError(f"Change {change_id} not found")
            
            if change_record.status != ThresholdChangeStatus.PENDING:
                raise ValueError(f"Change {change_id} is not in pending status")
            
            # Apply the threshold change
            success = await self._execute_threshold_change(change_record)
            
            if success:
                # Update status and start monitoring
                change_record.status = ThresholdChangeStatus.APPLIED
                change_record.applied_at = datetime.utcnow()
                
                await self._update_change_record(change_record)
                
                # Start monitoring
                asyncio.create_task(self._monitor_threshold_change(change_id))
                
                logger.info(f"Threshold change applied: {change_id}")
                return True
            else:
                change_record.status = ThresholdChangeStatus.FAILED
                await self._update_change_record(change_record)
                return False
                
        except Exception as e:
            logger.error(f"Failed to apply threshold change {change_id}: {e}")
            return False
    
    async def rollback_threshold_change(
        self, 
        change_id: str, 
        trigger: RollbackTrigger = RollbackTrigger.MANUAL,
        trigger_metrics: Optional[Dict[str, float]] = None
    ) -> bool:
        """
        Rollback a threshold change to previous value.
        
        Args:
            change_id: ID of the change to rollback
            trigger: What triggered the rollback
            trigger_metrics: Metrics that triggered rollback
            
        Returns:
            True if rollback successful
        """
        try:
            change_record = self.active_changes.get(change_id)
            if not change_record:
                raise ValueError(f"Change {change_id} not found")
            
            if change_record.status not in [ThresholdChangeStatus.APPLIED, ThresholdChangeStatus.MONITORING]:
                raise ValueError(f"Change {change_id} cannot be rolled back from status {change_record.status}")
            
            # Generate rollback ID
            rollback_id = f"rb_{int(datetime.utcnow().timestamp())}_{change_id}"
            
            # Execute rollback
            rollback_success = await self._execute_threshold_rollback(change_record)
            
            # Record rollback operation
            rollback_operation = RollbackOperation(
                rollback_id=rollback_id,
                original_change_id=change_id,
                trigger=trigger,
                trigger_metrics=trigger_metrics or {},
                rollback_threshold=change_record.previous_threshold,
                executed_at=datetime.utcnow(),
                success=rollback_success,
                impact_after_rollback=None
            )
            
            self.rollback_history.append(rollback_operation)
            
            if rollback_success:
                change_record.status = ThresholdChangeStatus.ROLLED_BACK
                change_record.rollback_at = datetime.utcnow()
                await self._update_change_record(change_record)
                
                logger.info(f"Threshold change rolled back: {change_id} (trigger: {trigger.value})")
                return True
            else:
                logger.error(f"Failed to rollback threshold change: {change_id}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to rollback threshold change {change_id}: {e}")
            return False
    
    async def get_change_history(
        self, 
        service_type: Optional[str] = None,
        hours: int = 168
    ) -> List[ThresholdChangeRecord]:
        """Get threshold change history for analysis."""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            history = []
            for change_record in self.active_changes.values():
                if change_record.requested_at >= cutoff_time:
                    if service_type is None or change_record.service_type == service_type:
                        history.append(change_record)
            
            # Sort by request time
            history.sort(key=lambda x: x.requested_at, reverse=True)
            return history
            
        except Exception as e:
            logger.error(f"Failed to get change history: {e}")
            return []
    
    async def get_rollback_history(
        self, 
        hours: int = 168
    ) -> List[RollbackOperation]:
        """Get rollback operation history."""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            recent_rollbacks = [
                rb for rb in self.rollback_history
                if rb.executed_at >= cutoff_time
            ]
            
            recent_rollbacks.sort(key=lambda x: x.executed_at, reverse=True)
            return recent_rollbacks
            
        except Exception as e:
            logger.error(f"Failed to get rollback history: {e}")
            return []
    
    async def _assess_change_impact(self, request: ThresholdChangeRequest) -> ImpactAssessment:
        """Assess the impact of proposed threshold change."""
        try:
            # Get historical performance analysis
            performance_analysis = await self.performance_analysis_service.analyze_service_performance(
                request.service_type, analysis_period_days=30
            )
            
            # Calculate expected impact
            current_violation_rate = performance_analysis.current_thresholds.get('violation_rate', 0.1)
            
            # Estimate new violation rate using statistical model
            stats = performance_analysis.performance_statistics
            if stats.distribution_type == "normal":
                from scipy import stats as scipy_stats
                z_score = (request.proposed_threshold - stats.mean_performance) / stats.standard_deviation
                new_violation_rate = 1.0 - scipy_stats.norm.cdf(z_score)
            else:
                # Use percentile-based estimation
                if request.proposed_threshold >= stats.percentile_99:
                    new_violation_rate = 0.01
                elif request.proposed_threshold >= stats.percentile_95:
                    new_violation_rate = 0.05
                else:
                    new_violation_rate = 0.15
            
            violation_rate_change = new_violation_rate - current_violation_rate
            
            # Performance impact estimate
            threshold_ratio = request.proposed_threshold / request.current_threshold
            performance_impact = (threshold_ratio - 1.0) * 100  # Percentage change
            
            # Risk assessment
            risk_factors = []
            if abs(violation_rate_change) > 0.1:
                risk_factors.append("Large violation rate change")
            if abs(performance_impact) > 20:
                risk_factors.append("Significant performance impact")
            if performance_analysis.data_quality_score < 0.7:
                risk_factors.append("Low data quality")
            
            risk_level = "high" if len(risk_factors) >= 2 else "medium" if len(risk_factors) == 1 else "low"
            
            # Confidence score
            confidence_score = (
                performance_analysis.data_quality_score * 0.4 +
                (1.0 - abs(violation_rate_change)) * 0.3 +
                performance_analysis.patterns.trend_confidence * 0.3
            )
            
            # Business impact score
            business_impact_score = self._calculate_business_impact_score(
                violation_rate_change, performance_impact
            )
            
            # Affected services (simplified - would query dependencies in production)
            affected_services = [request.service_type]
            
            return ImpactAssessment(
                expected_violation_rate_change=float(violation_rate_change),
                performance_impact_estimate=float(performance_impact),
                affected_services=affected_services,
                risk_level=risk_level,
                confidence_score=float(confidence_score),
                business_impact_score=float(business_impact_score),
                rollback_feasibility="high"  # Assuming high feasibility for threshold changes
            )
            
        except Exception as e:
            logger.error(f"Failed to assess change impact: {e}")
            return ImpactAssessment(
                expected_violation_rate_change=0.0,
                performance_impact_estimate=0.0,
                affected_services=[request.service_type],
                risk_level="medium",
                confidence_score=0.5,
                business_impact_score=0.0,
                rollback_feasibility="medium"
            )
    
    def _calculate_business_impact_score(
        self, 
        violation_rate_change: float, 
        performance_impact: float
    ) -> float:
        """Calculate business impact score."""
        try:
            # Positive score = good for business, negative = bad
            
            # Violation rate impact (negative change is good)
            violation_impact = -violation_rate_change * 100  # Convert to percentage
            
            # Performance impact (depends on context)
            perf_impact = 0.0
            if performance_impact > 0:  # Increased threshold
                perf_impact = min(20, performance_impact * 0.5)  # Moderate positive impact
            else:  # Decreased threshold
                perf_impact = max(-30, performance_impact * 0.8)  # Higher negative impact
            
            # Combined business impact
            total_impact = violation_impact * 0.7 + perf_impact * 0.3
            
            # Normalize to [-1, 1] range
            return max(-1.0, min(1.0, total_impact / 50))
            
        except Exception as e:
            logger.error(f"Failed to calculate business impact score: {e}")
            return 0.0
    
    async def _execute_threshold_change(self, change_record: ThresholdChangeRecord) -> bool:
        """Execute the actual threshold change."""
        try:
            # In production, this would update the actual SLA monitoring configuration
            # For now, we simulate the change
            
            logger.info(f"Executing threshold change for {change_record.service_type}: "
                       f"{change_record.previous_threshold} -> {change_record.new_threshold}")
            
            # Simulate configuration update
            await asyncio.sleep(1)  # Simulate update time
            
            # Would update configuration in monitoring system
            # update_sla_configuration(change_record.service_type, change_record.new_threshold)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to execute threshold change: {e}")
            return False
    
    async def _execute_threshold_rollback(self, change_record: ThresholdChangeRecord) -> bool:
        """Execute threshold rollback to previous value."""
        try:
            logger.info(f"Rolling back threshold for {change_record.service_type}: "
                       f"{change_record.new_threshold} -> {change_record.previous_threshold}")
            
            # Simulate rollback
            await asyncio.sleep(1)
            
            # Would restore previous configuration
            # update_sla_configuration(change_record.service_type, change_record.previous_threshold)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to execute threshold rollback: {e}")
            return False
    
    async def _monitor_threshold_change(self, change_id: str):
        """Monitor threshold change and trigger rollback if needed."""
        try:
            change_record = self.active_changes.get(change_id)
            if not change_record:
                return
            
            change_record.status = ThresholdChangeStatus.MONITORING
            await self._update_change_record(change_record)
            
            monitoring_start = datetime.utcnow()
            monitoring_duration = timedelta(hours=48)  # Default 48 hours
            
            while datetime.utcnow() - monitoring_start < monitoring_duration:
                await asyncio.sleep(self.monitoring_interval_minutes * 60)
                
                # Collect current metrics
                metrics = await self._collect_monitoring_metrics(change_record.service_type)
                change_record.monitoring_metrics.append({
                    'timestamp': datetime.utcnow().isoformat(),
                    'metrics': metrics
                })
                
                # Check rollback criteria
                should_rollback, trigger = await self._check_rollback_criteria(
                    change_record, metrics
                )
                
                if should_rollback:
                    await self.rollback_threshold_change(
                        change_id, trigger, metrics
                    )
                    return
                
                # Update change record
                await self._update_change_record(change_record)
            
            # Monitoring completed successfully
            change_record.status = ThresholdChangeStatus.SUCCESS
            await self._update_change_record(change_record)
            
            logger.info(f"Threshold change monitoring completed successfully: {change_id}")
            
        except Exception as e:
            logger.error(f"Error monitoring threshold change {change_id}: {e}")
    
    async def _collect_monitoring_metrics(self, service_type: str) -> Dict[str, float]:
        """Collect current performance metrics for monitoring."""
        try:
            # In production, would query actual monitoring systems
            # For now, simulate metrics
            import random
            
            metrics = {
                'violation_rate': random.uniform(0.05, 0.25),
                'mean_response_time': random.uniform(800, 2000),
                'p95_response_time': random.uniform(1500, 3000),
                'error_rate': random.uniform(0.01, 0.1),
                'throughput': random.uniform(100, 500)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to collect monitoring metrics: {e}")
            return {}
    
    async def _check_rollback_criteria(
        self, 
        change_record: ThresholdChangeRecord, 
        current_metrics: Dict[str, float]
    ) -> Tuple[bool, RollbackTrigger]:
        """Check if rollback criteria are met."""
        try:
            # Check violation rate threshold
            violation_rate = current_metrics.get('violation_rate', 0.0)
            if violation_rate > self.violation_rate_threshold:
                return True, RollbackTrigger.VIOLATION_RATE
            
            # Check performance degradation
            if len(change_record.monitoring_metrics) > 3:
                # Compare recent metrics to baseline
                recent_metrics = change_record.monitoring_metrics[-3:]
                baseline_response_time = 1200  # Would come from historical data
                
                recent_response_times = [
                    m['metrics'].get('mean_response_time', baseline_response_time)
                    for m in recent_metrics
                ]
                avg_recent_response = sum(recent_response_times) / len(recent_response_times)
                
                performance_degradation = (avg_recent_response - baseline_response_time) / baseline_response_time
                
                if performance_degradation > self.performance_degradation_threshold:
                    return True, RollbackTrigger.PERFORMANCE_DEGRADATION
            
            # Check custom rollback criteria
            for criteria in change_record.rollback_criteria:
                if self._evaluate_custom_criteria(criteria, current_metrics):
                    return True, RollbackTrigger.AUTOMATIC
            
            return False, RollbackTrigger.MANUAL
            
        except Exception as e:
            logger.error(f"Failed to check rollback criteria: {e}")
            return False, RollbackTrigger.MANUAL
    
    def _evaluate_custom_criteria(self, criteria: str, metrics: Dict[str, float]) -> bool:
        """Evaluate custom rollback criteria."""
        try:
            # Simple criteria evaluation (in production would be more sophisticated)
            if "violation rate exceeds" in criteria.lower():
                threshold = float(criteria.split()[-1].replace('%', '')) / 100
                return metrics.get('violation_rate', 0.0) > threshold
            
            if "response time" in criteria.lower() and "exceeds" in criteria.lower():
                # Extract threshold from criteria string
                import re
                numbers = re.findall(r'\d+', criteria)
                if numbers:
                    threshold = float(numbers[0])
                    return metrics.get('mean_response_time', 0.0) > threshold
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to evaluate custom criteria: {e}")
            return False
    
    async def _start_background_monitoring(self):
        """Start background monitoring for all active changes."""
        try:
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Monitor all active changes
                active_change_ids = list(self.active_changes.keys())
                for change_id in active_change_ids:
                    change_record = self.active_changes.get(change_id)
                    if (change_record and 
                        change_record.status == ThresholdChangeStatus.MONITORING):
                        
                        # Check if monitoring should continue
                        if change_record.applied_at:
                            monitoring_duration = datetime.utcnow() - change_record.applied_at
                            if monitoring_duration > timedelta(hours=self.max_monitoring_duration_hours):
                                change_record.status = ThresholdChangeStatus.SUCCESS
                                await self._update_change_record(change_record)
                
        except Exception as e:
            logger.error(f"Error in background monitoring: {e}")
    
    # Database operations (mock implementations)
    async def _store_change_record(self, change_record: ThresholdChangeRecord):
        """Store threshold change record in database."""
        # Mock implementation
        pass
    
    async def _update_change_record(self, change_record: ThresholdChangeRecord):
        """Update threshold change record in database."""
        # Mock implementation
        pass
    
    async def get_active_changes(self) -> List[ThresholdChangeRecord]:
        """Get all currently active threshold changes."""
        return [
            change for change in self.active_changes.values()
            if change.status in [
                ThresholdChangeStatus.PENDING,
                ThresholdChangeStatus.APPLIED,
                ThresholdChangeStatus.MONITORING
            ]
        ]
    
    async def get_change_status(self, change_id: str) -> Optional[ThresholdChangeRecord]:
        """Get status of specific threshold change."""
        return self.active_changes.get(change_id)
    
    async def cancel_pending_change(self, change_id: str) -> bool:
        """Cancel a pending threshold change."""
        try:
            change_record = self.active_changes.get(change_id)
            if not change_record:
                return False
            
            if change_record.status != ThresholdChangeStatus.PENDING:
                return False
            
            change_record.status = ThresholdChangeStatus.FAILED
            await self._update_change_record(change_record)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel change {change_id}: {e}")
            return False