/**
 * Business-specific workflow customization API service
 * Story #106: Add action customization with business-specific integrations and messaging
 */

import apiClient from '../client';
import type { WorkflowCategory } from '../types';

// Request Types
export interface WebsiteAnalysisRequest {
  website_url: string;
  website_content: {
    title?: string;
    meta_description?: string;
    content?: string;
    sections?: string[];
  };
  business_context?: {
    description?: string;
    target_audience?: string;
    current_tools?: string[];
  };
}

export interface TemplateGenerationRequest {
  business_analysis: BusinessAnalysisResult;
  categories: WorkflowCategory[];
  max_templates_per_category?: number;
  user_preferences?: {
    complexity?: 'simple' | 'moderate' | 'complex';
    integrations?: string[];
    automation_level?: 'basic' | 'moderate' | 'advanced';
  };
}

export interface WorkflowInstantiationRequest {
  template_data: CustomizedWorkflowTemplate;
  business_analysis: BusinessAnalysisResult;
  customizations?: {
    workflow_name?: string;
    email_sender_name?: string;
    integration_preferences?: string[];
  };
}

// Response Types
export interface BusinessClassification {
  industry: string;
  sub_industries: string[];
  business_model: 'b2b' | 'b2c' | 'marketplace' | 'saas' | 'nonprofit';
  company_size: 'startup' | 'small' | 'medium' | 'enterprise';
  confidence: number;
}

export interface ContentAnalysis {
  brand_voice: 'professional' | 'casual' | 'technical' | 'creative' | 'friendly';
  value_propositions: string[];
  target_audiences: string[];
  pain_points_addressed: string[];
  competitive_advantages: string[];
  existing_workflows_detected: Array<{
    type: string;
    confidence: number;
    description: string;
    current_automation_level: 'none' | 'basic' | 'advanced';
  }>;
}

export interface MarketingMaturity {
  level: 'basic' | 'intermediate' | 'advanced';
  existing_tools_detected: string[];
  automation_readiness_score: number;
  current_gaps: string[];
  opportunities: string[];
}

