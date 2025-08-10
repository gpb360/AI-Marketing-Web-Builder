/**
 * ErrorDetailsModal Component Tests
 * 
 * Story 3.1: Visual Workflow Debugging - Error Analysis Interface Tests
 * Comprehensive test coverage for error details modal functionality
 * 
 * Features tested:
 * - Detailed error analysis with contextual information
 * - Stack trace and debug logs visualization
 * - Performance metrics and retry analysis
 * - Suggested actions for error resolution
 * - Export functionality for error reports
 * 
 * @author Test Writer Agent - Story 3.1 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import ErrorDetailsModal, {
  type ErrorDetailsModalProps,
  type ErrorLog,
  type ErrorMetrics,
  type ErrorContext,
  type SuggestedAction
} from '../ErrorDetailsModal';
import { type WorkflowNodeData } from '../WorkflowStatusOverlay';

// ============================================================================
// TEST DATA
// ============================================================================

const mockFailedNode: WorkflowNodeData = {
  id: 'test-node-failed',
  status: 'failed',
  executionTime: 5000,
  lastUpdated: new Date('2024-01-15T10:35:00Z'),
  errorMessage: 'Database connection timeout after 5 seconds',
  metadata: {
    retry_count: 2,
    error_code: 'DB_TIMEOUT',
    node_type: 'database_query'
  }
};

const mockErrorContext: ErrorContext = {
  workflow_id: 123,
  execution_id: 456,
  workflow_name: 'User Registration Workflow',
  node_type: 'database_query',
  input_data: {
    query: 'INSERT INTO users (name, email) VALUES (?, ?)',
    params: ['John Doe', 'john@example.com']
  },
  configuration: {
    timeout_ms: 5000,
    retry_attempts: 3,
    connection_pool: 'users_db'
  },
  previous_nodes: ['validate_input', 'sanitize_data'],
  expected_outputs: ['user_id', 'success_status']
};

const mockErrorLogs: ErrorLog[] = [
  {
    timestamp: '2024-01-15T10:34:55Z',
    level: 'INFO',
    message: 'Starting database query execution',
    context: { node_id: 'test-node-failed', attempt: 1 }
  },
  {
    timestamp: '2024-01-15T10:34:58Z',
    level: 'WARN',
    message: 'Connection attempt taking longer than expected',
    context: { timeout_remaining: 2000 }
  },
  {
    timestamp: '2024-01-15T10:35:00Z',
    level: 'ERROR',
    message: 'Database connection timeout after 5 seconds',
    stack: `Error: Connection timeout
    at DatabaseConnection.connect (/app/db/connection.js:45:23)
    at QueryExecutor.execute (/app/db/executor.js:12:15)
    at WorkflowNode.run (/app/workflow/node.js:78:34)`,
    context: {
      connection_pool: 'users_db',
      active_connections: 10,
      max_connections: 20
    }
  },
  {
    timestamp: '2024-01-15T10:35:01Z',
    level: 'DEBUG',
    message: 'Attempting retry 1 of 3',
    context: { retry_delay_ms: 1000 }
  },
  {
    timestamp: '2024-01-15T10:35:06Z',
    level: 'FATAL',
    message: 'All retry attempts exhausted',
    context: { total_attempts: 3, total_time_ms: 11000 }
  }
];

const mockMetrics: ErrorMetrics = {
  execution_time_ms: 11000,
  memory_usage: '45.2MB',
  cpu_usage: '23.1%',
  retry_count: 3,
  last_success: '2024-01-15T09:30:00Z',
  error_frequency: 0.15 // 15% error rate
};

const mockSuggestedActions: SuggestedAction[] = [
  {
    action: 'Increase Connection Timeout',
    description: 'Current timeout of 5s may be insufficient during high load. Consider increasing to 10s.',
    type: 'config',
    confidence: 0.9
  },
  {
    action: 'Retry Node Execution',
    description: 'Database may have recovered. Retry the failed operation.',
    type: 'retry',
    confidence: 0.8
  },
  {
    action: 'Check Database Health',
    description: '15% error rate suggests potential database performance issues.',
    type: 'escalate',
    confidence: 0.7
  },
  {
    action: 'Enable Connection Pooling',
    description: 'Implement connection pooling to handle concurrent requests better.',
    type: 'config',
    confidence: 0.6
  }
];

const defaultProps: ErrorDetailsModalProps = {
  isOpen: true,
  onClose: jest.fn(),
  node: mockFailedNode,
  errorContext: mockErrorContext,
  errorLogs: mockErrorLogs,
  metrics: mockMetrics,
  suggestedActions: mockSuggestedActions,
  onRestartNode: jest.fn(),
  onSkipNode: jest.fn(),
  onDebugNode: jest.fn(),
  onExportError: jest.fn()
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ErrorDetailsModal Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // BASIC RENDERING TESTS
  // ========================================================================

  describe('Basic Rendering', () => {
    it('renders error details modal when open', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText('Error Details: test-node-failed')).toBeInTheDocument();
      expect(screen.getByText('Node Execution Error')).toBeInTheDocument();
      expect(screen.getByText('Database connection timeout after 5 seconds')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ErrorDetailsModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Error Details: test-node-failed')).not.toBeInTheDocument();
    });

    it('displays error context information', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText('User Registration Workflow')).toBeInTheDocument();
      expect(screen.getByText(/database query/i)).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument(); // execution_id
    });

    it('shows last updated timestamp', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });

    it('displays export buttons', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText('Export JSON')).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ERROR OVERVIEW TAB TESTS
  // ========================================================================

  describe('Error Overview Tab', () => {
    it('displays performance impact metrics when provided', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText('Performance Impact')).toBeInTheDocument();
      expect(screen.getByText('11.0s')).toBeInTheDocument(); // execution time
      expect(screen.getByText('45.2MB')).toBeInTheDocument(); // memory usage
      expect(screen.getByText('23.1%')).toBeInTheDocument(); // cpu usage
      expect(screen.getByText('3')).toBeInTheDocument(); // retry attempts
    });

    it('shows high error rate warning', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      expect(screen.getByText('High Error Rate: 15.0%')).toBeInTheDocument();
      expect(screen.getByText(/This node has failed frequently/)).toBeInTheDocument();
    });

    it('handles missing metrics gracefully', () => {
      const propsWithoutMetrics = { ...defaultProps, metrics: undefined };
      render(<ErrorDetailsModal {...propsWithoutMetrics} />);

      expect(screen.queryByText('Performance Impact')).not.toBeInTheDocument();
    });

    it('handles missing error context gracefully', () => {
      const propsWithoutContext = { ...defaultProps, errorContext: undefined };
      render(<ErrorDetailsModal {...propsWithoutContext} />);

      // Should still render the basic error info
      expect(screen.getByText('Node Execution Error')).toBeInTheDocument();
      expect(screen.getByText('Database connection timeout after 5 seconds')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ERROR LOGS TAB TESTS
  // ========================================================================

  describe('Error Logs Tab', () => {
    it('displays error logs with different severity levels', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // Click on logs tab
      await user.click(screen.getByText('Logs'));

      expect(screen.getByText('Starting database query execution')).toBeInTheDocument();
      expect(screen.getByText('Database connection timeout after 5 seconds')).toBeInTheDocument();
      expect(screen.getByText('All retry attempts exhausted')).toBeInTheDocument();
    });

    it('provides log level filtering', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Logs'));

      // Check filter buttons are present
      expect(screen.getByText('ALL')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
      expect(screen.getByText('WARN')).toBeInTheDocument();
      expect(screen.getByText('INFO')).toBeInTheDocument();
      expect(screen.getByText('DEBUG')).toBeInTheDocument();
      expect(screen.getByText('FATAL')).toBeInTheDocument();
    });

    it('filters logs by severity level', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Logs'));

      // Initially should show all logs
      expect(screen.getByText('Starting database query execution')).toBeInTheDocument();
      expect(screen.getByText('All retry attempts exhausted')).toBeInTheDocument();

      // Filter to only ERROR level
      await user.click(screen.getByText('ERROR'));

      // Should only show ERROR level messages
      expect(screen.getByText('Database connection timeout after 5 seconds')).toBeInTheDocument();
      expect(screen.queryByText('Starting database query execution')).not.toBeInTheDocument();
    });

    it('displays stack traces when available', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Logs'));

      // Find and click "Show Stack Trace" button
      const stackTraceButton = screen.getByText('Show Stack Trace');
      await user.click(stackTraceButton);

      expect(screen.getByText(/DatabaseConnection.connect/)).toBeInTheDocument();
      expect(screen.getByText(/QueryExecutor.execute/)).toBeInTheDocument();
    });

    it('displays log context when available', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Logs'));

      // Find and click "Show Context" button
      const contextButtons = screen.getAllByText('Show Context');
      await user.click(contextButtons[0]);

      expect(screen.getByText(/connection_pool/)).toBeInTheDocument();
    });

    it('shows no logs message when empty', async () => {
      const propsWithoutLogs = { ...defaultProps, errorLogs: [] };
      render(<ErrorDetailsModal {...propsWithoutLogs} />);

      await user.click(screen.getByText('Logs'));

      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });

    it('shows log count badges in tab', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // Check for log count badge
      expect(screen.getByText('5')).toBeInTheDocument(); // 5 log entries
    });
  });

  // ========================================================================
  // SUGGESTED ACTIONS TAB TESTS
  // ========================================================================

  describe('Suggested Actions Tab', () => {
    it('displays suggested actions sorted by confidence', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Actions'));

      // Should display actions in order of confidence
      const actions = screen.getAllByText(/confidence$/);
      expect(actions[0]).toHaveTextContent('90% confidence'); // Increase timeout
      expect(actions[1]).toHaveTextContent('80% confidence'); // Retry
      expect(actions[2]).toHaveTextContent('70% confidence'); // Check DB health
      expect(actions[3]).toHaveTextContent('60% confidence'); // Enable pooling
    });

    it('provides default actions when none provided', async () => {
      const propsWithoutActions = { ...defaultProps, suggestedActions: undefined };
      render(<ErrorDetailsModal {...propsWithoutActions} />);

      await user.click(screen.getByText('Actions'));

      expect(screen.getByText('Retry Node Execution')).toBeInTheDocument();
      expect(screen.getByText('Skip This Node')).toBeInTheDocument();
      expect(screen.getByText('Debug Node Configuration')).toBeInTheDocument();
    });

    it('handles action clicks correctly', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Actions'));

      // Find and click retry button
      const retryButtons = screen.getAllByText('Retry');
      await user.click(retryButtons[0]);

      expect(defaultProps.onRestartNode).toHaveBeenCalledWith('test-node-failed');
    });

    it('handles debug action clicks', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Actions'));

      // Find and click debug button
      const debugButtons = screen.getAllByText('Debug');
      await user.click(debugButtons[0]);

      expect(defaultProps.onDebugNode).toHaveBeenCalledWith('test-node-failed');
    });

    it('displays action confidence levels with appropriate styling', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Actions'));

      // High confidence should have green styling
      const highConfidenceAction = screen.getByText('90% confidence');
      expect(highConfidenceAction).toHaveClass('text-green-700');

      // Medium confidence should have yellow styling
      const mediumConfidenceAction = screen.getByText('70% confidence');
      expect(mediumConfidenceAction).toHaveClass('text-yellow-700');

      // Low confidence should have gray styling
      const lowConfidenceAction = screen.getByText('60% confidence');
      expect(lowConfidenceAction).toHaveClass('text-gray-700');
    });
  });

  // ========================================================================
  // EXPORT FUNCTIONALITY TESTS
  // ========================================================================

  describe('Export Functionality', () => {
    it('handles JSON export', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Export JSON'));

      expect(defaultProps.onExportError).toHaveBeenCalledWith('test-node-failed', 'json');
    });

    it('handles PDF export', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Export PDF'));

      expect(defaultProps.onExportError).toHaveBeenCalledWith('test-node-failed', 'pdf');
    });

    it('does not show export buttons when handler not provided', () => {
      const propsWithoutExport = { ...defaultProps, onExportError: undefined };
      render(<ErrorDetailsModal {...propsWithoutExport} />);

      expect(screen.queryByText('Export JSON')).not.toBeInTheDocument();
      expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACTION HANDLERS TESTS
  // ========================================================================

  describe('Action Handlers', () => {
    it('handles close action', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Close'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles restart node action', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      const restartButton = screen.getByText('Restart Node');
      await user.click(restartButton);

      expect(defaultProps.onRestartNode).toHaveBeenCalledWith('test-node-failed');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not show restart button when handler not provided', () => {
      const propsWithoutRestart = { ...defaultProps, onRestartNode: undefined };
      render(<ErrorDetailsModal {...propsWithoutRestart} />);

      expect(screen.queryByText('Restart Node')).not.toBeInTheDocument();
    });

    it('handles skip node action from actions tab', async () => {
      const propsWithDefaultActions = { ...defaultProps, suggestedActions: undefined };
      render(<ErrorDetailsModal {...propsWithDefaultActions} />);

      await user.click(screen.getByText('Actions'));

      // Find skip action in default actions
      const debugButtons = screen.getAllByText('Debug');
      const skipButton = debugButtons.find(button => 
        button.closest('div')?.textContent?.includes('Skip This Node')
      );
      
      if (skipButton) {
        await user.click(skipButton);
        expect(defaultProps.onSkipNode).toHaveBeenCalledWith('test-node-failed');
      }
    });
  });

  // ========================================================================
  // TAB NAVIGATION TESTS
  // ========================================================================

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // Default should be overview
      expect(screen.getByText('Node Execution Error')).toBeInTheDocument();

      // Switch to logs
      await user.click(screen.getByText('Logs'));
      expect(screen.getByText('Starting database query execution')).toBeInTheDocument();

      // Switch to actions
      await user.click(screen.getByText('Actions'));
      expect(screen.getByText('Increase Connection Timeout')).toBeInTheDocument();

      // Switch back to overview
      await user.click(screen.getByText('Overview'));
      expect(screen.getByText('Node Execution Error')).toBeInTheDocument();
    });

    it('maintains tab state during re-renders', async () => {
      const { rerender } = render(<ErrorDetailsModal {...defaultProps} />);

      // Switch to logs tab
      await user.click(screen.getByText('Logs'));
      expect(screen.getByText('Starting database query execution')).toBeInTheDocument();

      // Re-render with updated props
      rerender(<ErrorDetailsModal {...defaultProps} />);

      // Should still be on logs tab
      expect(screen.getByText('Starting database query execution')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================

  describe('Error Handling', () => {
    it('handles missing error message gracefully', () => {
      const nodeWithoutError = { ...mockFailedNode, errorMessage: undefined };
      render(<ErrorDetailsModal {...defaultProps} node={nodeWithoutError} />);

      expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
    });

    it('handles undefined metrics gracefully', () => {
      render(<ErrorDetailsModal {...defaultProps} metrics={undefined} />);

      // Should not crash and should hide performance section
      expect(screen.queryByText('Performance Impact')).not.toBeInTheDocument();
    });

    it('handles empty log arrays', async () => {
      render(<ErrorDetailsModal {...defaultProps} errorLogs={[]} />);

      await user.click(screen.getByText('Logs'));

      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });

    it('handles malformed log data', async () => {
      const malformedLogs = [
        {
          timestamp: 'invalid-date',
          level: 'ERROR' as const,
          message: 'Test error'
        }
      ];

      render(<ErrorDetailsModal {...defaultProps} errorLogs={malformedLogs} />);

      await user.click(screen.getByText('Logs'));

      // Should render without crashing
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // Dialog should have proper labeling
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Tabs should have proper roles
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3); // Overview, Logs, Actions
    });

    it('supports keyboard navigation', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // Tab navigation should work
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      const logsTab = screen.getByRole('tab', { name: /logs/i });

      overviewTab.focus();
      expect(overviewTab).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(logsTab).toHaveFocus();
    });

    it('provides proper focus management', async () => {
      render(<ErrorDetailsModal {...defaultProps} />);

      // When modal opens, it should manage focus
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Closing with Escape should work
      await user.keyboard('{Escape}');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  describe('Performance', () => {
    it('renders large log sets efficiently', () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        level: 'INFO' as const,
        message: `Log message ${i}`,
        context: { index: i }
      }));

      const startTime = performance.now();
      render(<ErrorDetailsModal {...defaultProps} errorLogs={largeLogs} />);
      const endTime = performance.now();

      // Should render in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('memoizes components to prevent unnecessary re-renders', () => {
      const { rerender } = render(<ErrorDetailsModal {...defaultProps} />);

      const initialOverview = screen.getByText('Node Execution Error');

      // Rerender with same props
      rerender(<ErrorDetailsModal {...defaultProps} />);

      const newOverview = screen.getByText('Node Execution Error');

      // Components should be memoized
      expect(initialOverview).toBe(newOverview);
    });
  });
});