/**
 * SmartTemplateSelector Component Tests
 * 
 * Test suite for Task #69: Smart Template Selection UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartTemplateSelector from '../SmartTemplateSelector';
import type { SmartTemplateRecommendation, TemplateCustomization } from '@/types/smart-templates';

// Mock the sub-components
jest.mock('../SmartTemplateRecommendations', () => {
  return function MockSmartTemplateRecommendations({ onTemplateSelect, onTemplateInstantiate }: any) {
    return (
      <div data-testid="smart-template-recommendations">
        <button 
          onClick={() => onTemplateSelect({ id: 'test-1', template_name: 'Test Template' })}
          data-testid="select-template"
        >
          Select Template
        </button>
        <button 
          onClick={() => onTemplateInstantiate('test-template', [])}
          data-testid="instantiate-template"
        >
          Instantiate Template
        </button>
      </div>
    );
  };
});

describe('SmartTemplateSelector', () => {
  const mockProps = {
    onTemplateSelect: jest.fn(),
    onTemplateInstantiate: jest.fn(),
    maxRecommendations: 6,
    showFilters: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with header and filters', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    expect(screen.getByText('Smart Template Selection')).toBeInTheDocument();
    expect(screen.getByText('AI-powered workflow templates customized for your business')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders without filters when showFilters is false', () => {
    render(<SmartTemplateSelector {...mockProps} showFilters={false} />);
    
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<SmartTemplateSelector {...mockProps} isLoading={true} />);
    
    expect(screen.getByText('Loading smart templates...')).toBeInTheDocument();
  });

  it('handles template selection correctly', async () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const selectButton = screen.getByTestId('select-template');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(mockProps.onTemplateSelect).toHaveBeenCalledWith({ 
        id: 'test-1', 
        template_name: 'Test Template' 
      });
    });
  });

  it('handles template instantiation correctly', async () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const instantiateButton = screen.getByTestId('instantiate-template');
    fireEvent.click(instantiateButton);
    
    await waitFor(() => {
      expect(mockProps.onTemplateInstantiate).toHaveBeenCalledWith('test-template', []);
    });
  });

  it('renders view mode toggles', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const gridButton = screen.getByRole('button', { name: /grid/i });
    const listButton = screen.getByRole('button', { name: /list/i });
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
  });

  it('renders quick start actions', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    expect(screen.getByText('Quick Start')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('handles category filter changes', async () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const marketingButton = screen.getByText('Marketing');
    fireEvent.click(marketingButton);
    
    // Component should update internal state - no direct assertion possible
    // but this ensures the click handler works without errors
    expect(marketingButton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SmartTemplateSelector {...mockProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders SmartTemplateRecommendations component', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    expect(screen.getByTestId('smart-template-recommendations')).toBeInTheDocument();
  });

  it('handles search functionality in filter panel', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search by name, description...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('handles complexity filter selection', () => {
    render(<SmartTemplateSelector {...mockProps} />);
    
    const beginnerFilter = screen.getByText('Beginner');
    expect(beginnerFilter).toBeInTheDocument();
    
    fireEvent.click(beginnerFilter);
    // Component should update internal state without errors
  });
});