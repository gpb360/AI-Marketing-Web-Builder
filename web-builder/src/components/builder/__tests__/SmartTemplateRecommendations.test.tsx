/**
 * Story 3.2: Smart Workflow Templates with AI Customization - Test Suite
 * 
 * Comprehensive test coverage for SmartTemplateRecommendations component
 * 
 * @author Test Writer Fixer Agent - Story 3.2 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Import components to test
import SmartTemplateRecommendations from '../SmartTemplateRecommendations';
import { useSmartTemplateRecommendations } from '../../../hooks/useSmartTemplateRecommendations';

// Mock the hook
jest.mock('../../../hooks/useSmartTemplateRecommendations', () => ({
  useSmartTemplateRecommendations: jest.fn()
}));

// Mock API calls
jest.mock('../../../lib/api/client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

describe('Story 3.2: SmartTemplateRecommendations Component', () => {
  
  // ========================================================================
  // TEST DATA
  // ========================================================================
  
  const mockBusinessContext = {
    industry: 'E-commerce',
    brandVoice: 'Professional',
    targetAudience: 'B2B',
    marketingMaturity: 'Intermediate',
    automationReadiness: 85,
    businessSize: 'Medium',
    currentTools: ['Shopify', 'MailChimp'],
    marketingGoals: ['Lead Generation', 'Customer Retention']
  };

  const mockTemplateRecommendation = {
    template_id: 'ecom-lead-nurture',
    name: 'E-commerce Lead Nurturing Sequence',
    category: 'Marketing',
    description: 'Automated lead nurturing for e-commerce businesses',
    relevanceScore: 92,
    successProbability: 87,
    estimatedSetupTime: 15,
    expectedOutcomes: {
      conversionIncrease: 25,
      timeToValue: 7,
      automationEfficiency: 90
    },
    reasoning: {
      primaryFactors: [
        'Perfect match for e-commerce industry',
        'Aligns with professional brand voice',
        'Suitable for intermediate marketing maturity'
      ],
      confidenceScore: 94,
      riskFactors: ['Requires integration with Shopify'],
      successIndicators: ['High engagement rates in similar businesses']
    },
    customizations: {
      emailTemplates: [
        {
          type: 'welcome',
          subject: 'Welcome to [Brand Name] - Your Success Starts Here',
          preview: 'Professional welcome message...',
          personalization: 85
        }
      ],
      integrationRequirements: [
        {
          service: 'Shopify',
          status: 'available',
          setupComplexity: 'Low'
        }
      ]
    },
    performance: {
      industryBenchmark: 18,
      averageROI: 340,
      implementationSuccess: 89
    }
  };

  const mockHookReturn = {
    recommendations: [mockTemplateRecommendation],
    isLoading: false,
    error: null,
    businessContext: mockBusinessContext,
    filters: {
      category: 'all',
      complexity: 'all',
      successRate: 0
    },
    sortBy: 'relevance',
    searchQuery: '',
    selectedTemplate: null,
    updateFilters: jest.fn(),
    setSortBy: jest.fn(),
    setSearchQuery: jest.fn(),
    selectTemplate: jest.fn(),
    instantiateTemplate: jest.fn(),
    refreshRecommendations: jest.fn(),
    analyzeBusinessContext: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSmartTemplateRecommendations as jest.Mock).mockReturnValue(mockHookReturn);
  });

  // ========================================================================
  // COMPONENT RENDERING TESTS (AC: 2)
  // ========================================================================
  
  describe('Component Rendering', () => {
    it('renders template recommendations with relevance scoring', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByText('E-commerce Lead Nurturing Sequence')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument(); // Relevance score
      expect(screen.getByText('87%')).toBeInTheDocument(); // Success probability
    });

    it('displays business context information', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByText('E-commerce')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('B2B')).toBeInTheDocument();
    });

    it('shows loading state when analyzing', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        isLoading: true,
        recommendations: []
      });

      render(<SmartTemplateRecommendations />);

      expect(screen.getByText(/Analyzing your business/)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('displays error state gracefully', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        error: 'Failed to load recommendations',
        recommendations: []
      });

      render(<SmartTemplateRecommendations />);

      expect(screen.getByText(/Failed to load recommendations/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // AI REASONING DISPLAY TESTS (AC: 2, 6)
  // ========================================================================
  
  describe('AI Reasoning Display', () => {
    it('shows detailed reasoning for recommendations', () => {
      render(<SmartTemplateRecommendations />);

      // Click on template to see details
      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));

      expect(screen.getByText('Perfect match for e-commerce industry')).toBeInTheDocument();
      expect(screen.getByText('94%')).toBeInTheDocument(); // Confidence score
    });

    it('displays success prediction with confidence intervals', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));

      expect(screen.getByText('Expected Outcomes')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument(); // Conversion increase
      expect(screen.getByText('340%')).toBeInTheDocument(); // Average ROI
    });

    it('highlights risk factors and mitigation strategies', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));

      expect(screen.getByText('Requires integration with Shopify')).toBeInTheDocument();
      expect(screen.getByText('Risk Factors')).toBeInTheDocument();
    });

    it('shows industry benchmarks for context', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));

      expect(screen.getByText('Industry Benchmark')).toBeInTheDocument();
      expect(screen.getByText('18%')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // TEMPLATE CUSTOMIZATION PREVIEW TESTS (AC: 3)
  // ========================================================================
  
  describe('Template Customization Preview', () => {
    it('shows AI-suggested customizations with impact assessment', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Preview Customizations'));

      expect(screen.getByText('Welcome to [Brand Name]')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument(); // Personalization score
    });

    it('displays before/after comparisons', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Preview Customizations'));

      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByText('Impact Assessment')).toBeInTheDocument();
    });

    it('shows integration requirements and setup complexity', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));

      expect(screen.getByText('Integration Requirements')).toBeInTheDocument();
      expect(screen.getByText('Shopify')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument(); // Setup complexity
    });

    it('provides confidence scores for customizations', () => {
      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Preview Customizations'));

      // Should show personalization confidence
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ONE-CLICK INSTANTIATION TESTS (AC: 4)
  // ========================================================================
  
  describe('One-Click Instantiation', () => {
    it('handles template instantiation with business context', async () => {
      const mockInstantiate = jest.fn().mockResolvedValue({
        workflowId: 'new-workflow-123',
        status: 'created'
      });

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        instantiateTemplate: mockInstantiate
      });

      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      
      const instantiateButton = screen.getByText('Create Workflow');
      fireEvent.click(instantiateButton);

      await waitFor(() => {
        expect(mockInstantiate).toHaveBeenCalledWith('ecom-lead-nurture', mockBusinessContext);
      });
    });

    it('shows setup instructions after instantiation', async () => {
      const mockInstantiate = jest.fn().mockResolvedValue({
        workflowId: 'new-workflow-123',
        status: 'created',
        setupInstructions: [
          'Connect your Shopify store',
          'Configure email templates',
          'Set automation triggers'
        ]
      });

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        instantiateTemplate: mockInstantiate
      });

      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('Setup Instructions')).toBeInTheDocument();
        expect(screen.getByText('Connect your Shopify store')).toBeInTheDocument();
      });
    });

    it('handles instantiation errors gracefully', async () => {
      const mockInstantiate = jest.fn().mockRejectedValue(new Error('Integration failed'));

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        instantiateTemplate: mockInstantiate
      });

      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(screen.getByText('Integration failed')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('tracks template selection analytics', async () => {
      const mockInstantiate = jest.fn().mockResolvedValue({ status: 'created' });

      render(<SmartTemplateRecommendations />);

      fireEvent.click(screen.getByText('E-commerce Lead Nurturing Sequence'));
      fireEvent.click(screen.getByText('Create Workflow'));

      await waitFor(() => {
        expect(mockInstantiate).toHaveBeenCalledWith(
          'ecom-lead-nurture',
          mockBusinessContext
        );
      });
    });
  });

  // ========================================================================
  // FILTERING AND SEARCH TESTS (AC: 5)
  // ========================================================================
  
  describe('Interactive Selection Interface', () => {
    it('provides category filtering', () => {
      render(<SmartTemplateRecommendations />);

      const categoryFilter = screen.getByLabelText('Category');
      fireEvent.change(categoryFilter, { target: { value: 'Marketing' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        category: 'Marketing'
      });
    });

    it('supports search functionality', () => {
      render(<SmartTemplateRecommendations />);

      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'lead generation' } });

      expect(mockHookReturn.setSearchQuery).toHaveBeenCalledWith('lead generation');
    });

    it('allows sorting by different criteria', () => {
      render(<SmartTemplateRecommendations />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'successRate' } });

      expect(mockHookReturn.setSortBy).toHaveBeenCalledWith('successRate');
    });

    it('filters by success rate threshold', () => {
      render(<SmartTemplateRecommendations />);

      const successRateSlider = screen.getByLabelText('Minimum Success Rate');
      fireEvent.change(successRateSlider, { target: { value: '80' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        successRate: 80
      });
    });

    it('provides grid and list view modes', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('List view'));
      
      // Should update view mode
      expect(screen.getByTestId('list-view-container')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // BUSINESS ANALYSIS INTEGRATION TESTS (AC: 1, 7)
  // ========================================================================
  
  describe('Business Analysis Integration', () => {
    it('triggers business context analysis', async () => {
      const mockAnalyze = jest.fn().mockResolvedValue(mockBusinessContext);

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        analyzeBusinessContext: mockAnalyze,
        businessContext: null
      });

      render(<SmartTemplateRecommendations />);

      const analyzeButton = screen.getByText('Analyze My Business');
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(mockAnalyze).toHaveBeenCalled();
      });
    });

    it('displays business context analysis results', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByText('Business Analysis')).toBeInTheDocument();
      expect(screen.getByText('Industry:')).toBeInTheDocument();
      expect(screen.getByText('E-commerce')).toBeInTheDocument();
      expect(screen.getByText('Brand Voice:')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('maintains context across workflow creation', () => {
      render(<SmartTemplateRecommendations />);

      // Context should be available throughout the component
      expect(screen.getByTestId('business-context')).toHaveAttribute(
        'data-context',
        JSON.stringify(mockBusinessContext)
      );
    });

    it('updates recommendations when context changes', async () => {
      const mockRefresh = jest.fn();

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        refreshRecommendations: mockRefresh
      });

      render(<SmartTemplateRecommendations />);

      // Simulate context change
      const refreshButton = screen.getByLabelText('Refresh recommendations');
      fireEvent.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  describe('Performance', () => {
    it('handles large recommendation lists efficiently', () => {
      const largeRecommendationList = Array.from({ length: 50 }, (_, index) => ({
        ...mockTemplateRecommendation,
        template_id: `template-${index}`,
        name: `Template ${index}`
      }));

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        recommendations: largeRecommendationList
      });

      const { container } = render(<SmartTemplateRecommendations />);

      // Should render without performance issues
      expect(container.querySelectorAll('[data-testid="template-card"]')).toHaveLength(50);
    });

    it('implements virtual scrolling for large lists', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        ...mockTemplateRecommendation,
        template_id: `template-${i}`,
        name: `Template ${i}`
      }));

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        recommendations: largeList
      });

      render(<SmartTemplateRecommendations />);

      // Should implement virtual scrolling
      expect(screen.getByTestId('virtual-scroll-container')).toBeInTheDocument();
    });

    it('debounces search input for performance', async () => {
      jest.useFakeTimers();

      render(<SmartTemplateRecommendations />);

      const searchInput = screen.getByPlaceholderText('Search templates...');
      
      // Type rapidly
      fireEvent.change(searchInput, { target: { value: 'l' } });
      fireEvent.change(searchInput, { target: { value: 'le' } });
      fireEvent.change(searchInput, { target: { value: 'lea' } });
      fireEvent.change(searchInput, { target: { value: 'lead' } });

      // Should not call setSearchQuery immediately
      expect(mockHookReturn.setSearchQuery).not.toHaveBeenCalled();

      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should call only once with final value
      expect(mockHookReturn.setSearchQuery).toHaveBeenCalledTimes(1);
      expect(mockHookReturn.setSearchQuery).toHaveBeenCalledWith('lead');

      jest.useRealTimers();
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================
  
  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Smart Template Recommendations');
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<SmartTemplateRecommendations />);

      const templateCard = screen.getByTestId('template-card-ecom-lead-nurture');
      expect(templateCard).toHaveAttribute('tabIndex', '0');

      // Test keyboard activation
      fireEvent.keyDown(templateCard, { key: 'Enter' });
      expect(mockHookReturn.selectTemplate).toHaveBeenCalledWith('ecom-lead-nurture');
    });

    it('provides screen reader friendly content', () => {
      render(<SmartTemplateRecommendations />);

      expect(screen.getByText('92% relevance score')).toHaveAttribute(
        'aria-label',
        'Relevance score: 92 percent'
      );
      expect(screen.getByText('87% success probability')).toHaveAttribute(
        'aria-label',
        'Success probability: 87 percent'
      );
    });

    it('handles focus management properly', () => {
      render(<SmartTemplateRecommendations />);

      const templateCard = screen.getByTestId('template-card-ecom-lead-nurture');
      fireEvent.click(templateCard);

      // Focus should move to details panel
      expect(screen.getByTestId('template-details')).toHaveFocus();
    });
  });

  // ========================================================================
  // ERROR BOUNDARY TESTS
  // ========================================================================
  
  describe('Error Handling', () => {
    it('catches and displays component errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div>Error caught: {(error as Error).message}</div>;
        }
      };

      render(
        <ErrorBoundaryWrapper>
          <ThrowError />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('Error caught: Test error')).toBeInTheDocument();
    });

    it('provides fallback content when recommendations fail to load', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        recommendations: [],
        error: 'Network error'
      });

      render(<SmartTemplateRecommendations />);

      expect(screen.getByText('Unable to load recommendations')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('handles partial data gracefully', () => {
      const incompleteRecommendation = {
        template_id: 'incomplete',
        name: 'Incomplete Template',
        relevanceScore: 85
        // Missing other required fields
      };

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        recommendations: [incompleteRecommendation]
      });

      render(<SmartTemplateRecommendations />);

      // Should render with fallback values
      expect(screen.getByText('Incomplete Template')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});