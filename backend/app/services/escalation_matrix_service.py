"""
Escalation Matrix Service for Story 3.6
Multi-level escalation framework with intelligent routing and timing optimization.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import json
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workflow import SLAViolation
from app.services.sla_remediation_service import RemediationExecution, RemediationStatus

logger = logging.getLogger(__name__)


class EscalationLevel(Enum):
    """Escalation levels for SLA violations."""
    LEVEL_1_AUTO = 1  # Automated self-healing
    LEVEL_2_TEAM = 2  # Team notification
    LEVEL_3_CRITICAL = 3  # Executive/critical escalation


class NotificationType(Enum):
    """Types of notifications for escalation."""
    EMAIL = "email"
    SLACK = "slack"
    SMS = "sms"
    WEBHOOK = "webhook"
    PAGERDUTY = "pagerduty"
    JIRA = "jira"


class EscalationTrigger(Enum):
    """Triggers that cause escalation."""
    REMEDIATION_TIMEOUT = "remediation_timeout"
    REMEDIATION_FAILURE = "remediation_failure"
    BUSINESS_IMPACT = "business_impact"
    REPEATED_VIOLATION = "repeated_violation"
    MANUAL_REQUEST = "manual_request"
    SEVERITY_INCREASE = "severity_increase"


@dataclass
class NotificationTarget:
    """Target for escalation notifications."""
    target_id: str
    target_type: NotificationType
    address: str  # email, phone, webhook URL, etc.
    role: str  # 'engineer', 'manager', 'executive', etc.
    business_hours_only: bool = False
    priority: int = 1  # 1 = highest priority
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EscalationCondition:
    """Condition that triggers escalation."""
    condition_type: str
    threshold_value: Any
    comparison_operator: str  # '>', '<', '==', '>=', '<=', '!='
    time_window_minutes: Optional[int] = None
    description: str = ""


@dataclass
class EscalationAction:
    """Action to perform during escalation."""
    action_id: str
    action_type: str
    description: str
    parameters: Dict[str, Any]
    timeout_seconds: int = 300
    retry_attempts: int = 3


@dataclass
class EscalationRule:
    """Complete escalation rule configuration."""
    rule_id: str
    violation_type: str
    escalation_level: EscalationLevel
    trigger_conditions: List[EscalationCondition]
    actions: List[EscalationAction]
    notification_targets: List[NotificationTarget]
    timeout_minutes: int
    approval_required: bool = False
    business_hours_only: bool = False
    cooldown_minutes: int = 60  # Prevent spam
    max_escalations_per_day: int = 10


@dataclass
class EscalationExecution:
    """Tracking of escalation execution."""
    escalation_id: str
    violation_id: str
    remediation_id: Optional[str]
    escalation_level: EscalationLevel
    trigger: EscalationTrigger
    rule_id: str
    start_time: datetime
    end_time: Optional[datetime]
    status: str  # 'pending', 'executing', 'completed', 'failed'
    notifications_sent: List[Dict[str, Any]]
    actions_completed: List[str]
    approval_received: bool = False
    approved_by: Optional[str] = None
    escalation_reason: str = ""
    business_impact_score: float = 0.0


@dataclass 
class BusinessImpactAssessment:
    """Assessment of business impact for escalation decisions."""
    impact_score: float  # 0.0 to 1.0
    affected_users: int
    revenue_impact: float
    service_criticality: str  # 'low', 'medium', 'high', 'critical'
    customer_tier: str  # 'free', 'paid', 'enterprise'
    sla_breach_risk: float
    reputation_risk: str


class IntelligentEscalationEngine:
    """
    Intelligent escalation decision engine with context-aware routing.
    Optimizes escalation timing and paths based on business impact and historical data.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.escalation_rules = self._load_escalation_rules()
        self.active_escalations: Dict[str, EscalationExecution] = {}
        self.escalation_history = []
        
        # Configuration
        self.business_hours_start = 9  # 9 AM
        self.business_hours_end = 17   # 5 PM
        self.weekend_escalation_threshold = 0.8  # Higher threshold on weekends
        
    def _load_escalation_rules(self) -> List[EscalationRule]:
        """Load escalation rules configuration."""
        return [
            # Level 1: Automated Self-Healing
            EscalationRule(
                rule_id="level1_build_time",
                violation_type="build_time",
                escalation_level=EscalationLevel.LEVEL_1_AUTO,
                trigger_conditions=[
                    EscalationCondition(
                        condition_type="violation_detected",
                        threshold_value=True,
                        comparison_operator="==",
                        description="Build time violation detected"
                    )
                ],
                actions=[
                    EscalationAction(
                        action_id="trigger_remediation",
                        action_type="automated_remediation",
                        description="Trigger automated remediation workflow",
                        parameters={"auto_approve": True, "max_risk": "low"}
                    )
                ],
                notification_targets=[],  # No notifications for Level 1
                timeout_minutes=30,
                cooldown_minutes=15
            ),
            
            # Level 2: Team Notification
            EscalationRule(
                rule_id="level2_build_time", 
                violation_type="build_time",
                escalation_level=EscalationLevel.LEVEL_2_TEAM,
                trigger_conditions=[
                    EscalationCondition(
                        condition_type="remediation_timeout",
                        threshold_value=30,
                        comparison_operator=">",
                        time_window_minutes=30,
                        description="Level 1 remediation timeout"
                    ),
                    EscalationCondition(
                        condition_type="remediation_failure",
                        threshold_value=True,
                        comparison_operator="==",
                        description="Level 1 remediation failed"
                    )
                ],
                actions=[
                    EscalationAction(
                        action_id="notify_team",
                        action_type="team_notification",
                        description="Notify engineering team",
                        parameters={"urgency": "medium", "include_context": True}
                    ),
                    EscalationAction(
                        action_id="create_incident_ticket",
                        action_type="ticket_creation", 
                        description="Create incident tracking ticket",
                        parameters={"priority": "P2", "auto_assign": True}
                    )
                ],
                notification_targets=[
                    NotificationTarget(
                        target_id="devops_team",
                        target_type=NotificationType.SLACK,
                        address="#devops-alerts",
                        role="engineer",
                        priority=1
                    ),
                    NotificationTarget(
                        target_id="on_call_engineer",
                        target_type=NotificationType.EMAIL,
                        address="oncall@company.com",
                        role="engineer",
                        priority=2
                    )
                ],
                timeout_minutes=60,
                cooldown_minutes=30
            ),
            
            # Level 3: Critical/Executive Escalation
            EscalationRule(
                rule_id="level3_critical",
                violation_type="build_time",
                escalation_level=EscalationLevel.LEVEL_3_CRITICAL,
                trigger_conditions=[
                    EscalationCondition(
                        condition_type="team_response_timeout",
                        threshold_value=60,
                        comparison_operator=">",
                        time_window_minutes=60,
                        description="No team response within 60 minutes"
                    ),
                    EscalationCondition(
                        condition_type="business_impact_high",
                        threshold_value=0.8,
                        comparison_operator=">",
                        description="High business impact detected"
                    ),
                    EscalationCondition(
                        condition_type="repeated_failures",
                        threshold_value=3,
                        comparison_operator=">=",
                        time_window_minutes=180,
                        description="Multiple failures in 3 hours"
                    )
                ],
                actions=[
                    EscalationAction(
                        action_id="critical_alert",
                        action_type="critical_notification",
                        description="Send critical alerts to leadership",
                        parameters={"severity": "critical", "exec_notification": True}
                    ),
                    EscalationAction(
                        action_id="emergency_response",
                        action_type="emergency_protocol",
                        description="Activate emergency response procedures",
                        parameters={"war_room": True, "status_page": True}
                    )
                ],
                notification_targets=[
                    NotificationTarget(
                        target_id="engineering_manager",
                        target_type=NotificationType.SMS,
                        address="+1-555-0123",
                        role="manager",
                        priority=1
                    ),
                    NotificationTarget(
                        target_id="cto",
                        target_type=NotificationType.PAGERDUTY,
                        address="cto-escalation",
                        role="executive", 
                        priority=1
                    ),
                    NotificationTarget(
                        target_id="incident_channel",
                        target_type=NotificationType.SLACK,
                        address="#incident-response",
                        role="team",
                        priority=2
                    )
                ],
                timeout_minutes=15,  # Faster response for critical
                approval_required=False,  # Emergency situations
                cooldown_minutes=120,  # Longer cooldown for critical alerts
                max_escalations_per_day=3  # Limited critical escalations
            )
        ]
    
    async def evaluate_escalation_need(self, 
                                     violation: SLAViolation,
                                     remediation: Optional[RemediationExecution] = None) -> Optional[Tuple[EscalationLevel, EscalationTrigger]]:
        """
        Evaluate if escalation is needed based on current situation.
        
        Args:
            violation: The SLA violation
            remediation: Current remediation execution if any
            
        Returns:
            Tuple of (escalation_level, trigger) if escalation needed, None otherwise
        """
        try:
            # Assess business impact
            business_impact = await self._assess_business_impact(violation)
            
            # Check for immediate Level 3 triggers (critical situations)
            level3_trigger = await self._check_level3_triggers(violation, business_impact, remediation)
            if level3_trigger:
                return (EscalationLevel.LEVEL_3_CRITICAL, level3_trigger)
            
            # Check for Level 2 triggers (team intervention needed)
            level2_trigger = await self._check_level2_triggers(violation, remediation)
            if level2_trigger:
                return (EscalationLevel.LEVEL_2_TEAM, level2_trigger)
            
            # Default to Level 1 (automated) for new violations
            if not remediation or remediation.status == RemediationStatus.PENDING:
                return (EscalationLevel.LEVEL_1_AUTO, EscalationTrigger.REMEDIATION_TIMEOUT)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to evaluate escalation need: {e}")
            return None
    
    async def _assess_business_impact(self, violation: SLAViolation) -> BusinessImpactAssessment:
        """Assess business impact of the violation."""
        try:
            # Mock business impact assessment - in production would use real metrics
            
            # Base impact on violation type and timing
            base_impact = {
                'build_time': 0.4,
                'deployment_time': 0.7,
                'pr_review_time': 0.3,
                'test_execution': 0.5,
                'agent_response': 0.8
            }.get(violation.violation_type, 0.5)
            
            # Adjust for timing
            current_hour = datetime.utcnow().hour
            is_business_hours = self.business_hours_start <= current_hour < self.business_hours_end
            is_weekend = datetime.utcnow().weekday() >= 5
            
            time_multiplier = 1.0
            if is_business_hours and not is_weekend:
                time_multiplier = 1.5  # Higher impact during business hours
            elif is_weekend:
                time_multiplier = 0.7  # Lower impact on weekends
            
            # Calculate final impact score
            impact_score = min(1.0, base_impact * time_multiplier)
            
            # Mock additional metrics
            affected_users = int(impact_score * 1000)  # Scale with impact
            revenue_impact = impact_score * 10000  # Revenue in dollars
            
            service_criticality = "critical" if impact_score > 0.8 else \
                                 "high" if impact_score > 0.6 else \
                                 "medium" if impact_score > 0.4 else "low"
            
            return BusinessImpactAssessment(
                impact_score=impact_score,
                affected_users=affected_users,
                revenue_impact=revenue_impact,
                service_criticality=service_criticality,
                customer_tier="enterprise" if impact_score > 0.7 else "paid",
                sla_breach_risk=impact_score * 0.9,
                reputation_risk=service_criticality
            )
            
        except Exception as e:
            logger.error(f"Failed to assess business impact: {e}")
            return BusinessImpactAssessment(
                impact_score=0.5, affected_users=100, revenue_impact=1000,
                service_criticality="medium", customer_tier="paid",
                sla_breach_risk=0.5, reputation_risk="medium"
            )
    
    async def _check_level3_triggers(self, 
                                   violation: SLAViolation,
                                   business_impact: BusinessImpactAssessment,
                                   remediation: Optional[RemediationExecution]) -> Optional[EscalationTrigger]:
        """Check for Level 3 (critical) escalation triggers."""
        try:
            # High business impact trigger
            if business_impact.impact_score > 0.8:
                logger.info("Level 3 trigger: High business impact")
                return EscalationTrigger.BUSINESS_IMPACT
            
            # Critical service criticality
            if business_impact.service_criticality == "critical":
                logger.info("Level 3 trigger: Critical service affected")
                return EscalationTrigger.BUSINESS_IMPACT
            
            # Multiple recent failures
            recent_violations = await self._count_recent_violations(
                violation.violation_type, hours=3
            )
            if recent_violations >= 3:
                logger.info("Level 3 trigger: Repeated violations")
                return EscalationTrigger.REPEATED_VIOLATION
            
            # Long-running unresolved violation
            if remediation:
                duration = (datetime.utcnow() - remediation.start_time).total_seconds() / 60
                if duration > 90:  # 90 minutes
                    logger.info("Level 3 trigger: Extended resolution time")
                    return EscalationTrigger.REMEDIATION_TIMEOUT
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to check Level 3 triggers: {e}")
            return None
    
    async def _check_level2_triggers(self, 
                                   violation: SLAViolation,
                                   remediation: Optional[RemediationExecution]) -> Optional[EscalationTrigger]:
        """Check for Level 2 (team) escalation triggers."""
        try:
            # Remediation failure
            if remediation and remediation.status == RemediationStatus.FAILED:
                logger.info("Level 2 trigger: Remediation failure")
                return EscalationTrigger.REMEDIATION_FAILURE
            
            # Remediation timeout
            if remediation:
                duration = (datetime.utcnow() - remediation.start_time).total_seconds() / 60
                if duration > 30:  # 30 minutes
                    logger.info("Level 2 trigger: Remediation timeout")
                    return EscalationTrigger.REMEDIATION_TIMEOUT
            
            # Severity increase
            if violation.severity == "high":
                logger.info("Level 2 trigger: High severity violation")
                return EscalationTrigger.SEVERITY_INCREASE
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to check Level 2 triggers: {e}")
            return None
    
    async def _count_recent_violations(self, violation_type: str, hours: int) -> int:
        """Count recent violations of the same type."""
        try:
            # Mock implementation - would query database in production
            import random
            return random.randint(0, 5)
        except Exception as e:
            logger.error(f"Failed to count recent violations: {e}")
            return 0
    
    async def execute_escalation(self, 
                               violation: SLAViolation,
                               escalation_level: EscalationLevel,
                               trigger: EscalationTrigger,
                               remediation: Optional[RemediationExecution] = None) -> EscalationExecution:
        """
        Execute escalation procedure for the given level.
        
        Args:
            violation: The SLA violation
            escalation_level: Level of escalation to execute
            trigger: What triggered the escalation
            remediation: Related remediation if any
            
        Returns:
            EscalationExecution tracking the escalation
        """
        try:
            escalation_id = f"esc_{int(datetime.utcnow().timestamp())}_{violation.violation_type}"
            
            # Find matching escalation rule
            escalation_rule = self._find_escalation_rule(violation.violation_type, escalation_level)
            if not escalation_rule:
                logger.warning(f"No escalation rule found for {violation.violation_type} level {escalation_level}")
                return self._create_default_escalation(escalation_id, violation, escalation_level, trigger)
            
            # Check cooldown period
            if await self._is_in_cooldown(escalation_rule):
                logger.info(f"Escalation rule {escalation_rule.rule_id} is in cooldown period")
                return self._create_cooldown_escalation(escalation_id, violation, escalation_level, trigger)
            
            # Check daily limits
            if await self._exceeds_daily_limit(escalation_rule):
                logger.warning(f"Daily escalation limit exceeded for rule {escalation_rule.rule_id}")
                return self._create_limited_escalation(escalation_id, violation, escalation_level, trigger)
            
            # Assess business impact for escalation context
            business_impact = await self._assess_business_impact(violation)
            
            # Create escalation execution
            escalation = EscalationExecution(
                escalation_id=escalation_id,
                violation_id=str(violation.id) if violation.id else "unknown",
                remediation_id=remediation.execution_id if remediation else None,
                escalation_level=escalation_level,
                trigger=trigger,
                rule_id=escalation_rule.rule_id,
                start_time=datetime.utcnow(),
                end_time=None,
                status="executing",
                notifications_sent=[],
                actions_completed=[],
                escalation_reason=self._generate_escalation_reason(trigger, business_impact),
                business_impact_score=business_impact.impact_score
            )
            
            self.active_escalations[escalation_id] = escalation
            
            # Execute escalation actions
            await self._execute_escalation_actions(escalation, escalation_rule, violation, business_impact)
            
            # Send notifications
            await self._send_escalation_notifications(escalation, escalation_rule, violation, business_impact)
            
            # Mark escalation complete
            escalation.status = "completed"
            escalation.end_time = datetime.utcnow()
            
            logger.info(f"Escalation {escalation_id} completed successfully")
            return escalation
            
        except Exception as e:
            logger.error(f"Failed to execute escalation: {e}")
            escalation_id = f"esc_error_{int(datetime.utcnow().timestamp())}"
            return self._create_error_escalation(escalation_id, violation, escalation_level, trigger, str(e))
    
    def _find_escalation_rule(self, violation_type: str, level: EscalationLevel) -> Optional[EscalationRule]:
        """Find matching escalation rule for violation type and level."""
        for rule in self.escalation_rules:
            if rule.violation_type == violation_type and rule.escalation_level == level:
                return rule
        return None
    
    async def _is_in_cooldown(self, rule: EscalationRule) -> bool:
        """Check if escalation rule is in cooldown period."""
        try:
            # Check recent escalations for this rule
            cutoff_time = datetime.utcnow() - timedelta(minutes=rule.cooldown_minutes)
            
            recent_escalations = [
                esc for esc in self.escalation_history
                if esc.rule_id == rule.rule_id and esc.start_time > cutoff_time
            ]
            
            return len(recent_escalations) > 0
            
        except Exception as e:
            logger.error(f"Failed to check cooldown: {e}")
            return False
    
    async def _exceeds_daily_limit(self, rule: EscalationRule) -> bool:
        """Check if daily escalation limit is exceeded."""
        try:
            # Count escalations today
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            today_escalations = [
                esc for esc in self.escalation_history
                if esc.rule_id == rule.rule_id and esc.start_time > today_start
            ]
            
            return len(today_escalations) >= rule.max_escalations_per_day
            
        except Exception as e:
            logger.error(f"Failed to check daily limit: {e}")
            return False
    
    def _generate_escalation_reason(self, trigger: EscalationTrigger, business_impact: BusinessImpactAssessment) -> str:
        """Generate human-readable escalation reason."""
        reason_templates = {
            EscalationTrigger.REMEDIATION_TIMEOUT: f"Automated remediation timed out after 30+ minutes. Business impact: {business_impact.service_criticality}",
            EscalationTrigger.REMEDIATION_FAILURE: f"Automated remediation failed. {business_impact.affected_users} users potentially affected",
            EscalationTrigger.BUSINESS_IMPACT: f"High business impact detected: {business_impact.impact_score:.1%} impact score, ${business_impact.revenue_impact:.0f} potential revenue impact",
            EscalationTrigger.REPEATED_VIOLATION: "Multiple violations detected in short time window, indicating systematic issue",
            EscalationTrigger.MANUAL_REQUEST: "Manual escalation requested by team member",
            EscalationTrigger.SEVERITY_INCREASE: f"Violation severity increased to {business_impact.service_criticality} level"
        }
        
        return reason_templates.get(trigger, f"Escalation triggered: {trigger.value}")
    
    async def _execute_escalation_actions(self, 
                                        escalation: EscalationExecution,
                                        rule: EscalationRule,
                                        violation: SLAViolation,
                                        business_impact: BusinessImpactAssessment):
        """Execute escalation actions defined in the rule."""
        try:
            for action in rule.actions:
                try:
                    logger.info(f"Executing escalation action: {action.action_id}")
                    
                    success = await self._execute_escalation_action(action, violation, business_impact)
                    
                    if success:
                        escalation.actions_completed.append(action.action_id)
                        logger.info(f"Escalation action {action.action_id} completed successfully")
                    else:
                        logger.warning(f"Escalation action {action.action_id} failed")
                        
                except Exception as e:
                    logger.error(f"Failed to execute escalation action {action.action_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Failed to execute escalation actions: {e}")
    
    async def _execute_escalation_action(self, 
                                       action: EscalationAction,
                                       violation: SLAViolation,
                                       business_impact: BusinessImpactAssessment) -> bool:
        """Execute a single escalation action."""
        try:
            if action.action_type == "automated_remediation":
                return await self._trigger_automated_remediation(action, violation)
            elif action.action_type == "team_notification":
                return await self._prepare_team_notification(action, violation, business_impact)
            elif action.action_type == "ticket_creation":
                return await self._create_incident_ticket(action, violation, business_impact)
            elif action.action_type == "critical_notification":
                return await self._send_critical_notification(action, violation, business_impact)
            elif action.action_type == "emergency_protocol":
                return await self._activate_emergency_protocol(action, violation, business_impact)
            else:
                logger.warning(f"Unknown escalation action type: {action.action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to execute escalation action: {e}")
            return False
    
    async def _trigger_automated_remediation(self, action: EscalationAction, violation: SLAViolation) -> bool:
        """Trigger automated remediation as escalation action."""
        try:
            # This would integrate with the SLARemediationService
            logger.info("Triggering automated remediation via escalation")
            
            # Mock remediation trigger
            await asyncio.sleep(1)
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger automated remediation: {e}")
            return False
    
    async def _prepare_team_notification(self, 
                                       action: EscalationAction,
                                       violation: SLAViolation,
                                       business_impact: BusinessImpactAssessment) -> bool:
        """Prepare team notification content."""
        try:
            urgency = action.parameters.get("urgency", "medium")
            include_context = action.parameters.get("include_context", True)
            
            logger.info(f"Preparing team notification with urgency: {urgency}")
            
            # Build notification context
            if include_context:
                context = {
                    "violation_type": violation.violation_type,
                    "business_impact": business_impact.impact_score,
                    "affected_users": business_impact.affected_users,
                    "service_criticality": business_impact.service_criticality
                }
                logger.info(f"Notification context: {context}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to prepare team notification: {e}")
            return False
    
    async def _create_incident_ticket(self, 
                                    action: EscalationAction,
                                    violation: SLAViolation,
                                    business_impact: BusinessImpactAssessment) -> bool:
        """Create incident tracking ticket."""
        try:
            priority = action.parameters.get("priority", "P2")
            auto_assign = action.parameters.get("auto_assign", True)
            
            logger.info(f"Creating incident ticket with priority: {priority}")
            
            # Mock ticket creation
            ticket_data = {
                "title": f"SLA Violation: {violation.violation_type}",
                "priority": priority,
                "business_impact": business_impact.impact_score,
                "auto_assign": auto_assign
            }
            
            # Would integrate with Jira/ServiceNow/etc.
            await asyncio.sleep(1)
            logger.info(f"Incident ticket created: {ticket_data}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to create incident ticket: {e}")
            return False
    
    async def _send_critical_notification(self, 
                                        action: EscalationAction,
                                        violation: SLAViolation,
                                        business_impact: BusinessImpactAssessment) -> bool:
        """Send critical level notifications."""
        try:
            severity = action.parameters.get("severity", "critical")
            exec_notification = action.parameters.get("exec_notification", True)
            
            logger.info(f"Sending critical notification with severity: {severity}")
            
            if exec_notification:
                logger.info("Executive notification included in critical alert")
            
            # Mock critical notification
            await asyncio.sleep(1)
            return True
            
        except Exception as e:
            logger.error(f"Failed to send critical notification: {e}")
            return False
    
    async def _activate_emergency_protocol(self, 
                                         action: EscalationAction,
                                         violation: SLAViolation,
                                         business_impact: BusinessImpactAssessment) -> bool:
        """Activate emergency response protocols."""
        try:
            war_room = action.parameters.get("war_room", False)
            status_page = action.parameters.get("status_page", False)
            
            logger.info("Activating emergency response protocols")
            
            if war_room:
                logger.info("War room activation requested")
            
            if status_page:
                logger.info("Status page update requested")
            
            # Mock emergency protocol activation
            await asyncio.sleep(2)
            return True
            
        except Exception as e:
            logger.error(f"Failed to activate emergency protocol: {e}")
            return False
    
    async def _send_escalation_notifications(self, 
                                           escalation: EscalationExecution,
                                           rule: EscalationRule,
                                           violation: SLAViolation,
                                           business_impact: BusinessImpactAssessment):
        """Send notifications to configured targets."""
        try:
            for target in rule.notification_targets:
                try:
                    # Check business hours constraint
                    if target.business_hours_only and not self._is_business_hours():
                        logger.info(f"Skipping notification to {target.target_id} - outside business hours")
                        continue
                    
                    success = await self._send_notification(target, escalation, violation, business_impact)
                    
                    notification_record = {
                        "target_id": target.target_id,
                        "target_type": target.target_type.value,
                        "address": target.address,
                        "success": success,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    escalation.notifications_sent.append(notification_record)
                    
                    if success:
                        logger.info(f"Notification sent successfully to {target.target_id}")
                    else:
                        logger.warning(f"Failed to send notification to {target.target_id}")
                        
                except Exception as e:
                    logger.error(f"Failed to send notification to {target.target_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Failed to send escalation notifications: {e}")
    
    async def _send_notification(self, 
                               target: NotificationTarget,
                               escalation: EscalationExecution,
                               violation: SLAViolation,
                               business_impact: BusinessImpactAssessment) -> bool:
        """Send notification to specific target."""
        try:
            message = self._build_notification_message(escalation, violation, business_impact, target)
            
            if target.target_type == NotificationType.EMAIL:
                return await self._send_email_notification(target.address, message)
            elif target.target_type == NotificationType.SLACK:
                return await self._send_slack_notification(target.address, message)
            elif target.target_type == NotificationType.SMS:
                return await self._send_sms_notification(target.address, message)
            elif target.target_type == NotificationType.WEBHOOK:
                return await self._send_webhook_notification(target.address, message)
            elif target.target_type == NotificationType.PAGERDUTY:
                return await self._send_pagerduty_notification(target.address, message)
            else:
                logger.warning(f"Unsupported notification type: {target.target_type}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False
    
    def _build_notification_message(self, 
                                   escalation: EscalationExecution,
                                   violation: SLAViolation,
                                   business_impact: BusinessImpactAssessment,
                                   target: NotificationTarget) -> Dict[str, Any]:
        """Build notification message tailored to target role."""
        try:
            base_message = {
                "escalation_id": escalation.escalation_id,
                "violation_type": violation.violation_type,
                "escalation_level": escalation.escalation_level.value,
                "trigger": escalation.trigger.value,
                "business_impact_score": business_impact.impact_score,
                "timestamp": escalation.start_time.isoformat()
            }
            
            # Customize message based on target role
            if target.role == "executive":
                base_message.update({
                    "summary": f"Critical SLA violation: {violation.violation_type}",
                    "business_impact": f"{business_impact.affected_users} users affected, ${business_impact.revenue_impact:.0f} revenue impact",
                    "action_required": escalation.escalation_reason
                })
            elif target.role == "manager":
                base_message.update({
                    "summary": f"SLA escalation requires attention: {violation.violation_type}",
                    "team_impact": f"Service criticality: {business_impact.service_criticality}",
                    "next_steps": "Team coordination required"
                })
            else:  # engineer/team
                base_message.update({
                    "summary": f"SLA violation escalated: {violation.violation_type}",
                    "technical_details": {
                        "violation_id": escalation.violation_id,
                        "remediation_id": escalation.remediation_id,
                        "actions_completed": escalation.actions_completed
                    },
                    "troubleshooting_context": escalation.escalation_reason
                })
            
            return base_message
            
        except Exception as e:
            logger.error(f"Failed to build notification message: {e}")
            return {"error": "Failed to build notification"}
    
    async def _send_email_notification(self, address: str, message: Dict[str, Any]) -> bool:
        """Send email notification."""
        try:
            logger.info(f"Sending email notification to {address}")
            # Mock email sending
            await asyncio.sleep(0.5)
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def _send_slack_notification(self, channel: str, message: Dict[str, Any]) -> bool:
        """Send Slack notification."""
        try:
            logger.info(f"Sending Slack notification to {channel}")
            # Mock Slack API call
            await asyncio.sleep(0.3)
            return True
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {e}")
            return False
    
    async def _send_sms_notification(self, phone: str, message: Dict[str, Any]) -> bool:
        """Send SMS notification."""
        try:
            logger.info(f"Sending SMS notification to {phone}")
            # Mock SMS sending
            await asyncio.sleep(0.2)
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return False
    
    async def _send_webhook_notification(self, url: str, message: Dict[str, Any]) -> bool:
        """Send webhook notification."""
        try:
            logger.info(f"Sending webhook notification to {url}")
            # Mock webhook call
            await asyncio.sleep(0.4)
            return True
        except Exception as e:
            logger.error(f"Failed to send webhook: {e}")
            return False
    
    async def _send_pagerduty_notification(self, service_key: str, message: Dict[str, Any]) -> bool:
        """Send PagerDuty notification."""
        try:
            logger.info(f"Sending PagerDuty notification to {service_key}")
            # Mock PagerDuty API call
            await asyncio.sleep(0.6)
            return True
        except Exception as e:
            logger.error(f"Failed to send PagerDuty notification: {e}")
            return False
    
    def _is_business_hours(self) -> bool:
        """Check if current time is within business hours."""
        now = datetime.utcnow()
        return (self.business_hours_start <= now.hour < self.business_hours_end and
                now.weekday() < 5)  # Monday=0, Sunday=6
    
    def _create_default_escalation(self, escalation_id: str, violation: SLAViolation, 
                                  level: EscalationLevel, trigger: EscalationTrigger) -> EscalationExecution:
        """Create default escalation when no rule found."""
        return EscalationExecution(
            escalation_id=escalation_id,
            violation_id=str(violation.id) if violation.id else "unknown",
            remediation_id=None,
            escalation_level=level,
            trigger=trigger,
            rule_id="default",
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow(),
            status="completed",
            notifications_sent=[],
            actions_completed=["default_escalation"],
            escalation_reason="No specific escalation rule found - using default behavior"
        )
    
    def _create_cooldown_escalation(self, escalation_id: str, violation: SLAViolation,
                                   level: EscalationLevel, trigger: EscalationTrigger) -> EscalationExecution:
        """Create escalation record when in cooldown period."""
        return EscalationExecution(
            escalation_id=escalation_id,
            violation_id=str(violation.id) if violation.id else "unknown",
            remediation_id=None,
            escalation_level=level,
            trigger=trigger,
            rule_id="cooldown",
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow(),
            status="skipped",
            notifications_sent=[],
            actions_completed=[],
            escalation_reason="Escalation skipped - in cooldown period"
        )
    
    def _create_limited_escalation(self, escalation_id: str, violation: SLAViolation,
                                  level: EscalationLevel, trigger: EscalationTrigger) -> EscalationExecution:
        """Create escalation record when daily limit exceeded."""
        return EscalationExecution(
            escalation_id=escalation_id,
            violation_id=str(violation.id) if violation.id else "unknown",
            remediation_id=None,
            escalation_level=level,
            trigger=trigger,
            rule_id="limited",
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow(),
            status="limited",
            notifications_sent=[],
            actions_completed=[],
            escalation_reason="Escalation limited - daily maximum reached"
        )
    
    def _create_error_escalation(self, escalation_id: str, violation: SLAViolation,
                                level: EscalationLevel, trigger: EscalationTrigger,
                                error_message: str) -> EscalationExecution:
        """Create escalation record when execution fails."""
        return EscalationExecution(
            escalation_id=escalation_id,
            violation_id=str(violation.id) if violation.id else "unknown",
            remediation_id=None,
            escalation_level=level,
            trigger=trigger,
            rule_id="error",
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow(),
            status="failed",
            notifications_sent=[],
            actions_completed=[],
            escalation_reason=f"Escalation failed: {error_message}"
        )
    
    async def get_active_escalations(self) -> List[EscalationExecution]:
        """Get all currently active escalations."""
        return [esc for esc in self.active_escalations.values() if esc.status == "executing"]
    
    async def get_escalation_history(self, hours: int = 24) -> List[EscalationExecution]:
        """Get escalation history for specified time period."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return [esc for esc in self.escalation_history if esc.start_time > cutoff_time]
    
    async def manual_escalation_override(self, escalation_id: str, action: str) -> bool:
        """Manually override or control escalation."""
        try:
            escalation = self.active_escalations.get(escalation_id)
            if not escalation:
                return False
            
            if action == "stop":
                escalation.status = "manual_override"
                escalation.end_time = datetime.utcnow()
                return True
            elif action == "approve":
                escalation.approval_received = True
                escalation.approved_by = "manual"
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to override escalation: {e}")
            return False