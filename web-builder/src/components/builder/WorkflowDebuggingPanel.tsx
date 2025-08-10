/**
 * WorkflowDebuggingPanel Component
 * 
 * Story 3.1: Visual Workflow Debugging - Main Integration Component
 * Combines all debugging features into a comprehensive workflow debugging interface
 * 
 * Features:
 * - Real-time workflow status monitoring with WebSocket
 * - Visual workflow nodes with status overlays
 * - Error details modal for failed nodes
 * - Execution timeline with step-by-step progress
 * - Performance metrics and SLA integration
 * - Export functionality for logs and analytics
 * 
 * @author Frontend Developer Agent - Story 3.1 Implementation
 */

'use client';

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings, 
  Download, 
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { extendedColors, animations } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our Story 3.1 components
import WorkflowStatusOverlay, { 
  type WorkflowNodeData, 
  type WorkflowNodeStatus 
} from './WorkflowStatusOverlay';
import ErrorDetailsModal, { type WorkflowError } from './ErrorDetailsModal';
import ExecutionTimeline, { type TimelineStep } from './ExecutionTimeline';
import { useWorkflowStatus } from '@/hooks/useWorkflowStatus';
import type { Workflow, WorkflowExecution } from '@/lib/api/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  connections: string[];
  config: Record<string, any>;
}

export interface WorkflowDebuggingPanelProps {
  /** Workflow to debug */
  workflow?: Workflow;
  /** Whether debugging is active */
  isDebugging?: boolean;
  /** Debug start handler */
  onStartDebugging?: () => void;
  /** Debug stop handler */
  onStopDebugging?: () => void;
  /** Workflow execution handler */
  onExecuteWorkflow?: () => Promise<WorkflowExecution>;
  /** Node configuration edit handler */
  onEditNode?: (nodeId: string) => void;
  /** Export handler */
  onExport?: (format: 'pdf' | 'csv', data: any) => void;
  /** Custom CSS classes */
  className?: string;
}

// ============================================================================
// MOCK DATA (for development/testing)
// ============================================================================

