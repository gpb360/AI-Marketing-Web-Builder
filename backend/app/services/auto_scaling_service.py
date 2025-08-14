"""
Auto-scaling Service for Story 3.4
Capacity-aware auto-scaling with manual override capabilities.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.workflow import SLAPrediction

logger = logging.getLogger(__name__)


class ScalingAction(Enum):
    """Types of scaling actions."""
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    NO_ACTION = "no_action"


class ResourceType(Enum):
    """Types of resources that can be scaled."""
    BUILD_AGENTS = "build_agents"
    API_INSTANCES = "api_instances"
    DB_CONNECTIONS = "db_connections"
    WORKER_NODES = "worker_nodes"


@dataclass
class ScalingDecision:
    """Scaling decision with justification."""
    resource_type: ResourceType
    action: ScalingAction
    current_capacity: int
    target_capacity: int
    justification: str
    confidence: float
    execution_time: datetime
    rollback_time: Optional[datetime] = None


@dataclass
class ResourceMetrics:
    """Current resource utilization metrics."""
    resource_type: ResourceType
    current_capacity: int
    current_utilization: float
    target_utilization: float
    max_capacity: int
    min_capacity: int


class AutoScalingService:
    """
    Auto-scaling decision engine for capacity predictions.
    Implements manual override controls and rollback capabilities.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scaling_history: List[ScalingDecision] = []
        self.manual_overrides: Dict[str, bool] = {}
        
        # Resource configurations
        self.resource_configs = {
            ResourceType.BUILD_AGENTS: {
                'min_capacity': 2,
                'max_capacity': 20,
                'scale_up_threshold': 0.8,
                'scale_down_threshold': 0.3,
                'scale_factor': 1.5,
                'cooldown_minutes': 5
            },
            ResourceType.API_INSTANCES: {
                'min_capacity': 3,
                'max_capacity': 50,
                'scale_up_threshold': 0.7,
                'scale_down_threshold': 0.4,
                'scale_factor': 1.3,
                'cooldown_minutes': 10
            },
            ResourceType.DB_CONNECTIONS: {
                'min_capacity': 10,
                'max_capacity': 200,
                'scale_up_threshold': 0.85,
                'scale_down_threshold': 0.2,
                'scale_factor': 1.2,
                'cooldown_minutes': 15
            },
            ResourceType.WORKER_NODES: {
                'min_capacity': 1,
                'max_capacity': 10,
                'scale_up_threshold': 0.75,
                'scale_down_threshold': 0.25,
                'scale_factor': 2.0,
                'cooldown_minutes': 20
            }
        }
    
    async def evaluate_scaling_decisions(
        self, 
        predictions: List[SLAPrediction]
    ) -> List[ScalingDecision]:
        """
        Evaluate scaling decisions based on SLA violation predictions.
        Returns list of recommended scaling actions.
        """
        decisions = []
        
        # Get current resource metrics
        current_metrics = await self._get_current_resource_metrics()
        
        # Analyze each prediction for scaling opportunities
        for prediction in predictions:
            if prediction.confidence_score < 0.75:  # Only act on high-confidence predictions
                continue
            
            scaling_decision = await self._analyze_prediction_for_scaling(
                prediction, current_metrics
            )
            
            if scaling_decision and scaling_decision.action != ScalingAction.NO_ACTION:
                # Check manual overrides
                override_key = f"{scaling_decision.resource_type.value}_{scaling_decision.action.value}"
                if not self.manual_overrides.get(override_key, False):
                    decisions.append(scaling_decision)
                else:
                    logger.info(f"Scaling action blocked by manual override: {override_key}")
        
        return decisions
    
    async def _analyze_prediction_for_scaling(
        self, 
        prediction: SLAPrediction, 
        metrics: Dict[ResourceType, ResourceMetrics]
    ) -> Optional[ScalingDecision]:
        """Analyze individual prediction for scaling opportunities."""
        try:
            violation_type = prediction.violation_type
            
            # Map violation types to resource types
            resource_mapping = {
                'build_time': ResourceType.BUILD_AGENTS,
                'test_execution': ResourceType.WORKER_NODES,
                'deployment_time': ResourceType.API_INSTANCES,
                'agent_response': ResourceType.API_INSTANCES,
                'task_completion': ResourceType.WORKER_NODES,
                'pr_review_time': None  # Human-dependent, no auto-scaling
            }
            
            resource_type = resource_mapping.get(violation_type)
            if not resource_type:
                return None
            
            current_metric = metrics.get(resource_type)
            if not current_metric:
                return None
            
            config = self.resource_configs[resource_type]
            
            # Check if scaling is needed based on prediction probability
            if prediction.probability >= 0.8:  # High probability violation
                # Calculate target capacity
                target_capacity = min(
                    int(current_metric.current_capacity * config['scale_factor']),
                    config['max_capacity']
                )
                
                if target_capacity > current_metric.current_capacity:
                    # Check cooldown period
                    if await self._is_in_cooldown(resource_type):
                        return None
                    
                    return ScalingDecision(
                        resource_type=resource_type,
                        action=ScalingAction.SCALE_UP,
                        current_capacity=current_metric.current_capacity,
                        target_capacity=target_capacity,
                        justification=f"Predicted {violation_type} violation with {prediction.probability:.1%} probability",
                        confidence=prediction.confidence_score,
                        execution_time=datetime.utcnow() + timedelta(minutes=2),
                        rollback_time=datetime.utcnow() + timedelta(hours=2)
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to analyze prediction for scaling: {e}")
            return None
    
    async def execute_scaling_decision(
        self, 
        decision: ScalingDecision
    ) -> bool:
        """
        Execute scaling decision with monitoring and rollback capability.
        """
        try:
            # Check if manual override is active
            override_key = f"{decision.resource_type.value}_{decision.action.value}"
            if self.manual_overrides.get(override_key, False):
                logger.warning(f"Scaling execution blocked by manual override: {override_key}")
                return False
            
            # Execute scaling action
            success = await self._execute_scaling_action(decision)
            
            if success:
                # Record in scaling history
                self.scaling_history.append(decision)
                
                # Schedule rollback if specified
                if decision.rollback_time:
                    await self._schedule_rollback(decision)
                
                logger.info(f"Scaling executed: {decision.resource_type.value} "
                           f"{decision.action.value} from {decision.current_capacity} "
                           f"to {decision.target_capacity}")
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to execute scaling decision: {e}")
            return False
    
    async def _execute_scaling_action(self, decision: ScalingDecision) -> bool:
        """Execute the actual scaling action."""
        try:
            # In production, this would integrate with container orchestration
            # For now, simulate the scaling action
            
            if decision.resource_type == ResourceType.BUILD_AGENTS:
                return await self._scale_build_agents(decision)
            elif decision.resource_type == ResourceType.API_INSTANCES:
                return await self._scale_api_instances(decision)
            elif decision.resource_type == ResourceType.DB_CONNECTIONS:
                return await self._scale_db_connections(decision)
            elif decision.resource_type == ResourceType.WORKER_NODES:
                return await self._scale_worker_nodes(decision)
            
            return False
            
        except Exception as e:
            logger.error(f"Scaling action failed: {e}")
            return False
    
    async def _scale_build_agents(self, decision: ScalingDecision) -> bool:
        """Scale build agent capacity."""
        logger.info(f"Scaling build agents: {decision.current_capacity} -> {decision.target_capacity}")
        # Simulate scaling action
        await asyncio.sleep(1)
        return True
    
    async def _scale_api_instances(self, decision: ScalingDecision) -> bool:
        """Scale API instance capacity."""
        logger.info(f"Scaling API instances: {decision.current_capacity} -> {decision.target_capacity}")
        # Simulate scaling action
        await asyncio.sleep(1)
        return True
    
    async def _scale_db_connections(self, decision: ScalingDecision) -> bool:
        """Scale database connection pool."""
        logger.info(f"Scaling DB connections: {decision.current_capacity} -> {decision.target_capacity}")
        # Simulate scaling action
        await asyncio.sleep(1)
        return True
    
    async def _scale_worker_nodes(self, decision: ScalingDecision) -> bool:
        """Scale worker node capacity."""
        logger.info(f"Scaling worker nodes: {decision.current_capacity} -> {decision.target_capacity}")
        # Simulate scaling action
        await asyncio.sleep(1)
        return True
    
    async def _get_current_resource_metrics(self) -> Dict[ResourceType, ResourceMetrics]:
        """Get current resource utilization metrics."""
        # In production, would query monitoring systems
        return {
            ResourceType.BUILD_AGENTS: ResourceMetrics(
                resource_type=ResourceType.BUILD_AGENTS,
                current_capacity=5,
                current_utilization=0.75,
                target_utilization=0.7,
                max_capacity=20,
                min_capacity=2
            ),
            ResourceType.API_INSTANCES: ResourceMetrics(
                resource_type=ResourceType.API_INSTANCES,
                current_capacity=8,
                current_utilization=0.6,
                target_utilization=0.7,
                max_capacity=50,
                min_capacity=3
            ),
            ResourceType.DB_CONNECTIONS: ResourceMetrics(
                resource_type=ResourceType.DB_CONNECTIONS,
                current_capacity=50,
                current_utilization=0.4,
                target_utilization=0.6,
                max_capacity=200,
                min_capacity=10
            ),
            ResourceType.WORKER_NODES: ResourceMetrics(
                resource_type=ResourceType.WORKER_NODES,
                current_capacity=3,
                current_utilization=0.8,
                target_utilization=0.7,
                max_capacity=10,
                min_capacity=1
            )
        }
    
    async def _is_in_cooldown(self, resource_type: ResourceType) -> bool:
        """Check if resource is in cooldown period."""
        config = self.resource_configs[resource_type]
        cooldown_duration = timedelta(minutes=config['cooldown_minutes'])
        cutoff_time = datetime.utcnow() - cooldown_duration
        
        # Check recent scaling actions for this resource
        recent_actions = [
            decision for decision in self.scaling_history
            if (decision.resource_type == resource_type and 
                decision.execution_time > cutoff_time)
        ]
        
        return len(recent_actions) > 0
    
    async def _schedule_rollback(self, decision: ScalingDecision) -> None:
        """Schedule automatic rollback of scaling action."""
        # In production, would use task queue or scheduler
        logger.info(f"Rollback scheduled for {decision.rollback_time} for {decision.resource_type.value}")
    
    def set_manual_override(
        self, 
        resource_type: ResourceType, 
        action: ScalingAction, 
        enabled: bool
    ) -> None:
        """Set manual override for specific scaling actions."""
        override_key = f"{resource_type.value}_{action.value}"
        self.manual_overrides[override_key] = enabled
        
        logger.info(f"Manual override {'enabled' if enabled else 'disabled'} for {override_key}")
    
    def get_scaling_history(
        self, 
        resource_type: Optional[ResourceType] = None,
        hours: int = 24
    ) -> List[ScalingDecision]:
        """Get scaling action history."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        history = [
            decision for decision in self.scaling_history
            if decision.execution_time > cutoff_time
        ]
        
        if resource_type:
            history = [
                decision for decision in history
                if decision.resource_type == resource_type
            ]
        
        return sorted(history, key=lambda x: x.execution_time, reverse=True)
    
    async def rollback_scaling_action(self, decision: ScalingDecision) -> bool:
        """Manually rollback a scaling action."""
        try:
            # Create reverse scaling decision
            reverse_action = ScalingAction.SCALE_DOWN if decision.action == ScalingAction.SCALE_UP else ScalingAction.SCALE_UP
            
            rollback_decision = ScalingDecision(
                resource_type=decision.resource_type,
                action=reverse_action,
                current_capacity=decision.target_capacity,
                target_capacity=decision.current_capacity,
                justification=f"Manual rollback of scaling action from {decision.execution_time}",
                confidence=1.0,
                execution_time=datetime.utcnow()
            )
            
            success = await self.execute_scaling_decision(rollback_decision)
            
            if success:
                logger.info(f"Successfully rolled back scaling action for {decision.resource_type.value}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to rollback scaling action: {e}")
            return False
    
    def get_manual_overrides(self) -> Dict[str, bool]:
        """Get current manual override settings."""
        return self.manual_overrides.copy()
    
    async def get_scaling_recommendations(
        self, 
        predictions: List[SLAPrediction]
    ) -> Dict[str, Any]:
        """Get scaling recommendations without executing."""
        decisions = await self.evaluate_scaling_decisions(predictions)
        
        return {
            'recommendations': [
                {
                    'resource_type': decision.resource_type.value,
                    'action': decision.action.value,
                    'current_capacity': decision.current_capacity,
                    'target_capacity': decision.target_capacity,
                    'justification': decision.justification,
                    'confidence': decision.confidence,
                    'execution_time': decision.execution_time.isoformat()
                }
                for decision in decisions
            ],
            'manual_overrides': self.manual_overrides,
            'total_recommendations': len(decisions)
        }