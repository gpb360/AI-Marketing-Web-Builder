/**
 * Test Helpers for Story 1.3 Components
 * 
 * Utility functions for creating test data and mocking API responses
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

import {
  BusinessAnalysisResult,
  Template,
  TemplateRecommendation,
  PersonalizationSettings,
  CustomizedTemplate,
  BrandColors,
  Typography,
  ContentPreferences,
  LayoutPreferences,
  InteractiveElements
} from '@/types/context-aware-templates';

// =============================================================================
// Mock Data Factories
// =============================================================================

export const createDefaultBusinessAnalysisResult = (): BusinessAnalysisResult => ({
  industry_classification: {
    primary: 'technology',
    secondary: ['software', 'saas'],
    confidence: 0.9
  },
  target_audience: {
    demographics: ['professionals', 'tech-savvy'],
    psychographics: ['innovation-focused', 'efficiency-oriented'],
    confidence: 0.85
  },
  business_type: 'b2b',
  content_requirements: [
    'product demonstrations',
    'case studies',
    'technical documentation',
    'customer testimonials'
  ],
  design_preferences: {
    modern: 0.9,
    professional: 0.95,
    minimal: 0.8,
    bold: 0.3
  },
  brand_personality: {
    traits: ['innovative', 'reliable', 'professional', 'forward-thinking'],
    tone: 'professional',
    confidence: 0.88
  }
});

export const createDefaultTemplate = (): Template => ({
  id: 'test-template-1',
  name: 'Modern SaaS Landing Page',
  category: 'saas',
  thumbnail: '/images/templates/saas-landing-thumb.jpg',
  preview_url: '/templates/saas-landing/preview',
  description: 'A clean, conversion-focused landing page designed for SaaS products',
  features: [
    'Hero section with product demo',
    'Feature highlights',
    'Pricing table',
    'Customer testimonials',
    'Contact form integration'
  ],
  industries: ['technology', 'software', 'saas'],
  business_types: ['b2b', 'b2c'],
  design_attributes: {
    modern: 0.95,
    professional: 0.9,
    minimal: 0.85,
    conversion_optimized: 0.9
  }
});

export const createDefaultTemplateRecommendation = (): TemplateRecommendation => ({
  template: createDefaultTemplate(),
  confidenceScore: 0.92,
  reasoning: {
    industryAlignment: 'Perfect match for technology/SaaS companies with modern design expectations',
    audienceFit: 'Designed specifically for tech-savvy professionals who value clean, efficient interfaces',
    featureBenefits: [
      'Built-in product demo section increases engagement',
      'Social proof elements build credibility',
      'Conversion-optimized layout improves lead generation'
    ],
    designRationale: 'Modern, minimal design aligns with current SaaS industry standards and user expectations'
  },
  personalizationSuggestions: [
    {
      type: 'color',
      title: 'Tech Brand Colors',
      description: 'Apply your brand colors to maintain consistency',
      preview: 'Blue and white theme with accent colors',
      impact: 'Strengthens brand recognition and professional appearance'
    },
    {
      type: 'content',
      title: 'Product-Specific Copy',
      description: 'Customize headlines and descriptions for your specific product',
      preview: 'Industry-specific language and value propositions',
      impact: 'Improves message clarity and conversion rates'
    }
  ],
  businessGoalAlignment: [
    {
      goal: 'product demonstrations',
      alignment: 95,
      description: 'Dedicated demo section with video integration capabilities'
    },
    {
      goal: 'customer testimonials',
      alignment: 90,
      description: 'Prominent testimonial section with photo and company logos'
    }
  ],
  industryRelevance: 0.95,
  targetAudienceFit: 0.88,
  pros: [
    'Industry-proven design patterns',
    'High conversion potential',
    'Mobile-responsive',
    'Fast loading times',
    'SEO optimized'
  ],
  cons: [
    'May require custom integrations for complex products',
    'Limited color customization without code changes'
  ],
  estimatedConversionRate: 0.12,
  setupComplexity: 'medium',
  customizationEffort: 6
});

export const createDefaultBrandColors = (): BrandColors => ({
  primary: '#3B82F6',
  secondary: '#1E40AF',
  accent: '#F59E0B',
  text: '#1F2937',
  background: '#FFFFFF'
});

export const createDefaultTypography = (): Typography => ({
  heading_font: 'Inter',
  body_font: 'Inter',
  font_size_scale: 1.0
});

export const createDefaultContentPreferences = (): ContentPreferences => ({
  tone: 'professional',
  content_length: 'detailed',
  use_industry_terms: true,
  include_social_proof: true
});

export const createDefaultLayoutPreferences = (): LayoutPreferences => ({
  component_spacing: 'normal',
  section_order: ['hero', 'features', 'about', 'testimonials', 'contact'],
  sidebar_position: 'none'
});

export const createDefaultInteractiveElements = (): InteractiveElements => ({
  animations: true,
  hover_effects: true,
  scroll_animations: false
});

export const createDefaultPersonalizationSettings = (): PersonalizationSettings => ({
  brand_colors: createDefaultBrandColors(),
  typography: createDefaultTypography(),
  content_preferences: createDefaultContentPreferences(),
  layout_preferences: createDefaultLayoutPreferences(),
  interactive_elements: createDefaultInteractiveElements()
});

export const createDefaultCustomizedTemplate = (): CustomizedTemplate => ({
  id: 'customized-template-1',
  original_template_id: 'test-template-1',
  name: 'Customized SaaS Landing Page',
  customizations: {
    colorScheme: createDefaultBrandColors(),
    typography: createDefaultTypography(),
    layout: createDefaultLayoutPreferences(),
    content: {
      sections: {
        hero_headline: 'Transform Your Business with Our SaaS Solution',
        hero_subheadline: 'Streamline operations and boost productivity with our innovative platform',
        cta_text: 'Start Free Trial'
      },
      tone: 'professional',
      industry_terms: true,
      social_proof: true,
      cta_optimization: true
    },
    images: {
      style: 'photography',
      color_treatment: 'original',
      aspect_ratios: ['16:9', '4:3'],
      quality: 'high'
    },
    components: {
      animations: true,
      hover_effects: true,
      scroll_animations: false,
      loading_states: true,
      micro_interactions: true
    }
  },
  preview_data: {
    template_id: 'test-template-1',
    preview_url: '/preview/customized-template-1',
    preview_images: ['/preview/desktop.jpg', '/preview/mobile.jpg'],
    device_previews: {
      desktop: '/preview/desktop.jpg',
      tablet: '/preview/tablet.jpg',
      mobile: '/preview/mobile.jpg'
    },
    estimated_load_time: 2.3,
    performance_score: 92
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
});

// =============================================================================
// Mock API Responses
// =============================================================================

export const mockBusinessAnalysisApiResponse = {
  analysis: createDefaultBusinessAnalysisResult(),
  confidence: 0.89,
  processing_time: 1250,
  suggestions: [
    'Consider highlighting your technical expertise in the hero section',
    'Include case studies from similar technology companies',
    'Emphasize security and reliability features for B2B audience'
  ]
};

export const mockTemplateRecommendationApiResponse = {
  recommendations: [
    createDefaultTemplateRecommendation(),
    {
      ...createDefaultTemplateRecommendation(),
      template: {
        ...createDefaultTemplate(),
        id: 'test-template-2',
        name: 'Corporate Business Template',
        category: 'corporate'
      },
      confidenceScore: 0.78
    }
  ],
  total_analyzed: 25,
  processing_time: 800,
  fallback_recommendations: []
};

export const mockPersonalizationApiResponse = {
  personalized_template: createDefaultCustomizedTemplate(),
  processing_time: 950,
  alternatives: []
};

// =============================================================================
// Test Utilities
// =============================================================================

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

export const mockFetch = (responses: Record<string, any>) => {
  global.fetch = jest.fn((url: string) => {
    const response = responses[url] || { error: 'Not found' };
    return Promise.resolve({
      ok: !response.error,
      status: response.error ? 404 : 200,
      json: () => Promise.resolve(response)
    } as Response);
  });
};

export const createMockQueryClient = () => {
  const { QueryClient } = require('@tanstack/react-query');
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
      },
      mutations: {
        retry: false
      }
    }
  });
};

export const createMockIntersectionObserver = () => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
};

export const createMockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
};

// =============================================================================
// Validation Helpers
// =============================================================================

export const validateBusinessAnalysisResult = (result: any): boolean => {
  return !!(
    result &&
    result.industry_classification &&
    result.target_audience &&
    result.business_type &&
    result.content_requirements &&
    Array.isArray(result.content_requirements) &&
    result.design_preferences &&
    result.brand_personality
  );
};

export const validateTemplateRecommendation = (recommendation: any): boolean => {
  return !!(
    recommendation &&
    recommendation.template &&
    recommendation.template.id &&
    recommendation.confidenceScore >= 0 &&
    recommendation.confidenceScore <= 1 &&
    recommendation.reasoning &&
    Array.isArray(recommendation.personalizationSuggestions) &&
    Array.isArray(recommendation.businessGoalAlignment)
  );
};

export const validatePersonalizationSettings = (settings: any): boolean => {
  return !!(
    settings &&
    settings.brand_colors &&
    settings.typography &&
    settings.content_preferences &&
    settings.layout_preferences &&
    settings.interactive_elements
  );
};

// =============================================================================
// Error Simulation
// =============================================================================

export const simulateNetworkError = () => {
  global.fetch = jest.fn(() => 
    Promise.reject(new Error('Network error'))
  );
};

export const simulateTimeoutError = () => {
  global.fetch = jest.fn(() => 
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 100)
    )
  );
};

export const simulateServerError = () => {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'Server error' })
    } as Response)
  );
};

// =============================================================================
// Accessibility Testing Helpers
// =============================================================================

export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('axe-core');
  const results = await axe(container);
  return results.violations;
};

export const checkKeyboardNavigation = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  return Array.from(focusableElements).every(el => {
    const tabIndex = el.getAttribute('tabindex');
    return tabIndex !== '-1';
  });
};

// =============================================================================
// Performance Testing Helpers
// =============================================================================

export const measureRenderTime = (renderFunction: () => void) => {
  const start = performance.now();
  renderFunction();
  const end = performance.now();
  return end - start;
};

export const createLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
    description: `Description for item ${index}`,
    data: new Array(100).fill(`data-${index}`).join(' ')
  }));
};

// =============================================================================
// Component Testing Utilities
// =============================================================================

export const getByTestIdRecursive = (container: HTMLElement, testId: string): HTMLElement | null => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

export const waitForElementToBeRemoved = async (element: HTMLElement, timeout = 5000) => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  return waitForElementToBeRemoved(element, { timeout });
};

export const fireEventSequence = async (events: Array<() => void>, delay = 100) => {
  for (const event of events) {
    event();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

export default {
  createDefaultBusinessAnalysisResult,
  createDefaultTemplate,
  createDefaultTemplateRecommendation,
  createDefaultPersonalizationSettings,
  createDefaultCustomizedTemplate,
  mockBusinessAnalysisApiResponse,
  mockTemplateRecommendationApiResponse,
  mockPersonalizationApiResponse,
  mockLocalStorage,
  mockFetch,
  createMockQueryClient,
  validateBusinessAnalysisResult,
  validateTemplateRecommendation,
  validatePersonalizationSettings,
  simulateNetworkError,
  simulateTimeoutError,
  simulateServerError,
  checkAccessibility,
  measureRenderTime
};