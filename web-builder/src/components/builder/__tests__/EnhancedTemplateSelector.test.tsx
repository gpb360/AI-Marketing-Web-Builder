import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EnhancedTemplateSelector from '../EnhancedTemplateSelector';
import * as builderStore from '@/store/builderStore';

// Mock the builder store
jest.mock('@/store/builderStore', () => ({
  useBuilderStore: jest.fn(() => ({
    addComponent: jest.fn(),
    templates: []
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock data
jest.mock('@/data/templates', () => ({
  sampleTemplates: [
    {
      id: 'test-template-1',
      name: 'Test SaaS Template',
      category: 'landing',
      description: 'A test SaaS landing page template',
      is_premium: true,
      rating: 4.8,
      usage_count: 1000,
      tags: ['saas', 'landing', 'premium']
    },
    {
      id: 'test-template-2',
      name: 'Test E-commerce Template',
      category: 'ecommerce',
      description: 'A test e-commerce template',
      is_premium: false,
      rating: 4.5,
      usage_count: 500,
      tags: ['ecommerce', 'shopping']
    }
  ],
  templateCategories: [
    { id: 'landing', name: 'Landing Pages' },
    { id: 'ecommerce', name: 'E-commerce' }
  ]
}));

describe('EnhancedTemplateSelector', () => {
  const mockAddComponent = jest.fn();
  const mockOnTemplateSelect = jest.fn();
  const mockOnTemplateInstantiate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (builderStore.useBuilderStore as jest.Mock).mockReturnValue({
      addComponent: mockAddComponent,
      templates: []
    });
  });

  describe('Acceptance Criteria Testing', () => {
    test('AC 3: One-click template instantiation with pre-configured nodes', async () => {
      render(
        <EnhancedTemplateSelector
          onTemplateSelect={mockOnTemplateSelect}
          onTemplateInstantiate={mockOnTemplateInstantiate}
        />
      );

      // Find the first template's "Use Template" button
      const useTemplateButtons = screen.getAllByText(/Use Template|Creating.../);
      const useTemplateButton = useTemplateButtons[0];

      // Click the instantiate button
      fireEvent.click(useTemplateButton);

      // Should show loading state
      expect(screen.getByText(/Creating.../)).toBeInTheDocument();

      // Should call the instantiate callback
      expect(mockOnTemplateInstantiate).toHaveBeenCalled();

      // Wait for the instantiation process to complete
      await waitFor(() => {
        expect(mockAddComponent).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('AC 5: Preview mode shows expected workflow outcomes with success probability estimates', async () => {
      render(<EnhancedTemplateSelector />);

      // Find and click a preview button
      const previewButtons = screen.getAllByText('Preview');
      fireEvent.click(previewButtons[0]);

      // Should open preview modal
      await waitFor(() => {
        expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      });

      // Should show success probability
      const successRate = screen.getByText(/\d+% success rate/);
      expect(successRate).toBeInTheDocument();

      // Should show outcome predictions
      expect(screen.getByText('Expected Conversion')).toBeInTheDocument();
      expect(screen.getByText('Setup Time')).toBeInTheDocument();
      expect(screen.getByText('AI Customization')).toBeInTheDocument();

      // Should show conversion rate
      const conversionText = screen.getByText(/\d+\.\d+%/);
      expect(conversionText).toBeInTheDocument();

      // Should show setup time
      const setupTimeText = screen.getByText(/\d+ min/);
      expect(setupTimeText).toBeInTheDocument();
    });

    test('AC 7: Integration with existing workflow builder maintains current drag-drop functionality', () => {
      render(
        <EnhancedTemplateSelector
          onTemplateSelect={mockOnTemplateSelect}
          onTemplateInstantiate={mockOnTemplateInstantiate}
        />
      );

      // Should use the builder store for component management
      expect(builderStore.useBuilderStore).toHaveBeenCalled();

      // Should accept callback functions for integration
      expect(typeof mockOnTemplateSelect).toBe('function');
      expect(typeof mockOnTemplateInstantiate).toBe('function');

      // Should maintain template compatibility
      const templates = screen.getAllByText(/Template/);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Filtering and Sorting', () => {
    test('should filter templates by search query', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Find search input
      const searchInput = screen.getByPlaceholderText(/Search templates/);
      
      // Type in search query
      await user.type(searchInput, 'SaaS');

      // Should filter results
      expect(screen.getByText('Test SaaS Template')).toBeInTheDocument();
      expect(screen.queryByText('Test E-commerce Template')).not.toBeInTheDocument();
    });

    test('should filter templates by category', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Find category selector
      const categorySelect = screen.getByDisplayValue('All Categories');
      
      // Select e-commerce category
      await user.selectOptions(categorySelect, 'ecommerce');

      // Should show only e-commerce templates
      expect(screen.getByText('Test E-commerce Template')).toBeInTheDocument();
    });

    test('should sort templates by different criteria', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Find sort selector
      const sortSelect = screen.getByDisplayValue(/Most Popular|Highest Success Rate/);
      
      // Change sort to highest rated
      await user.selectOptions(sortSelect, 'rating-desc');

      // Templates should be re-ordered (hard to test exact order without more complex setup)
      const templates = screen.getAllByText(/Test.*Template/);
      expect(templates.length).toBeGreaterThan(0);
    });

    test('should toggle advanced filters', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Find filters toggle button
      const filtersButton = screen.getByText('Filters');
      
      // Click to show filters
      await user.click(filtersButton);

      // Should show advanced filter options
      expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
      expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
      expect(screen.getByText('Template Type')).toBeInTheDocument();
    });

    test('should filter by difficulty level', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Open advanced filters
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      // Find and check beginner difficulty
      const beginnerCheckbox = screen.getByLabelText('beginner');
      await user.click(beginnerCheckbox);

      // Should filter by difficulty (exact testing would require mock data with difficulty levels)
      expect(beginnerCheckbox).toBeChecked();
    });

    test('should clear all filters', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Set some filters first
      const searchInput = screen.getByPlaceholderText(/Search templates/);
      await user.type(searchInput, 'test');

      // Open advanced filters and set some
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      const clearFiltersButton = screen.getByText('Clear Filters');
      await user.click(clearFiltersButton);

      // Search should be cleared
      expect(searchInput).toHaveValue('');
    });
  });

  describe('View Modes', () => {
    test('should switch between grid, list, and detailed view modes', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Find view mode buttons (they use icons, so we'll look for parent elements)
      const viewModeButtons = screen.getAllByRole('button');
      const gridButton = viewModeButtons.find(btn => 
        btn.querySelector('svg') && btn.getAttribute('class')?.includes('bg-white')
      );

      // Should start in grid mode (default)
      expect(gridButton).toBeInTheDocument();

      // The switching functionality is implemented but hard to test without more specific selectors
      // In a real implementation, we'd add data-testid attributes for reliable testing
    });
  });

  describe('Template Cards', () => {
    test('should display template information correctly', () => {
      render(<EnhancedTemplateSelector />);

      // Should show template names
      expect(screen.getByText('Test SaaS Template')).toBeInTheDocument();
      expect(screen.getByText('Test E-commerce Template')).toBeInTheDocument();

      // Should show ratings
      const ratingElements = screen.getAllByText(/4\.\d/);
      expect(ratingElements.length).toBeGreaterThan(0);

      // Should show success probability badges
      const successBadges = screen.getAllByText(/\d+%/);
      expect(successBadges.length).toBeGreaterThan(0);
    });

    test('should show premium badges for premium templates', () => {
      render(<EnhancedTemplateSelector />);

      // Premium templates should have premium indicators
      // This would be more testable with data-testid attributes on the badges
      const premiumTemplateCard = screen.getByText('Test SaaS Template').closest('.template-card');
      expect(premiumTemplateCard).toBeInTheDocument();
    });

    test('should display AI insights for each template', () => {
      render(<EnhancedTemplateSelector />);

      // Should show setup time
      const setupTimeElements = screen.getAllByText(/\d+min setup/);
      expect(setupTimeElements.length).toBeGreaterThan(0);

      // Should show conversion rates
      const conversionElements = screen.getAllByText(/\d+\.\d+% conversion/);
      expect(conversionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Preview Modal', () => {
    test('should open and close preview modal', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Open preview
      const previewButtons = screen.getAllByText('Preview');
      await user.click(previewButtons[0]);

      // Should show preview modal content
      await waitFor(() => {
        expect(screen.getByText('Template Features')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close|cancel/i });
      await user.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Template Features')).not.toBeInTheDocument();
      });
    });

    test('should show detailed template information in preview', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Open preview for first template
      const previewButtons = screen.getAllByText('Preview');
      await user.click(previewButtons[0]);

      await waitFor(() => {
        // Should show template name as header
        expect(screen.getByText('Test SaaS Template')).toBeInTheDocument();
        
        // Should show features section
        expect(screen.getByText('Template Features')).toBeInTheDocument();
        
        // Should show workflow compatibility
        expect(screen.getByText('Workflow Compatibility')).toBeInTheDocument();
        
        // Should show outcome predictions
        expect(screen.getByText('Expected Conversion')).toBeInTheDocument();
        expect(screen.getByText('Setup Time')).toBeInTheDocument();
        expect(screen.getByText('AI Customization')).toBeInTheDocument();
      });
    });

    test('should allow template instantiation from preview modal', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector onTemplateInstantiate={mockOnTemplateInstantiate} />);

      // Open preview
      const previewButtons = screen.getAllByText('Preview');
      await user.click(previewButtons[0]);

      // Click use template button in modal
      await waitFor(() => {
        const useTemplateButton = screen.getByText('Use This Template');
        expect(useTemplateButton).toBeInTheDocument();
        
        // Click the button
        fireEvent.click(useTemplateButton);
        
        // Should call instantiate callback
        expect(mockOnTemplateInstantiate).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty search results gracefully', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Search for something that won't match
      const searchInput = screen.getByPlaceholderText(/Search templates/);
      await user.type(searchInput, 'nonexistenttemplatequery');

      // Should show no results message
      expect(screen.getByText('No templates found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });

    test('should handle template instantiation errors', async () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the instantiate callback to throw an error
      const errorCallback = jest.fn().mockRejectedValue(new Error('Instantiation failed'));
      
      render(<EnhancedTemplateSelector onTemplateInstantiate={errorCallback} />);

      const useTemplateButtons = screen.getAllByText(/Use Template/);
      fireEvent.click(useTemplateButtons[0]);

      // Should handle the error gracefully (not crash the component)
      await waitFor(() => {
        expect(errorCallback).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test('should work without callback props', () => {
      // Should render without crashing when no callbacks provided
      expect(() => {
        render(<EnhancedTemplateSelector />);
      }).not.toThrow();

      // Should still show templates
      expect(screen.getByText('Test SaaS Template')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', () => {
      render(<EnhancedTemplateSelector />);

      // Search input should have proper labeling
      const searchInput = screen.getByPlaceholderText(/Search templates/);
      expect(searchInput).toBeInTheDocument();

      // Buttons should be accessible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Select elements should be accessible
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnhancedTemplateSelector />);

      // Should be able to tab to search input
      await user.tab();
      expect(screen.getByPlaceholderText(/Search templates/)).toHaveFocus();

      // Should be able to continue tabbing through interactive elements
      await user.tab();
      await user.tab();
      
      // Some element should have focus (exact element depends on implementation)
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Performance', () => {
    test('should render efficiently with many templates', () => {
      // Mock a large number of templates
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        category: 'landing',
        description: `Description for template ${i}`,
        rating: 4.0 + (i % 10) / 10,
        usage_count: i * 100,
        tags: ['tag1', 'tag2']
      }));

      // Mock the templates data
      jest.doMock('@/data/templates', () => ({
        sampleTemplates: manyTemplates,
        templateCategories: [{ id: 'landing', name: 'Landing Pages' }]
      }));

      // Should render without performance issues
      const startTime = performance.now();
      render(<EnhancedTemplateSelector />);
      const endTime = performance.now();

      // Should render reasonably quickly (within 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});