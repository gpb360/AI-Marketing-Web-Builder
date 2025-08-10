/**
 * useWorkflowStatus Hook Tests
 * 
 * Story 3.1: Visual Workflow Debugging - WebSocket Integration Hook Tests
 * Comprehensive test coverage for real-time workflow status management
 * 
 * Features tested:
 * - WebSocket connection management with auto-reconnect
 * - Real-time status updates for workflow nodes
 * - Error handling and connection state management
 * - Performance monitoring (latency tracking)
 * - Message queuing and callback integration
 * 
 * @author Test Writer Agent - Story 3.1 Test Implementation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import { useWorkflowStatus } from '../useWorkflowStatus';
import type { 
  UseWorkflowStatusOptions, 
  WorkflowStatusEvent,
  WorkflowNodeData
} from '../useWorkflowStatus';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send = jest.fn();
  close = jest.fn((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  });
}

// Mock useAuth hook
const mockUseAuth = jest.fn(() => ({
  token: 'test-token-123'
}));

jest.mock('../useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Set up global WebSocket mock
(global as any).WebSocket = MockWebSocket;

// Mock environment variable
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000';

// ============================================================================
// TEST DATA
// ============================================================================

const mockOptions: UseWorkflowStatusOptions = {
  workflowId: 123,
  autoConnect: true,
  maxReconnectAttempts: 3,
  reconnectDelay: 1000,
  onStatusUpdate: jest.fn(),
  onExecutionComplete: jest.fn(),
  onExecutionStarted: jest.fn(),
  onError: jest.fn(),
  onConnected: jest.fn()
};

const mockConnectedEvent: WorkflowStatusEvent = {
  type: 'connected',
  timestamp: '2024-01-15T10:30:00Z',
  workflow_id: 123,
  workflow_name: 'Test Workflow',
  workflow_status: 'active',
  is_active: true,
  recent_executions: [
    {
      execution_id: 456,
      status: 'completed',
      started_at: '2024-01-15T10:25:00Z',
      finished_at: '2024-01-15T10:29:00Z',
      execution_time: 240000
    }
  ]
};

const mockExecutionStartedEvent: WorkflowStatusEvent = {
  type: 'execution_started',
  timestamp: '2024-01-15T10:30:00Z',
  workflow_id: 123,
  execution_id: 789
};

const mockExecutionUpdateEvent: WorkflowStatusEvent = {
  type: 'execution_update',
  timestamp: '2024-01-15T10:30:15Z',
  workflow_id: 123,
  execution_id: 789,
  node_id: 'node-1',
  status: 'running',
  execution_time_ms: 2500
};

const mockExecutionCompletedEvent: WorkflowStatusEvent = {
  type: 'execution_completed',
  timestamp: '2024-01-15T10:32:00Z',
  workflow_id: 123,
  execution_id: 789,
  final_status: 'success',
  duration_ms: 120000,
  success_count: 5,
  total_nodes: 5,
  success_rate: 100
};

const mockErrorEvent: WorkflowStatusEvent = {
  type: 'error',
  timestamp: '2024-01-15T10:30:30Z',
  workflow_id: 123,
  error_details: 'Connection timeout occurred',
  message: 'WebSocket error'
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('useWorkflowStatus Hook', () => {
  let mockWebSocket: MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: 'test-token-123' });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ========================================================================
  // CONNECTION MANAGEMENT TESTS
  // ========================================================================

  describe('Connection Management', () => {
    it('establishes WebSocket connection on mount with autoConnect', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnecting).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isConnecting).toBe(false);
      });
    });

    it('does not auto-connect when autoConnect is false', () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        autoConnect: false
      }));

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
    });

    it('constructs correct WebSocket URL with token', async () => {
      renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(MockWebSocket).toHaveBeenCalledWith(
          'ws://localhost:8000/api/v1/workflows/123/debug?token=test-token-123'
        );
      });
    });

    it('handles manual connect and disconnect', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        autoConnect: false
      }));

      expect(result.current.isConnected).toBe(false);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        result.current.disconnect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('prevents duplicate connections', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Try to connect again
      act(() => {
        result.current.connect();
      });

      // Should still have only one connection
      expect(MockWebSocket).toHaveBeenCalledTimes(1);
    });

    it('does not connect without workflowId or token', () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        workflowId: null
      }));

      expect(result.current.isConnected).toBe(false);
      expect(MockWebSocket).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // MESSAGE HANDLING TESTS
  // ========================================================================

  describe('Message Handling', () => {
    it('handles connected event and triggers callback', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate receiving connected message
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockConnectedEvent)
          }));
        }
      });

      await waitFor(() => {
        expect(result.current.workflowInfo).toEqual({
          workflow_id: 123,
          workflow_name: 'Test Workflow',
          workflow_status: 'active',
          is_active: true
        });
        expect(result.current.recentExecutions).toEqual(mockConnectedEvent.recent_executions);
        expect(mockOptions.onConnected).toHaveBeenCalledWith(mockConnectedEvent);
      });
    });

    it('handles execution started event', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockExecutionStartedEvent)
          }));
        }
      });

      await waitFor(() => {
        expect(result.current.currentExecution).toEqual({
          execution_id: 789,
          status: 'running',
          started_at: '2024-01-15T10:30:00Z'
        });
        expect(mockOptions.onExecutionStarted).toHaveBeenCalledWith(mockExecutionStartedEvent);
      });
    });

    it('handles execution update event with node status', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockExecutionUpdateEvent)
          }));
        }
      });

      await waitFor(() => {
        const nodeStatus = result.current.nodeStatuses['node-1'];
        expect(nodeStatus).toEqual({
          id: 'node-1',
          status: 'running',
          executionTime: 2500,
          lastUpdated: new Date('2024-01-15T10:30:15Z')
        });
        expect(mockOptions.onStatusUpdate).toHaveBeenCalledWith('node-1', nodeStatus);
      });
    });

    it('handles execution completed event', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // First start an execution
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockExecutionStartedEvent)
          }));
        }
      });

      // Then complete it
      act(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockExecutionCompletedEvent)
          }));
        }
      });

      await waitFor(() => {
        expect(result.current.currentExecution).toEqual({
          execution_id: 789,
          status: 'success',
          started_at: '2024-01-15T10:30:00Z',
          finished_at: '2024-01-15T10:32:00Z',
          total_nodes: 5,
          completed_nodes: 5,
          success_rate: 100
        });
        expect(mockOptions.onExecutionComplete).toHaveBeenCalledWith(mockExecutionCompletedEvent);
      });
    });

    it('handles error events', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockErrorEvent)
          }));
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Connection timeout occurred');
        expect(mockOptions.onError).toHaveBeenCalledWith('Connection timeout occurred');
      });
    });

    it('handles malformed messages gracefully', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: 'invalid json'
          }));
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[useWorkflowStatus] Failed to parse message:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // MESSAGE SENDING TESTS
  // ========================================================================

  describe('Message Sending', () => {
    it('sends messages when connected', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const testMessage = { type: 'test', data: 'test-data' };

      act(() => {
        result.current.sendMessage(testMessage);
      });

      mockWebSocket = (MockWebSocket as any).mock.instances[0];
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
    });

    it('queues messages when disconnected', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        autoConnect: false
      }));

      const testMessage = { type: 'test', data: 'test-data' };

      act(() => {
        result.current.sendMessage(testMessage);
      });

      expect(result.current.messageQueue).toContain(testMessage);
    });

    it('sends queued messages on connection', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        autoConnect: false
      }));

      const testMessage = { type: 'test', data: 'test-data' };

      // Queue a message while disconnected
      act(() => {
        result.current.sendMessage(testMessage);
      });

      expect(result.current.messageQueue).toContain(testMessage);

      // Connect
      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockWebSocket = (MockWebSocket as any).mock.instances[0];
      
      // Wait for queued messages to be processed
      await waitFor(() => {
        expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
        expect(result.current.messageQueue).toHaveLength(0);
      });
    });

    it('provides convenience methods for common messages', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockWebSocket = (MockWebSocket as any).mock.instances[0];

      act(() => {
        result.current.getExecutionDetails(456);
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'get_execution_details',
        execution_id: 456
      }));

      act(() => {
        result.current.getNodeLogs(456, 'node-1');
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'get_node_logs',
        execution_id: 456,
        node_id: 'node-1'
      }));

      act(() => {
        result.current.subscribeToExecution(456);
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'subscribe_execution',
        execution_id: 456
      }));
    });
  });

  // ========================================================================
  // ERROR HANDLING AND RECONNECTION TESTS
  // ========================================================================

  describe('Error Handling and Reconnection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('attempts reconnection on connection loss', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate connection loss
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close', { code: 1006 }));
        }
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionAttempts).toBe(1);

      // Fast-forward timer to trigger reconnection
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should attempt to reconnect
      expect(MockWebSocket).toHaveBeenCalledTimes(2);
    });

    it('uses exponential backoff for reconnection delays', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        reconnectDelay: 1000
      }));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate multiple connection failures
      for (let attempt = 0; attempt < 3; attempt++) {
        act(() => {
          mockWebSocket = (MockWebSocket as any).mock.instances[MockWebSocket.mock.instances.length - 1];
          if (mockWebSocket.onclose) {
            mockWebSocket.onclose(new CloseEvent('close', { code: 1006 }));
          }
        });

        const expectedDelay = 1000 * Math.pow(1.5, attempt);
        
        act(() => {
          jest.advanceTimersByTime(expectedDelay - 1);
        });

        // Should not reconnect yet
        expect(MockWebSocket).toHaveBeenCalledTimes(attempt + 2);

        act(() => {
          jest.advanceTimersByTime(1);
        });

        // Should reconnect now
        expect(MockWebSocket).toHaveBeenCalledTimes(attempt + 3);
      }
    });

    it('stops reconnecting after max attempts', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        maxReconnectAttempts: 2
      }));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate connection failures beyond max attempts
      for (let attempt = 0; attempt < 3; attempt++) {
        act(() => {
          mockWebSocket = (MockWebSocket as any).mock.instances[MockWebSocket.mock.instances.length - 1];
          if (mockWebSocket.onclose) {
            mockWebSocket.onclose(new CloseEvent('close', { code: 1006 }));
          }
        });

        act(() => {
          jest.advanceTimersByTime(5000);
        });
      }

      await waitFor(() => {
        expect(result.current.error).toBe('Maximum reconnection attempts reached');
        expect(mockOptions.onError).toHaveBeenCalledWith('Maximum reconnection attempts reached');
      });
    });

    it('does not reconnect on manual disconnect', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Manual disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.isConnected).toBe(false);

      // Fast-forward timers - should not reconnect
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(MockWebSocket).toHaveBeenCalledTimes(1);
    });

    it('handles WebSocket errors', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('WebSocket connection error');
        expect(mockOptions.onError).toHaveBeenCalledWith('WebSocket connection error');
      });
    });

    it('provides retry functionality', async () => {
      const { result } = renderHook(() => useWorkflowStatus({
        ...mockOptions,
        maxReconnectAttempts: 1
      }));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Cause connection failure beyond max attempts
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close', { code: 1006 }));
        }
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should fail after max attempts
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Retry should reset attempts and reconnect
      act(() => {
        result.current.retry();
      });

      expect(result.current.connectionAttempts).toBe(0);
      expect(MockWebSocket).toHaveBeenCalledTimes(3); // Initial + failed attempt + retry
    });

    it('clears errors when requested', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Cause an error
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ========================================================================
  // UTILITY METHOD TESTS
  // ========================================================================

  describe('Utility Methods', () => {
    it('provides node status lookup', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Add a node status
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(new MessageEvent('message', {
            data: JSON.stringify(mockExecutionUpdateEvent)
          }));
        }
      });

      const nodeStatus = result.current.getNodeStatus('node-1');
      expect(nodeStatus).toBeDefined();
      expect(nodeStatus?.id).toBe('node-1');
      expect(nodeStatus?.status).toBe('running');

      const missingStatus = result.current.getNodeStatus('non-existent');
      expect(missingStatus).toBeNull();
    });

    it('tracks connection latency', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const latency = result.current.getConnectionLatency();
      expect(latency).toBeGreaterThanOrEqual(0);
    });
  });

  // ========================================================================
  // CLEANUP TESTS
  // ========================================================================

  describe('Cleanup', () => {
    it('cleans up WebSocket connection on unmount', async () => {
      const { result, unmount } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockWebSocket = (MockWebSocket as any).mock.instances[0];

      unmount();

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Manual disconnect');
    });

    it('clears reconnection timers on unmount', async () => {
      jest.useFakeTimers();
      
      const { result, unmount } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Cause disconnection to start reconnection timer
      act(() => {
        mockWebSocket = (MockWebSocket as any).mock.instances[0];
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new CloseEvent('close', { code: 1006 }));
        }
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  describe('Performance', () => {
    it('memoizes return value to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useWorkflowStatus(mockOptions));

      const initialReturn = result.current;
      
      // Re-render with same props
      rerender();
      
      // The memoized return should be the same reference
      expect(result.current).toBe(initialReturn);
    });

    it('handles high-frequency message updates efficiently', async () => {
      const { result } = renderHook(() => useWorkflowStatus(mockOptions));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockWebSocket = (MockWebSocket as any).mock.instances[0];

      // Send 100 rapid updates
      const startTime = Date.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          if (mockWebSocket.onmessage) {
            mockWebSocket.onmessage(new MessageEvent('message', {
              data: JSON.stringify({
                ...mockExecutionUpdateEvent,
                node_id: `node-${i}`,
                execution_time_ms: i * 100
              })
            }));
          }
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should process all updates quickly (less than 100ms for 100 updates)
      expect(duration).toBeLessThan(100);
      expect(Object.keys(result.current.nodeStatuses)).toHaveLength(100);
    });
  });
});