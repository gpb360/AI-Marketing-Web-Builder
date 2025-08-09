/**
 * ErrorDetailsModal Component
 * 
 * Modal for displaying detailed error information for failed workflow nodes
 * Part of Story 3.1: Visual Workflow Debugging - Integration Component
 * 
 * Features:
 * - Detailed error information display
 * - Integration with SLA violation structure
 * - Quick actions for error resolution
 * - Contextual help and documentation links
 * - Export functionality for error logs
 * 
 * @author Integration Coordinator - Story 3.1 Implementation
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Clock,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Bug,
  FileText,
  Activity,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData } from './WorkflowStatusOverlay';
import type { WorkflowStatusEvent } from '@/hooks/useWorkflowStatus';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ErrorLog {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface ErrorMetrics {
  execution_time_ms: number;
  memory_usage: string;
  cpu_usage: string;
  retry_count?: number;
  last_success?: string;
  error_frequency?: number;
}

export interface SLAViolationInfo {
  id: string;
  violation_type: string;
  threshold_value: number;
  actual_value: number;
  current_level: 1 | 2 | 3;
  created_at: string;
}

export interface ErrorContext {
  workflow_id: number;
  execution_id?: number;
  workflow_name?: string;
  node_type?: string;
  input_data?: Record<string, any>;
  configuration?: Record<string, any>;
  previous_nodes?: string[];
  expected_outputs?: string[];
}

export interface ErrorDetailsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Failed workflow node data */
  node: WorkflowNodeData;
  /** Additional error context */
  errorContext?: ErrorContext;
  /** Error logs */
  errorLogs?: ErrorLog[];
  /** Performance metrics */
  metrics?: ErrorMetrics;
  /** Related SLA violation */
  slaViolation?: SLAViolationInfo;
  /** Restart node handler */
  onRestartNode?: (nodeId: string) => void;
  /** Skip node handler */
  onSkipNode?: (nodeId: string) => void;
  /** Debug node handler */
  onDebugNode?: (nodeId: string) => void;
  /** Export error details handler */
  onExportError?: (nodeId: string, format: 'json' | 'pdf' | 'csv') => void;
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

function getErrorSeverityColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warn':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'debug':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getSLALevelColor(level: 1 | 2 | 3): string {
  switch (level) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 2:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 3:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ErrorSummary = React.memo<{
  node: WorkflowNodeData;
  errorContext?: ErrorContext;
  slaViolation?: SLAViolationInfo;
}>(({ node, errorContext, slaViolation }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        Error Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Node ID</label>
          <p className="font-mono text-sm">{node.id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <Badge variant="destructive">Failed</Badge>
        </div>
        {errorContext?.node_type && (
          <div>
            <label className="text-sm font-medium text-gray-500">Node Type</label>
            <p className="text-sm">{errorContext.node_type}</p>
          </div>
        )}
        {node.executionTime && (
          <div>
            <label className="text-sm font-medium text-gray-500">Execution Time</label>
            <p className="text-sm">{formatDuration(node.executionTime)}</p>
          </div>
        )}
        {node.lastUpdated && (
          <div>
            <label className="text-sm font-medium text-gray-500">Failed At</label>
            <p className="text-sm">{formatTimestamp(node.lastUpdated)}</p>
          </div>
        )}
        {slaViolation && (
          <div>
            <label className="text-sm font-medium text-gray-500">SLA Violation</label>
            <Badge className={getSLALevelColor(slaViolation.current_level)}>
              Level {slaViolation.current_level}
            </Badge>
          </div>
        )}
      </div>
      
      {node.errorMessage && (
        <div>
          <label className="text-sm font-medium text-gray-500">Error Message</label>
          <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{node.errorMessage}</p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
));

ErrorSummary.displayName = 'ErrorSummary';

const ErrorLogs = React.memo<{
  logs?: ErrorLog[];
}>(({ logs = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-500" />
        Error Logs
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-64">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No error logs available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-md border text-sm',
                  getErrorSeverityColor(log.level)
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {log.level}
                  </Badge>
                  <span className="text-xs opacity-70">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <p className="font-medium">{log.message}</p>
                {log.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs opacity-70">
                      Stack trace
                    </summary>
                    <pre className="mt-1 text-xs font-mono bg-black/5 p-2 rounded overflow-x-auto">
                      {log.stack}
                    </pre>
                  </details>
                )}
                {log.context && Object.keys(log.context).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs opacity-70">
                      Context data
                    </summary>
                    <pre className="mt-1 text-xs font-mono bg-black/5 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </CardContent>
  </Card>
));

ErrorLogs.displayName = 'ErrorLogs';

const PerformanceMetrics = React.memo<{
  metrics?: ErrorMetrics;
}>(({ metrics }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        Performance Metrics
      </CardTitle>
    </CardHeader>
    <CardContent>
      {!metrics ? (
        <div className="text-center text-gray-500 py-8">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No performance metrics available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Execution Time</label>
              <p className="text-lg font-semibold">
                {formatDuration(metrics.execution_time_ms)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Memory Usage</label>
              <p className="text-lg font-semibold">{metrics.memory_usage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CPU Usage</label>
              <p className="text-lg font-semibold">{metrics.cpu_usage}</p>
            </div>
          </div>
          <div className="space-y-3">
            {metrics.retry_count !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-500">Retry Count</label>
                <p className="text-lg font-semibold">{metrics.retry_count}</p>
              </div>
            )}
            {metrics.last_success && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Success</label>
                <p className="text-sm">{formatTimestamp(metrics.last_success)}</p>
              </div>
            )}
            {metrics.error_frequency !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-500">Error Frequency</label>
                <p className="text-lg font-semibold">{(metrics.error_frequency * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
));

 PerformanceMetrics.displayName = 'PerformanceMetrics';

const NodeConfiguration = React.memo<{
  errorContext?: ErrorContext;
}>(({ errorContext }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-500" />
        Node Configuration
      </CardTitle>
    </CardHeader>
    <CardContent>
      {!errorContext?.configuration ? (
        <div className="text-center text-gray-500 py-8">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No configuration data available</p>
        </div>
      ) : (
        <ScrollArea className="h-48">
          <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(errorContext.configuration, null, 2)}
          </pre>
        </ScrollArea>
      )}
      
      {errorContext?.input_data && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-500 mb-2 block">Input Data</label>
          <ScrollArea className="h-32">
            <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify(errorContext.input_data, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}
    </CardContent>
  </Card>
));

NodeConfiguration.displayName = 'NodeConfiguration';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ErrorDetailsModal = React.memo<ErrorDetailsModalProps>(({
  isOpen,
  onClose,
  node,
  errorContext,
  errorLogs,
  metrics,
  slaViolation,
  onRestartNode,
  onSkipNode,
  onDebugNode,
  onExportError,
  className
}) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleAction = useCallback(async (action: string, handler?: (nodeId: string) => void) => {
    if (!handler) return;
    
    setIsActionLoading(action);
    try {
      await handler(node.id);
    } catch (error) {
      console.error(`Failed to ${action} node:`, error);
    } finally {
      setIsActionLoading(null);
    }
  }, [node.id]);

  const handleCopyError = useCallback(() => {
    const errorDetails = {
      nodeId: node.id,
      errorMessage: node.errorMessage,
      timestamp: node.lastUpdated,
      executionTime: node.executionTime,
      context: errorContext
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  }, [node, errorContext]);

  const handleExport = useCallback((format: 'json' | 'pdf' | 'csv') => {
    onExportError?.(node.id, format);
  }, [node.id, onExportError]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasLogs = useMemo(() => errorLogs && errorLogs.length > 0, [errorLogs]);
  const hasMetrics = useMemo(() => Boolean(metrics), [metrics]);
  const hasConfiguration = useMemo(() => Boolean(errorContext?.configuration), [errorContext]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl max-h-[90vh] overflow-hidden', className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bug className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Node Execution Error</DialogTitle>
                <DialogDescription>
                  Detailed error information for node {node.id}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="logs" disabled={!hasLogs}>
                Logs {hasLogs && `(${errorLogs?.length})`}
              </TabsTrigger>
              <TabsTrigger value="metrics" disabled={!hasMetrics}>
                Metrics
              </TabsTrigger>
              <TabsTrigger value="config" disabled={!hasConfiguration}>
                Configuration
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="summary" className="h-full overflow-auto">
                <ErrorSummary
                  node={node}
                  errorContext={errorContext}
                  slaViolation={slaViolation}
                />
              </TabsContent>

              <TabsContent value="logs" className="h-full overflow-auto">
                <ErrorLogs logs={errorLogs} />
              </TabsContent>

              <TabsContent value="metrics" className="h-full overflow-auto">
                <PerformanceMetrics metrics={metrics} />
              </TabsContent>

              <TabsContent value="config" className="h-full overflow-auto">
                <NodeConfiguration errorContext={errorContext} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyError}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Error
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <div className="flex gap-2">
            {onDebugNode && (
              <Button
                variant="outline"
                onClick={() => handleAction('debug', onDebugNode)}
                disabled={isActionLoading === 'debug'}
                className="flex items-center gap-2"
              >
                {isActionLoading === 'debug' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Debug
              </Button>
            )}

            {onSkipNode && (
              <Button
                variant="outline"
                onClick={() => handleAction('skip', onSkipNode)}
                disabled={isActionLoading === 'skip'}
                className="flex items-center gap-2"
              >
                {isActionLoading === 'skip' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Skip
              </Button>
            )}

            {onRestartNode && (
              <Button
                onClick={() => handleAction('restart', onRestartNode)}
                disabled={isActionLoading === 'restart'}
                className="flex items-center gap-2"
              >
                {isActionLoading === 'restart' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Restart Node
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ErrorDetailsModal.displayName = 'ErrorDetailsModal';

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorDetailsModal;

export type {
  ErrorLog,
  ErrorMetrics,
  SLAViolationInfo,
  ErrorContext,
  ErrorDetailsModalProps
};