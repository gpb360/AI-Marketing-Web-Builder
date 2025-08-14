/**
 * Context-Aware Templates API Service
 * 
 * API client for business context analysis and template recommendations
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

import {
  BusinessAnalysisRequest,
  BusinessAnalysisResult,
  TemplateRecommendation,
  PersonalizedTemplate,
  PersonalizationSettings,
  ContextualRecommendation,
  RecommendationContext,
  BusinessAnalysisApiResponse,
  TemplateRecommendationApiResponse,
  TemplatePersonalizationApiResponse,
  ContextualRecommendationsApiResponse,
  TemplateFeedback,
  LearningData
} from '@/types/context-aware-templates';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TIMEOUT = 30000; // 30 seconds

class ContextAwareTemplatesApiError extends Error {
  public statusCode?: number;
  public details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ContextAwareTemplatesApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      let errorDetails = null;

      try {
        errorDetails = await response.json();
        errorMessage = errorDetails.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      throw new ContextAwareTemplatesApiError(errorMessage, response.status, errorDetails);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ContextAwareTemplatesApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ContextAwareTemplatesApiError('Request timeout');
    }

    throw new ContextAwareTemplatesApiError(`Network error: ${error.message}`);
  }
}

/**
 * Business Context Analysis API
 */
export class BusinessAnalysisApi {
  /**
   * Analyze business information and classify industry, audience, etc.
   */
  static async analyzeBusinessContext(
    request: BusinessAnalysisRequest
  ): Promise<BusinessAnalysisResult> {
    const response = await apiRequest<BusinessAnalysisApiResponse>(
      '/business-analysis/analyze',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response.analysis;
  }

  /**
   * Get industry insights for better analysis
   */
  static async getIndustryInsights(industry: string): Promise<{
    common_patterns: string[];
    typical_goals: string[];
    design_trends: string[];
    conversion_benchmarks: Record<string, number>;
  }> {
    return apiRequest(
      `/business-analysis/industries/${encodeURIComponent(industry)}/insights`
    );
  }

  /**
   * Validate business analysis result
   */
  static async validateAnalysis(
    analysis: BusinessAnalysisResult
  ): Promise<{
    is_valid: boolean;
    confidence_score: number;
    suggestions: string[];
  }> {
    return apiRequest(
      '/business-analysis/validate',
      {
        method: 'POST',
        body: JSON.stringify({ analysis }),
      }
    );
  }
}

/**
 * Template Recommendation API
 */
export class TemplateRecommendationApi {
  /**
   * Get AI-powered template recommendations based on business context
   */
  static async getRecommendations(
    businessContext: BusinessAnalysisResult,
    options: {
      maxRecommendations?: number;
      includeReasoning?: boolean;
      filterByCategory?: string[];
      sortBy?: 'confidence' | 'conversion' | 'popularity';
    } = {}
  ): Promise<TemplateRecommendation[]> {
    const params = new URLSearchParams({
      max_recommendations: (options.maxRecommendations || 5).toString(),
      include_reasoning: (options.includeReasoning !== false).toString(),
      ...(options.filterByCategory && { 
        categories: options.filterByCategory.join(',') 
      }),
      ...(options.sortBy && { sort_by: options.sortBy }),
    });

    const response = await apiRequest<TemplateRecommendationApiResponse>(
      `/template-recommendations?${params}`,
      {
        method: 'POST',
        body: JSON.stringify({ business_context: businessContext }),
      }
    );

    return response.recommendations;
  }

  /**
   * Get detailed template analysis
   */
  static async analyzeTemplate(
    templateId: string,
    businessContext: BusinessAnalysisResult
  ): Promise<{
    compatibility_score: number;
    customization_requirements: string[];
    expected_performance: {
      conversion_rate: number;
      setup_time: number;
      maintenance_effort: number;
    };
    similar_templates: string[];
  }> {
    return apiRequest(
      `/templates/${encodeURIComponent(templateId)}/analysis`,
      {
        method: 'POST',
        body: JSON.stringify({ business_context: businessContext }),
      }
    );
  }

