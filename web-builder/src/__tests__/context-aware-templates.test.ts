/**
 * Context-Aware Template System Tests
 * 
 * Tests for Story 3.7: Context-Aware Template Recommendations
 * Validates business context analysis and template matching intelligence
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  BusinessAnalysisRequest,
  BusinessAnalysisResult,
  TemplateIntelligenceScore,
  EnhancedTemplate,
  TemplateRecommendation
} from '@/types/context-aware-templates';

import {
  sampleTemplates,
  getTemplatesForIndustry,
  getTemplatesForBusinessType,
  getTemplatesByDesignStyle,
  getTemplatesByIntelligenceScore,
  searchTemplates
} from '@/data/templates/enhanced-templates';

import { ContextAwareTemplatesUtils } from '@/lib/api/context-aware-templates';

describe('Context-Aware Template System', () => {
  let mockBusinessContext: BusinessAnalysisResult;
  let mockBusinessRequest: BusinessAnalysisRequest;

  beforeEach(() => {
    mockBusinessRequest = {
      business_name: 'TechFlow Solutions',
      business_description: 'AI-powered workflow automation platform for modern businesses seeking to streamline operations and boost productivity',
      industry: 'technology',
      target_audience: 'B2B professionals, CTOs, operations managers',
      business_goals: ['Generate leads', 'Increase brand awareness', 'Drive online sales'],
      existing_brand_colors: ['#4f46e5', '#0066CC'],
      preferred_style: 'modern',
      website_url: 'https://techflow.com',
      competitors: ['Zapier', 'Microsoft Power Automate']
    };

    mockBusinessContext = {
      industry_classification: {
        primary: 'technology',
        secondary: ['software', 'saas', 'automation'],
        confidence: 0.92
      },
      target_audience: {
        demographics: ['25-45 years', 'professionals', 'decision-makers'],
        psychographics: ['efficiency-focused', 'innovation-seeking', 'growth-oriented'],
        confidence: 0.88
      },
      business_type: 'b2b',
      content_requirements: [
        'Clear value proposition',
        'Feature demonstrations',
        'Customer testimonials',
        'Integration capabilities',
        'Pricing transparency'
      ],
      design_preferences: {
        modern: 0.95,
        minimal: 0.80,
        professional: 0.90,
        colorful: 0.40
      },
      brand_personality: {
        traits: ['innovative', 'reliable', 'efficient'],
        tone: 'professional',
        confidence: 0.85
      }
    };
  });

  describe('Business Analysis Request Validation', () => {
    it('should validate complete business analysis request', () => {
      const validation = ContextAwareTemplatesUtils.validateBusinessAnalysisRequest(mockBusinessRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject incomplete business analysis request', () => {
      const incompleteRequest: BusinessAnalysisRequest = {
        business_name: '',
        business_description: 'Short',
        industry: 'technology',
        target_audience: '',
        business_goals: [],
        existing_brand_colors: [],
        preferred_style: undefined,
        website_url: '',
        competitors: []
      };

      const validation = ContextAwareTemplatesUtils.validateBusinessAnalysisRequest(incompleteRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('Business name is required');
      expect(validation.errors).toContain('Business description must be at least 20 characters');
      expect(validation.errors).toContain('At least one business goal is required');
    });
  });

  describe('Template Filtering and Matching', () => {
    it('should filter templates by industry', () => {
      const techTemplates = getTemplatesForIndustry('technology');
      
      expect(techTemplates.length).toBeGreaterThan(0);
      techTemplates.forEach(template => {
        expect(template.target_industries).toContain('technology');
      });
    });

    it('should filter templates by business type', () => {
      const b2bTemplates = getTemplatesForBusinessType('b2b');
      
      expect(b2bTemplates.length).toBeGreaterThan(0);
      b2bTemplates.forEach(template => {
        expect(template.target_business_types).toContain('b2b');
      });
    });

    it('should filter templates by design style', () => {
      const modernTemplates = getTemplatesByDesignStyle('modern');
      
      expect(modernTemplates.length).toBeGreaterThan(0);
      modernTemplates.forEach(template => {
        expect(template.design_style).toContain('modern');
      });
    });

    it('should filter templates by intelligence score', () => {
      const highScoreTemplates = getTemplatesByIntelligenceScore(0.8);
      
      expect(highScoreTemplates.length).toBeGreaterThan(0);
      highScoreTemplates.forEach(template => {
        expect(template.intelligence_score?.overall_score).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('Template Intelligence Scoring', () => {
    it('should calculate template match score correctly', () => {
      const template = sampleTemplates.find(t => t.id === 'premium-saas-landing-1');
      expect(template).toBeDefined();

      if (template) {
        const matchScore = ContextAwareTemplatesUtils.calculateTemplateMatchScore(template, mockBusinessContext);
        
        expect(matchScore).toBeGreaterThanOrEqual(0);
        expect(matchScore).toBeLessThanOrEqual(1);
        // Should score high for technology + B2B + modern style
        expect(matchScore).toBeGreaterThan(0.7);
      }
    });

    it('should have intelligence scores for all templates', () => {
      sampleTemplates.forEach(template => {
        expect(template.intelligence_score).toBeDefined();
        expect(template.intelligence_score?.overall_score).toBeGreaterThanOrEqual(0);
        expect(template.intelligence_score?.overall_score).toBeLessThanOrEqual(1);
        expect(template.intelligence_score?.confidence_level).toBeGreaterThanOrEqual(0);
        expect(template.intelligence_score?.reasoning).toBeDefined();
        expect(Array.isArray(template.intelligence_score?.reasoning)).toBe(true);
      });
    });

    it('should format confidence scores correctly', () => {
      expect(ContextAwareTemplatesUtils.formatConfidenceScore(0.95)).toBe('Very High');
      expect(ContextAwareTemplatesUtils.formatConfidenceScore(0.85)).toBe('High');
      expect(ContextAwareTemplatesUtils.formatConfidenceScore(0.75)).toBe('Medium');
      expect(ContextAwareTemplatesUtils.formatConfidenceScore(0.65)).toBe('Moderate');
      expect(ContextAwareTemplatesUtils.formatConfidenceScore(0.55)).toBe('Low');
    });
  });

  describe('Template Search and Discovery', () => {
    it('should search templates by keyword', () => {
      const saasResults = searchTemplates('saas');
      expect(saasResults.length).toBeGreaterThan(0);
      
      const portfolioResults = searchTemplates('portfolio');
      expect(portfolioResults.length).toBeGreaterThan(0);
      
      const modernResults = searchTemplates('modern');
      expect(modernResults.length).toBeGreaterThan(0);
    });

    it('should return empty results for non-existent keywords', () => {
      const noResults = searchTemplates('nonexistentkeyword12345');
      expect(noResults).toHaveLength(0);
    });
  });

  describe('Enhanced Template Structure', () => {
    it('should have all required enhanced template fields', () => {
      sampleTemplates.forEach(template => {
        // Core template fields
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.description).toBeDefined();
        
        // Enhanced fields
        expect(template.target_industries).toBeDefined();
        expect(template.target_business_types).toBeDefined();
        expect(template.design_style).toBeDefined();
        expect(template.complexity_level).toBeDefined();
        expect(typeof template.setup_time_minutes).toBe('number');
        expect(typeof template.responsive).toBe('boolean');
        expect(typeof template.mobile_optimized).toBe('boolean');
        expect(typeof template.seo_optimized).toBe('boolean');
        expect(typeof template.performance_score).toBe('number');
        
        // Intelligence data
        expect(template.intelligence_score).toBeDefined();
        expect(template.personalization_data).toBeDefined();
        expect(template.usage_analytics).toBeDefined();
        expect(template.ai_insights).toBeDefined();
      });
    });

    it('should have valid performance scores', () => {
      sampleTemplates.forEach(template => {
        expect(template.performance_score).toBeGreaterThanOrEqual(0);
        expect(template.performance_score).toBeLessThanOrEqual(1);
      });
    });

    it('should have personalization data structure', () => {
      sampleTemplates.forEach(template => {
        expect(template.personalization_data?.customizable_elements).toBeDefined();
        expect(Array.isArray(template.personalization_data?.customizable_elements)).toBe(true);
        expect(template.personalization_data?.ai_content_suggestions).toBeDefined();
        expect(template.personalization_data?.color_palette_options).toBeDefined();
        expect(template.personalization_data?.layout_variations).toBeDefined();
      });
    });
  });

  describe('Business Context Compatibility', () => {
    it('should identify highly compatible templates for technology B2B business', () => {
      const compatibleTemplates = sampleTemplates.filter(template => {
        const matchScore = ContextAwareTemplatesUtils.calculateTemplateMatchScore(template, mockBusinessContext);
        return matchScore > 0.7;
      });

      expect(compatibleTemplates.length).toBeGreaterThan(0);
      
      // Should include SaaS templates for tech B2B
      const hasSaasTemplate = compatibleTemplates.some(t => 
        t.subcategory === 'saas' || t.name.toLowerCase().includes('saas')
      );
      expect(hasSaasTemplate).toBe(true);
    });

    it('should rank templates by compatibility score', () => {
      const templatesWithScores = sampleTemplates.map(template => ({
        template,
        score: ContextAwareTemplatesUtils.calculateTemplateMatchScore(template, mockBusinessContext)
      }));

      templatesWithScores.sort((a, b) => b.score - a.score);

      // Top ranked template should have high score
      expect(templatesWithScores[0].score).toBeGreaterThan(0.5);
      
      // Scores should be in descending order
      for (let i = 1; i < templatesWithScores.length; i++) {
        expect(templatesWithScores[i-1].score).toBeGreaterThanOrEqual(templatesWithScores[i].score);
      }
    });
  });

  describe('Setup Complexity Analysis', () => {
    it('should provide setup complexity descriptions', () => {
      const lowComplexity = ContextAwareTemplatesUtils.getSetupComplexityDescription('low');
      expect(lowComplexity.skillLevel).toBe('Beginner');
      expect(lowComplexity.timeEstimate).toBe('5-15 minutes');

      const mediumComplexity = ContextAwareTemplatesUtils.getSetupComplexityDescription('medium');
      expect(mediumComplexity.skillLevel).toBe('Intermediate');
      expect(mediumComplexity.timeEstimate).toBe('15-45 minutes');

      const highComplexity = ContextAwareTemplatesUtils.getSetupComplexityDescription('high');
      expect(highComplexity.skillLevel).toBe('Advanced');
      expect(highComplexity.timeEstimate).toBe('45+ minutes');
    });

    it('should handle invalid complexity levels', () => {
      const invalidComplexity = ContextAwareTemplatesUtils.getSetupComplexityDescription('invalid' as any);
      expect(invalidComplexity.skillLevel).toBe('Intermediate'); // Should default to medium
    });
  });

  describe('AI Insights and Analytics', () => {
    it('should have AI insights for all templates', () => {
      sampleTemplates.forEach(template => {
        expect(template.ai_insights).toBeDefined();
        expect(template.ai_insights?.optimization_opportunities).toBeDefined();
        expect(Array.isArray(template.ai_insights?.optimization_opportunities)).toBe(true);
        expect(typeof template.ai_insights?.trend_alignment).toBe('number');
        expect(template.ai_insights?.competitive_analysis).toBeDefined();
        expect(typeof template.ai_insights?.future_proof_score).toBe('number');
        expect(template.ai_insights?.maintenance_recommendations).toBeDefined();
      });
    });

    it('should have usage analytics for all templates', () => {
      sampleTemplates.forEach(template => {
        expect(template.usage_analytics).toBeDefined();
        expect(typeof template.usage_analytics?.total_uses).toBe('number');
        expect(typeof template.usage_analytics?.success_rate).toBe('number');
        expect(typeof template.usage_analytics?.avg_setup_time).toBe('number');
        expect(typeof template.usage_analytics?.user_satisfaction).toBe('number');
        expect(template.usage_analytics?.performance_metrics).toBeDefined();
      });
    });
  });

  describe('Integration with Existing Systems', () => {
    it('should maintain compatibility with legacy template structure', () => {
      sampleTemplates.forEach(template => {
        // Should have legacy Template fields
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.thumbnail).toBeDefined();
        expect(template.createdAt).toBeDefined();
        expect(template.updatedAt).toBeDefined();
        expect(template.components).toBeDefined();
        expect(Array.isArray(template.components)).toBe(true);
      });
    });

    it('should have valid component structures', () => {
      sampleTemplates.forEach(template => {
        template.components.forEach(component => {
          expect(component.id).toBeDefined();
          expect(component.type).toBeDefined();
          expect(component.name).toBeDefined();
          expect(component.styles).toBeDefined();
          expect(component.props).toBeDefined();
          expect(component.children).toBeDefined();
          expect(Array.isArray(component.children)).toBe(true);
          expect(typeof component.order).toBe('number');
        });
      });
    });
  });
});

// Integration test for the complete workflow
describe('Context-Aware Template Recommendation Workflow', () => {
  it('should complete full recommendation workflow', async () => {
    // Step 1: Validate business request
    const businessRequest: BusinessAnalysisRequest = {
      business_name: 'InnovateCorp',
      business_description: 'Enterprise software solutions for digital transformation and operational excellence',
      industry: 'technology',
      target_audience: 'Enterprise decision makers, CTOs, IT directors',
      business_goals: ['Generate leads', 'Showcase portfolio', 'Build community'],
      existing_brand_colors: ['#2563eb', '#7c3aed'],
      preferred_style: 'modern',
      website_url: 'https://innovatecorp.com',
      competitors: ['Salesforce', 'Microsoft', 'Oracle']
    };

    const validation = ContextAwareTemplatesUtils.validateBusinessAnalysisRequest(businessRequest);
    expect(validation.isValid).toBe(true);

    // Step 2: Generate business context (mock)
    const businessContext: BusinessAnalysisResult = {
      industry_classification: {
        primary: 'technology',
        secondary: ['software', 'enterprise', 'saas'],
        confidence: 0.91
      },
      target_audience: {
        demographics: ['35-55 years', 'executives', 'technical leaders'],
        psychographics: ['innovation-focused', 'results-driven', 'strategic-thinking'],
        confidence: 0.87
      },
      business_type: 'b2b',
      content_requirements: [
        'Executive summaries',
        'Technical specifications',
        'Case studies',
        'ROI calculators',
        'Demo requests'
      ],
      design_preferences: {
        modern: 0.92,
        professional: 0.95,
        minimal: 0.78,
        corporate: 0.88
      },
      brand_personality: {
        traits: ['authoritative', 'innovative', 'trustworthy'],
        tone: 'professional',
        confidence: 0.89
      }
    };

    // Step 3: Find matching templates
    const industryMatches = getTemplatesForIndustry(businessContext.industry_classification.primary);
    const businessTypeMatches = getTemplatesForBusinessType(businessContext.business_type);
    const highScoreTemplates = getTemplatesByIntelligenceScore(0.8);

    expect(industryMatches.length).toBeGreaterThan(0);
    expect(businessTypeMatches.length).toBeGreaterThan(0);
    expect(highScoreTemplates.length).toBeGreaterThan(0);

    // Step 4: Calculate compatibility scores
    const recommendedTemplates = industryMatches.slice(0, 3).map(template => ({
      template,
      compatibilityScore: ContextAwareTemplatesUtils.calculateTemplateMatchScore(template, businessContext),
      intelligenceScore: template.intelligence_score?.overall_score || 0
    }));

    recommendedTemplates.forEach(({ compatibilityScore, intelligenceScore }) => {
      expect(compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(compatibilityScore).toBeLessThanOrEqual(1);
      expect(intelligenceScore).toBeGreaterThanOrEqual(0);
      expect(intelligenceScore).toBeLessThanOrEqual(1);
    });

    // Step 5: Verify recommendation quality
    const topRecommendation = recommendedTemplates.sort((a, b) => b.compatibilityScore - a.compatibilityScore)[0];
    expect(topRecommendation.compatibilityScore).toBeGreaterThan(0.6);
    
    console.log('✅ Context-Aware Template Recommendation Workflow Test Completed Successfully');
    console.log(`   Top recommendation: ${topRecommendation.template.name} (${Math.round(topRecommendation.compatibilityScore * 100)}% match)`);
  });
});