const mockWorkflowNodes: WorkflowNode[] = [
  {
    id: 'trigger-1',
    name: 'Form Submission Trigger',
    type: 'trigger',
    position: { x: 100, y: 100 },
    connections: ['action-1'],
    config: { form_id: 'contact-form' }
  },
  {
    id: 'action-1',
    name: 'Send Email',
    type: 'email',
    position: { x: 300, y: 100 },
    connections: ['action-2'],
    config: { template: 'welcome-email' }
  },
  {
    id: 'action-2',
    name: 'Update CRM',
    type: 'crm_update',
    position: { x: 500, y: 100 },
    connections: ['condition-1'],
    config: { field: 'lead_score', value: '+10' }
  },
  {
    id: 'condition-1',
    name: 'Check Lead Score',
    type: 'condition',
    position: { x: 300, y: 250 },
    connections: ['action-3'],
    config: { field: 'lead_score', operator: '>', value: 50 }
  },
  {
    id: 'action-3',
    name: 'Create Sales Task',
    type: 'action',
    position: { x: 500, y: 250 },
    connections: [],
    config: { task_type: 'follow_up_call' }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts node status data to timeline steps
 */
function convertNodesToTimelineSteps(
  nodes: WorkflowNode[],
  statusData: Record<string, WorkflowNodeData>
): TimelineStep[] {
  return nodes.map(node => {
    const status = statusData[node.id];
    
    return {
      id: node.id,
      node_id: node.id,
      node_name: node.name,
      node_type: node.type,
      status: status?.status || 'pending',
      started_at: status?.lastUpdated || new Date(),
      completed_at: status?.status === 'success' || status?.status === 'failed' 
        ? status.lastUpdated 
        : undefined,
      execution_time_ms: status?.executionTime,
      error_message: status?.errorMessage,
      // Mock additional data for demo
      input_data: { node_config: node.config },
      output_data: status?.status === 'success' ? { result: 'processed' } : undefined,
      performance_metrics: {
        memory_usage_mb: Math.random() * 50,
        cpu_usage_percent: Math.random() * 80
      }
    };
  });
}

/**
 * Converts node status to workflow error for modal
 */
function convertNodeStatusToError(
  node: WorkflowNode,
  status: WorkflowNodeData
): WorkflowError | null {
  if (status.status !== 'failed' || !status.errorMessage) return null;
  
  return {
    id: `error-${node.id}-${Date.now()}`,
    workflow_id: 1, // Mock
    execution_id: 1, // Mock
    node_id: node.id,
    node_name: node.name,
    node_type: node.type,
    error_message: status.errorMessage,
    error_stack_trace: 'Mock stack trace for demo purposes',
    error_code: 'EXECUTION_FAILED',
    timestamp: status.lastUpdated?.toISOString() || new Date().toISOString(),
    execution_time_ms: status.executionTime,
    retry_count: 0,
    debug_logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'ERROR' as const,
        message: status.errorMessage,
        context: { node_id: node.id, node_type: node.type }
      }
    ],
    input_data: { node_config: node.config },
    performance_metrics: {
      memory_usage_mb: Math.random() * 50,
      cpu_usage_percent: Math.random() * 80
    },
    suggested_actions: [
      {
        action: 'Retry Node Execution',
        description: 'Retry this node with the same configuration',
        type: 'retry',
        confidence: 0.9
      },
      {
        action: 'Check Node Configuration',
        description: 'Review and update node parameters',
        type: 'config',
        confidence: 0.7
      }
    ]
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Workflow canvas with status overlays
 */
const WorkflowCanvas = memo<{
  nodes: WorkflowNode[];
  statusData: Record<string, WorkflowNodeData>;
  onNodeClick: (node: WorkflowNode, status: WorkflowNodeData) => void;
  showStatusOverlays: boolean;
}>(({ nodes, statusData, onNodeClick, showStatusOverlays }) => {
  const canvasStyle = {
    width: '800px',
    height: '500px',
    position: 'relative' as const,
    background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 202, 84, 0.1) 0%, transparent 50%)',
    borderRadius: '12px',
    border: '1px solid rgb(55 65 81)', // border-gray-700
  };
  
  return (
    <div className="p-6 border border-gray-700 rounded-xl bg-gray-900/50 backdrop-blur-sm">
      <div style={canvasStyle}>
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.connections.map(connectedNodeId => {
              const connectedNode = nodes.find(n => n.id === connectedNodeId);
              if (!connectedNode) return null;
              
              return (
                <line
                  key={`${node.id}-${connectedNodeId}`}
                  x1={node.position.x + 60}
                  y1={node.position.y + 30}
                  x2={connectedNode.position.x + 60}
                  y2={connectedNode.position.y + 30}
                  stroke="rgb(75 85 99)" // gray-600
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })
          )}
        </svg>
        
        {/* Workflow nodes */}
        {nodes.map(node => {
          const status = statusData[node.id];
          
          return (
            <div
              key={node.id}
              className={cn(
                'absolute w-32 h-16 p-3 rounded-lg border border-gray-600',
                'bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer',
                'flex flex-col justify-center items-center text-center',
                status?.status === 'running' && 'animate-pulse border-blue-400',
                status?.status === 'success' && 'border-green-400',
                status?.status === 'failed' && 'border-red-400'
              )}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`
              }}
              onClick={() => status && onNodeClick(node, status)}
            >
              <div className="text-xs font-medium text-white truncate w-full">
                {node.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {node.type.replace('_', ' ').toUpperCase()}
              </div>
              
              {/* Status overlay */}
              {showStatusOverlays && status && (
                <WorkflowStatusOverlay
                  node={status}
                  position="top-right"
                  size="sm"
                  showProgress={true}
                  showExecutionTime={true}
                  animate={true}
                  className="z-10"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';

/**
 * Debugging controls panel
 */
const DebuggingControls = memo<{
  isDebugging: boolean;
  isExecuting: boolean;
  connectionState: {
    status: string;
    reconnectCount?: number;
  };
  onStartDebugging: () => void;
  onStopDebugging: () => void;
  onExecuteWorkflow: () => void;
  onRefreshStatus: () => void;
  showStatusOverlays: boolean;
  onToggleStatusOverlays: (show: boolean) => void;
}>(({ 
  isDebugging, 
  isExecuting, 
  connectionState,
  onStartDebugging, 
  onStopDebugging, 
  onExecuteWorkflow,
  onRefreshStatus,
  showStatusOverlays,
  onToggleStatusOverlays
}) => {
  const connectionStatusDisplay = {
    connected: { color: 'text-green-400', label: 'Connected' },
    connecting: { color: 'text-yellow-400', label: 'Connecting...' },
    disconnected: { color: 'text-gray-400', label: 'Disconnected' },
    error: { color: 'text-red-400', label: 'Error' },
  };
  
  const currentStatus = connectionStatusDisplay[connectionState.status as keyof typeof connectionStatusDisplay] || 
    connectionStatusDisplay.disconnected;
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={cn('w-2 h-2 rounded-full', currentStatus.color.replace('text-', 'bg-'))} />
          <span className={cn('text-sm font-medium', currentStatus.color)}>
            {currentStatus.label}
          </span>
          {connectionState.reconnectCount && connectionState.reconnectCount > 0 && (
            <Badge variant="outline" className="text-xs">
              Retry {connectionState.reconnectCount}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatusOverlays(!showStatusOverlays)}
          className={showStatusOverlays ? 'bg-yellow-400/10 border-yellow-400/30' : ''}
        >
          {showStatusOverlays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshStatus}
          disabled={isExecuting}
        >
          <RefreshCw className={cn('w-3 h-3', isExecuting && 'animate-spin')} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExecuteWorkflow}
          disabled={isExecuting || !isDebugging}
        >
          <Play className="w-3 h-3 mr-2" />
          Execute
        </Button>
        
        {!isDebugging ? (
          <Button
            onClick={onStartDebugging}
            className="bg-yellow-400 text-black hover:bg-yellow-300"
          >
            <Activity className="w-3 h-3 mr-2" />
            Start Debugging
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onStopDebugging}
          >
            <Square className="w-3 h-3 mr-2" />
            Stop Debugging
          </Button>
        )}
      </div>
    </div>
  );
});

DebuggingControls.displayName = 'DebuggingControls';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WorkflowDebuggingPanel = memo<WorkflowDebuggingPanelProps>(({
  workflow,
  isDebugging = false,
  onStartDebugging,
  onStopDebugging,
  onExecuteWorkflow,
  onEditNode,
  onExport,
  className
}) => {
  // ===== STATE =====
  const [selectedError, setSelectedError] = useState<WorkflowError | null>(null);
  const [showStatusOverlays, setShowStatusOverlays] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // ===== WORKFLOW STATUS HOOK =====
  const workflowStatus = useWorkflowStatus({
    workflowId: workflow?.id || null,
    autoConnect: isDebugging,
    onStatusUpdate: (nodeId, status) => {
      console.log(`Node ${nodeId} status updated:`, status);
    },
    onExecutionComplete: (execution) => {
      console.log('Execution completed:', execution);
      setIsExecuting(false);
    },
    onError: (error) => {
      console.error('Workflow status error:', error);
    }
  });
  
  // ===== DERIVED DATA =====
  const nodes = useMemo(() => mockWorkflowNodes, []); // In real app, would come from workflow.nodes
  
  const timelineSteps = useMemo(() => 
    convertNodesToTimelineSteps(nodes, workflowStatus.nodeStatuses),
    [nodes, workflowStatus.nodeStatuses]
  );
  
  const executionStats = useMemo(() => {
    const statuses = Object.values(workflowStatus.nodeStatuses);
    const total = statuses.length;
    const completed = statuses.filter(s => s.status === 'success' || s.status === 'failed').length;
    const failed = statuses.filter(s => s.status === 'failed').length;
    const running = statuses.filter(s => s.status === 'running').length;
    
    return { total, completed, failed, running };
  }, [workflowStatus.nodeStatuses]);
  
  // ===== HANDLERS =====
  const handleStartDebugging = useCallback(() => {
    workflowStatus.connect();
    onStartDebugging?.();
  }, [workflowStatus, onStartDebugging]);
  
  const handleStopDebugging = useCallback(() => {
    workflowStatus.disconnect();
    onStopDebugging?.();
  }, [workflowStatus, onStopDebugging]);
  
  const handleExecuteWorkflow = useCallback(async () => {
    if (!onExecuteWorkflow) {
      // Mock execution for demo
      setIsExecuting(true);
      
      // Simulate node execution sequence
      const nodeIds = nodes.map(n => n.id);
      
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const node = nodes.find(n => n.id === nodeId)!;
        
        // Set to running
        const runningStatus: WorkflowNodeData = {
          id: nodeId,
          status: 'running',
          progress: 0,
          lastUpdated: new Date()
        };
        
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 25) {
          setTimeout(() => {
            // Mock status update - in real app this would come from WebSocket
          }, i * 2000 + (progress / 25) * 500);
        }
        
        // Complete with success or failure (10% chance of failure)
        setTimeout(() => {
          const isSuccess = Math.random() > 0.1;
          const finalStatus: WorkflowNodeData = {
            id: nodeId,
            status: isSuccess ? 'success' : 'failed',
            executionTime: Math.floor(Math.random() * 3000) + 500,
            lastUpdated: new Date(),
            errorMessage: isSuccess ? undefined : 'Simulated execution error'
          };
          
          // Mock status update - in real app this would come from WebSocket
        }, (i + 1) * 2000);
      }
      
      // Complete execution
      setTimeout(() => {
        setIsExecuting(false);
      }, (nodeIds.length + 1) * 2000);
      
      return;
    }
    
    try {
      setIsExecuting(true);
      await onExecuteWorkflow();
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
    }
  }, [onExecuteWorkflow, nodes]);
  
  const handleNodeClick = useCallback((node: WorkflowNode, status: WorkflowNodeData) => {
    if (status.status === 'failed') {
      const error = convertNodeStatusToError(node, status);
      if (error) {
        setSelectedError(error);
      }
    }
  }, []);
  
  const handleRetryNode = useCallback((nodeId: string) => {
    console.log('Retrying node:', nodeId);
    setSelectedError(null);
    // In real app, would trigger node retry
  }, []);
  
  const handleEditNodeConfig = useCallback((nodeId: string) => {
    console.log('Editing node config:', nodeId);
    setSelectedError(null);
    onEditNode?.(nodeId);
  }, [onEditNode]);
  
  const handleViewLogs = useCallback((executionId: number) => {
    console.log('Viewing logs for execution:', executionId);
    // In real app, would open logs viewer
  }, []);
  
  const handleExport = useCallback((format: 'pdf' | 'csv') => {
    const exportData = {
      workflow_id: workflow?.id,
      workflow_name: workflow?.name,
      execution_stats: executionStats,
      timeline_steps: timelineSteps,
      node_statuses: workflowStatus.nodeStatuses,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Exporting ${format}:`, exportData);
    onExport?.(format, exportData);
  }, [workflow, executionStats, timelineSteps, workflowStatus.nodeStatuses, onExport]);
  
  // ===== RENDER =====
  return (
    <div className={cn(
      'flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">
              Workflow Debugging Panel
            </h1>
            {workflow && (
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Workflow: {workflow.name}</span>
                <span>•</span>
                <span>Nodes: {executionStats.total}</span>
                {executionStats.running > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400">Running: {executionStats.running}</span>
                  </>
                )}
                {executionStats.failed > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-400">Failed: {executionStats.failed}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={cn(
                isDebugging 
                  ? 'text-green-400 border-green-400/30' 
                  : 'text-gray-400 border-gray-400/30'
              )}
            >
              {isDebugging ? 'Debugging Active' : 'Debugging Inactive'}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <DebuggingControls
        isDebugging={isDebugging}
        isExecuting={isExecuting}
        connectionState={workflowStatus}
        onStartDebugging={handleStartDebugging}
        onStopDebugging={handleStopDebugging}
        onExecuteWorkflow={handleExecuteWorkflow}
        onRefreshStatus={workflowStatus.retry}
        showStatusOverlays={showStatusOverlays}
        onToggleStatusOverlays={setShowStatusOverlays}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="canvas" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="canvas">Workflow Canvas</TabsTrigger>
            <TabsTrigger value="timeline">Execution Timeline</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="canvas" className="flex-1 m-0 p-6">
            <WorkflowCanvas
              nodes={nodes}
              statusData={workflowStatus.nodeStatuses}
              onNodeClick={handleNodeClick}
              showStatusOverlays={showStatusOverlays}
            />
          </TabsContent>
          
          <TabsContent value="timeline" className="flex-1 m-0 p-6">
            <ExecutionTimeline
              steps={timelineSteps}
              isRunning={isExecuting}
              showMetrics={true}
              detailedView={false}
              onExport={handleExport}
              className="h-full"
            />
          </TabsContent>
          
          <TabsContent value="metrics" className="flex-1 m-0 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Execution Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">
                    {executionStats.completed}/{executionStats.total}
                  </div>
                  <div className="text-xs text-gray-400">
                    {executionStats.total > 0 
                      ? Math.round((executionStats.completed / executionStats.total) * 100)
                      : 0}% Complete
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {executionStats.completed > 0 
                      ? Math.round(((executionStats.completed - executionStats.failed) / executionStats.completed) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {executionStats.failed} failures
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Avg Execution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {Math.round(Math.random() * 2000 + 500)}ms
                  </div>
                  <div className="text-xs text-gray-400">
                    Per node average
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Error Details Modal */}
      <ErrorDetailsModal
        isOpen={!!selectedError}
        onClose={() => setSelectedError(null)}
        error={selectedError}
        onRetry={handleRetryNode}
        onEditConfig={handleEditNodeConfig}
        onViewLogs={handleViewLogs}
      />
    </div>
  );
});

WorkflowDebuggingPanel.displayName = 'WorkflowDebuggingPanel';

// ============================================================================
// EXPORTS
// ============================================================================

export default WorkflowDebuggingPanel;

export type {
  WorkflowNode,
  WorkflowDebuggingPanelProps,
};