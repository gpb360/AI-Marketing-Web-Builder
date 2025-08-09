/**
 * ExecutionTimeline Component
 * 
 * Visual timeline showing step-by-step workflow execution progress
 * Part of Story 3.1: Visual Workflow Debugging - Integration Component
 * 
 * Features:
 * - Real-time execution progress visualization
 * - Performance metrics integration
 * - Interactive timeline with drill-down capability
 * - Export functionality for execution data
 * - Integration with SLA monitoring
 * 
 * @author Integration Coordinator - Story 3.1 Implementation
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Download,
  Filter,
  ZoomIn,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData, WorkflowNodeStatus } from './WorkflowStatusOverlay';
import type { WorkflowStatusEvent } from '@/hooks/useWorkflowStatus';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ExecutionStep {
  id: string;
  node_id: string;
  node_name?: string;
  node_type?: string;
  status: WorkflowNodeStatus;
  started_at?: string;
  finished_at?: string;
  execution_time_ms?: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  retry_count?: number;
  parent_step?: string;
  child_steps?: string[];
  performance_metrics?: {
    cpu_usage?: number;
    memory_usage?: number;
    network_io?: number;
    disk_io?: number;
  };
}

export interface ExecutionTimelineData {
  execution_id: number;
  workflow_id: number;
  workflow_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  started_at: string;
  finished_at?: string;
  total_duration_ms?: number;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  success_rate: number;
  steps: ExecutionStep[];
  sla_violations?: Array<{
    id: string;
    violation_type: string;
    threshold_value: number;
    actual_value: number;
    current_level: 1 | 2 | 3;
  }>;
}

export interface ExecutionTimelineProps {
  /** Timeline execution data */
  executionData: ExecutionTimelineData | null;
  /** Whether timeline is loading */
  isLoading?: boolean;
  /** Selected step for detailed view */
  selectedStepId?: string;
  /** Step selection handler */
  onStepSelect?: (stepId: string) => void;
  /** Step retry handler */
  onStepRetry?: (stepId: string) => void;
  /** Export handler */
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
  /** Real-time updates enabled */
  realTimeUpdates?: boolean;
  /** Show performance metrics */
  showMetrics?: boolean;
  /** Custom CSS classes */
  className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
}