  /**
   * Compare multiple templates
   */
  static async compareTemplates(
    templateIds: string[],
    businessContext: BusinessAnalysisResult
  ): Promise<{
    comparison_matrix: Record<string, any>;
    recommendations: {
      best_overall: string;
      easiest_setup: string;
      highest_conversion: string;
    };
  }> {
    return apiRequest(
      '/templates/compare',
      {
        method: 'POST',
        body: JSON.stringify({
          template_ids: templateIds,
          business_context: businessContext,
        }),
      }
    );
  }
}

/**
 * Template Personalization API
 */
export class TemplatePersonalizationApi {
  /**
   * Generate personalized template based on business context and preferences
   */
  static async personalizeTemplate(
    templateId: string,
    businessContext: BusinessAnalysisResult,
    settings: PersonalizationSettings
  ): Promise<PersonalizedTemplate> {
    const response = await apiRequest<TemplatePersonalizationApiResponse>(
      `/templates/${encodeURIComponent(templateId)}/personalize`,
      {
        method: 'POST',
        body: JSON.stringify({
          business_context: businessContext,
          personalization_settings: settings,
        }),
      }
    );

    return response.personalized_template;
  }

  /**
   * Get personalization suggestions
   */
  static async getPersonalizationSuggestions(
    templateId: string,
    businessContext: BusinessAnalysisResult
  ): Promise<{
    color_suggestions: Array<{ palette: string; reason: string; }>;
    content_suggestions: Array<{ section: string; content: string; reason: string; }>;
    layout_suggestions: Array<{ component: string; suggestion: string; reason: string; }>;
  }> {
    return apiRequest(
      `/templates/${encodeURIComponent(templateId)}/personalization-suggestions`,
      {
        method: 'POST',
        body: JSON.stringify({ business_context: businessContext }),
      }
    );
  }

