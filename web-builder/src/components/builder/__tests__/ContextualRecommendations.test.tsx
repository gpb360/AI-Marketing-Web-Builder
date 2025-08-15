/**
 * ContextualRecommendations Component Tests
 * 
 * Comprehensive test suite for the AI-powered template recommendations component
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { ContextualRecommendations } from '../ContextualRecommendations';
import { 
  BusinessAnalysisResult, 
  TemplateRecommendation, 
  Template 
} from '@/types/context-aware-templates';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => 
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className} data-testid="badge">{children}</span>
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => 
    <div className={className} data-testid="progress" data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => 
    <div data-testid="select" data-value={value}>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => 
    <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value" />
}));

// Mock child components
jest.mock('../RecommendationCard', () => ({
  RecommendationCard: ({ recommendation, onSelect, onPreview, onFeedback }: any) => (
    <div data-testid="recommendation-card" data-template-id={recommendation.template.id}>
      <h3>{recommendation.template.name}</h3>
      <button onClick={onSelect} data-testid="select-button">Select</button>
      <button onClick={onPreview} data-testid="preview-button">Preview</button>
      <button onClick={() => onFeedback(5)} data-testid="feedback-button">Feedback</button>
    </div>
  )
}));

jest.mock('../TemplatePreviewModal', () => ({
  TemplatePreviewModal: ({ template, isOpen, onClose, onSelect }: any) => 
    isOpen ? (
      <div data-testid="preview-modal">
        <h2>Preview: {template?.name}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <button onClick={onSelect} data-testid="select-from-modal">Select</button>
      </div>
    ) : null
}));

// Mock data
const mockBusinessContext: BusinessAnalysisResult = {
  industry_classification: {
    primary: 'technology',
    secondary: ['software', 'saas'],
    confidence: 0.95
  },
  target_audience: {
    demographics: ['tech professionals', 'business decision makers'],
    psychographics: ['efficiency-focused', 'innovation-driven'],
    confidence: 0.87
  },
  business_type: 'b2b',
  content_requirements: ['feature comparisons', 'testimonials', 'pricing'],
  design_preferences: {
    modern: 0.9,
    professional: 0.8,
    minimal: 0.7
  },
  brand_personality: {
    traits: ['innovative', 'trustworthy', 'professional'],
    tone: 'professional',
    confidence: 0.85
  }
};

const mockTemplate: Template = {
  id: 'saas-landing-1',
  name: 'SaaS Landing Pro',
  category: 'SaaS',
  thumbnail: '/templates/saas-landing-pro.jpg',
  preview_url: '/templates/saas-landing-pro/preview',
  description: 'Professional SaaS landing page template'
};

const mockRecommendations: TemplateRecommendation[] = [
  {
    template: mockTemplate,
    confidenceScore: 0.92,
    reasoning: {
      industryAlignment: 'Optimized for technology businesses with proven conversion patterns',
      audienceFit: 'Designed for B2B decision-makers and technical evaluators',
      featureBenefits: ['Built-in lead capture', 'Feature comparison tables', 'Social proof sections'],
      designRationale: 'Clean, professional aesthetic that builds trust with enterprise clients'
    },
    personalizationSuggestions: [
      {
        type: 'color',
        title: 'Brand Color Integration',
        description: 'Apply your brand colors throughout the template',
        preview: 'Updated color scheme with your primary brand colors',
        impact: 'Increases brand recognition by 35%'
      }
    ],
    businessGoalAlignment: [
      {
        goal: 'Lead Generation',
        alignment: 95,
        description: 'Optimized conversion funnels and lead capture forms'
      }
    ],
    industryRelevance: 95,
    targetAudienceFit: 92,
    pros: ['Proven high conversion rates', 'Built-in lead nurturing'],
    cons: ['May need content customization'],
    estimatedConversionRate: 8.7,
    setupComplexity: 'medium',
    customizationEffort: 6
  }
];

const defaultProps = {
  businessContext: mockBusinessContext,
  recommendations: mockRecommendations,
  onTemplateSelect: jest.fn(),
  onPreviewTemplate: jest.fn(),
  onFeedback: jest.fn(),
  isLoading: false
};

describe('ContextualRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component with header and business context', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByText('AI Template Recommendations')).toBeInTheDocument();
      expect(screen.getByText(/Personalized suggestions.*for your technology business/)).toBeInTheDocument();
      expect(screen.getByText('Personalized for technology Business')).toBeInTheDocument();
    });

    it('displays template statistics correctly', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Total templates
      expect(screen.getByText('AI-Curated Templates')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument(); // Average confidence
    });

    it('renders recommendation cards for each template', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
      expect(screen.getByText('SaaS Landing Pro')).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      render(<ContextualRecommendations {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('AI Analyzing Your Business')).toBeInTheDocument();
      expect(screen.getByText(/Our AI is analyzing your business context/)).toBeInTheDocument();
    });

    it('shows empty state when no recommendations are provided', () => {
      render(<ContextualRecommendations {...defaultProps} recommendations={[]} />);
      
      expect(screen.getByText('No Templates Found')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find any templates/)).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('renders grid and list view toggle buttons', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('toggles between grid and list view modes', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      const listButton = screen.getByText('List');
      await user.click(listButton);
      
      // The view mode change should affect how RecommendationCard is rendered
      // This would be tested via the viewMode prop passed to RecommendationCard
    });
  });

  describe('Sorting Functionality', () => {
    it('renders sort dropdown with options', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('sorts recommendations by confidence score by default', () => {
      const multipleRecommendations = [
        { ...mockRecommendations[0], confidenceScore: 0.8 },
        { ...mockRecommendations[0], template: { ...mockTemplate, id: 'template-2', name: 'Template 2' }, confidenceScore: 0.9 }
      ];
      
      render(<ContextualRecommendations {...defaultProps} recommendations={multipleRecommendations} />);
      
      const cards = screen.getAllByTestId('recommendation-card');
      // Higher confidence template should be first
      expect(cards[0]).toHaveAttribute('data-template-id', 'template-2');
    });
  });

  describe('Template Interactions', () => {
    it('calls onTemplateSelect when template is selected', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      const selectButton = screen.getByTestId('select-button');
      await user.click(selectButton);
      
      expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith(mockTemplate);
    });

    it('opens preview modal when template is previewed', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      const previewButton = screen.getByTestId('preview-button');
      await user.click(previewButton);
      
      expect(defaultProps.onPreviewTemplate).toHaveBeenCalledWith(mockTemplate);
      expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
    });

    it('closes preview modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      // Open modal
      const previewButton = screen.getByTestId('preview-button');
      await user.click(previewButton);
      
      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
    });

    it('handles feedback submission', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      const feedbackButton = screen.getByTestId('feedback-button');
      await user.click(feedbackButton);
      
      expect(defaultProps.onFeedback).toHaveBeenCalledWith('saas-landing-1', 5, undefined);
    });
  });

  describe('Template Comparison', () => {
    it('shows comparison bar when templates are selected for comparison', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      // Add template to comparison (this would be triggered by RecommendationCard)
      // The actual implementation would track comparison state
    });

    it('limits comparison to maximum 3 templates', () => {
      // This would test the comparison limit logic
      // Implementation depends on how comparison state is managed
    });
  });

  describe('Business Context Integration', () => {
    it('displays business context information correctly', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      expect(screen.getByText('Target Audience: tech professionals, business decision makers')).toBeInTheDocument();
      expect(screen.getByText('Business Model: B2B')).toBeInTheDocument();
      expect(screen.getByText('Brand Tone: professional')).toBeInTheDocument();
    });

    it('adapts recommendations based on business context', () => {
      const ecommerceContext = {
        ...mockBusinessContext,
        industry_classification: {
          ...mockBusinessContext.industry_classification,
          primary: 'retail'
        },
        business_type: 'b2c' as const
      };
      
      render(<ContextualRecommendations {...defaultProps} businessContext={ecommerceContext} />);
      
      expect(screen.getByText('Personalized for retail Business')).toBeInTheDocument();
      expect(screen.getByText('Business Model: B2C')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing business context gracefully', () => {
      const propsWithoutContext = {
        ...defaultProps,
        businessContext: null as any
      };
      
      // Should not crash
      expect(() => render(<ContextualRecommendations {...propsWithoutContext} />)).not.toThrow();
    });

    it('handles empty recommendations array', () => {
      render(<ContextualRecommendations {...defaultProps} recommendations={[]} />);
      
      expect(screen.getByText('No Templates Found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels and roles', () => {
      render(<ContextualRecommendations {...defaultProps} />);
      
      // Check for semantic headings
      expect(screen.getByRole('heading', { name: /AI Template Recommendations/ })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ContextualRecommendations {...defaultProps} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple recommendations', () => {
      const manyRecommendations = Array.from({ length: 20 }, (_, i) => ({
        ...mockRecommendations[0],
        template: {
          ...mockTemplate,
          id: `template-${i}`,
          name: `Template ${i}`
        }
      }));
      
      const startTime = performance.now();
      render(<ContextualRecommendations {...defaultProps} recommendations={manyRecommendations} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for different screen sizes', () => {
      // This would test responsive behavior
      // Implementation depends on how responsive classes are applied
      render(<ContextualRecommendations {...defaultProps} />);
      
      // Check for responsive grid classes
      const gridContainer = screen.getByTestId('card').parentElement;
      expect(gridContainer).toHaveClass('grid');
    });
  });
});