function getStatusColor(status: WorkflowNodeStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'running':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'success':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'failed':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'paused':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

function getStatusIcon(status: WorkflowNodeStatus, size = 'w-4 h-4') {
  const iconClass = cn(size);
  
  switch (status) {
    case 'pending':
      return <Clock className={cn(iconClass, 'text-yellow-600')} />;
    case 'running':
      return <Play className={cn(iconClass, 'text-blue-600')} />;
    case 'success':
      return <CheckCircle className={cn(iconClass, 'text-green-600')} />;
    case 'failed':
      return <XCircle className={cn(iconClass, 'text-red-600')} />;
    case 'paused':
      return <Pause className={cn(iconClass, 'text-gray-600')} />;
    default:
      return <Clock className={cn(iconClass, 'text-gray-600')} />;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ExecutionOverview = React.memo<{
  executionData: ExecutionTimelineData;
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}>(({ executionData, onExport }) => {
  const progress = useMemo(() => {
    if (executionData.total_steps === 0) return 0;
    return (executionData.completed_steps / executionData.total_steps) * 100;
  }, [executionData.completed_steps, executionData.total_steps]);

  const duration = useMemo(() => {
    if (!executionData.started_at) return null;
    
    const start = new Date(executionData.started_at);
    const end = executionData.finished_at ? new Date(executionData.finished_at) : new Date();
    return end.getTime() - start.getTime();
  }, [executionData.started_at, executionData.finished_at]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Execution Overview
            </CardTitle>
            {executionData.workflow_name && (
              <p className="text-sm text-gray-600 mt-1">
                {executionData.workflow_name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('json')}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {executionData.completed_steps} / {executionData.total_steps} steps
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {executionData.total_steps}
            </div>
            <div className="text-xs text-gray-600">Total Steps</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {executionData.completed_steps}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {executionData.failed_steps}
            </div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {executionData.success_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <label className="text-xs font-medium text-gray-500">Started</label>
            <p className="text-sm">{formatTimestamp(executionData.started_at)}</p>
          </div>
          
          {executionData.finished_at && (
            <div>
              <label className="text-xs font-medium text-gray-500">Finished</label>
              <p className="text-sm">{formatTimestamp(executionData.finished_at)}</p>
            </div>
          )}
          
          {duration && (
            <div>
              <label className="text-xs font-medium text-gray-500">Duration</label>
              <p className="text-sm">{formatDuration(duration)}</p>
            </div>
          )}
        </div>

        {/* SLA Violations */}
        {executionData.sla_violations && executionData.sla_violations.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">SLA Violations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {executionData.sla_violations.map((violation) => (
                <Badge
                  key={violation.id}
                  variant="outline"
                  className={cn(
                    'text-xs',
                    violation.current_level === 3 ? 'border-red-300 text-red-700' :
                    violation.current_level === 2 ? 'border-orange-300 text-orange-700' :
                    'border-yellow-300 text-yellow-700'
                  )}
                >
                  {violation.violation_type} (L{violation.current_level})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Execution Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {getStatusIcon(executionData.status as WorkflowNodeStatus)}
            <span className="text-sm font-medium capitalize">
              {executionData.status}
            </span>
          </div>
          <Badge className={getStatusColor(executionData.status as WorkflowNodeStatus)}>
            {executionData.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

ExecutionOverview.displayName = 'ExecutionOverview';

const TimelineStep = React.memo<{
  step: ExecutionStep;
  isSelected: boolean;
  isLast: boolean;
  showMetrics: boolean;
  onSelect: (stepId: string) => void;
  onRetry?: (stepId: string) => void;
}>(({ step, isSelected, isLast, showMetrics, onSelect, onRetry }) => {
  const duration = useMemo(() => {
    if (!step.started_at || !step.finished_at) return null;
    const start = new Date(step.started_at);
    const end = new Date(step.finished_at);
    return end.getTime() - start.getTime();
  }, [step.started_at, step.finished_at]);

  return (
    <div className="relative">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
      )}
      
      {/* Timeline Item */}
      <div
        className={cn(
          'flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer',
          isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        )}
        onClick={() => onSelect(step.id)}
      >
        {/* Status Icon */}
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2',
          getStatusColor(step.status)
        )}>
          {getStatusIcon(step.status, 'w-3 h-3')}
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">
                {step.node_name || step.node_id}
              </h4>
              {step.node_type && (
                <Badge variant="outline" className="text-xs">
                  {step.node_type}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {duration && (
                <span className="text-xs text-gray-500">
                  {formatDuration(duration)}
                </span>
              )}
              {step.status === 'failed' && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry(step.id);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 mb-2">
            {step.started_at && (
              <span>Started: {formatTimestamp(step.started_at)}</span>
            )}
            {step.finished_at && (
              <span className="ml-4">
                Finished: {formatTimestamp(step.finished_at)}
              </span>
            )}
          </div>

          {/* Error Message */}
          {step.error_message && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mb-2">
              {step.error_message}
            </div>
          )}

          {/* Performance Metrics */}
          {showMetrics && step.performance_metrics && (
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {step.performance_metrics.cpu_usage && (
                <div>CPU: {step.performance_metrics.cpu_usage}%</div>
              )}
              {step.performance_metrics.memory_usage && (
                <div>Memory: {step.performance_metrics.memory_usage}MB</div>
              )}
            </div>
          )}

          {/* Retry Information */}
          {step.retry_count && step.retry_count > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              Retried {step.retry_count} time{step.retry_count > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TimelineStep.displayName = 'TimelineStep';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExecutionTimeline = React.memo<ExecutionTimelineProps>(({
  executionData,
  isLoading = false,
  selectedStepId,
  onStepSelect,
  onStepRetry,
  onExport,
  realTimeUpdates = false,
  showMetrics = false,
  className
}) => {
  const [filterStatus, setFilterStatus] = useState<WorkflowNodeStatus | 'all'>('all');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSteps = useMemo(() => {
    if (!executionData?.steps) return [];
    
    if (filterStatus === 'all') {
      return executionData.steps;
    }
    
    return executionData.steps.filter(step => step.status === filterStatus);
  }, [executionData?.steps, filterStatus]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStepSelect = useCallback((stepId: string) => {
    onStepSelect?.(stepId);
  }, [onStepSelect]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading execution timeline...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!executionData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No execution data available</p>
            <p className="text-sm mt-1">Start a workflow execution to see the timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Execution Overview */}
      <ExecutionOverview executionData={executionData} onExport={onExport} />

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Execution Timeline
              {realTimeUpdates && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Live
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'text-xs',
                  filterStatus === 'all' && 'bg-blue-50 border-blue-300'
                )}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus('failed')}
                className={cn(
                  'text-xs',
                  filterStatus === 'failed' && 'bg-red-50 border-red-300'
                )}
              >
                Failed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus('running')}
                className={cn(
                  'text-xs',
                  filterStatus === 'running' && 'bg-blue-50 border-blue-300'
                )}
              >
                Running
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96">
            {filteredSteps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No steps match the current filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSteps.map((step, index) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    isSelected={selectedStepId === step.id}
                    isLast={index === filteredSteps.length - 1}
                    showMetrics={showMetrics}
                    onSelect={handleStepSelect}
                    onRetry={onStepRetry}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

ExecutionTimeline.displayName = 'ExecutionTimeline';

// ============================================================================
// EXPORTS
// ============================================================================

export default ExecutionTimeline;

export type {
  ExecutionStep,
  ExecutionTimelineData,
  ExecutionTimelineProps
};