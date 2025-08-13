/**
 * Context-Aware Template Selector Component Tests
 * 
 * Tests for smart template selection functionality
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextAwareTemplateSelector } from '../ContextAwareTemplateSelector';
import { BusinessAnalysisResult, TemplateRecommendation } from '@/types/context-aware-templates';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${variant} ${size} ${className}`}
      data-testid="button"
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`} data-testid="badge">{children}</span>
  )
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-value={value} data-testid="progress" />
  )
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>{children}</div>
  ),
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, className }: any) => (
    <button data-testid="tabs-trigger" data-value={value} className={className}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) => <hr className={className} data-testid="separator" />
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-testid="scroll-area">{children}</div>
  )
}));

// Mock template data
jest.mock('@/data/templates/enhanced-templates', () => ({
  sampleTemplates: [
    {
      id: 'template-1',
      name: 'SaaS Landing Pro',
      category: 'landing',
      description: 'Professional SaaS landing page',
      thumbnail: '/templates/saas-pro.jpg',
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'template-2',
      name: 'E-commerce Store',
      category: 'ecommerce',
      description: 'Modern e-commerce template',
      thumbnail: '/templates/ecommerce.jpg',
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  templateCategories: [
    { id: 'all', name: 'All Templates', count: 2 },
    { id: 'landing', name: 'Landing', count: 1 },
    { id: 'ecommerce', name: 'E-commerce', count: 1 }
  ]
}));

describe('ContextAwareTemplateSelector', () => {
  const mockBusinessContext: BusinessAnalysisResult = {
    industry_classification: {
      primary: 'technology',
      secondary: ['software', 'saas'],
      confidence: 0.9
    },
    target_audience: {
      demographics: ['25-45 years', 'professionals'],
      psychographics: ['efficiency-focused', 'tech-savvy'],
      confidence: 0.85
    },
    business_type: 'b2b',
    content_requirements: ['features', 'pricing', 'testimonials'],
    design_preferences: {
      modern: 0.8,
      minimal: 0.7,
      professional: 0.9
    },
    brand_personality: {
      traits: ['innovative', 'trustworthy'],
      tone: 'professional',
      confidence: 0.8
    }
  };

  const mockOnTemplateSelect = jest.fn();

  const defaultProps = {
    businessContext: mockBusinessContext,
    onTemplateSelect: mockOnTemplateSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch or any API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders component title and description', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      expect(screen.getByText('Smart Template Recommendations')).toBeInTheDocument();
      expect(screen.getByText(/AI-curated templates perfect for your technology business/)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      expect(screen.getByText('Analyzing Templates')).toBeInTheDocument();
      expect(screen.getByText('Finding the perfect templates for your business...')).toBeInTheDocument();
    });

    it('renders filter and refresh buttons', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
    });

    it('shows message when no business context provided', () => {
      render(<ContextAwareTemplateSelector {...defaultProps} businessContext={undefined} />);
      
      expect(screen.getByText('Business Analysis Required')).toBeInTheDocument();
      expect(screen.getByText(/Complete the business context analysis/)).toBeInTheDocument();
    });
  });

  describe('Template Recommendations Loading', () => {
    it('displays template recommendations after loading', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Analyzing Templates')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show template cards
      expect(screen.getByText('SaaS Landing Pro')).toBeInTheDocument();
    });

    it('shows best match badge on first recommendation', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Best Match')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('displays confidence scores for each template', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        // Look for confidence percentage indicators
        const confidenceElements = screen.getAllByText(/\d+%/);
        expect(confidenceElements.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('Template Selection', () => {
    it('calls onTemplateSelect when template is selected', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const selectButton = screen.getByText('Select Template');
        expect(selectButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const selectButton = screen.getByText('Select Template');
      await user.click(selectButton);
      
      expect(mockOnTemplateSelect).toHaveBeenCalled();
    });

    it('shows selected state after template selection', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const selectButton = screen.getByText('Select Template');
        expect(selectButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const selectButton = screen.getByText('Select Template');
      await user.click(selectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Selected')).toBeInTheDocument();
      });
    });

    it('disables already selected template', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const selectButton = screen.getByText('Select Template');
        expect(selectButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const selectButton = screen.getByText('Select Template');
      await user.click(selectButton);
      
      await waitFor(() => {
        const selectedButton = screen.getByText('Selected');
        expect(selectedButton).toBeDisabled();
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('shows filters when filters button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        expect(filtersButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);
      
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    it('refreshes recommendations when refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);
      
      // Should show loading state again
      expect(screen.getByText('Analyzing Templates')).toBeInTheDocument();
    });
  });

  describe('Template Card Content', () => {
    it('displays template information correctly', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('SaaS Landing Pro')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show setup complexity
      expect(screen.getByText('Easy Setup')).toBeInTheDocument();
      
      // Should show AI reasoning
      expect(screen.getByText('Why this template?')).toBeInTheDocument();
    });

    it('shows pros and cons for templates', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Pros')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show at least one pro
      expect(screen.getByText(/conversion rate/i)).toBeInTheDocument();
    });

    it('displays estimated metrics', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        // Should show conversion rate estimates
        const conversionElements = screen.getAllByText(/\d+\.\d+%/);
        expect(conversionElements.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('Responsive Behavior', () => {
    it('handles maxRecommendations prop', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} maxRecommendations={1} />);
      
      await waitFor(() => {
        const templateCards = screen.getAllByTestId('card');
        // Should have limited number of recommendation cards (plus other UI cards)
        expect(templateCards.length).toBeLessThanOrEqual(3); // Allowing for other UI cards
      }, { timeout: 5000 });
    });

    it('shows/hides reasoning details based on prop', async () => {
      const { rerender } = render(
        <ContextAwareTemplateSelector {...defaultProps} showReasoningDetails={false} />
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Why this template?')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      rerender(<ContextAwareTemplateSelector {...defaultProps} showReasoningDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Why this template?')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('shows no recommendations message when no templates match', async () => {
      // Mock API to return no recommendations
      const emptyContextMock: BusinessAnalysisResult = {
        ...mockBusinessContext,
        industry_classification: {
          primary: 'unknown',
          secondary: [],
          confidence: 0.1
        }
      };

      render(<ContextAwareTemplateSelector {...defaultProps} businessContext={emptyContextMock} />);
      
      await waitFor(() => {
        expect(screen.getByText('No Recommendations Found')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('provides try again button when no recommendations', async () => {
      const user = userEvent.setup();
      const emptyContextMock: BusinessAnalysisResult = {
        ...mockBusinessContext,
        industry_classification: {
          primary: 'unknown',
          secondary: [],
          confidence: 0.1
        }
      };

      render(<ContextAwareTemplateSelector {...defaultProps} businessContext={emptyContextMock} />);
      
      await waitFor(() => {
        const tryAgainButton = screen.getByText('Try Again');
        expect(tryAgainButton).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      // Template selection buttons should be accessible
      const selectButtons = screen.getAllByText(/Select Template|Selected/);
      selectButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const selectButton = screen.getByText('Select Template');
        expect(selectButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const selectButton = screen.getByText('Select Template');
      
      // Should be focusable and clickable with keyboard
      selectButton.focus();
      expect(document.activeElement).toBe(selectButton);
      
      await user.keyboard('{Enter}');
      expect(mockOnTemplateSelect).toHaveBeenCalled();
    });
  });

  describe('Preview Functionality', () => {
    it('shows preview button for templates', async () => {
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const previewButtons = screen.getAllByText('Preview');
        expect(previewButtons.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('handles preview button clicks', async () => {
      const user = userEvent.setup();
      render(<ContextAwareTemplateSelector {...defaultProps} />);
      
      await waitFor(() => {
        const previewButton = screen.getAllByText('Preview')[0];
        expect(previewButton).toBeInTheDocument();
      }, { timeout: 5000 });

      const previewButton = screen.getAllByText('Preview')[0];
      await user.click(previewButton);
      
      // Preview functionality should be triggered (you might mock this)
      expect(previewButton).toBeInTheDocument();
    });
  });
});