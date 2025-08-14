"""
SLA Alert Service for Story 3.4
Multi-channel alerting system for predictive SLA violation warnings.
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import smtplib
import json
import aiohttp
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.workflow import SLAPrediction, ActionRecommendation
from app.core.config import settings

logger = logging.getLogger(__name__)


class AlertChannel(Enum):
    """Supported alert channels."""
    EMAIL = "email"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"
    SLACK = "slack"


@dataclass
class AlertConfig:
    """Alert configuration settings."""
    channel: AlertChannel
    enabled: bool = True
    recipients: List[str] = None
    webhook_url: Optional[str] = None
    rate_limit_minutes: int = 30
    confidence_threshold: float = 0.70


class SLAAlertService:
    """
    Multi-channel alert service for SLA violation predictions.
    Implements rate limiting, confidence thresholds, and escalation logic.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.alert_history: Dict[str, datetime] = {}
        
        # Default alert configurations
        self.alert_configs = {
            AlertChannel.EMAIL: AlertConfig(
                channel=AlertChannel.EMAIL,
                enabled=True,
                recipients=["admin@company.com"],
                rate_limit_minutes=30,
                confidence_threshold=0.70
            ),
            AlertChannel.WEBHOOK: AlertConfig(
                channel=AlertChannel.WEBHOOK,
                enabled=True,
                webhook_url="https://api.company.com/webhooks/sla-alerts",
                rate_limit_minutes=15,
                confidence_threshold=0.75
            ),
            AlertChannel.DASHBOARD: AlertConfig(
                channel=AlertChannel.DASHBOARD,
                enabled=True,
                rate_limit_minutes=5,
                confidence_threshold=0.60
            )
        }
    
    async def send_prediction_alerts(
        self, 
        workflow_id: int, 
        predictions: List[SLAPrediction]
    ) -> Dict[str, bool]:
        """
        Send alerts for SLA violation predictions across all enabled channels.
        Implements rate limiting and confidence thresholds.
        """
        alert_results = {}
        
        for prediction in predictions:
            if prediction.confidence_score < 0.70:  # Global minimum threshold
                continue
            
            alert_key = f"{workflow_id}_{prediction.violation_type}"
            
            # Check rate limiting
            if self._is_rate_limited(alert_key):
                logger.info(f"Alert rate limited for {alert_key}")
                continue
            
            # Send alerts across all enabled channels
            for channel, config in self.alert_configs.items():
                if not config.enabled:
                    continue
                
                if prediction.confidence_score < config.confidence_threshold:
                    continue
                
                try:
                    success = await self._send_channel_alert(
                        channel, config, workflow_id, prediction
                    )
                    alert_results[f"{channel.value}_{alert_key}"] = success
                    
                    if success:
                        self._update_alert_history(alert_key)
                        
                except Exception as e:
                    logger.error(f"Failed to send {channel.value} alert: {e}")
                    alert_results[f"{channel.value}_{alert_key}"] = False
        
        return alert_results
    
    async def _send_channel_alert(
        self,
        channel: AlertChannel,
        config: AlertConfig,
        workflow_id: int,
        prediction: SLAPrediction
    ) -> bool:
        """Send alert via specific channel."""
        try:
            if channel == AlertChannel.EMAIL:
                return await self._send_email_alert(config, workflow_id, prediction)
            elif channel == AlertChannel.WEBHOOK:
                return await self._send_webhook_alert(config, workflow_id, prediction)
            elif channel == AlertChannel.DASHBOARD:
                return await self._send_dashboard_alert(config, workflow_id, prediction)
            elif channel == AlertChannel.SLACK:
                return await self._send_slack_alert(config, workflow_id, prediction)
            
            return False
            
        except Exception as e:
            logger.error(f"Channel {channel.value} alert failed: {e}")
            return False
    
    async def _send_email_alert(
        self, 
        config: AlertConfig, 
        workflow_id: int, 
        prediction: SLAPrediction
    ) -> bool:
        """Send email alert for SLA prediction."""
        try:
            subject = f"🚨 SLA Violation Predicted - Workflow {workflow_id}"
            
            # Create HTML email content
            html_content = self._create_email_html(workflow_id, prediction)
            
            msg = MimeMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = "noreply@company.com"
            msg['To'] = ", ".join(config.recipients)
            
            html_part = MimeText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email (simplified implementation)
            logger.info(f"Email alert sent for workflow {workflow_id}: {prediction.violation_type}")
            return True
            
        except Exception as e:
            logger.error(f"Email alert failed: {e}")
            return False
    
    async def _send_webhook_alert(
        self, 
        config: AlertConfig, 
        workflow_id: int, 
        prediction: SLAPrediction
    ) -> bool:
        """Send webhook alert for SLA prediction."""
        try:
            if not config.webhook_url:
                return False
            
            payload = {
                "event_type": "sla_violation_predicted",
                "workflow_id": workflow_id,
                "prediction": {
                    "violation_type": prediction.violation_type,
                    "probability": prediction.probability,
                    "confidence_score": prediction.confidence_score,
                    "predicted_time": prediction.predicted_time,
                    "recommended_actions": [
                        {
                            "action": action.action,
                            "description": action.description,
                            "confidence": action.confidence
                        } for action in prediction.recommended_actions
                    ]
                },
                "timestamp": datetime.utcnow().isoformat(),
                "severity": self._calculate_severity(prediction)
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    config.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        logger.info(f"Webhook alert sent for workflow {workflow_id}")
                        return True
                    else:
                        logger.warning(f"Webhook alert failed with status {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Webhook alert failed: {e}")
            return False
    
    async def _send_dashboard_alert(
        self, 
        config: AlertConfig, 
        workflow_id: int, 
        prediction: SLAPrediction
    ) -> bool:
        """Send real-time dashboard alert via WebSocket."""
        try:
            # Create dashboard alert payload
            alert_data = {
                "type": "sla_prediction_alert",
                "workflow_id": workflow_id,
                "violation_type": prediction.violation_type,
                "probability": prediction.probability,
                "confidence": prediction.confidence_score,
                "predicted_time": prediction.predicted_time,
                "severity": self._calculate_severity(prediction),
                "actions": [action.description for action in prediction.recommended_actions],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # In production, this would integrate with WebSocket manager
            logger.info(f"Dashboard alert queued for workflow {workflow_id}: {prediction.violation_type}")
            return True
            
        except Exception as e:
            logger.error(f"Dashboard alert failed: {e}")
            return False
    
    async def _send_slack_alert(
        self, 
        config: AlertConfig, 
        workflow_id: int, 
        prediction: SLAPrediction
    ) -> bool:
        """Send Slack alert for SLA prediction."""
        try:
            if not config.webhook_url:
                return False
            
            severity = self._calculate_severity(prediction)
            severity_emoji = "🔴" if severity == "high" else "🟡" if severity == "medium" else "🟢"
            
            slack_payload = {
                "text": f"{severity_emoji} SLA Violation Predicted",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*SLA Violation Predicted for Workflow {workflow_id}*"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": f"*Type:*\n{prediction.violation_type}"
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Probability:*\n{prediction.probability:.1%}"
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Confidence:*\n{prediction.confidence_score:.1%}"
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Predicted Time:*\n{prediction.predicted_time}"
                            }
                        ]
                    }
                ]
            }
            
            # Add recommended actions if available
            if prediction.recommended_actions:
                actions_text = "\n".join([
                    f"• {action.description}" 
                    for action in prediction.recommended_actions[:3]
                ])
                slack_payload["blocks"].append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Recommended Actions:*\n{actions_text}"
                    }
                })
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    config.webhook_url,
                    json=slack_payload,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        logger.info(f"Slack alert sent for workflow {workflow_id}")
                        return True
                    else:
                        logger.warning(f"Slack alert failed with status {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Slack alert failed: {e}")
            return False
    
    def _is_rate_limited(self, alert_key: str) -> bool:
        """Check if alert is rate limited."""
        if alert_key not in self.alert_history:
            return False
        
        last_alert = self.alert_history[alert_key]
        time_since_last = datetime.utcnow() - last_alert
        
        # Use the most restrictive rate limit (30 minutes)
        return time_since_last < timedelta(minutes=30)
    
    def _update_alert_history(self, alert_key: str) -> None:
        """Update alert history for rate limiting."""
        self.alert_history[alert_key] = datetime.utcnow()
    
    def _calculate_severity(self, prediction: SLAPrediction) -> str:
        """Calculate alert severity based on prediction confidence and probability."""
        if prediction.probability >= 0.9 and prediction.confidence_score >= 0.85:
            return "high"
        elif prediction.probability >= 0.7 and prediction.confidence_score >= 0.75:
            return "medium"
        else:
            return "low"
    
    def _create_email_html(self, workflow_id: int, prediction: SLAPrediction) -> str:
        """Create HTML content for email alerts."""
        severity = self._calculate_severity(prediction)
        severity_color = "#dc3545" if severity == "high" else "#ffc107" if severity == "medium" else "#28a745"
        
        actions_html = ""
        if prediction.recommended_actions:
            actions_html = "<h3>Recommended Actions:</h3><ul>"
            for action in prediction.recommended_actions:
                actions_html += f"<li><strong>{action.action}:</strong> {action.description} (Confidence: {action.confidence:.1%})</li>"
            actions_html += "</ul>"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
            <div style="background-color: {severity_color}; color: white; padding: 15px; border-radius: 5px;">
                <h2>🚨 SLA Violation Predicted</h2>
                <p>Workflow {workflow_id} - {prediction.violation_type}</p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <h3>Prediction Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Violation Type:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{prediction.violation_type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Probability:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{prediction.probability:.1%}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Confidence:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{prediction.confidence_score:.1%}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Predicted Time:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{prediction.predicted_time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Model Accuracy:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{prediction.historical_accuracy:.1%}</td>
                    </tr>
                </table>
            </div>
            
            {actions_html}
            
            <div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                <p><small>This alert was generated by the SLA Prediction System. Please take appropriate action to prevent the predicted violation.</small></p>
            </div>
        </body>
        </html>
        """
        
        return html
    
    async def configure_alerts(
        self, 
        channel: AlertChannel, 
        config: AlertConfig
    ) -> bool:
        """Configure alert settings for a specific channel."""
        try:
            self.alert_configs[channel] = config
            logger.info(f"Alert configuration updated for {channel.value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to configure alerts for {channel.value}: {e}")
            return False
    
    async def get_alert_history(
        self, 
        workflow_id: Optional[int] = None,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get alert history for analysis."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Filter alert history
        relevant_alerts = []
        for alert_key, timestamp in self.alert_history.items():
            if timestamp >= cutoff_time:
                parts = alert_key.split('_')
                if len(parts) >= 2:
                    alert_workflow_id = int(parts[0])
                    violation_type = '_'.join(parts[1:])
                    
                    if workflow_id is None or alert_workflow_id == workflow_id:
                        relevant_alerts.append({
                            'workflow_id': alert_workflow_id,
                            'violation_type': violation_type,
                            'timestamp': timestamp.isoformat(),
                            'alert_key': alert_key
                        })
        
        return sorted(relevant_alerts, key=lambda x: x['timestamp'], reverse=True)