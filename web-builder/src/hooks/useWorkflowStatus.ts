/**
 * useWorkflowStatus Hook
 * 
 * Real-time WebSocket connection for workflow debugging and status updates
 * Part of Story 3.1: Visual Workflow Debugging
 * 
 * Features:
 * - WebSocket connection management with auto-reconnect
 * - Real-time status updates for workflow nodes
 * - Error handling and connection state management
 * - Performance target: <100ms status update latency
 * - Integration callbacks for status updates
 * 
 * @author Frontend Developer - Story 3.1 Implementation
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

// ============================================================================
// TYPES & INTERFACES (Story 3.1 WebSocket Protocol)
// ============================================================================

export interface WorkflowStatusEvent {
  type: 'connected' | 'execution_update' | 'execution_started' | 'execution_completed' | 'execution_details' | 'node_logs' | 'error' | 'subscribed';
  timestamp: string;
  workflow_id: number;
  execution_id?: number;
  node_id?: string;
  status?: 'pending' | 'running' | 'success' | 'failed' | 'paused';
  execution_time_ms?: number;
  error_details?: string;
  next_nodes?: string[];
  workflow_name?: string;
  workflow_status?: string;
  is_active?: boolean;
  recent_executions?: Array<{
    execution_id: number;
    status: string;
    started_at: string | null;
    finished_at: string | null;
    execution_time: number | null;
  }>;
  final_status?: string;
  duration_ms?: number;
  success_count?: number;
  total_nodes?: number;
  success_rate?: number;
  trigger_data?: Record<string, any>;
  execution_data?: Record<string, any>;
  error_message?: string;
  node_executions?: Array<any>;
  logs?: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
  metrics?: {
    execution_time_ms: number;
    memory_usage: string;
    cpu_usage: string;
  };
  message?: string;
}

export interface WorkflowNodeData {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'paused';
  executionTime?: number;
  lastUpdated: Date;
  errorMessage?: string;
  metrics?: {
    execution_time_ms: number;
    memory_usage: string;
    cpu_usage: string;
  };
}

export interface WorkflowStatusState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  nodeStatuses: Record<string, WorkflowNodeData>;
  currentExecution: {
    execution_id?: number;
    status?: string;
    started_at?: string;
    finished_at?: string;
    total_nodes?: number;
    completed_nodes?: number;
    success_rate?: number;
  } | null;
  workflowInfo: {
    workflow_id?: number;
    workflow_name?: string;
    workflow_status?: string;
    is_active?: boolean;
  } | null;
  recentExecutions: Array<{
    execution_id: number;
    status: string;
    started_at: string | null;
    finished_at: string | null;
    execution_time: number | null;
  }>;
  connectionAttempts: number;
  lastMessage?: WorkflowStatusEvent;
  messageQueue: any[];
}

export interface UseWorkflowStatusOptions {
  workflowId: number | null;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onStatusUpdate?: (nodeId: string, status: WorkflowNodeData) => void;
  onExecutionComplete?: (execution: WorkflowStatusEvent) => void;
  onExecutionStarted?: (execution: WorkflowStatusEvent) => void;
  onError?: (error: string) => void;
  onConnected?: (workflowInfo: WorkflowStatusEvent) => void;
}

export interface UseWorkflowStatusReturn extends WorkflowStatusState {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  getNodeStatus: (nodeId: string) => WorkflowNodeData | null;
  getExecutionDetails: (executionId: number) => void;
  getNodeLogs: (executionId: number, nodeId: string) => void;
  subscribeToExecution: (executionId: number) => void;
  clearError: () => void;
  retry: () => void;
  getConnectionLatency: () => number | null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useWorkflowStatus(options: UseWorkflowStatusOptions): UseWorkflowStatusReturn {
  const {
    workflowId,
    autoConnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 3000,
    onStatusUpdate,
    onExecutionComplete,
    onExecutionStarted,
    onError,
    onConnected
  } = options;

  const { token } = useAuth();
  
  // WebSocket ref and connection state
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);
  const connectionStartTime = useRef<number | null>(null);
  const latency = useRef<number | null>(null);
  
  const [state, setState] = useState<WorkflowStatusState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    nodeStatuses: {},
    currentExecution: null,
    workflowInfo: null,
    recentExecutions: [],
    connectionAttempts: 0,
    messageQueue: []
  });

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  const connect = useCallback(() => {
    if (!workflowId || !token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Story 3.1 WebSocket endpoint: /api/v1/workflows/{workflow_id}/debug
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/workflows/${workflowId}/debug?token=${token}`;

    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      connectionAttempts: prev.connectionAttempts + 1
    }));

    connectionStartTime.current = Date.now();

    try {
      wsRef.current = new WebSocket(wsUrl);
      isManualDisconnect.current = false;

      wsRef.current.onopen = () => {
        if (connectionStartTime.current) {
          latency.current = Date.now() - connectionStartTime.current;
        }

        console.log(`[useWorkflowStatus] Connected to workflow ${workflowId} debugging (latency: ${latency.current}ms)`);
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionAttempts: 0,
          error: null
        }));

        // Process queued messages
        state.messageQueue.forEach(queuedMessage => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(queuedMessage));
          }
        });
        setState(prev => ({ ...prev, messageQueue: [] }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WorkflowStatusEvent = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('[useWorkflowStatus] Failed to parse message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`[useWorkflowStatus] Connection closed:`, event.code, event.reason);
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));

        // Auto-reconnect if not manually disconnected and under attempt limit
        if (!isManualDisconnect.current && state.connectionAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(1.5, state.connectionAttempts);
          console.log(`[useWorkflowStatus] Reconnecting in ${delay}ms (attempt ${state.connectionAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (state.connectionAttempts >= maxReconnectAttempts) {
          const error = 'Maximum reconnection attempts reached';
          setState(prev => ({ ...prev, error }));
          onError?.(error);
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('[useWorkflowStatus] WebSocket error:', event);
        const error = 'WebSocket connection error';
        setState(prev => ({ ...prev, error, isConnecting: false }));
        onError?.(error);
      };

    } catch (err: any) {
      const error = `Connection failed: ${err.message}`;
      setState(prev => ({ ...prev, error, isConnecting: false }));
      onError?.(error);
    }
  }, [workflowId, token, state.connectionAttempts, state.messageQueue, maxReconnectAttempts, reconnectDelay, onError]);

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionAttempts: 0
    }));
  }, []);

  // ============================================================================
  // MESSAGE HANDLING (Story 3.1 Protocol)
  // ============================================================================

  const handleMessage = useCallback((message: WorkflowStatusEvent) => {
    setState(prev => ({
      ...prev,
      lastMessage: message
    }));

    switch (message.type) {
      case 'connected':
        console.log(`[useWorkflowStatus] Connected to workflow: ${message.workflow_name}`);
        
        const workflowInfo = {
          workflow_id: message.workflow_id,
          workflow_name: message.workflow_name,
          workflow_status: message.workflow_status,
          is_active: message.is_active
        };

        setState(prev => ({
          ...prev,
          workflowInfo,
          recentExecutions: message.recent_executions || []
        }));

        onConnected?.(message);
        break;

      case 'execution_started':
        console.log(`[useWorkflowStatus] Execution started: ${message.execution_id}`);
        
        setState(prev => ({
          ...prev,
          currentExecution: {
            execution_id: message.execution_id,
            status: 'running',
            started_at: message.timestamp
          }
        }));

        onExecutionStarted?.(message);
        break;

      case 'execution_update':
        if (message.node_id && message.status) {
          const nodeStatus: WorkflowNodeData = {
            id: message.node_id,
            status: message.status,
            executionTime: message.execution_time_ms,
            lastUpdated: new Date(message.timestamp),
            errorMessage: message.error_details
          };

          setState(prev => ({
            ...prev,
            nodeStatuses: {
              ...prev.nodeStatuses,
              [message.node_id!]: nodeStatus
            }
          }));

          // Performance target: <100ms status update latency
          onStatusUpdate?.(message.node_id, nodeStatus);
        }
        break;

      case 'execution_completed':
        console.log(`[useWorkflowStatus] Execution completed: ${message.execution_id}`);
        
        setState(prev => ({
          ...prev,
          currentExecution: prev.currentExecution ? {
            ...prev.currentExecution,
            status: message.final_status,
            finished_at: message.timestamp,
            total_nodes: message.total_nodes,
            completed_nodes: message.success_count,
            success_rate: message.success_rate
          } : null
        }));

        onExecutionComplete?.(message);
        break;

      case 'execution_details':
        console.log(`[useWorkflowStatus] Received execution details for: ${message.execution_id}`);
        // This could be used to update a detailed view
        break;

      case 'node_logs':
        if (message.node_id && message.logs) {
          console.log(`[useWorkflowStatus] Received logs for node: ${message.node_id}`);
          
          // Update node with metrics if available
          if (message.metrics && message.node_id) {
            setState(prev => ({
              ...prev,
              nodeStatuses: {
                ...prev.nodeStatuses,
                [message.node_id!]: {
                  ...prev.nodeStatuses[message.node_id!],
                  metrics: message.metrics
                }
              }
            }));
          }
        }
        break;

      case 'subscribed':
        console.log(`[useWorkflowStatus] Subscribed to execution: ${message.execution_id}`);
        break;

      case 'error':
        const error = message.error_details || message.message || 'Unknown error occurred';
        setState(prev => ({ ...prev, error }));
        onError?.(error);
        break;

      default:
        console.log(`[useWorkflowStatus] Unhandled message type: ${message.type}`, message);
    }
  }, [onStatusUpdate, onExecutionComplete, onExecutionStarted, onError, onConnected]);

  // ============================================================================
  // MESSAGE SENDING (Story 3.1 Client Commands)
  // ============================================================================

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is available
      setState(prev => ({
        ...prev,
        messageQueue: [...prev.messageQueue, message]
      }));
    }
  }, []);

  const getExecutionDetails = useCallback((executionId: number) => {
    sendMessage({
      type: 'get_execution_details',
      execution_id: executionId
    });
  }, [sendMessage]);

  const getNodeLogs = useCallback((executionId: number, nodeId: string) => {
    sendMessage({
      type: 'get_node_logs',
      execution_id: executionId,
      node_id: nodeId
    });
  }, [sendMessage]);

  const subscribeToExecution = useCallback((executionId: number) => {
    sendMessage({
      type: 'subscribe_execution',
      execution_id: executionId
    });
  }, [sendMessage]);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  const getNodeStatus = useCallback((nodeId: string): WorkflowNodeData | null => {
    return state.nodeStatuses[nodeId] || null;
  }, [state.nodeStatuses]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, connectionAttempts: 0 }));
    connect();
  }, [connect]);

  const getConnectionLatency = useCallback((): number | null => {
    return latency.current;
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-connect when workflowId changes
  useEffect(() => {
    if (autoConnect && workflowId && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [workflowId, token, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return useMemo(() => ({
    ...state,
    connect,
    disconnect,
    sendMessage,
    getNodeStatus,
    getExecutionDetails,
    getNodeLogs,
    subscribeToExecution,
    clearError,
    retry,
    getConnectionLatency
  }), [
    state,
    connect,
    disconnect,
    sendMessage,
    getNodeStatus,
    getExecutionDetails,
    getNodeLogs,
    subscribeToExecution,
    clearError,
    retry,
    getConnectionLatency
  ]);
}