"""
Startup initialization for workflow debugging system.
Story 3.1: Visual Workflow Debugging UI Backend Support
"""

import asyncio
import logging
from typing import Dict, Any

from app.services.workflow_automation import workflow_engine
from app.api.v1.endpoints.workflow_websocket import connection_manager

logger = logging.getLogger(__name__)


class WorkflowDebugManager:
    """Manager for workflow debugging system initialization and monitoring."""
    
    def __init__(self):
        self.initialized = False
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
    
    async def initialize(self):
        """Initialize the workflow debugging system."""
        if self.initialized:
            return
        
        logger.info("🔧 Initializing Workflow Debugging System...")
        
        try:
            # Initialize WebSocket connection manager
            await self._initialize_websocket_manager()
            
            # Start monitoring tasks
            await self._start_monitoring_tasks()
            
            # Integration with workflow engine
            await self._integrate_with_workflow_engine()
            
            self.initialized = True
            logger.info("✅ Workflow Debugging System initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Workflow Debugging System: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown the workflow debugging system."""
        if not self.initialized:
            return
        
        logger.info("🔄 Shutting down Workflow Debugging System...")
        
        # Cancel monitoring tasks
        for task_name, task in self.monitoring_tasks.items():
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    logger.debug(f"Cancelled monitoring task: {task_name}")
        
        self.monitoring_tasks.clear()
        self.initialized = False
        
        logger.info("✅ Workflow Debugging System shut down successfully")
    
    async def _initialize_websocket_manager(self):
        """Initialize WebSocket connection manager."""
        # The connection manager is already initialized as a singleton
        # Just log that it's ready
        logger.info("📡 WebSocket connection manager ready for workflow debugging")
    
    async def _start_monitoring_tasks(self):
        """Start background monitoring tasks."""
        
        # Connection health monitoring
        self.monitoring_tasks['connection_health'] = asyncio.create_task(
            self._monitor_connection_health()
        )
        
        # Performance monitoring
        self.monitoring_tasks['performance_monitor'] = asyncio.create_task(
            self._monitor_performance_metrics()
        )
        
        logger.info("🔍 Started debugging monitoring tasks")
    
    async def _integrate_with_workflow_engine(self):
        """Integrate debugging with the workflow engine."""
        # The integration is handled through imports in workflow_automation.py
        # This method can be extended for additional integration needs
        logger.info("🔗 Integrated debugging with workflow execution engine")
    
    async def _monitor_connection_health(self):
        """Monitor WebSocket connection health."""
        while True:
            try:
                # Monitor active connections
                active_workflows = len(connection_manager.active_connections)
                total_connections = sum(
                    len(connections) for connections in connection_manager.active_connections.values()
                )
                
                if total_connections > 0:
                    logger.debug(
                        f"Debug connections: {total_connections} clients monitoring {active_workflows} workflows"
                    )
                
                # Clean up stale connections (this could be enhanced)
                await self._cleanup_stale_connections()
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in connection health monitoring: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _monitor_performance_metrics(self):
        """Monitor performance metrics for debugging system."""
        while True:
            try:
                # Monitor memory usage, connection counts, etc.
                # This can be expanded based on specific requirements
                
                # For now, just log periodic status
                active_workflows = len(connection_manager.active_connections)
                if active_workflows > 0:
                    logger.debug(f"Debugging system monitoring {active_workflows} workflows")
                
                await asyncio.sleep(300)  # Check every 5 minutes
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in performance monitoring: {e}")
                await asyncio.sleep(300)
    
    async def _cleanup_stale_connections(self):
        """Clean up stale WebSocket connections."""
        # This method can be enhanced to detect and clean up stale connections
        # For now, it's a placeholder for future implementation
        pass
    
    async def get_debug_status(self) -> Dict[str, Any]:
        """Get current status of the debugging system."""
        active_workflows = len(connection_manager.active_connections)
        total_connections = sum(
            len(connections) for connections in connection_manager.active_connections.values()
        )
        
        return {
            'initialized': self.initialized,
            'active_workflows': active_workflows,
            'total_connections': total_connections,
            'monitoring_tasks': {
                name: not task.done() for name, task in self.monitoring_tasks.items()
            }
        }


# Global debug manager instance
debug_manager = WorkflowDebugManager()


async def initialize_workflow_debugging():
    """Initialize workflow debugging system - called during app startup."""
    await debug_manager.initialize()


async def shutdown_workflow_debugging():
    """Shutdown workflow debugging system - called during app shutdown."""
    await debug_manager.shutdown()


def get_debug_status():
    """Get debug system status - for health checks."""
    return debug_manager.get_debug_status()


# Export for use in other modules
__all__ = [
    "debug_manager",
    "initialize_workflow_debugging", 
    "shutdown_workflow_debugging",
    "get_debug_status"
]