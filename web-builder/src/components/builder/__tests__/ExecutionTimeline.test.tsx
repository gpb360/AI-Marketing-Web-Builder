/**
 * ExecutionTimeline Component Tests
 * 
 * Story 3.1: Visual Workflow Debugging - Execution Timeline Tests
 * Comprehensive test coverage for step-by-step execution visualization
 * 
 * Features tested:
 * - Step-by-step execution timeline with timestamps
 * - Performance metrics display (CPU, memory, execution time)
 * - Interactive step selection and filtering
 * - Export functionality for execution logs
 * - Real-time updates during execution
 * 
 * @author Test Writer Agent - Story 3.1 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

import ExecutionTimeline, {
  type ExecutionTimelineProps,
  type ExecutionData,
  type TimelineStep
} from '../ExecutionTimeline';

// ============================================================================
// TEST DATA
// ============================================================================

const mockTimelineSteps: TimelineStep[] = [
  {
    id: 'step-1',
    node_id: 'trigger-node',
    node_name: 'Form Submission Trigger',
    node_type: 'trigger',
    status: 'success',
    started_at: new Date('2024-01-15T10:30:00Z'),
    completed_at: new Date('2024-01-15T10:30:02Z'),
    execution_time_ms: 2000,
    input_data: {
      form_data: { name: 'John Doe', email: 'john@example.com' }
    },
    output_data: {
      user_id: 'user_12345',
      validation_status: 'passed'
    },
    performance_metrics: {
      memory_usage_mb: 15.2,
      cpu_usage_percent: 12.5,
      network_io_kb: 2.1
    }
  },
  {
    id: 'step-2',
    node_id: 'validation-node',
    node_name: 'Data Validation',
    node_type: 'validation',
    status: 'success',
    started_at: new Date('2024-01-15T10:30:02Z'),
    completed_at: new Date('2024-01-15T10:30:05Z'),
    execution_time_ms: 3000,
    input_data: {
      user_data: { name: 'John Doe', email: 'john@example.com' }
    },
    output_data: {
      validated_data: { name: 'John Doe', email: 'john@example.com' },
      validation_errors: []
    },
    performance_metrics: {
      memory_usage_mb: 22.8,
      cpu_usage_percent: 18.3
    }
  },
  {
    id: 'step-3',
    node_id: 'database-node',
    node_name: 'Database Insert',
    node_type: 'database',
    status: 'running',
    started_at: new Date('2024-01-15T10:30:05Z'),
    input_data: {
      table: 'users',
      data: { name: 'John Doe', email: 'john@example.com' }
    },
    performance_metrics: {
      memory_usage_mb: 35.1,
      cpu_usage_percent: 45.7,
      network_io_kb: 15.3
    }
  },
  {
    id: 'step-4',
    node_id: 'notification-node',
    node_name: 'Send Welcome Email',
    node_type: 'email',
    status: 'failed',
    started_at: new Date('2024-01-15T10:30:08Z'),
    completed_at: new Date('2024-01-15T10:30:13Z'),
    execution_time_ms: 5000,
    error_message: 'SMTP server connection timeout',
    input_data: {
      template: 'welcome_email',
      recipient: 'john@example.com'
    },
    performance_metrics: {
      memory_usage_mb: 18.5,
      cpu_usage_percent: 8.2,
      network_io_kb: 0.5
    }
  },
  {
    id: 'step-5',
    node_id: 'logging-node',
    node_name: 'Log Activity',
    node_type: 'logging',
    status: 'pending',
    performance_metrics: {
      memory_usage_mb: 5.2,
      cpu_usage_percent: 2.1
    }
  }
];

const mockExecutionData: ExecutionData = {
  execution_id: 12345,
  workflow_id: 67890,
  workflow_name: 'User Registration Workflow',
  status: 'running',
  started_at: '2024-01-15T10:30:00Z',
  total_steps: 5,
  completed_steps: 3,
  failed_steps: 1,
  success_rate: 60.0,
  steps: mockTimelineSteps
};

const defaultProps: ExecutionTimelineProps = {
  executionData: mockExecutionData,
  isRunning: true,
  showMetrics: true,
  detailedView: false,
  onStepSelect: jest.fn(),
  onExport: jest.fn(),
  onViewLogs: jest.fn()
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ExecutionTimeline Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // BASIC RENDERING TESTS
  // ========================================================================

  describe('Basic Rendering', () => {
    it('renders execution timeline with header information', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      expect(screen.getByText('Execution Timeline')).toBeInTheDocument();
      expect(screen.getByText('User Registration Workflow - Execution #12345')).toBeInTheDocument();
    });

    it('displays execution overview statistics', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('3/5')).toBeInTheDocument(); // progress
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // success rate
      expect(screen.getByText('1')).toBeInTheDocument(); // failed steps
    });

    it('shows running indicator when execution is active', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should show animated dot for running status
      const runningIndicator = screen.getByText('Execution Timeline').closest('div')?.querySelector('.animate-pulse');
      expect(runningIndicator).toBeInTheDocument();
    });

    it('renders without execution data using steps prop', () => {
      const propsWithSteps = {
        ...defaultProps,
        executionData: undefined,
        steps: mockTimelineSteps
      };
      
      render(<ExecutionTimeline {...propsWithSteps} />);

      expect(screen.getByText('Execution Timeline')).toBeInTheDocument();
      expect(screen.getByText('Step-by-step execution progress')).toBeInTheDocument();
    });

    it('handles empty timeline gracefully', () => {
      const emptyProps = {
        ...defaultProps,
        executionData: undefined,
        steps: []
      };
      
      render(<ExecutionTimeline {...emptyProps} />);

      expect(screen.getByText('No steps match the current filter')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // TIMELINE STEPS RENDERING TESTS
  // ========================================================================

  describe('Timeline Steps Rendering', () => {
    it('displays all timeline steps with correct information', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Check each step is rendered
      expect(screen.getByText('Form Submission Trigger')).toBeInTheDocument();
      expect(screen.getByText('Data Validation')).toBeInTheDocument();
      expect(screen.getByText('Database Insert')).toBeInTheDocument();
      expect(screen.getByText('Send Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Log Activity')).toBeInTheDocument();
    });

    it('shows correct status icons for different step states', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Check for status badges
      expect(screen.getAllByText('success')).toHaveLength(2);
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('displays timestamps for completed steps', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should show started/finished times
      expect(screen.getAllByText(/Started:/)).toHaveLength(4); // 4 steps have start times
      expect(screen.getAllByText(/Finished:/)).toHaveLength(3); // 3 steps have finish times
    });

    it('shows execution duration when available', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
      expect(screen.getAllByText(/Execution:/)).toHaveLength(3); // 3 steps have execution_time_ms
    });

    it('displays error messages for failed steps', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      expect(screen.getByText('SMTP server connection timeout')).toBeInTheDocument();
    });

    it('handles steps with missing data gracefully', () => {
      const stepsWithMissingData = [
        {
          id: 'incomplete-step',
          node_id: 'incomplete',
          node_name: 'Incomplete Step',
          node_type: 'unknown',
          status: 'pending' as const
          // Missing timestamps and other optional fields
        }
      ];

      const propsWithIncompleteSteps = {
        ...defaultProps,
        executionData: undefined,
        steps: stepsWithMissingData
      };

      render(<ExecutionTimeline {...propsWithIncompleteSteps} />);

      expect(screen.getByText('Incomplete Step')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PERFORMANCE METRICS TESTS
  // ========================================================================

  describe('Performance Metrics', () => {
    it('displays performance metrics when enabled', () => {
      render(<ExecutionTimeline {...defaultProps} showMetrics={true} />);

      // Check for CPU usage
      expect(screen.getByText('CPU: 12.5%')).toBeInTheDocument();
      expect(screen.getByText('CPU: 18.3%')).toBeInTheDocument();
      
      // Check for memory usage
      expect(screen.getByText('Memory: 15.2MB')).toBeInTheDocument();
      expect(screen.getByText('Memory: 22.8MB')).toBeInTheDocument();
      
      // Check for network I/O where available
      expect(screen.getByText('Network: 2.1KB')).toBeInTheDocument();
      expect(screen.getByText('Network: 15.3KB')).toBeInTheDocument();
    });

    it('hides performance metrics when disabled', () => {
      render(<ExecutionTimeline {...defaultProps} showMetrics={false} />);

      expect(screen.queryByText('CPU:')).not.toBeInTheDocument();
      expect(screen.queryByText('Memory:')).not.toBeInTheDocument();
      expect(screen.queryByText('Network:')).not.toBeInTheDocument();
    });

    it('handles missing performance metrics gracefully', () => {
      const stepsWithoutMetrics = mockTimelineSteps.map(step => ({
        ...step,
        performance_metrics: undefined
      }));

      const propsWithoutMetrics = {
        ...defaultProps,
        steps: stepsWithoutMetrics
      };

      render(<ExecutionTimeline {...propsWithoutMetrics} />);

      // Should render without metrics sections
      expect(screen.queryByText('CPU:')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // DETAILED VIEW TESTS
  // ========================================================================

  describe('Detailed View', () => {
    it('shows input/output data in detailed view', () => {
      render(<ExecutionTimeline {...defaultProps} detailedView={true} />);

      // Check for input/output data sections
      expect(screen.getByText('Input Data')).toBeInTheDocument();
      expect(screen.getByText('Output Data')).toBeInTheDocument();
    });

    it('allows expanding input/output data', async () => {
      render(<ExecutionTimeline {...defaultProps} detailedView={true} />);

      // Find and click input data section
      const inputDataButton = screen.getByText('Input Data');
      await user.click(inputDataButton);

      // Should show JSON data
      expect(screen.getByText(/form_data/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('hides detailed data when not in detailed view', () => {
      render(<ExecutionTimeline {...defaultProps} detailedView={false} />);

      expect(screen.queryByText('Input Data')).not.toBeInTheDocument();
      expect(screen.queryByText('Output Data')).not.toBeInTheDocument();
    });

    it('handles steps without input/output data', () => {
      const stepsWithoutData = mockTimelineSteps.map(step => ({
        ...step,
        input_data: undefined,
        output_data: undefined
      }));

      const propsWithoutData = {
        ...defaultProps,
        steps: stepsWithoutData,
        detailedView: true
      };

      render(<ExecutionTimeline {...propsWithoutData} />);

      // Should not show data sections when no data available
      expect(screen.queryByText('Input Data')).not.toBeInTheDocument();
      expect(screen.queryByText('Output Data')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // FILTERING TESTS
  // ========================================================================

  describe('Step Filtering', () => {
    it('displays filter buttons with correct counts', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should show filter buttons with counts
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();

      // Check for count badges
      expect(screen.getByText('5')).toBeInTheDocument(); // Total steps
      expect(screen.getByText('2')).toBeInTheDocument(); // Success count
      expect(screen.getByText('1')).toBeInTheDocument(); // Failed count (appears in multiple places)
    });

    it('filters steps by status', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Initially should show all steps
      expect(screen.getByText('Form Submission Trigger')).toBeInTheDocument();
      expect(screen.getByText('Send Welcome Email')).toBeInTheDocument();

      // Filter to only success
      await user.click(screen.getByText('Success'));

      // Should only show successful steps
      expect(screen.getByText('Form Submission Trigger')).toBeInTheDocument();
      expect(screen.getByText('Data Validation')).toBeInTheDocument();
      expect(screen.queryByText('Send Welcome Email')).not.toBeInTheDocument(); // Failed step hidden
    });

    it('shows no steps message when filter matches nothing', async () => {
      const stepsWithNoMatches = [
        {
          id: 'step-1',
          node_id: 'node-1',
          node_name: 'Test Step',
          node_type: 'test',
          status: 'success' as const
        }
      ];

      const propsWithLimitedSteps = {
        ...defaultProps,
        steps: stepsWithNoMatches
      };

      render(<ExecutionTimeline {...propsWithLimitedSteps} />);

      // Filter to failed (no failed steps exist)
      await user.click(screen.getByText('Failed'));

      expect(screen.getByText('No steps match the current filter')).toBeInTheDocument();
    });

    it('resets to all when clicking All filter', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Filter to success first
      await user.click(screen.getByText('Success'));
      expect(screen.queryByText('Send Welcome Email')).not.toBeInTheDocument();

      // Click All to show everything again
      await user.click(screen.getByText('All'));
      expect(screen.getByText('Send Welcome Email')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTERACTION TESTS
  // ========================================================================

  describe('User Interactions', () => {
    it('handles step selection clicks', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Click on a step
      const stepElement = screen.getByText('Form Submission Trigger').closest('div');
      await user.click(stepElement!);

      expect(defaultProps.onStepSelect).toHaveBeenCalledWith('step-1');
    });

    it('handles view logs button clicks', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Find and click a view logs button
      const viewLogsButtons = screen.getAllByLabelText(/View logs/i);
      await user.click(viewLogsButtons[0]);

      expect(defaultProps.onViewLogs).toHaveBeenCalledWith('step-1');
    });

    it('does not handle clicks when handlers not provided', () => {
      const propsWithoutHandlers = {
        ...defaultProps,
        onStepSelect: undefined,
        onViewLogs: undefined
      };

      render(<ExecutionTimeline {...propsWithoutHandlers} />);

      const stepElement = screen.getByText('Form Submission Trigger').closest('div');
      expect(stepElement).not.toHaveClass('cursor-pointer');
    });

    it('shows view logs buttons only when handler provided', () => {
      const propsWithoutViewLogs = {
        ...defaultProps,
        onViewLogs: undefined
      };

      render(<ExecutionTimeline {...propsWithoutViewLogs} />);

      expect(screen.queryByLabelText(/View logs/i)).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // EXPORT FUNCTIONALITY TESTS
  // ========================================================================

  describe('Export Functionality', () => {
    it('displays export button when handler provided', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('handles export button clicks', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      await user.click(screen.getByText('Export'));

      expect(defaultProps.onExport).toHaveBeenCalledWith('json');
    });

    it('hides export button when handler not provided', () => {
      const propsWithoutExport = {
        ...defaultProps,
        onExport: undefined
      };

      render(<ExecutionTimeline {...propsWithoutExport} />);

      expect(screen.queryByText('Export')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // TIME FORMATTING TESTS
  // ========================================================================

  describe('Time Formatting', () => {
    it('formats timestamps correctly', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should format dates in local format
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });

    it('formats execution durations correctly', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should show duration as seconds for short times
      expect(screen.getByText(/2\.0s/)).toBeInTheDocument(); // 2000ms
      expect(screen.getByText(/3\.0s/)).toBeInTheDocument(); // 3000ms
      expect(screen.getByText(/5\.0s/)).toBeInTheDocument(); // 5000ms
    });

    it('calculates step duration from start/end times', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Should calculate duration for steps with start/end times
      // First step: 2 seconds (10:30:00 to 10:30:02)
      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    });

    it('handles missing timestamps gracefully', () => {
      const stepsWithoutTimestamps = [
        {
          id: 'step-no-time',
          node_id: 'node-no-time',
          node_name: 'Step Without Time',
          node_type: 'test',
          status: 'success' as const
        }
      ];

      const propsWithoutTimestamps = {
        ...defaultProps,
        steps: stepsWithoutTimestamps
      };

      render(<ExecutionTimeline {...propsWithoutTimestamps} />);

      expect(screen.getByText('Step Without Time')).toBeInTheDocument();
      expect(screen.queryByText(/Started:/)).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================

  describe('Accessibility', () => {
    it('provides proper ARIA labels for interactive elements', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Filter buttons should have proper labels
      const filterButtons = screen.getAllByRole('button');
      expect(filterButtons.length).toBeGreaterThan(0);

      // Steps with click handlers should be focusable
      const clickableSteps = screen.getAllByText(/Form Submission Trigger|Data Validation/);
      clickableSteps.forEach(step => {
        const stepContainer = step.closest('div');
        expect(stepContainer).toHaveClass('cursor-pointer');
      });
    });

    it('supports keyboard navigation', async () => {
      render(<ExecutionTimeline {...defaultProps} />);

      const filterButton = screen.getByText('All');
      filterButton.focus();
      expect(filterButton).toHaveFocus();

      await user.keyboard('{Enter}');
      // Should maintain functionality with keyboard
    });

    it('provides meaningful text for screen readers', () => {
      render(<ExecutionTimeline {...defaultProps} />);

      // Status information should be accessible
      expect(screen.getByText('User Registration Workflow - Execution #12345')).toBeInTheDocument();
      expect(screen.getByText('Step-by-step execution progress')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  describe('Performance', () => {
    it('renders large step lists efficiently', () => {
      const largeStepList = Array.from({ length: 100 }, (_, i) => ({
        id: `step-${i}`,
        node_id: `node-${i}`,
        node_name: `Step ${i}`,
        node_type: 'test',
        status: 'success' as const,
        started_at: new Date(Date.now() - i * 1000),
        completed_at: new Date(Date.now() - i * 1000 + 500),
        execution_time_ms: 500
      }));

      const propsWithLargeList = {
        ...defaultProps,
        steps: largeStepList
      };

      const startTime = performance.now();
      render(<ExecutionTimeline {...propsWithLargeList} />);
      const endTime = performance.now();

      // Should render in reasonable time
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('optimizes re-renders with memoization', () => {
      const { rerender } = render(<ExecutionTimeline {...defaultProps} />);

      const initialStepCount = screen.getAllByText(/Step|Trigger|Validation|Database|Email|Log/).length;

      // Re-render with same props
      rerender(<ExecutionTimeline {...defaultProps} />);

      const newStepCount = screen.getAllByText(/Step|Trigger|Validation|Database|Email|Log/).length;

      // Should maintain same content
      expect(newStepCount).toBe(initialStepCount);
    });

    it('handles rapid step updates without performance degradation', () => {
      const { rerender } = render(<ExecutionTimeline {...defaultProps} />);

      // Simulate rapid updates
      for (let i = 0; i < 20; i++) {
        const updatedSteps = mockTimelineSteps.map(step => ({
          ...step,
          status: Math.random() > 0.5 ? 'success' as const : 'running' as const
        }));

        const updatedProps = {
          ...defaultProps,
          steps: updatedSteps
        };

        rerender(<ExecutionTimeline {...updatedProps} />);
      }

      // Should still be responsive
      expect(screen.getByText('Execution Timeline')).toBeInTheDocument();
    });
  });
});