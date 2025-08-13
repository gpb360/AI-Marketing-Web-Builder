/**
 * Tests for PredictionCard Component (Story 3.4)
 * Validates prediction display, user interactions, and UI behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictionCard from '../PredictionCard';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button 
      onClick={onClick} 
      className={`btn ${variant} ${size} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-testid="progress" data-value={value} />
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: any) => <div className={`alert ${className}`}>{children}</div>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-triangle">⚠️</span>,
  Clock: () => <span data-testid="clock">🕐</span>,
  TrendingUp: () => <span data-testid="trending-up">📈</span>,
  CheckCircle: () => <span data-testid="check-circle">✅</span>,
  X: () => <span data-testid="x">❌</span>,
}));

describe('PredictionCard Component', () => {
  const mockPrediction = {
    violation_type: 'build_time',
    probability: 0.85,
    confidence_score: 0.90,
    predicted_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    recommended_actions: [
      {
        action: 'scale_build_agents',
        description: 'Increase build agent capacity',
        confidence: 0.9,
        estimated_impact: '30% reduction in build time'
      },
      {
        action: 'notify_team',
        description: 'Alert development team',
        confidence: 0.8,
        estimated_impact: 'Faster issue resolution'
      }
    ],
    historical_accuracy: 0.87
  };

  const mockProps = {
    prediction: mockPrediction,
    onTakeAction: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders prediction card with basic information', () => {
      render(<PredictionCard {...mockProps} />);
      
      expect(screen.getByText('SLA Violation Predicted')).toBeInTheDocument();
      expect(screen.getByText('Build Time')).toBeInTheDocument();
      expect(screen.getByText('85.0%')).toBeInTheDocument(); // Probability
      expect(screen.getByText('90.0%')).toBeInTheDocument(); // Confidence
    });

    it('displays violation type in formatted form', () => {
      const testPrediction = {
        ...mockPrediction,
        violation_type: 'pr_review_time'
      };
      
      render(<PredictionCard {...mockProps} prediction={testPrediction} />);
      expect(screen.getByText('Pr Review Time')).toBeInTheDocument();
    });

    it('shows correct severity level and styling', () => {
      // High severity (probability >= 0.9, confidence >= 0.85)
      const highSeverityPrediction = {
        ...mockPrediction,
        probability: 0.95,
        confidence_score: 0.90
      };

      const { rerender } = render(<PredictionCard {...mockProps} prediction={highSeverityPrediction} />);
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      
      // Medium severity
      const mediumSeverityPrediction = {
        ...mockPrediction,
        probability: 0.75,
        confidence_score: 0.80
      };

      rerender(<PredictionCard {...mockProps} prediction={mediumSeverityPrediction} />);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      
      // Low severity
      const lowSeverityPrediction = {
        ...mockPrediction,
        probability: 0.60,
        confidence_score: 0.70
      };

      rerender(<PredictionCard {...mockProps} prediction={lowSeverityPrediction} />);
      expect(screen.getByText('LOW')).toBeInTheDocument();
    });

    it('displays progress bars for probability and confidence', () => {
      render(<PredictionCard {...mockProps} />);
      
      const progressBars = screen.getAllByTestId('progress');
      expect(progressBars).toHaveLength(2);
      expect(progressBars[0]).toHaveAttribute('data-value', '85'); // Probability
      expect(progressBars[1]).toHaveAttribute('data-value', '90'); // Confidence
    });

    it('shows model accuracy with check circle icon', () => {
      render(<PredictionCard {...mockProps} />);
      
      expect(screen.getByText('87.0%')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('formats predicted time correctly', () => {
      const futureTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const predictionWithTime = {
        ...mockPrediction,
        predicted_time: futureTime.toISOString()
      };

      render(<PredictionCard {...mockProps} prediction={predictionWithTime} />);
      
      // Should show "in 30 min" or similar
      expect(screen.getByText(/30 min/)).toBeInTheDocument();
    });

    it('handles imminent predictions', () => {
      const pastTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const predictionWithPastTime = {
        ...mockPrediction,
        predicted_time: pastTime.toISOString()
      };

      render(<PredictionCard {...mockProps} prediction={predictionWithPastTime} />);
      expect(screen.getByText('Imminent')).toBeInTheDocument();
    });
  });

  describe('Recommended Actions', () => {
    it('displays recommended actions with confidence scores', () => {
      render(<PredictionCard {...mockProps} />);
      
      expect(screen.getByText('Increase build agent capacity')).toBeInTheDocument();
      expect(screen.getByText('30% reduction in build time')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument(); // Confidence badge
    });

    it('shows "Take Action" buttons for each recommendation', () => {
      render(<PredictionCard {...mockProps} />);
      
      const actionButtons = screen.getAllByText('Take Action');
      expect(actionButtons).toHaveLength(2);
    });

    it('limits displayed actions to 2 and shows "View more" for additional actions', () => {
      const predictionWithManyActions = {
        ...mockPrediction,
        recommended_actions: [
          ...mockPrediction.recommended_actions,
          {
            action: 'third_action',
            description: 'Third action',
            confidence: 0.7,
            estimated_impact: 'Some impact'
          },
          {
            action: 'fourth_action',
            description: 'Fourth action',
            confidence: 0.6,
            estimated_impact: 'Another impact'
          }
        ]
      };

      render(<PredictionCard {...mockProps} prediction={predictionWithManyActions} />);
      
      // Should show only first 2 actions
      expect(screen.getByText('Increase build agent capacity')).toBeInTheDocument();
      expect(screen.getByText('Alert development team')).toBeInTheDocument();
      
      // Should show "View more" button
      expect(screen.getByText('View 2 more actions')).toBeInTheDocument();
    });

    it('handles predictions with no recommended actions', () => {
      const predictionNoActions = {
        ...mockPrediction,
        recommended_actions: []
      };

      render(<PredictionCard {...mockProps} prediction={predictionNoActions} />);
      
      expect(screen.queryByText('Recommended Actions')).not.toBeInTheDocument();
      expect(screen.queryByText('Take Action')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onTakeAction when action button is clicked', async () => {
      render(<PredictionCard {...mockProps} />);
      
      const actionButtons = screen.getAllByText('Take Action');
      fireEvent.click(actionButtons[0]);
      
      await waitFor(() => {
        expect(mockProps.onTakeAction).toHaveBeenCalledWith('scale_build_agents');
      });
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      render(<PredictionCard {...mockProps} />);
      
      const dismissButton = screen.getByTestId('x').closest('button');
      expect(dismissButton).toBeInTheDocument();
      
      fireEvent.click(dismissButton!);
      
      await waitFor(() => {
        expect(mockProps.onDismiss).toHaveBeenCalled();
      });
    });

    it('handles multiple action button clicks correctly', async () => {
      render(<PredictionCard {...mockProps} />);
      
      const actionButtons = screen.getAllByText('Take Action');
      
      fireEvent.click(actionButtons[0]);
      fireEvent.click(actionButtons[1]);
      
      await waitFor(() => {
        expect(mockProps.onTakeAction).toHaveBeenCalledTimes(2);
        expect(mockProps.onTakeAction).toHaveBeenNthCalledWith(1, 'scale_build_agents');
        expect(mockProps.onTakeAction).toHaveBeenNthCalledWith(2, 'notify_team');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate ARIA labels and semantic structure', () => {
      render(<PredictionCard {...mockProps} />);
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /SLA Violation Predicted/i })).toBeInTheDocument();
      
      // Check for accessible buttons
      const actionButtons = screen.getAllByRole('button', { name: /Take Action/i });
      expect(actionButtons).toHaveLength(2);
      
      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toBeInTheDocument();
    });

    it('maintains keyboard navigation support', () => {
      render(<PredictionCard {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid prediction time gracefully', () => {
      const predictionWithInvalidTime = {
        ...mockPrediction,
        predicted_time: 'invalid-time'
      };

      render(<PredictionCard {...mockProps} prediction={predictionWithInvalidTime} />);
      
      // Should not crash and should display the invalid time as-is
      expect(screen.getByText('invalid-time')).toBeInTheDocument();
    });

    it('handles edge case probability values', () => {
      const predictionWithEdgeCases = {
        ...mockPrediction,
        probability: 1.0,
        confidence_score: 0.0
      };

      render(<PredictionCard {...mockProps} prediction={predictionWithEdgeCases} />);
      
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders without performance issues for large action lists', () => {
      const predictionWithManyActions = {
        ...mockPrediction,
        recommended_actions: Array.from({ length: 20 }, (_, i) => ({
          action: `action_${i}`,
          description: `Action ${i} description`,
          confidence: 0.8,
          estimated_impact: `Impact ${i}`
        }))
      };

      const startTime = performance.now();
      render(<PredictionCard {...mockProps} prediction={predictionWithManyActions} />);
      const endTime = performance.now();
      
      // Should render quickly (less than 100ms in test environment)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});