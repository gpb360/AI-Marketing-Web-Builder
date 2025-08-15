/**
 * Type definitions for Context-Aware Template System
 * 
 * Part of Story 3.7: Context-Aware Template Recommendations
 * Comprehensive type system for business context analysis and template intelligence
 */

// Business Analysis Types
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

export type BusinessType = 'b2b' | 'b2c' | 'b2b2c' | 'nonprofit' | 'government';

export type DesignStyle = 'modern' | 'classic' | 'minimal' | 'bold' | 'creative' | 'corporate';

export type BrandTone = 'professional' | 'friendly' | 'authoritative' | 'playful' | 'sophisticated' | 'casual';

// Business Analysis Request
export interface BusinessAnalysisRequest {
  business_name: string;
  business_description: string;
  industry?: BusinessIndustry;
  target_audience: string;
  business_goals: string[];
  existing_brand_colors?: string[];
  preferred_style?: DesignStyle;
  website_url?: string;
  competitors?: string[];
}

// Business Analysis Result
export interface BusinessAnalysisResult {
  industry_classification: {
    primary: BusinessIndustry;
    secondary: string[];
    confidence: number;
  };
  target_audience: {
    demographics: string[];
    psychographics: string[];
    confidence: number;
  };
  business_type: BusinessType;
  content_requirements: string[];
  design_preferences: {
    modern: number;
    minimal: number;
    professional: number;
    colorful: number;
    [key: string]: number;
  };
  brand_personality: {
    traits: string[];
    tone: BrandTone;
    confidence: number;
  };
}

// Template Types
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  thumbnail?: string;
  preview_url?: string;
  features: string[];
  target_industries: BusinessIndustry[];
  target_business_types: BusinessType[];
  design_style: DesignStyle[];
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  setup_time_minutes: number;
  responsive: boolean;
  mobile_optimized: boolean;
  seo_optimized: boolean;
  analytics_ready: boolean;
  conversion_optimized: boolean;
  a11y_compliant: boolean;
  performance_score: number;
  last_updated: string;
  version: string;
}

export interface TemplateContent {
  sections: TemplateSection[];
  global_styles: TemplateStyles;
  responsive_breakpoints: ResponsiveBreakpoints;
  seo_settings: SEOSettings;
  performance_settings: PerformanceSettings;
}

export interface TemplateSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'contact' | 'footer' | 'custom';
  name: string;
  content: any;
  customizable: boolean;
  ai_personalizable: boolean;
  required: boolean;
  order: number;
}

export interface TemplateStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  typography: {
    headings: string;
    body: string;
    accent: string;
  };
  spacing: {
    base: number;
    scale: number[];
  };
  borders: {
    radius: number;
    width: number;
  };
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface SEOSettings {
  title_template: string;
  meta_description_template: string;
  og_image_template?: string;
  structured_data: boolean;
  sitemap_included: boolean;
}

export interface PerformanceSettings {
  lazy_loading: boolean;
  image_optimization: boolean;
  css_minification: boolean;
  js_minification: boolean;
  critical_css: boolean;
  preload_resources: string[];
}

// Template Recommendation Types
export interface TemplateRecommendation {
  template_id: string;
  template: TemplateMetadata;
  confidence_score: number;
  match_reasoning: {
    industry_alignment: string;
    audience_fit: string;
    feature_benefits: string[];
    design_rationale: string;
  };
  customization_preview: {
    hero_text: string;
    cta_buttons: string[];
    color_scheme: string[];
    content_sections: TemplateContentPreview[];
  };
  pros: string[];
  cons: string[];
  estimated_conversion_rate?: number;
  setup_complexity: 'low' | 'medium' | 'high';
  customization_effort: number; // 1-10 scale
}

export interface TemplateContentPreview {
  id: string;
  type: string;
  title: string;
  content: string;
  customized: boolean;
  ai_generated: boolean;
}

// Contextual Recommendation Types
export interface ContextualRecommendation {
  id: string;
  type: 'template' | 'component' | 'content' | 'workflow';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  implementation_effort: number; // 1-5 scale
  expected_impact: string;
  action_url?: string;
  preview_data?: any;
}

export interface RecommendationContext {
  business_analysis: BusinessAnalysisResult;
  current_template?: TemplateMetadata;
  user_preferences?: UserPreferences;
  performance_data?: PerformanceData;
}

export interface UserPreferences {
  preferred_complexity: 'simple' | 'moderate' | 'advanced';
  time_investment: 'minimal' | 'moderate' | 'extensive';
  customization_level: 'basic' | 'moderate' | 'extensive';
  feature_priorities: string[];
}

export interface PerformanceData {
  current_conversion_rate?: number;
  bounce_rate?: number;
  avg_session_duration?: number;
  top_performing_pages: string[];
  improvement_areas: string[];
}

