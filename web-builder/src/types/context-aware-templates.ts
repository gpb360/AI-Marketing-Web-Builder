export type BusinessIndustry = 
  | 'technology' 
  | 'healthcare' 
  | 'finance' 
  | 'education' 
  | 'retail'
  | 'manufacturing' 
  | 'real-estate' 
  | 'food-service' 
  | 'professional-services'
  | 'nonprofit' 
  | 'entertainment' 
  | 'fitness' 
  | 'automotive' 
  | 'beauty' 
  | 'travel' 
  | 'other';

export interface BusinessAnalysisRequest {
  business_name: string;
  business_description: string;
  industry?: BusinessIndustry;
  business_goals: string[];
  existing_brand_colors?: string[];
  preferred_style?: DesignStyle;
  website_url?: string;
  competitors?: string[];
}

export interface ContextualRecommendation {
  id: string;
  type: 'template' | 'component' | 'content' | 'workflow';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export interface BusinessContextAnalyzerProps {
  onAnalysisComplete: (result: BusinessAnalysisResult) => void;
  initialData?: Partial<BusinessAnalysisRequest>;
  isLoading?: boolean;
  className?: string;
}

export interface ContextAwareTemplateSelectorProps {
  onTemplateSelect: (recommendation: TemplateRecommendation) => void;
  maxRecommendations?: number;
  showReasoningDetails?: boolean;
  enableComparison?: boolean;
  className?: string;
}

export interface ContextualRecommendationsProps {
  className?: string;
}

export interface TemplatePersonalizationProps {
  templateId: string;
  businessContext: BusinessAnalysisResult;
  onPersonalizationComplete: (template: PersonalizedTemplate) => void;
  className?: string;
}

export interface BusinessAnalysisResult {
  industry_classification: {
    primary: BusinessIndustry;
    secondary?: BusinessIndustry[];
    confidence: number;
  };
  business_type: 'b2b' | 'b2c' | 'marketplace' | 'portfolio' | 'nonprofit';
  target_audience: {
    demographics: string[];
    psychographics: string[];
    pain_points: string[];
  };
  design_preferences: {
    modern: number;
    professional: number;
    creative: number;
    minimalist: number;
  };
  content_requirements: string[];
  goals_analysis: {
    primary_goals: string[];
    success_metrics: string[];
    timeline: string;
  };
}

export interface TemplateRecommendation {
  template_id: string;
  title: string;
  description: string;
  compatibility_score: number;
  reasoning: string;
  customization_suggestions: string[];
  expected_setup_time: number;
  preview_url?: string;
  features: string[];
}

export interface PersonalizedTemplate {
  template_id: string;
  customizations: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    content: Record<string, string>;
    layout: Record<string, any>;
  };
  preview_url: string;
  estimated_completion_time: number;
}

export interface PersonalizationSettings {
  preserve_existing_content: boolean;
  color_scheme_preference: 'brand' | 'template' | 'custom';
  content_tone: 'professional' | 'friendly' | 'creative' | 'technical';
  customization_level: 'minimal' | 'moderate' | 'extensive';
}

export interface RecommendationContext {
  business_analysis: BusinessAnalysisResult;
  current_template?: string;
  user_preferences?: any;
  stage: 'initial' | 'refining' | 'final';
}

export type DesignStyle = 'modern' | 'professional' | 'creative' | 'minimalist' | 'bold' | 'elegant';

// API Response Types
export interface TemplatePersonalizationApiResponse {
  personalized_template: PersonalizedTemplate;
}

export interface ContextualRecommendationsApiResponse {
  recommendations: ContextualRecommendation[];
}

export interface TemplateFeedback {
  template_id: string;
  business_context: BusinessAnalysisResult;
  was_helpful: boolean;
  was_implemented: boolean;
  user_rating: number;
  feedback_comments?: string;
}

export interface LearningData {
  template_selections: TemplateFeedback[];
  user_journey: any[];
  conversion_outcomes: any[];
}