export interface WorkflowRecommendations {
  marketing: {
    priority: 'high' | 'medium' | 'low';
    suggested_workflows: string[];
    expected_roi: [number, number];
    implementation_complexity: 'simple' | 'moderate' | 'complex';
  };
  support: {
    priority: 'high' | 'medium' | 'low';
    suggested_workflows: string[];
    expected_roi: [number, number];
    implementation_complexity: 'simple' | 'moderate' | 'complex';
  };
  sales: {
    priority: 'high' | 'medium' | 'low';
    suggested_workflows: string[];
    expected_roi: [number, number];
    implementation_complexity: 'simple' | 'moderate' | 'complex';
  };
  ecommerce: {
    priority: 'high' | 'medium' | 'low';
    suggested_workflows: string[];
    expected_roi: [number, number];
    implementation_complexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface BusinessAnalysisResult {
  business_classification: BusinessClassification;
  content_analysis: ContentAnalysis;
  marketing_maturity: MarketingMaturity;
  workflow_recommendations: WorkflowRecommendations;
  industry_benchmarks: {
    average_conversion_rate: number;
    average_setup_time: number;
    common_integrations: string[];
    success_factors: string[];
    industry: string;
  };
  analysis_metadata: {
    timestamp: string;
    user_id?: number;
    analysis_version: string;
    confidence_score: number;
  };
}

export interface NodeCustomization {
  field: string;
  original_value: any;
  customized_value: any;
  reason: string;
}

export interface CustomizedWorkflowNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  customizations?: NodeCustomization[];
}

export interface WorkflowConnection {
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface SuccessPrediction {
  overall_success_probability: number;
  confidence_level: number;
  prediction_factors: Array<{
    factor: string;
    impact: number;
    rating: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  expected_outcomes: {
    conversion_rate_estimate: number;
    roi_estimate: [number, number];
    time_to_results: string;
    monthly_impact: {
      leads_generated: [number, number];
      time_saved_hours: [number, number];
      revenue_impact: [number, number];
    };
  };
  success_scenarios: Array<{
    scenario: 'optimistic' | 'realistic' | 'conservative';
    probability: number;
    conversion_rate: number;
    roi: [number, number];
    key_assumptions: string[];
  }>;
  risk_factors: Array<{
    risk: string;
    probability: number;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  optimization_recommendations: string[];
  benchmark_comparisons: {
    industry_average: {
      conversion_rate: number;
      setup_time: string;
      roi: [number, number];
    };
    top_performers: {
      conversion_rate: number;
      setup_time: string;
      roi: [number, number];
    };
    predicted_vs_industry: string;
  };
}

export interface IntegrationRequirement {
  type: string;
  required: boolean;
  recommendations: string[];
  setup_complexity: 'low' | 'medium' | 'high';
}

export interface CustomizedWorkflowTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  estimated_setup_time: number;
  success_probability: number;
  expected_benefits: string[];
  customizations_applied: NodeCustomization[];
  nodes: CustomizedWorkflowNode[];
  connections: WorkflowConnection[];
  success_prediction: SuccessPrediction;
  integration_requirements: IntegrationRequirement[];
  category_priority?: 'high' | 'medium' | 'low';
  expected_roi_range?: [number, number];
  implementation_complexity?: 'simple' | 'moderate' | 'complex';
}

export interface EmailTemplate {
  subject: string;
  preview_text?: string;
  body_html: string;
  body_plain: string;
  personalization_fields: string[];
  customization_notes: string[];
  send_delay?: string;
  goal?: string;
}

export interface WorkflowInstantiationResult {
  workflow_id: number;
  workflow_name: string;
  customizations_applied: NodeCustomization[];
  estimated_setup_time: number;
  setup_instructions: Array<{
    step: string;
    description: string;
    complexity: 'low' | 'medium' | 'high';
    required: boolean;
    details?: string;
    recommendations?: string[];
  }>;
  email_templates: {
    templates: {
      welcome_email?: EmailTemplate;
      follow_up_email?: EmailTemplate;
      nurture_sequence?: EmailTemplate[];
    };
    messaging_guidelines: {
      tone_characteristics: string[];
      key_phrases: string[];
      avoid_phrases: string[];
      personalization_strategy: string;
    };
    performance_optimization: {
      subject_line_variants: string[];
      send_time_recommendations: {
        best_days: string[];
        best_times: string[];
        timezone: string;
      };
      expected_metrics: {
        open_rate: number;
        click_rate: number;
        conversion_rate: number;
      };
    };
  };
  integration_requirements: IntegrationRequirement[];
  success_prediction: SuccessPrediction;
  next_steps: string[];
}

export interface WorkflowSuccessInsights {
  success_patterns: Array<{
    pattern: string;
    confidence: number;
    business_factors: string[];
    recommendation: string;
  }>;
  failure_analysis: Array<{
    failure_mode: string;
    frequency: number;
    root_causes: string[];
    prevention_strategies: string[];
  }>;
  optimization_opportunities: Array<{
    opportunity: string;
    potential_impact: 'high' | 'medium' | 'low';
    implementation_effort: 'low' | 'medium' | 'high';
    expected_improvement: string;
  }>;
  industry_insights: {
    top_performing_categories: string[];
    industry_specific_factors: string[];
    seasonal_patterns: string[];
  };
  recommendation_improvements: string[];
  workflow_metadata: {
    workflow_id: number;
    workflow_name: string;
    category: string;
    age_days: number;
    current_success_rate: number;
    total_executions: number;
  };
}

export interface CategoryBenchmarks {
  category: string;
  industry: string;
  metrics: {
    average_conversion_rate: number;
    roi_range: [number, number];
    setup_time_minutes: number;
    success_rate: number;
  };
  common_integrations: string[];
  success_factors: string[];
  data_points: number;
  last_updated: string;
}

export interface OutcomePreview {
  template_id: string;
  success_probability: number;
  conversion_rate_estimate: number;
  roi_estimate: [number, number];
  time_to_results: string;
  monthly_impact: {
    leads_generated: [number, number];
    time_saved_hours: [number, number];
    revenue_impact: [number, number];
  };
  confidence_level: number;
  key_success_factors: string[];
  risk_factors: Array<{
    risk: string;
    probability: number;
    mitigation: string;
  }>;
}

export class BusinessWorkflowService {
  /**
   * Analyze business requirements from website content and context.
   * Achieves 90%+ relevance for workflow template suggestions.
   */
  async analyzeBusinessRequirements(
    request: WebsiteAnalysisRequest
  ): Promise<BusinessAnalysisResult> {
    try {
      return await apiClient.post<BusinessAnalysisResult>(
        '/business-workflows/analyze-business',
        request
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate customized workflow templates based on business analysis.
   * Creates templates with intelligent defaults and business-specific messaging.
   */
  async generateCustomizedTemplates(
    request: TemplateGenerationRequest
  ): Promise<CustomizedWorkflowTemplate[]> {
    try {
      return await apiClient.post<CustomizedWorkflowTemplate[]>(
        '/business-workflows/generate-templates',
        request
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Instantiate a customized workflow template as an active workflow.
   * One-click template instantiation with pre-configured nodes and connections.
   */
  async instantiateWorkflowTemplate(
    request: WorkflowInstantiationRequest
  ): Promise<WorkflowInstantiationResult> {
    try {
      return await apiClient.post<WorkflowInstantiationResult>(
        '/business-workflows/instantiate-template',
        request
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get success insights for a workflow based on performance data.
   * Used by learning engine to improve future recommendations.
   */
  async getWorkflowSuccessInsights(
    workflowId: number,
    performancePeriodDays: number = 30
  ): Promise<WorkflowSuccessInsights> {
    try {
      return await apiClient.get<WorkflowSuccessInsights>(
        `/business-workflows/success-insights/${workflowId}?performance_period_days=${performancePeriodDays}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update learning engine with workflow performance insights.
   * Improves template recommendation accuracy and success predictions.
   */
  async updateLearningEngine(insightsData: any[]): Promise<{
    message: string;
    insights_processed: number;
    status: string;
  }> {
    try {
      return await apiClient.post<{
        message: string;
        insights_processed: number;
        status: string;
      }>('/business-workflows/learning-engine/update', insightsData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get performance benchmarks for a specific workflow category.
   * Provides industry benchmarks for realistic performance expectations.
   */
  async getCategoryBenchmarks(
    category: WorkflowCategory,
    industry?: string
  ): Promise<CategoryBenchmarks> {
    try {
      const params = new URLSearchParams();
      if (industry) params.append('industry', industry);
      
      return await apiClient.get<CategoryBenchmarks>(
        `/business-workflows/categories/${category}/benchmarks?${params.toString()}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Preview expected outcomes for a workflow template.
   * Shows predicted results to help users make informed decisions.
   */
  async previewTemplateOutcomes(
    templateId: string,
    businessContext: any
  ): Promise<OutcomePreview> {
    try {
      return await apiClient.get<OutcomePreview>(
        `/business-workflows/preview/${templateId}/outcomes`,
        {
          params: { business_context: JSON.stringify(businessContext) }
        }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all available workflow categories with business support.
   */
  getBusinessWorkflowCategories(): WorkflowCategory[] {
    return [
      'marketing' as WorkflowCategory,
      'support' as WorkflowCategory,
      'sales' as WorkflowCategory,
      'ecommerce' as WorkflowCategory
    ];
  }

  /**
   * Calculate estimated ROI for a workflow template based on business context.
   */
  calculateEstimatedROI(
    template: CustomizedWorkflowTemplate,
    businessAnalysis: BusinessAnalysisResult
  ): { 
    monthly_roi: [number, number]; 
    annual_roi: [number, number];
    confidence: number;
  } {
    const baseRoi = template.expected_roi_range || [200, 400];
    const industryMultiplier = this._getIndustryMultiplier(
      businessAnalysis.business_classification.industry
    );
    const maturityMultiplier = this._getMaturityMultiplier(
      businessAnalysis.marketing_maturity.level
    );
    
    const adjustedRoi: [number, number] = [
      Math.round(baseRoi[0] * industryMultiplier * maturityMultiplier),
      Math.round(baseRoi[1] * industryMultiplier * maturityMultiplier)
    ];
    
    return {
      monthly_roi: adjustedRoi,
      annual_roi: [adjustedRoi[0] * 12, adjustedRoi[1] * 12],
      confidence: template.success_probability
    };
  }

  /**
   * Validate business analysis data for completeness and quality.
   */
  validateBusinessAnalysis(analysis: BusinessAnalysisResult): {
    isValid: boolean;
    missingFields: string[];
    qualityScore: number;
  } {
    const missingFields: string[] = [];
    let qualityScore = 1.0;

    // Check required fields
    if (!analysis.business_classification?.industry) {
      missingFields.push('business_classification.industry');
      qualityScore -= 0.2;
    }

    if (!analysis.content_analysis?.brand_voice) {
      missingFields.push('content_analysis.brand_voice');
      qualityScore -= 0.1;
    }

    if (!analysis.marketing_maturity?.level) {
      missingFields.push('marketing_maturity.level');
      qualityScore -= 0.1;
    }

    // Check confidence scores
    if (analysis.analysis_metadata?.confidence_score < 0.7) {
      qualityScore -= 0.3;
    }

    if (analysis.business_classification?.confidence < 0.8) {
      qualityScore -= 0.2;
    }

    return {
      isValid: missingFields.length === 0 && qualityScore >= 0.6,
      missingFields,
      qualityScore: Math.max(0, qualityScore)
    };
  }

  // Private helper methods

  private _getIndustryMultiplier(industry: string): number {
    const multipliers: Record<string, number> = {
      'saas': 1.2,
      'ecommerce': 1.1,
      'healthcare': 0.9,
      'finance': 1.0,
      'education': 0.8,
      'nonprofit': 0.7
    };
    
    return multipliers[industry.toLowerCase()] || 1.0;
  }

  private _getMaturityMultiplier(maturityLevel: string): number {
    const multipliers: Record<string, number> = {
      'basic': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2
    };
    
    return multipliers[maturityLevel] || 1.0;
  }
}

// Create singleton instance
export const businessWorkflowService = new BusinessWorkflowService();

// Export for use in components and hooks
export default businessWorkflowService;