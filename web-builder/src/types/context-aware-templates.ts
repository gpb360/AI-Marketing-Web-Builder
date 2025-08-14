/**
 * Context-Aware Template Types and Interfaces
 * 
 * Type definitions for business context analysis and AI-powered template recommendations
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

// =============================================================================
// Core Business Context Types
// =============================================================================

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

export type BusinessType = 'b2b' | 'b2c' | 'marketplace' | 'portfolio' | 'nonprofit';

export type DesignStyle = 'modern' | 'classic' | 'minimal' | 'bold';

export interface BusinessAnalysisRequest {
  business_name: string;
  business_description: string;
  industry?: BusinessIndustry;
  target_audience?: string;
  business_goals: string[];
  existing_brand_colors?: string[];
  preferred_style?: DesignStyle;
  website_url?: string;
  competitors?: string[];
}

export interface IndustryClassification {
  primary: BusinessIndustry;
  secondary: string[];
  confidence: number;
}

export interface TargetAudience {
  demographics: string[];
  psychographics: string[];
  confidence: number;
}

export interface BrandPersonality {
  traits: string[];
  tone: string;
  confidence: number;
}

export interface BusinessAnalysisResult {
  industry_classification: IndustryClassification;
  target_audience: TargetAudience;
  business_type: BusinessType;
  content_requirements: string[];
  design_preferences: Record<string, number>;
  brand_personality: BrandPersonality;
}

// =============================================================================
// Template Recommendation Types
// =============================================================================

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  preview_url: string;
  description?: string;
  features?: string[];
  industries?: string[];
  business_types?: string[];
  design_attributes?: Record<string, number>;
}

export interface RecommendationReasoning {
  industryAlignment: string;
  audienceFit: string;
  featureBenefits: string[];
  designRationale: string;
}

export interface PersonalizationSuggestion {
  type: 'color' | 'content' | 'layout' | 'animation';
  title: string;
  description: string;
  preview: string;
  impact: string;
}

export interface BusinessGoalAlignment {
  goal: string;
  alignment: number; // 0-100
  description: string;
}

export interface MatchReasoning {
  industry_alignment: string;
  audience_fit: string;
  feature_benefits: string[];
  design_rationale: string;
}

export interface CustomizationPreview {
  hero_text: string;
  cta_buttons: string[];
  color_scheme: string[];
  content_sections: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    customized: boolean;
    ai_generated: boolean;
  }>;
}

export interface TemplateRecommendation {
  template: Template;
  confidenceScore: number;
  reasoning: RecommendationReasoning;
  personalizationSuggestions: PersonalizationSuggestion[];
  businessGoalAlignment: BusinessGoalAlignment[];
  industryRelevance: number;
  targetAudienceFit: number;
  pros: string[];
  cons: string[];
  estimatedConversionRate?: number;
  setupComplexity: 'low' | 'medium' | 'high';
  customizationEffort: number; // 1-10 scale
}

// =============================================================================
// Personalization Types
// =============================================================================

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface Typography {
  heading_font: string;
  body_font: string;
  font_size_scale: number;
}

export interface ContentPreferences {
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'creative';
  content_length: 'concise' | 'detailed' | 'comprehensive';
  use_industry_terms: boolean;
  include_social_proof: boolean;
}

export interface LayoutPreferences {
  component_spacing: 'tight' | 'normal' | 'spacious';
  section_order: string[];
  sidebar_position: 'left' | 'right' | 'none';
}

export interface InteractiveElements {
  animations: boolean;
  hover_effects: boolean;
  scroll_animations: boolean;
}

export interface PersonalizationSettings {
  brand_colors: BrandColors;
  typography: Typography;
  content_preferences: ContentPreferences;
  layout_preferences: LayoutPreferences;
  interactive_elements: InteractiveElements;
}

export interface PersonalizationChange {
  property: string;
  original_value: any;
  new_value: any;
  reason: string;
  type: 'style' | 'content' | 'layout';
  impact_score: number;
}

export interface PersonalizedComponent {
  component_id: string;
  original_props: any;
  personalized_props: any;
  changes: PersonalizationChange[];
  ai_confidence: number;
}

export interface PersonalizedTemplate {
  original_template_id: string;
  personalized_components: PersonalizedComponent[];
  applied_settings: PersonalizationSettings;
  personalization_score: number;
  estimated_setup_time: number;
  preview_url?: string;
}

// =============================================================================
// Contextual Recommendations Types
// =============================================================================

export interface RecommendationContext {
  business_analysis: BusinessAnalysisResult;
  current_project?: any;
  user_preferences?: PersonalizationSettings;
  industry_trends?: any;
  competitor_analysis?: any;
}

export interface ContextualRecommendation {
  id: string;
  type: 'template' | 'component' | 'content' | 'workflow';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  action_required?: string;
  preview_data?: any;
  implementation_effort?: number;
  expected_impact?: string;
}

// =============================================================================
// Learning and Feedback Types
// =============================================================================

export interface TemplateFeedback {
  template_id: string;
  business_context: BusinessAnalysisResult;
  user_action: 'selected' | 'rejected' | 'modified' | 'published';
  feedback_score?: number; // 1-5
  feedback_comments?: string;
  customizations_made?: any[];
  final_conversion_rate?: number;
  time_to_complete?: number;
}

export interface LearningData {
  business_context: BusinessAnalysisResult;
  template_selections: string[];
  customizations: any[];
  performance_metrics: {
    setup_time: number;
    conversion_rate?: number;
    user_engagement?: number;
    bounce_rate?: number;
  };
  user_satisfaction: number;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface BusinessAnalysisApiResponse {
  analysis: BusinessAnalysisResult;
  confidence: number;
  processing_time: number;
  suggestions?: string[];
}

export interface TemplateRecommendationApiResponse {
  recommendations: TemplateRecommendation[];
  total_analyzed: number;
  processing_time: number;
  fallback_recommendations?: TemplateRecommendation[];
}

export interface TemplatePersonalizationApiResponse {
  personalized_template: PersonalizedTemplate;
  processing_time: number;
  alternatives?: PersonalizedTemplate[];
}

export interface ContextualRecommendationsApiResponse {
  recommendations: ContextualRecommendation[];
  context_summary: {
    primary_focus: string;
    key_insights: string[];
    confidence: number;
  };
  processing_time: number;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface BusinessContextAnalyzerProps {
  onAnalysisComplete: (result: BusinessAnalysisResult) => void;
  initialData?: Partial<BusinessAnalysisRequest>;
  isLoading?: boolean;
  className?: string;
}

export interface ContextAwareTemplateSelectorProps {
  businessContext: BusinessAnalysisResult | null;
  onTemplateSelect: (recommendation: TemplateRecommendation) => void;
  maxRecommendations?: number;
  showReasoningDetails?: boolean;
  enableComparison?: boolean;
  className?: string;
}

export interface ContextualRecommendationsProps {
  businessContext: BusinessAnalysisResult;
  recommendations: TemplateRecommendation[];
  onTemplateSelect: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  onFeedback?: (templateId: string, rating: number, feedback?: string) => void;
  isLoading?: boolean;
  className?: string;
}

export interface TemplatePersonalizationProps {
  selectedTemplate: Template;
  businessContext: BusinessAnalysisResult;
  onPersonalizationUpdate: (customization: TemplateCustomization) => void;
  onPreviewUpdate?: (previewData: TemplatePreview) => void;
  onSaveTemplate?: (customizedTemplate: CustomizedTemplate) => void;
  initialSettings?: PersonalizationSettings;
  isLoading?: boolean;
  className?: string;
}

// Additional required types for Story 1.3
export interface TemplateCustomization {
  colorScheme: BrandColors;
  typography: Typography;
  layout: LayoutPreferences;
  content: ContentCustomization;
  images: ImageSettings;
  components: ComponentSettings;
}

export interface TemplatePreview {
  template_id: string;
  preview_url: string;
  preview_images: string[];
  device_previews: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  estimated_load_time: number;
  performance_score: number;
}

export interface CustomizedTemplate {
  id: string;
  original_template_id: string;
  name: string;
  customizations: TemplateCustomization;
  preview_data: TemplatePreview;
  created_at: string;
  updated_at: string;
}

export interface ContentCustomization {
  sections: Record<string, string>;
  tone: string;
  industry_terms: boolean;
  social_proof: boolean;
  cta_optimization: boolean;
}

export interface ImageSettings {
  style: 'photography' | 'illustration' | 'mixed';
  color_treatment: 'original' | 'filtered' | 'branded';
  aspect_ratios: string[];
  quality: 'standard' | 'high' | 'premium';
}

export interface ComponentSettings {
  animations: boolean;
  hover_effects: boolean;
  scroll_animations: boolean;
  loading_states: boolean;
  micro_interactions: boolean;
}

// =============================================================================
// Utility Types
// =============================================================================

export interface AnalysisValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface TemplateMatchScore {
  overall_score: number;
  industry_score: number;
  audience_score: number;
  design_score: number;
  feature_score: number;
  breakdown: Record<string, number>;
}

export interface PersonalizationOption {
  id: string;
  category: string;
  title: string;
  description: string;
  preview_image?: string;
  impact_level: 'low' | 'medium' | 'high';
  implementation_effort: number;
}

// =============================================================================
// AI and Enhancement Types
// =============================================================================

export interface AIPersonalizationSuggestion {
  id: string;
  type: 'color' | 'typography' | 'layout' | 'content';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  impact_score: number;
  preview_data?: any;
  implementation_effort: 'low' | 'medium' | 'high';
}

export interface PersonalizationHistory {
  timestamp: string;
  changes: TemplateCustomization;
  user_action: string;
  ai_suggested: boolean;
}

export interface TemplateAnalytics {
  performance_score: number;
  accessibility_score: number;
  mobile_score: number;
  seo_score: number;
  load_time: number;
  conversion_potential: number;
}

// =============================================================================
// State Management Types
// =============================================================================

export interface ContextAnalysisState {
  isAnalyzing: boolean;
  analysisResult: BusinessAnalysisResult | null;
  analysisError: string | null;
  validationErrors: Record<string, string>;
  analysisHistory: BusinessAnalysisResult[];
}

export interface TemplateRecommendationState {
  isLoading: boolean;
  recommendations: TemplateRecommendation[];
  selectedTemplateId: string | null;
  comparisonMode: boolean;
  sortBy: 'confidence' | 'conversion' | 'complexity';
  filters: {
    categories: string[];
    complexityLevel: string[];
    conversionThreshold: number;
  };
}

export interface PersonalizationState {
  isPersonalizing: boolean;
  currentSettings: PersonalizationSettings;
  personalizedTemplate: PersonalizedTemplate | null;
  previewMode: boolean;
  personalizationHistory: PersonalizedTemplate[];
}

// =============================================================================
// Hook Return Types
// =============================================================================

export interface UseBusinessAnalysisReturn {
  analyzeBusinessContext: (request: BusinessAnalysisRequest) => Promise<BusinessAnalysisResult>;
  state: ContextAnalysisState;
  validateRequest: (request: BusinessAnalysisRequest) => AnalysisValidation;
  clearAnalysis: () => void;
  retryAnalysis: () => Promise<void>;
}

export interface UseTemplateRecommendationsReturn {
  getRecommendations: (businessContext: BusinessAnalysisResult) => Promise<TemplateRecommendation[]>;
  state: TemplateRecommendationState;
  selectTemplate: (templateId: string) => void;
  compareTemplates: (templateIds: string[]) => void;
  updateFilters: (filters: Partial<TemplateRecommendationState['filters']>) => void;
  refreshRecommendations: () => Promise<void>;
}

export interface UseTemplatePersonalizationReturn {
  personalizeTemplate: (
    templateId: string,
    businessContext: BusinessAnalysisResult,
    settings: PersonalizationSettings
  ) => Promise<PersonalizedTemplate>;
  state: PersonalizationState;
  updateSettings: (settings: Partial<PersonalizationSettings>) => void;
  previewPersonalization: () => Promise<void>;
  savePersonalization: () => Promise<void>;
  resetPersonalization: () => void;
}

// Extended props interfaces for sub-components
export interface ColorSchemePanelProps {
  currentColors: BrandColors;
  businessContext: BusinessAnalysisResult;
  onColorChange: (colors: BrandColors) => void;
  onAIGenerate?: () => void;
  className?: string;
}

export interface ContentCustomizationPanelProps {
  businessContext: BusinessAnalysisResult;
  contentPreferences: ContentPreferences;
  onContentChange: (sectionId: string, content: string) => void;
  onPreferencesChange: (preferences: ContentPreferences) => void;
  className?: string;
}

export interface TypographyPanelProps {
  currentTypography: Typography;
  businessContext: BusinessAnalysisResult;
  onTypographyChange: (typography: Typography) => void;
  onAIGenerate?: () => void;
  className?: string;
}

export interface TemplatePreviewProps {
  template: Template;
  personalizationSettings: PersonalizationSettings;
  businessContext: BusinessAnalysisResult;
  isLoading?: boolean;
  showComparison?: boolean;
  onSettingsChange?: (settings: PersonalizationSettings) => void;
  className?: string;
}