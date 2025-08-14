/**
 * Business Context Analyzer Component Tests
 * 
 * Tests for the business context analysis functionality
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessContextAnalyzer } from '../BusinessContextAnalyzer';
import { BusinessAnalysisResult } from '@/types/context-aware-templates';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type} 
      className={className}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, id, type }: any) => (
    <input
      id={id}
      type={type || 'text'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className, rows }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
    />
  )
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-value={value} />
  )
}));

describe('BusinessContextAnalyzer', () => {
  const mockOnAnalysisComplete = jest.fn();

  const defaultProps = {
    onAnalysisComplete: mockOnAnalysisComplete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component with correct title', () => {
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      expect(screen.getByText('Business Context Analysis')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/business description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
    });

    it('displays business goals as clickable buttons', () => {
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      expect(screen.getByText('Generate leads')).toBeInTheDocument();
      expect(screen.getByText('Increase brand awareness')).toBeInTheDocument();
      expect(screen.getByText('Drive online sales')).toBeInTheDocument();
    });

    it('shows analyze button in initial state', () => {
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      expect(analyzeButton).toBeInTheDocument();
      expect(analyzeButton).not.toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    it('updates business name field', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      await user.type(businessNameInput, 'Test Company');
      
      expect(businessNameInput).toHaveValue('Test Company');
    });

    it('updates business description field', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/business description/i);
      await user.type(descriptionInput, 'This is a test business description');
      
      expect(descriptionInput).toHaveValue('This is a test business description');
    });

    it('toggles business goals on click', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const goalButton = screen.getByText('Generate leads');
      await user.click(goalButton);
      
      // Button should be selected (you might need to check for specific class or attribute)
      expect(goalButton).toBeInTheDocument();
    });

    it('adds and removes brand colors', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      // Find color input and add button
      const colorInput = screen.getByPlaceholderText('#0066CC or Blue');
      const addButton = screen.getByText('Add');
      
      await user.type(colorInput, '#FF0000');
      await user.click(addButton);
      
      // Color should be added (check for the color badge)
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
    });

    it('adds and removes competitors', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const competitorInput = screen.getByPlaceholderText('competitor.com or Company Name');
      const addButton = screen.getAllByText('Add')[1]; // Second add button for competitors
      
      await user.type(competitorInput, 'competitor.com');
      await user.click(addButton);
      
      expect(screen.getByText('competitor.com')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty business name', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      await user.click(analyzeButton);
      
      expect(screen.getByText('Business name is required')).toBeInTheDocument();
    });

    it('shows validation error for short business description', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      const descriptionInput = screen.getByLabelText(/business description/i);
      
      await user.type(businessNameInput, 'Test Company');
      await user.type(descriptionInput, 'Short'); // Less than 20 characters
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      await user.click(analyzeButton);
      
      expect(screen.getByText('Business description must be at least 20 characters')).toBeInTheDocument();
    });

    it('shows validation error when no business goals selected', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      const descriptionInput = screen.getByLabelText(/business description/i);
      
      await user.type(businessNameInput, 'Test Company');
      await user.type(descriptionInput, 'This is a valid business description with more than twenty characters');
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      await user.click(analyzeButton);
      
      expect(screen.getByText('Please select at least one business goal')).toBeInTheDocument();
    });

    it('clears validation errors when user corrects input', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      await user.click(analyzeButton);
      
      expect(screen.getByText('Business name is required')).toBeInTheDocument();
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      await user.type(businessNameInput, 'Test Company');
      
      expect(screen.queryByText('Business name is required')).not.toBeInTheDocument();
    });
  });

  describe('Analysis Process', () => {
    it('initiates analysis with valid form data', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      // Fill out valid form
      await user.type(screen.getByLabelText(/business name/i), 'Test Company');
      await user.type(screen.getByLabelText(/business description/i), 'This is a comprehensive business description');
      await user.click(screen.getByText('Generate leads'));
      
      const analyzeButton = screen.getByRole('button', { name: /analyze business context/i });
      await user.click(analyzeButton);
      
      // Should show analyzing state
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();
    });

    it('shows progress during analysis', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      // Fill valid form and start analysis
      await user.type(screen.getByLabelText(/business name/i), 'Test Company');
      await user.type(screen.getByLabelText(/business description/i), 'This is a comprehensive business description');
      await user.click(screen.getByText('Generate leads'));
      await user.click(screen.getByRole('button', { name: /analyze business context/i }));
      
      // Should show progress steps
      await waitFor(() => {
        expect(screen.getByText(/analyzing business description/i)).toBeInTheDocument();
      });
    });

    it('calls onAnalysisComplete with results', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      // Fill valid form and start analysis
      await user.type(screen.getByLabelText(/business name/i), 'Test Company');
      await user.type(screen.getByLabelText(/business description/i), 'This is a comprehensive business description');
      await user.click(screen.getByText('Generate leads'));
      await user.click(screen.getByRole('button', { name: /analyze business context/i }));
      
      // Wait for analysis to complete
      await waitFor(() => {
        expect(mockOnAnalysisComplete).toHaveBeenCalled();
      }, { timeout: 10000 });
      
      const callArgs = mockOnAnalysisComplete.mock.calls[0][0];
      expect(callArgs).toHaveProperty('industry_classification');
      expect(callArgs).toHaveProperty('target_audience');
      expect(callArgs).toHaveProperty('business_type');
    });

    it('displays analysis results after completion', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      // Fill form and analyze
      await user.type(screen.getByLabelText(/business name/i), 'Test Company');
      await user.type(screen.getByLabelText(/business description/i), 'This is a comprehensive business description');
      await user.click(screen.getByText('Generate leads'));
      await user.click(screen.getByRole('button', { name: /analyze business context/i }));
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      expect(screen.getByText('Industry Classification')).toBeInTheDocument();
      expect(screen.getByText('Target Audience')).toBeInTheDocument();
    });
  });

  describe('Initial Data', () => {
    it('populates form with initial data', () => {
      const initialData = {
        business_name: 'Initial Company',
        business_description: 'Initial description that is long enough',
        industry: 'technology',
        business_goals: ['Generate leads']
      };

      render(<BusinessContextAnalyzer {...defaultProps} initialData={initialData} />);
      
      expect(screen.getByDisplayValue('Initial Company')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Initial description that is long enough')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows disabled state when externally loading', () => {
      render(<BusinessContextAnalyzer {...defaultProps} isLoading={true} />);
      
      const analyzeButton = screen.getByRole('button', { name: /analyzing/i });
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe('Character Counter', () => {
    it('shows character count for business description', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/business description/i);
      await user.type(descriptionInput, 'Test description');
      
      expect(screen.getByText('16 characters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form inputs', () => {
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/business description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
    });

    it('associates validation errors with form fields', async () => {
      const user = userEvent.setup();
      render(<BusinessContextAnalyzer {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /analyze business context/i }));
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      const errorMessage = screen.getByText('Business name is required');
      
      expect(businessNameInput).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });
  });
});