// Template Intelligence Scoring
export interface TemplateIntelligenceScore {
  overall_score: number;
  category_scores: {
    industry_alignment: number;
    audience_fit: number;
    design_quality: number;
    performance: number;
    conversion_potential: number;
    customization_ease: number;
  };
  confidence_level: number;
  reasoning: string[];
  improvement_suggestions: string[];
}

export interface ScoringCriteria {
  industry_weight: number;
  audience_weight: number;
  design_weight: number;
  performance_weight: number;
  conversion_weight: number;
  customization_weight: number;
}

// API Response Types
export interface TemplateRecommendationResponse {
  recommendations: TemplateRecommendation[];
  total_count: number;
  analysis_meta: {
    processing_time_ms: number;
    confidence_threshold: number;
    algorithm_version: string;
  };
}

export interface BusinessAnalysisResponse {
  analysis: BusinessAnalysisResult;
  recommendations_count: number;
  processing_time_ms: number;
  suggestions: string[];
}

// Component Props Types
export interface BusinessContextAnalyzerProps {
  onAnalysisComplete: (result: BusinessAnalysisResult) => void;
  initialData?: Partial<BusinessAnalysisRequest>;
  isLoading?: boolean;
  className?: string;
}

export interface ContextAwareTemplateSelectorProps {
  businessContext: BusinessAnalysisResult;
  onTemplateSelect: (recommendation: TemplateRecommendation) => void;
  maxRecommendations?: number;
  showReasoningDetails?: boolean;
  enableComparison?: boolean;
  className?: string;
}

export interface ContextualRecommendationsProps {
  context: RecommendationContext;
  onRecommendationSelect: (recommendation: ContextualRecommendation) => void;
  maxRecommendations?: number;
  filterByType?: ContextualRecommendation['type'][];
  showPriorityFilter?: boolean;
  className?: string;
}

export interface TemplatePersonalizationProps {
  template: TemplateMetadata;
  businessContext: BusinessAnalysisResult;
  onPersonalizationComplete: (personalizedTemplate: any) => void;
  customizationLevel?: 'basic' | 'moderate' | 'extensive';
  className?: string;
}

// Enhanced Template Types
export interface EnhancedTemplate extends TemplateMetadata {
  intelligence_score?: TemplateIntelligenceScore;
  personalization_data?: TemplatePersonalizationData;
  usage_analytics?: TemplateUsageAnalytics;
  ai_insights?: TemplateAIInsights;
}

export interface TemplatePersonalizationData {
  customizable_elements: CustomizableElement[];
  ai_content_suggestions: ContentSuggestion[];
  color_palette_options: ColorPalette[];
  layout_variations: LayoutVariation[];
}

export interface CustomizableElement {
  id: string;
  type: 'text' | 'image' | 'color' | 'layout' | 'component';
  name: string;
  description: string;
  current_value: any;
  suggestions: any[];
  ai_generated_options?: any[];
}

export interface ContentSuggestion {
  element_id: string;
  content_type: 'headline' | 'subheading' | 'body' | 'cta' | 'tagline';
  suggestions: string[];
  confidence: number;
  reasoning: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  harmony_type: 'monochromatic' | 'complementary' | 'analogous' | 'triadic';
  brand_alignment_score: number;
}

export interface LayoutVariation {
  id: string;
  name: string;
  description: string;
  preview_image?: string;
  conversion_impact: 'positive' | 'neutral' | 'negative';
  complexity_change: number;
}

export interface TemplateUsageAnalytics {
  total_uses: number;
  success_rate: number;
  avg_setup_time: number;
  user_satisfaction: number;
  common_customizations: string[];
  performance_metrics: {
    avg_load_time: number;
    mobile_score: number;
    seo_score: number;
    accessibility_score: number;
  };
}

export interface TemplateAIInsights {
  optimization_opportunities: string[];
  trend_alignment: number;
  competitive_analysis: CompetitiveInsight[];
  future_proof_score: number;
  maintenance_recommendations: string[];
}

export interface CompetitiveInsight {
  competitor: string;
  similarity_score: number;
  differentiators: string[];
  improvement_areas: string[];
}

// Template Category and Data Types
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  template_count: number;
  popularity_score: number;
  target_industries: BusinessIndustry[];
  subcategories: TemplateSubcategory[];
}

export interface TemplateSubcategory {
  id: string;
  name: string;
  description: string;
  template_count: number;
  recommended_for: string[];
}

// Error and Status Types
export interface ContextAwareTemplateError {
  code: string;
  message: string;
  details?: any;
  suggestions?: string[];
}

export interface AnalysisStatus {
  step: string;
  progress: number;
  estimated_time_remaining?: number;
  current_operation: string;
}