  /**
   * Preview personalized template
   */
  static async previewPersonalization(
    templateId: string,
    businessContext: BusinessAnalysisResult,
    settings: PersonalizationSettings
  ): Promise<{
    preview_url: string;
    preview_images: string[];
    estimated_changes: number;
  }> {
    return apiRequest(
      `/templates/${encodeURIComponent(templateId)}/personalization-preview`,
      {
        method: 'POST',
        body: JSON.stringify({
          business_context: businessContext,
          personalization_settings: settings,
        }),
      }
    );
  }
}

/**
 * Contextual Recommendations API
 */
export class ContextualRecommendationsApi {
  /**
   * Get contextual recommendations for templates, components, content, and workflows
   */
  static async getRecommendations(
    context: RecommendationContext,
    options: {
      maxRecommendations?: number;
      filterByType?: ('template' | 'component' | 'content' | 'workflow')[];
      priorityThreshold?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<ContextualRecommendation[]> {
    const params = new URLSearchParams({
      max_recommendations: (options.maxRecommendations || 10).toString(),
      ...(options.filterByType && { 
        types: options.filterByType.join(',') 
      }),
      ...(options.priorityThreshold && { 
        priority_threshold: options.priorityThreshold 
      }),
    });

    const response = await apiRequest<ContextualRecommendationsApiResponse>(
      `/contextual-recommendations?${params}`,
      {
        method: 'POST',
        body: JSON.stringify({ context }),
      }
    );

    return response.recommendations;
  }

  /**
   * Get industry-specific recommendations
   */
  static async getIndustryRecommendations(
    industry: string,
    businessType: 'b2b' | 'b2c' | 'marketplace' | 'portfolio' | 'nonprofit'
  ): Promise<ContextualRecommendation[]> {
    return apiRequest(
      `/contextual-recommendations/industry/${encodeURIComponent(industry)}`,
      {
        method: 'POST',
        body: JSON.stringify({ business_type: businessType }),
      }
    );
  }

  /**
   * Submit feedback on recommendations
   */
  static async submitRecommendationFeedback(
    recommendationId: string,
    feedback: {
      helpful: boolean;
      implemented: boolean;
      rating: number; // 1-5
      comments?: string;
    }
  ): Promise<void> {
    await apiRequest(
      `/contextual-recommendations/${encodeURIComponent(recommendationId)}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify(feedback),
      }
    );
  }
}

/**
 * Learning and Feedback API
 */
export class LearningApi {
  /**
   * Submit template selection feedback
   */
  static async submitTemplateFeedback(
    feedback: TemplateFeedback
  ): Promise<void> {
    await apiRequest(
      '/learning/template-feedback',
      {
        method: 'POST',
        body: JSON.stringify(feedback),
      }
    );
  }

  /**
   * Submit learning data for algorithm improvement
   */
  static async submitLearningData(
    data: LearningData
  ): Promise<void> {
    await apiRequest(
      '/learning/training-data',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Get recommendation accuracy metrics
   */
  static async getAccuracyMetrics(
    timeRange?: '7d' | '30d' | '90d'
  ): Promise<{
    overall_accuracy: number;
    accuracy_by_industry: Record<string, number>;
    user_satisfaction: number;
    improvement_suggestions: string[];
  }> {
    const params = timeRange ? `?time_range=${timeRange}` : '';
    return apiRequest(`/learning/accuracy-metrics${params}`);
  }
}

/**
 * Utility functions
 */
export class ContextAwareTemplatesUtils {
  /**
   * Validate business analysis request
   */
  static validateBusinessAnalysisRequest(
    request: BusinessAnalysisRequest
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.business_name?.trim()) {
      errors.push('Business name is required');
    }

    if (!request.business_description?.trim() || request.business_description.length < 20) {
      errors.push('Business description must be at least 20 characters');
    }

    if (!request.business_goals || request.business_goals.length === 0) {
      errors.push('At least one business goal is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate template match score
   */
  static calculateTemplateMatchScore(
    template: any,
    businessContext: BusinessAnalysisResult
  ): number {
    let score = 0;

    // Industry alignment (40% weight)
    if (template.industries?.includes(businessContext.industry_classification.primary)) {
      score += 0.4;
    }

    // Business type alignment (20% weight)
    if (template.business_types?.includes(businessContext.business_type)) {
      score += 0.2;
    }

    // Design preference alignment (20% weight)
    const designMatch = Object.entries(businessContext.design_preferences)
      .reduce((acc, [style, preference]) => {
        if (template.design_attributes?.[style]) {
          return acc + (preference * template.design_attributes[style]);
        }
        return acc;
      }, 0) / Object.keys(businessContext.design_preferences).length;
    
    score += designMatch * 0.2;

    // Content requirements alignment (20% weight)
    const contentMatch = businessContext.content_requirements.filter(req =>
      template.features?.includes(req)
    ).length / businessContext.content_requirements.length;
    
    score += contentMatch * 0.2;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Format confidence score for display
   */
  static formatConfidenceScore(score: number): string {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.8) return 'High';
    if (score >= 0.7) return 'Medium';
    if (score >= 0.6) return 'Moderate';
    return 'Low';
  }

  /**
   * Get setup complexity description
   */
  static getSetupComplexityDescription(complexity: string): {
    description: string;
    timeEstimate: string;
    skillLevel: string;
  } {
    const complexityMap = {
      low: {
        description: 'Quick and easy setup with minimal customization needed',
        timeEstimate: '5-15 minutes',
        skillLevel: 'Beginner'
      },
      medium: {
        description: 'Moderate setup with some customization required',
        timeEstimate: '15-45 minutes',
        skillLevel: 'Intermediate'
      },
      high: {
        description: 'Advanced setup with extensive customization options',
        timeEstimate: '45+ minutes',
        skillLevel: 'Advanced'
      }
    };

    return complexityMap[complexity as keyof typeof complexityMap] || complexityMap.medium;
  }
}

// Export the main API client
export const ContextAwareTemplatesApi = {
  BusinessAnalysis: BusinessAnalysisApi,
  TemplateRecommendation: TemplateRecommendationApi,
  TemplatePersonalization: TemplatePersonalizationApi,
  ContextualRecommendations: ContextualRecommendationsApi,
  Learning: LearningApi,
  Utils: ContextAwareTemplatesUtils,
};

export default ContextAwareTemplatesApi;