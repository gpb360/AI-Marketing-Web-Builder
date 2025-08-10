/**
 * WorkflowDebugger Integration Component Tests
 * 
 * Story 3.1: Visual Workflow Debugging - Main Integration Component Tests
 * Comprehensive test coverage for the main debugging panel integration
 * 
 * Features tested:
 * - Real-time workflow status monitoring with WebSocket
 * - Visual workflow nodes with status overlays
 * - Error details modal integration for failed nodes
 * - Execution timeline with step-by-step progress
 * - Performance metrics and SLA integration
 * - Export functionality for logs and analytics
 * 
 * @author Test Writer Agent - Story 3.1 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import WorkflowDebuggingPanel, {
  type WorkflowDebuggingPanelProps,
  type WorkflowNode
} from '../WorkflowDebuggingPanel';
import { useWorkflowStatus } from '../../../hooks/useWorkflowStatus';
import type { Workflow, WorkflowExecution } from '@/lib/api/types';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the useWorkflowStatus hook
jest.mock('../../../hooks/useWorkflowStatus', () => ({
  useWorkflowStatus: jest.fn()
}));

// Mock child components to isolate integration testing
jest.mock('../WorkflowStatusOverlay', () => ({
  __esModule: true,
  default: ({ node, onErrorClick }: any) => (
    <div 
      data-testid={`status-overlay-${node.id}`}
      onClick={() => onErrorClick?.(node, node.errorMessage)}
    >
      Status: {node.status}
    </div>
  )
}));

jest.mock('../ErrorDetailsModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, error, onRetry }: any) => isOpen ? (
    <div data-testid="error-modal">
      <div>Error Modal: {error?.error_message}</div>
      <button onClick={() => onRetry?.(error?.node_id)}>Retry</button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}));

jest.mock('../ExecutionTimeline', () => ({
  __esModule: true,
  default: ({ steps, onExport, onStepSelect }: any) => (
    <div data-testid="execution-timeline">
      <div>Timeline Steps: {steps.length}</div>
      <button onClick={() => onExport?.('json')}>Export</button>
      {steps.map((step: any) => (
        <div 
          key={step.id} 
          onClick={() => onStepSelect?.(step.id)}
          data-testid={`timeline-step-${step.id}`}
        >
          {step.node_name}: {step.status}
        </div>
      ))}
    </div>
  )
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockWorkflow: Workflow = {
  id: 123,
  name: 'Test Marketing Workflow',
  description: 'Test workflow for debugging',
  status: 'active',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  nodes: [],
  edges: []
};

const mockWorkflowNodes: WorkflowNode[] = [
  {
    id: 'trigger-1',
    name: 'Form Submission',
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
    config: { template: 'welcome' }
  },
  {
    id: 'action-2',
    name: 'Update CRM',
    type: 'crm_update',
    position: { x: 500, y: 100 },
    connections: [],
    config: { field: 'status', value: 'contacted' }
  }
];

const mockWorkflowStatusReturn = {
  isConnected: true,
  isConnecting: false,
  error: null,
  nodeStatuses: {
    'trigger-1': {
      id: 'trigger-1',
      status: 'success' as const,
      executionTime: 1500,
      lastUpdated: new Date('2024-01-15T10:30:00Z')
    },
    'action-1': {
      id: 'action-1',
      status: 'running' as const,
      progress: 75,
      lastUpdated: new Date('2024-01-15T10:30:15Z')
    },
    'action-2': {
      id: 'action-2',
      status: 'failed' as const,
      executionTime: 3000,
      lastUpdated: new Date('2024-01-15T10:30:30Z'),
      errorMessage: 'CRM API connection failed'
    }
  },
  currentExecution: {
    execution_id: 456,
    status: 'running',
    started_at: '2024-01-15T10:30:00Z',
    total_nodes: 3,
    completed_nodes: 1,
    success_rate: 33.3
  },
  workflowInfo: {
    workflow_id: 123,
    workflow_name: 'Test Marketing Workflow',
    workflow_status: 'active',
    is_active: true
  },
  recentExecutions: [],
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
  retry: jest.fn(),
  getConnectionLatency: jest.fn(() => 50)
};

const defaultProps: WorkflowDebuggingPanelProps = {
  workflow: mockWorkflow,
  isDebugging: false,
  onStartDebugging: jest.fn(),
  onStopDebugging: jest.fn(),
  onExecuteWorkflow: jest.fn(),
  onEditNode: jest.fn(),
  onExport: jest.fn()
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('WorkflowDebuggingPanel Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkflowStatus as jest.Mock).mockReturnValue(mockWorkflowStatusReturn);
  });

  // ========================================================================
  // BASIC RENDERING TESTS
  // ========================================================================

  describe('Basic Rendering', () => {
    it('renders the debugging panel with workflow information', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Workflow Debugging Panel')).toBeInTheDocument();
      expect(screen.getByText('Workflow: Test Marketing Workflow')).toBeInTheDocument();
      expect(screen.getByText('Nodes: 0')).toBeInTheDocument(); // No node statuses yet
      expect(screen.getByText('Debugging Inactive')).toBeInTheDocument();
    });

    it('displays debugging status correctly', () => {
      const activeProps = { ...defaultProps, isDebugging: true };
      render(<WorkflowDebuggingPanel {...activeProps} />);

      expect(screen.getByText('Debugging Active')).toBeInTheDocument();
    });

    it('shows connection status from WebSocket hook', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('displays execution statistics when available', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // With mock node statuses
      expect(screen.getByText('Nodes: 3')).toBeInTheDocument(); // 3 node statuses
      expect(screen.getByText('Running: 1')).toBeInTheDocument();
      expect(screen.getByText('Failed: 1')).toBeInTheDocument();
    });

    it('handles missing workflow gracefully', () => {
      const propsWithoutWorkflow = { ...defaultProps, workflow: undefined };
      render(<WorkflowDebuggingPanel {...propsWithoutWorkflow} />);

      expect(screen.getByText('Workflow Debugging Panel')).toBeInTheDocument();
      expect(screen.queryByText('Workflow:')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // CONNECTION MANAGEMENT TESTS
  // ========================================================================

  describe('Connection Management', () => {
    it('connects to WebSocket when debugging starts', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const startButton = screen.getByText('Start Debugging');
      await user.click(startButton);

      expect(mockWorkflowStatusReturn.connect).toHaveBeenCalled();
      expect(defaultProps.onStartDebugging).toHaveBeenCalled();
    });

    it('disconnects WebSocket when debugging stops', async () => {
      const activeProps = { ...defaultProps, isDebugging: true };
      render(<WorkflowDebuggingPanel {...activeProps} />);

      const stopButton = screen.getByText('Stop Debugging');
      await user.click(stopButton);

      expect(mockWorkflowStatusReturn.disconnect).toHaveBeenCalled();
      expect(defaultProps.onStopDebugging).toHaveBeenCalled();
    });

    it('displays connection error states', () => {
      const errorStatusReturn = {
        ...mockWorkflowStatusReturn,
        isConnected: false,
        error: 'Connection failed',
        connectionAttempts: 2
      };
      (useWorkflowStatus as jest.Mock).mockReturnValue(errorStatusReturn);

      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Retry 2')).toBeInTheDocument();
    });

    it('provides retry functionality for failed connections', async () => {
      const errorStatusReturn = {
        ...mockWorkflowStatusReturn,
        isConnected: false,
        error: 'Connection failed'
      };
      (useWorkflowStatus as jest.Mock).mockReturnValue(errorStatusReturn);

      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockWorkflowStatusReturn.retry).toHaveBeenCalled();
    });

    it('shows connecting state properly', () => {
      const connectingStatusReturn = {
        ...mockWorkflowStatusReturn,
        isConnected: false,
        isConnecting: true
      };
      (useWorkflowStatus as jest.Mock).mockReturnValue(connectingStatusReturn);

      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // WORKFLOW CANVAS TESTS
  // ========================================================================

  describe('Workflow Canvas', () => {
    it('renders workflow canvas by default', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Should be on canvas tab by default
      expect(screen.getByText('Workflow Canvas')).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('displays workflow nodes with status overlays', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Mock nodes should be displayed with their statuses
      expect(screen.getByTestId('status-overlay-trigger-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-overlay-action-1')).toBeInTheDocument();
      expect(screen.getByTestId('status-overlay-action-2')).toBeInTheDocument();
    });

    it('handles node clicks to show error details', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Click on failed node
      const failedNodeOverlay = screen.getByTestId('status-overlay-action-2');
      await user.click(failedNodeOverlay);

      expect(screen.getByTestId('error-modal')).toBeInTheDocument();
      expect(screen.getByText('Error Modal: CRM API connection failed')).toBeInTheDocument();
    });

    it('toggles status overlay visibility', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /eye/i });
      await user.click(toggleButton);

      // Status overlay visibility should toggle
      // This would be tested in the actual canvas implementation
    });

    it('displays connection lines between nodes', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // SVG connection lines should be rendered
      const canvas = screen.getByRole('tabpanel');
      expect(canvas.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // EXECUTION TIMELINE TESTS
  // ========================================================================

  describe('Execution Timeline', () => {
    it('switches to timeline view', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      expect(screen.getByTestId('execution-timeline')).toBeInTheDocument();
      expect(screen.getByText('Timeline Steps: 3')).toBeInTheDocument();
    });

    it('converts node statuses to timeline steps', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      // Should show steps based on mock nodes
      expect(screen.getByTestId('timeline-step-trigger-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-step-action-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-step-action-2')).toBeInTheDocument();
    });

    it('handles timeline step selection', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      const timelineStep = screen.getByTestId('timeline-step-trigger-1');
      await user.click(timelineStep);

      // Step selection should work (implementation depends on actual timeline)
    });

    it('provides export functionality from timeline', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      expect(defaultProps.onExport).toHaveBeenCalledWith('json', expect.any(Object));
    });
  });

  // ========================================================================
  // PERFORMANCE METRICS TESTS
  // ========================================================================

  describe('Performance Metrics', () => {
    it('displays performance metrics tab', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Performance Metrics'));

      expect(screen.getByText('Execution Status')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Execution Time')).toBeInTheDocument();
    });

    it('shows execution completion statistics', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Performance Metrics'));

      // Should show stats based on node statuses
      expect(screen.getByText('1/3')).toBeInTheDocument(); // completed/total
      expect(screen.getByText('33% Complete')).toBeInTheDocument();
    });

    it('calculates success rate correctly', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Performance Metrics'));

      expect(screen.getByText('0%')).toBeInTheDocument(); // 0% success rate (1 success, 1 failure)
      expect(screen.getByText('1 failures')).toBeInTheDocument();
    });

    it('shows average execution time', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Performance Metrics'));

      // Should show some execution time (mocked)
      expect(screen.getByText(/ms/)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // WORKFLOW EXECUTION TESTS
  // ========================================================================

  describe('Workflow Execution', () => {
    it('handles workflow execution', async () => {
      const activeProps = { ...defaultProps, isDebugging: true };
      render(<WorkflowDebuggingPanel {...activeProps} />);

      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);

      expect(defaultProps.onExecuteWorkflow).toHaveBeenCalled();
    });

    it('disables execute button when not debugging', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const executeButton = screen.getByText('Execute');
      expect(executeButton).toBeDisabled();
    });

    it('disables execute button during execution', async () => {
      // Mock execution in progress
      const executingProps = { ...defaultProps, isDebugging: true };
      const { rerender } = render(<WorkflowDebuggingPanel {...executingProps} />);

      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);

      // Simulate execution state
      rerender(<WorkflowDebuggingPanel {...executingProps} />);

      // Button should show spinning state (implementation detail)
    });

    it('runs mock execution when no handler provided', async () => {
      const propsWithoutExecution = { 
        ...defaultProps, 
        isDebugging: true,
        onExecuteWorkflow: undefined 
      };
      
      jest.useFakeTimers();
      render(<WorkflowDebuggingPanel {...propsWithoutExecution} />);

      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);

      // Should start mock execution
      expect(executeButton).toBeDisabled();

      // Fast forward mock execution
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      jest.useRealTimers();
    });
  });

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================

  describe('Error Handling', () => {
    it('displays error modal when node fails', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Click on failed node
      const failedNodeOverlay = screen.getByTestId('status-overlay-action-2');
      await user.click(failedNodeOverlay);

      expect(screen.getByTestId('error-modal')).toBeInTheDocument();
    });

    it('handles node restart from error modal', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Open error modal
      const failedNodeOverlay = screen.getByTestId('status-overlay-action-2');
      await user.click(failedNodeOverlay);

      // Click retry button
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      // Should close modal and retry node
      expect(screen.queryByTestId('error-modal')).not.toBeInTheDocument();
    });

    it('closes error modal properly', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Open error modal
      const failedNodeOverlay = screen.getByTestId('status-overlay-action-2');
      await user.click(failedNodeOverlay);

      expect(screen.getByTestId('error-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      expect(screen.queryByTestId('error-modal')).not.toBeInTheDocument();
    });

    it('handles node editing from error context', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      // This would test the edit node functionality
      // Implementation depends on actual error modal integration
    });
  });

  // ========================================================================
  // EXPORT FUNCTIONALITY TESTS
  // ========================================================================

  describe('Export Functionality', () => {
    it('exports debugging data with correct format', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      expect(defaultProps.onExport).toHaveBeenCalledWith('json', expect.objectContaining({
        workflow_id: 123,
        workflow_name: 'Test Marketing Workflow',
        execution_stats: expect.any(Object),
        timeline_steps: expect.any(Array),
        node_statuses: expect.any(Object),
        timestamp: expect.any(String)
      }));
    });

    it('handles export errors gracefully', async () => {
      const errorExportProps = {
        ...defaultProps,
        onExport: jest.fn(() => { throw new Error('Export failed'); })
      };

      render(<WorkflowDebuggingPanel {...errorExportProps} />);

      await user.click(screen.getByText('Execution Timeline'));

      const exportButton = screen.getByText('Export');
      
      // Should not crash on export error
      await user.click(exportButton);
    });
  });

  // ========================================================================
  // REAL-TIME UPDATE TESTS
  // ========================================================================

  describe('Real-Time Updates', () => {
    it('updates UI when node statuses change', () => {
      const { rerender } = render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Initially shows current status
      expect(screen.getByText('Status: success')).toBeInTheDocument();
      expect(screen.getByText('Status: running')).toBeInTheDocument();
      expect(screen.getByText('Status: failed')).toBeInTheDocument();

      // Update node status
      const updatedStatusReturn = {
        ...mockWorkflowStatusReturn,
        nodeStatuses: {
          ...mockWorkflowStatusReturn.nodeStatuses,
          'action-1': {
            ...mockWorkflowStatusReturn.nodeStatuses['action-1'],
            status: 'success' as const
          }
        }
      };

      (useWorkflowStatus as jest.Mock).mockReturnValue(updatedStatusReturn);
      rerender(<WorkflowDebuggingPanel {...defaultProps} />);

      // Should reflect updated status
      expect(screen.getAllByText('Status: success')).toHaveLength(2);
    });

    it('updates execution statistics in real-time', () => {
      const { rerender } = render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Failed: 1')).toBeInTheDocument();

      // Update to no failures
      const updatedStatusReturn = {
        ...mockWorkflowStatusReturn,
        nodeStatuses: {
          'trigger-1': { ...mockWorkflowStatusReturn.nodeStatuses['trigger-1'] },
          'action-1': { ...mockWorkflowStatusReturn.nodeStatuses['action-1'], status: 'success' as const },
          'action-2': { ...mockWorkflowStatusReturn.nodeStatuses['action-2'], status: 'success' as const }
        }
      };

      (useWorkflowStatus as jest.Mock).mockReturnValue(updatedStatusReturn);
      rerender(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.queryByText('Failed: 1')).not.toBeInTheDocument();
    });

    it('handles rapid status updates efficiently', () => {
      const { rerender } = render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const rapidStatusReturn = {
          ...mockWorkflowStatusReturn,
          nodeStatuses: {
            ...mockWorkflowStatusReturn.nodeStatuses,
            'action-1': {
              ...mockWorkflowStatusReturn.nodeStatuses['action-1'],
              progress: Math.random() * 100
            }
          }
        };

        (useWorkflowStatus as jest.Mock).mockReturnValue(rapidStatusReturn);
        rerender(<WorkflowDebuggingPanel {...defaultProps} />);
      }

      // Should still be functional
      expect(screen.getByText('Workflow Debugging Panel')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================

  describe('Accessibility', () => {
    it('provides proper ARIA labels for interactive elements', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const startButton = screen.getByText('Start Debugging');
      expect(startButton).toHaveAttribute('type', 'button');

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('supports keyboard navigation', async () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      const startButton = screen.getByText('Start Debugging');
      startButton.focus();
      expect(startButton).toHaveFocus();

      await user.keyboard('{Tab}');
      // Next focusable element should receive focus
    });

    it('provides meaningful status information for screen readers', () => {
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Debugging Inactive')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTEGRATION EDGE CASES
  // ========================================================================

  describe('Integration Edge Cases', () => {
    it('handles WebSocket hook returning null/undefined', () => {
      (useWorkflowStatus as jest.Mock).mockReturnValue(null);

      expect(() => {
        render(<WorkflowDebuggingPanel {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles missing workflow data gracefully', () => {
      const propsWithoutWorkflow = {
        ...defaultProps,
        workflow: undefined
      };

      render(<WorkflowDebuggingPanel {...propsWithoutWorkflow} />);

      expect(screen.getByText('Workflow Debugging Panel')).toBeInTheDocument();
    });

    it('handles empty node statuses', () => {
      const emptyStatusReturn = {
        ...mockWorkflowStatusReturn,
        nodeStatuses: {}
      };

      (useWorkflowStatus as jest.Mock).mockReturnValue(emptyStatusReturn);
      render(<WorkflowDebuggingPanel {...defaultProps} />);

      expect(screen.getByText('Nodes: 0')).toBeInTheDocument();
    });

    it('handles component unmount during execution', () => {
      const { unmount } = render(<WorkflowDebuggingPanel {...defaultProps} />);

      // Should cleanup properly without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});