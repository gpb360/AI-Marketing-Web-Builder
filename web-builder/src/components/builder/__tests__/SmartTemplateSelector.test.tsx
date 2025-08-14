/**
 * Story 3.2: Smart Workflow Templates - SmartTemplateSelector Test Suite
 * 
 * Comprehensive test coverage for SmartTemplateSelector component
 * 
 * @author Test Writer Fixer Agent - Story 3.2 Test Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Import components to test
import SmartTemplateSelector from '../SmartTemplateSelector';
import { useSmartTemplateRecommendations } from '../../../hooks/useSmartTemplateRecommendations';

// Mock dependencies
jest.mock('../../../hooks/useSmartTemplateRecommendations');
jest.mock('../../../lib/api/client');

describe('Story 3.2: SmartTemplateSelector Component', () => {
  
  // ========================================================================
  // TEST DATA
  // ========================================================================
  
  const mockTemplates = [
    {
      template_id: 'ecom-welcome',
      name: 'E-commerce Welcome Series',
      category: 'Marketing',
      description: 'Welcome new customers with personalized emails',
      relevanceScore: 94,
      successProbability: 89,
      estimatedSetupTime: 10,
      difficulty: 'Easy',
      tags: ['email', 'welcome', 'automation'],
      preview: {
        thumbnail: '/templates/ecom-welcome-thumb.jpg',
        steps: ['Send welcome email', 'Follow up after 3 days', 'Product recommendations']
      },
      performance: {
        averageConversion: 15.8,
        industryBenchmark: 12.3,
        userRating: 4.7
      }
    },
    {
      template_id: 'lead-scoring',
      name: 'Advanced Lead Scoring',
      category: 'Sales',
      description: 'Automatically score and qualify leads',
      relevanceScore: 87,
      successProbability: 82,
      estimatedSetupTime: 25,
      difficulty: 'Advanced',
      tags: ['lead scoring', 'automation', 'CRM'],
      preview: {
        thumbnail: '/templates/lead-scoring-thumb.jpg',
        steps: ['Capture lead data', 'Calculate score', 'Route to sales team']
      },
      performance: {
        averageConversion: 23.4,
        industryBenchmark: 18.7,
        userRating: 4.5
      }
    },
    {
      template_id: 'support-ticket',
      name: 'Support Ticket Automation',
      category: 'Support',
      description: 'Streamline customer support workflows',
      relevanceScore: 78,
      successProbability: 85,
      estimatedSetupTime: 15,
      difficulty: 'Intermediate',
      tags: ['support', 'tickets', 'automation'],
      preview: {
        thumbnail: '/templates/support-thumb.jpg',
        steps: ['Receive ticket', 'Categorize issue', 'Assign to agent']
      },
      performance: {
        averageConversion: 32.1,
        industryBenchmark: 28.9,
        userRating: 4.3
      }
    }
  ];

  const mockBusinessContext = {
    industry: 'E-commerce',
    brandVoice: 'Professional',
    targetAudience: 'B2B',
    marketingMaturity: 'Intermediate'
  };

  const mockHookReturn = {
    templates: mockTemplates,
    filteredTemplates: mockTemplates,
    isLoading: false,
    error: null,
    businessContext: mockBusinessContext,
    filters: {
      category: 'all',
      difficulty: 'all',
      successRate: 0,
      setupTime: 60
    },
    sortBy: 'relevance',
    searchQuery: '',
    viewMode: 'grid',
    selectedTemplate: null,
    previewTemplate: null,
    updateFilters: jest.fn(),
    setSortBy: jest.fn(),
    setSearchQuery: jest.fn(),
    setViewMode: jest.fn(),
    selectTemplate: jest.fn(),
    previewTemplate: jest.fn(),
    instantiateTemplate: jest.fn(),
    refreshTemplates: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSmartTemplateRecommendations as jest.Mock).mockReturnValue(mockHookReturn);
  });

  // ========================================================================
  // TEMPLATE DISPLAY TESTS (AC: 5)
  // ========================================================================
  
  describe('Template Display', () => {
    it('renders template grid with all templates', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByText('E-commerce Welcome Series')).toBeInTheDocument();
      expect(screen.getByText('Advanced Lead Scoring')).toBeInTheDocument();
      expect(screen.getByText('Support Ticket Automation')).toBeInTheDocument();
    });

    it('displays template cards with key information', () => {
      render(<SmartTemplateSelector />);

      // Check first template
      expect(screen.getByText('94%')).toBeInTheDocument(); // Relevance score
      expect(screen.getByText('89%')).toBeInTheDocument(); // Success probability
      expect(screen.getByText('10 min')).toBeInTheDocument(); // Setup time
      expect(screen.getByText('Easy')).toBeInTheDocument(); // Difficulty
    });

    it('shows template thumbnails and previews', () => {
      render(<SmartTemplateSelector />);

      const thumbnails = screen.getAllByRole('img');
      expect(thumbnails).toHaveLength(3);
      expect(thumbnails[0]).toHaveAttribute('src', '/templates/ecom-welcome-thumb.jpg');
    });

    it('displays performance metrics and ratings', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByText('4.7')).toBeInTheDocument(); // User rating
      expect(screen.getByText('15.8%')).toBeInTheDocument(); // Average conversion
      expect(screen.getByText('12.3%')).toBeInTheDocument(); // Industry benchmark
    });

    it('shows template tags and categories', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('automation')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // FILTERING AND SEARCH TESTS (AC: 5)
  // ========================================================================
  
  describe('Filtering and Search', () => {
    it('filters templates by category', () => {
      render(<SmartTemplateSelector />);

      const categoryFilter = screen.getByLabelText('Category');
      fireEvent.change(categoryFilter, { target: { value: 'Marketing' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        category: 'Marketing'
      });
    });

    it('filters by difficulty level', () => {
      render(<SmartTemplateSelector />);

      const difficultyFilter = screen.getByLabelText('Difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'Easy' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        difficulty: 'Easy'
      });
    });

    it('filters by success rate threshold', () => {
      render(<SmartTemplateSelector />);

      const successRateSlider = screen.getByLabelText('Minimum Success Rate');
      fireEvent.change(successRateSlider, { target: { value: '85' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        successRate: 85
      });
    });

    it('filters by setup time range', () => {
      render(<SmartTemplateSelector />);

      const setupTimeSlider = screen.getByLabelText('Maximum Setup Time');
      fireEvent.change(setupTimeSlider, { target: { value: '20' } });

      expect(mockHookReturn.updateFilters).toHaveBeenCalledWith({
        setupTime: 20
      });
    });

    it('supports text search across template properties', () => {
      render(<SmartTemplateSelector />);

      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'welcome' } });

      expect(mockHookReturn.setSearchQuery).toHaveBeenCalledWith('welcome');
    });

    it('clears all filters when reset button is clicked', () => {
      const mockUpdateFilters = jest.fn();
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        updateFilters: mockUpdateFilters,
        filters: { category: 'Marketing', difficulty: 'Easy' }
      });

      render(<SmartTemplateSelector />);

      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      expect(mockUpdateFilters).toHaveBeenCalledWith({
        category: 'all',
        difficulty: 'all',
        successRate: 0,
        setupTime: 60
      });
    });
  });

  // ========================================================================
  // SORTING TESTS (AC: 5)
  // ========================================================================
  
  describe('Sorting', () => {
    it('sorts templates by relevance score', () => {
      render(<SmartTemplateSelector />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'relevance' } });

      expect(mockHookReturn.setSortBy).toHaveBeenCalledWith('relevance');
    });

    it('sorts by success probability', () => {
      render(<SmartTemplateSelector />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'successRate' } });

      expect(mockHookReturn.setSortBy).toHaveBeenCalledWith('successRate');
    });

    it('sorts by setup time', () => {
      render(<SmartTemplateSelector />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'setupTime' } });

      expect(mockHookReturn.setSortBy).toHaveBeenCalledWith('setupTime');
    });

    it('sorts by user rating', () => {
      render(<SmartTemplateSelector />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'rating' } });

      expect(mockHookReturn.setSortBy).toHaveBeenCalledWith('rating');
    });
  });

  // ========================================================================
  // VIEW MODE TESTS (AC: 5)
  // ========================================================================
  
  describe('View Modes', () => {
    it('switches between grid and list view modes', () => {
      render(<SmartTemplateSelector />);

      const listViewButton = screen.getByLabelText('List view');
      fireEvent.click(listViewButton);

      expect(mockHookReturn.setViewMode).toHaveBeenCalledWith('list');
    });

    it('displays templates in grid layout by default', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByTestId('template-grid')).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('displays templates in list layout when selected', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        viewMode: 'list'
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByTestId('template-list')).toHaveClass('space-y-4');
    });

    it('maintains view mode preference', () => {
      const { rerender } = render(<SmartTemplateSelector />);

      fireEvent.click(screen.getByLabelText('List view'));

      rerender(<SmartTemplateSelector />);

      // Should remember the view mode
      expect(mockHookReturn.setViewMode).toHaveBeenCalledWith('list');
    });
  });

  // ========================================================================
  // TEMPLATE PREVIEW TESTS (AC: 5)
  // ========================================================================
  
  describe('Template Preview', () => {
    it('opens preview modal when template is clicked', () => {
      render(<SmartTemplateSelector />);

      const templateCard = screen.getByTestId('template-card-ecom-welcome');
      fireEvent.click(templateCard);

      expect(mockHookReturn.previewTemplate).toHaveBeenCalledWith('ecom-welcome');
    });

    it('displays detailed template information in preview', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        previewTemplate: mockTemplates[0]
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Template Preview')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Welcome Series')).toBeInTheDocument();
      expect(screen.getByText('Welcome new customers with personalized emails')).toBeInTheDocument();
    });

    it('shows workflow steps in preview', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        previewTemplate: mockTemplates[0]
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Send welcome email')).toBeInTheDocument();
      expect(screen.getByText('Follow up after 3 days')).toBeInTheDocument();
      expect(screen.getByText('Product recommendations')).toBeInTheDocument();
    });

    it('displays performance comparison in preview', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        previewTemplate: mockTemplates[0]
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
      expect(screen.getByText('vs Industry Benchmark')).toBeInTheDocument();
    });

    it('provides instantiation button in preview', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        previewTemplate: mockTemplates[0]
      });

      render(<SmartTemplateSelector />);

      const instantiateButton = screen.getByText('Create Workflow');
      expect(instantiateButton).toBeInTheDocument();

      fireEvent.click(instantiateButton);
      expect(mockHookReturn.instantiateTemplate).toHaveBeenCalledWith('ecom-welcome');
    });
  });

  // ========================================================================
  // BUSINESS CONTEXT INTEGRATION TESTS (AC: 1, 7)
  // ========================================================================
  
  describe('Business Context Integration', () => {
    it('displays business context information', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByText('Business Context')).toBeInTheDocument();
      expect(screen.getByText('E-commerce')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('B2B')).toBeInTheDocument();
    });

    it('highlights templates relevant to business context', () => {
      render(<SmartTemplateSelector />);

      const ecomTemplate = screen.getByTestId('template-card-ecom-welcome');
      expect(ecomTemplate).toHaveClass('border-blue-500'); // Highlighted for e-commerce business
    });

    it('shows context-specific recommendations', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByText('Recommended for your business')).toBeInTheDocument();
      expect(screen.getByText('94% match')).toBeInTheDocument(); // High relevance for business context
    });

    it('updates templates when context changes', async () => {
      const mockRefresh = jest.fn();
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        refreshTemplates: mockRefresh
      });

      render(<SmartTemplateSelector />);

      const refreshButton = screen.getByLabelText('Refresh templates');
      fireEvent.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // LOADING AND ERROR STATES TESTS
  // ========================================================================
  
  describe('Loading and Error States', () => {
    it('displays loading state while fetching templates', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        isLoading: true,
        templates: []
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Loading templates...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error state when templates fail to load', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        error: 'Failed to load templates',
        templates: []
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Failed to load templates')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('displays empty state when no templates match filters', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        filteredTemplates: []
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('No templates found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });

    it('handles partial template data gracefully', () => {
      const incompleteTemplate = {
        template_id: 'incomplete',
        name: 'Incomplete Template',
        relevanceScore: 75
        // Missing other fields
      };

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        templates: [incompleteTemplate],
        filteredTemplates: [incompleteTemplate]
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByText('Incomplete Template')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // RESPONSIVE DESIGN TESTS
  // ========================================================================
  
  describe('Responsive Design', () => {
    it('adapts grid layout for mobile screens', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<SmartTemplateSelector />);

      const grid = screen.getByTestId('template-grid');
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('shows appropriate number of columns for tablet', () => {
      // Mock tablet viewport
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      render(<SmartTemplateSelector />);

      const grid = screen.getByTestId('template-grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('collapses filters on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<SmartTemplateSelector />);

      expect(screen.getByLabelText('Open filters')).toBeInTheDocument();
    });

    it('maintains full layout on desktop', () => {
      global.innerWidth = 1200;
      global.dispatchEvent(new Event('resize'));

      render(<SmartTemplateSelector />);

      const grid = screen.getByTestId('template-grid');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================
  
  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Template Selector');
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<SmartTemplateSelector />);

      const firstTemplate = screen.getByTestId('template-card-ecom-welcome');
      expect(firstTemplate).toHaveAttribute('tabIndex', '0');

      fireEvent.keyDown(firstTemplate, { key: 'Enter' });
      expect(mockHookReturn.previewTemplate).toHaveBeenCalled();
    });

    it('provides screen reader friendly descriptions', () => {
      render(<SmartTemplateSelector />);

      expect(screen.getByLabelText('Template relevance score: 94%')).toBeInTheDocument();
      expect(screen.getByLabelText('Success probability: 89%')).toBeInTheDocument();
    });

    it('manages focus properly when modal opens', () => {
      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        previewTemplate: mockTemplates[0]
      });

      render(<SmartTemplateSelector />);

      // Modal should have focus
      expect(screen.getByRole('dialog')).toHaveFocus();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  describe('Performance', () => {
    it('implements virtual scrolling for large template lists', () => {
      const largeTemplateList = Array.from({ length: 100 }, (_, index) => ({
        ...mockTemplates[0],
        template_id: `template-${index}`,
        name: `Template ${index}`
      }));

      (useSmartTemplateRecommendations as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        templates: largeTemplateList,
        filteredTemplates: largeTemplateList
      });

      render(<SmartTemplateSelector />);

      expect(screen.getByTestId('virtual-scroll-container')).toBeInTheDocument();
    });

    it('debounces search input', async () => {
      jest.useFakeTimers();

      render(<SmartTemplateSelector />);

      const searchInput = screen.getByPlaceholderText('Search templates...');
      
      fireEvent.change(searchInput, { target: { value: 'e' } });
      fireEvent.change(searchInput, { target: { value: 'em' } });
      fireEvent.change(searchInput, { target: { value: 'email' } });

      expect(mockHookReturn.setSearchQuery).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockHookReturn.setSearchQuery).toHaveBeenCalledWith('email');

      jest.useRealTimers();
    });

    it('memoizes template cards to prevent unnecessary re-renders', () => {
      const { rerender } = render(<SmartTemplateSelector />);

      // Re-render with same props
      rerender(<SmartTemplateSelector />);

      // Template cards should be memoized
      expect(screen.getAllByTestId(/template-card-/)).toHaveLength(3);
    });
  });
});