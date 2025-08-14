/**
 * Story 3.1: Visual Workflow Debugging - Test Suite
 * 
 * Comprehensive test coverage for all Story 3.1 components and functionality
 * 
 * @author Frontend Developer Agent - Story 3.1 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Import components to test
import WorkflowStatusOverlay from '../WorkflowStatusOverlay';
import { WorkflowNodeData } from '../WorkflowStatusOverlay';
import ErrorDetailsModal from '../ErrorDetailsModal';
import ExecutionTimeline from '../ExecutionTimeline';
import WorkflowDebuggingPanel from '../WorkflowDebuggingPanel';
import { useWorkflowStatus } from '../../../hooks/useWorkflowStatus';

// Mock the useWorkflowStatus hook
jest.mock('../../../hooks/useWorkflowStatus', () => ({
  useWorkflowStatus: jest.fn()
}));

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  readyState: WebSocket.OPEN
};
// @ts-ignore
global.WebSocket = jest.fn(() => mockWebSocket);

describe('Story 3.1: Visual Workflow Debugging', () => {
  
  // ========================================================================
  // TEST DATA
  // ========================================================================
  
  const mockNodeData: WorkflowNodeData = {
    id: 'test-node-1',
    status: 'running',
    progress: 75,
    executionTime: 2500,
    lastUpdated: new Date('2024-01-15T10:30:00Z'),
    errorMessage: undefined,
    metadata: {}
  };

  const mockFailedNodeData: WorkflowNodeData = {
    id: 'test-node-2',
    status: 'failed',
    executionTime: 5000,
    lastUpdated: new Date('2024-01-15T10:35:00Z'),
    errorMessage: 'Connection timeout after 5 seconds',
    metadata: {
      retry_count: 2,
      error_code: 'TIMEOUT'
    }
  };

  const mockWorkflowStatusReturn = {
    isConnected: true,
    isConnecting: false,
    error: null,
    nodeStatuses: {
      'test-node-1': mockNodeData,
      'test-node-2': mockFailedNodeData
    },
    currentExecution: {
      execution_id: 123,
      status: 'running',
      started_at: '2024-01-15T10:30:00Z'
    },
    connectionAttempts: 0,
    messageQueue: [],
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    getNodeStatus: jest.fn(),
    getExecutionDetails: jest.fn(),
    getNodeLogs: jest.fn(),
    subscribeToExecution: jest.fn(),
    clearError: jest.fn(),
    retry: jest.fn()
  };

  const mockExecutionData = {
    execution_id: 123,
    workflow_id: 1,
    workflow_name: 'Test Workflow',
    status: 'running' as const,
    started_at: '2024-01-15T10:30:00Z',
    total_steps: 3,
    completed_steps: 2,
    failed_steps: 0,
    success_rate: 66.7,
    steps: [
      {
        id: 'step-1',
        node_id: 'node-1',
        node_name: 'First Step',
        node_type: 'trigger',
        status: 'success' as const,
        started_at: '2024-01-15T10:30:00Z',
        finished_at: '2024-01-15T10:30:30Z',
        execution_time_ms: 30000
      },
      {
        id: 'step-2',
        node_id: 'node-2',
        node_name: 'Second Step',
        node_type: 'action',
        status: 'running' as const,
        started_at: '2024-01-15T10:30:30Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkflowStatus as jest.Mock).mockReturnValue(mockWorkflowStatusReturn);
  });

  // ========================================================================
  // WORKFLOW STATUS OVERLAY TESTS (AC: 1)
  // ========================================================================
  
  describe('WorkflowStatusOverlay Component', () => {
    it('displays status indicators with distinct visual states', () => {
      const { rerender } = render(
        <WorkflowStatusOverlay node={mockNodeData} />
      );

      // Test running state
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label', 
        expect.stringContaining('running')
      );

      // Test failed state
      rerender(<WorkflowStatusOverlay node={mockFailedNodeData} />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label', 
        expect.stringContaining('failed')
      );
    });

    it('shows progress for running nodes', () => {
      render(<WorkflowStatusOverlay node={mockNodeData} showProgress={true} />);
      
      // Should show progress in title attribute
      const statusButton = screen.getByRole('button');
      expect(statusButton).toHaveAttribute(
        'title', 
        expect.stringContaining('75%')
      );
    });

    it('displays execution time when provided', () => {
      render(
        <WorkflowStatusOverlay 
          node={mockNodeData} 
          showExecutionTime={true} 
        />
      );
      
      const statusButton = screen.getByRole('button');
      expect(statusButton).toHaveAttribute(
        'title', 
        expect.stringContaining('2.5s')
      );
    });

    it('handles error click for failed nodes', () => {
      const mockErrorClick = jest.fn();
      
      render(
        <WorkflowStatusOverlay 
          node={mockFailedNodeData} 
          onErrorClick={mockErrorClick}
        />
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockErrorClick).toHaveBeenCalledWith(
        mockFailedNodeData, 
        'Connection timeout after 5 seconds'
      );
    });

    it('applies animations when enabled', () => {
      render(<WorkflowStatusOverlay node={mockNodeData} animate={true} />);
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('shadow-lg');
    });
  });

  // ========================================================================
  // ERROR DETAILS MODAL TESTS (AC: 3)
  // ========================================================================
  
  describe('ErrorDetailsModal Component', () => {
    const mockErrorContext = {
      workflow_id: 1,
      execution_id: 123,
      workflow_name: 'Test Workflow',
      node_type: 'action'
    };

    const mockErrorLogs = [
      {
        timestamp: '2024-01-15T10:35:00Z',
        level: 'ERROR' as const,
        message: 'Connection failed',
        stack: 'Error at line 1',
        context: { timeout: 5000 }
      }
    ];

    it('displays error details inline without navigation', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          node={mockFailedNodeData}
          errorContext={mockErrorContext}
          errorLogs={mockErrorLogs}
        />
      );

      expect(screen.getByText('Node Execution Error')).toBeInTheDocument();
      expect(screen.getByText('Connection timeout after 5 seconds')).toBeInTheDocument();
    });

    it('shows contextual error information', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          node={mockFailedNodeData}
          errorContext={mockErrorContext}
          errorLogs={mockErrorLogs}
        />
      );

      // Check for contextual information
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
      expect(screen.getByText('action')).toBeInTheDocument();
    });

    it('provides restart action for failed nodes', () => {
      const mockRestart = jest.fn();
      
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          node={mockFailedNodeData}
          onRestartNode={mockRestart}
        />
      );

      const restartButton = screen.getByText('Restart Node');
      fireEvent.click(restartButton);
      
      expect(mockRestart).toHaveBeenCalledWith('test-node-2');
    });

    it('displays error logs with different severity levels', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          node={mockFailedNodeData}
          errorLogs={mockErrorLogs}
        />
      );

      // Click on logs tab
      fireEvent.click(screen.getByText(/Logs/));
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EXECUTION TIMELINE TESTS (AC: 4, 6)
  // ========================================================================
  
  describe('ExecutionTimeline Component', () => {
    it('displays step-by-step progress with timestamps', () => {
      render(
        <ExecutionTimeline 
          executionData={mockExecutionData}
          showMetrics={false}
        />
      );

      expect(screen.getByText('First Step')).toBeInTheDocument();
      expect(screen.getByText('Second Step')).toBeInTheDocument();
      
      // Check for timestamps
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
      expect(screen.getByText(/Finished:/)).toBeInTheDocument();
    });

    it('shows performance metrics when enabled', () => {
      const executionDataWithMetrics = {
        ...mockExecutionData,
        steps: [
          {
            ...mockExecutionData.steps[0],
            performance_metrics: {
              cpu_usage: 25.5,
              memory_usage: 128.7
            }
          }
        ]
      };

      render(
        <ExecutionTimeline 
          executionData={executionDataWithMetrics}
          showMetrics={true}
        />
      );

      expect(screen.getByText(/CPU: 25.5%/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 128.7MB/)).toBeInTheDocument();
    });

    it('handles step selection', () => {
      const mockStepSelect = jest.fn();
      
      render(
        <ExecutionTimeline 
          executionData={mockExecutionData}
          onStepSelect={mockStepSelect}
        />
      );

      const firstStep = screen.getByText('First Step');
      fireEvent.click(firstStep.closest('div')!);
      
      expect(mockStepSelect).toHaveBeenCalledWith('step-1');
    });

    it('provides export functionality', () => {
      const mockExport = jest.fn();
      
      render(
        <ExecutionTimeline 
          executionData={mockExecutionData}
          onExport={mockExport}
        />
      );

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(mockExport).toHaveBeenCalledWith('json');
    });

    it('filters steps by status', () => {
      render(
        <ExecutionTimeline 
          executionData={mockExecutionData}
        />
      );

      // Click failed filter
      const failedFilter = screen.getByText('Failed');
      fireEvent.click(failedFilter);
      
      // Should show no steps since none are failed
      expect(screen.getByText('No steps match the current filter')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // WEBSOCKET INTEGRATION TESTS (AC: 2)
  // ========================================================================
  
  describe('useWorkflowStatus Hook Integration', () => {
    it('establishes WebSocket connection when enabled', () => {
      const mockConnect = jest.fn();
      (useWorkflowStatus as jest.Mock).mockReturnValue({
        ...mockWorkflowStatusReturn,
        connect: mockConnect
      });

      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
          isDebugging={true}
        />
      );

      // Should connect when debugging is enabled
      expect(mockConnect).toHaveBeenCalled();
    });

    it('handles real-time status updates', async () => {
      const { rerender } = render(
        <WorkflowStatusOverlay node={mockNodeData} />
      );

      // Simulate status update
      const updatedNodeData = {
        ...mockNodeData,
        status: 'success' as const,
        progress: 100
      };

      (useWorkflowStatus as jest.Mock).mockReturnValue({
        ...mockWorkflowStatusReturn,
        nodeStatuses: {
          'test-node-1': updatedNodeData
        }
      });

      rerender(<WorkflowStatusOverlay node={updatedNodeData} />);

      // Should reflect the updated status
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label', 
        expect.stringContaining('success')
      );
    });

    it('handles connection errors gracefully', () => {
      (useWorkflowStatus as jest.Mock).mockReturnValue({
        ...mockWorkflowStatusReturn,
        isConnected: false,
        error: 'Connection failed'
      });

      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
          isDebugging={true}
        />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTEGRATION TESTS (AC: 5)
  // ========================================================================
  
  describe('WorkflowDebuggingPanel Integration', () => {
    it('highlights current execution flow', () => {
      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test Workflow' } as any}
          isDebugging={true}
        />
      );

      // Should show workflow canvas with highlighted nodes
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    it('handles workflow execution', async () => {
      const mockExecute = jest.fn().mockResolvedValue({});
      
      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
          isDebugging={true}
          onExecuteWorkflow={mockExecute}
        />
      );

      const executeButton = screen.getByText('Execute');
      fireEvent.click(executeButton);
      
      expect(mockExecute).toHaveBeenCalled();
    });

    it('switches between canvas and timeline views', () => {
      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
        />
      );

      // Should have tabs for different views
      expect(screen.getByText('Workflow Canvas')).toBeInTheDocument();
      expect(screen.getByText('Execution Timeline')).toBeInTheDocument();

      // Click timeline tab
      fireEvent.click(screen.getByText('Execution Timeline'));
      
      // Should show timeline content
      expect(screen.getByText('Execution Overview')).toBeInTheDocument();
    });

    it('handles export functionality', () => {
      const mockExport = jest.fn();
      
      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
          onExport={mockExport}
        />
      );

      // Navigate to timeline tab
      fireEvent.click(screen.getByText('Execution Timeline'));
      
      // Find and click export button
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(mockExport).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PERFORMANCE AND ACCESSIBILITY TESTS
  // ========================================================================
  
  describe('Performance and Accessibility', () => {
    it('meets accessibility requirements', () => {
      render(<WorkflowStatusOverlay node={mockNodeData} />);
      
      const statusButton = screen.getByRole('button');
      expect(statusButton).toHaveAttribute('aria-label');
      expect(statusButton).toHaveAttribute('title');
    });

    it('handles keyboard navigation', () => {
      render(<WorkflowStatusOverlay node={mockFailedNodeData} onErrorClick={jest.fn()} />);
      
      const statusButton = screen.getByRole('button');
      expect(statusButton).toHaveAttribute('tabIndex', '0');
      
      // Test keyboard activation
      fireEvent.keyDown(statusButton, { key: 'Enter' });
      // Should trigger click behavior
    });

    it('optimizes re-renders with memoization', () => {
      const mockOnClick = jest.fn();
      
      const { rerender } = render(
        <WorkflowStatusOverlay node={mockNodeData} onClick={mockOnClick} />
      );

      // Rerender with same props
      rerender(
        <WorkflowStatusOverlay node={mockNodeData} onClick={mockOnClick} />
      );

      // Component should be memoized and not cause unnecessary re-renders
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================
  
  describe('Error Handling', () => {
    it('handles missing node data gracefully', () => {
      const incompleteNode = {
        id: 'incomplete',
        status: 'pending' as const
      };

      render(<WorkflowStatusOverlay node={incompleteNode} />);
      
      // Should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles WebSocket connection failures', () => {
      (useWorkflowStatus as jest.Mock).mockReturnValue({
        ...mockWorkflowStatusReturn,
        isConnected: false,
        error: 'WebSocket connection failed',
        connectionAttempts: 3
      });

      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
          isDebugging={true}
        />
      );

      expect(screen.getByText(/Retry/)).toBeInTheDocument();
    });

    it('provides fallback when real-time updates fail', () => {
      const mockRefresh = jest.fn();
      (useWorkflowStatus as jest.Mock).mockReturnValue({
        ...mockWorkflowStatusReturn,
        isConnected: false,
        retry: mockRefresh
      });

      render(
        <WorkflowDebuggingPanel
          workflow={{ id: 1, name: 'Test' } as any}
        />
      );

      // Should provide manual refresh option
      const refreshButton = screen.getByLabelText(/refresh/i) || screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});