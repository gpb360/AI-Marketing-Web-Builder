/**
<<<<<<< HEAD
 * Type definitions for Context-Aware Template System
 * 
 * Part of Story 3.7: Context-Aware Template Recommendations
 * Comprehensive type system for business context analysis and template intelligence
 */

// Business Analysis Types
=======
 * Context-Aware Template Types and Interfaces
 * 
 * Type definitions for business context analysis and AI-powered template recommendations
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

// =============================================================================
// Core Business Context Types
// =============================================================================

>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
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

<<<<<<< HEAD
export type BusinessType = 'b2b' | 'b2c' | 'b2b2c' | 'nonprofit' | 'government';

export type DesignStyle = 'modern' | 'classic' | 'minimal' | 'bold' | 'creative' | 'corporate';

export type BrandTone = 'professional' | 'friendly' | 'authoritative' | 'playful' | 'sophisticated' | 'casual';

// Business Analysis Request
=======
export type BusinessType = 'b2b' | 'b2c' | 'marketplace' | 'portfolio' | 'nonprofit';

export type DesignStyle = 'modern' | 'classic' | 'minimal' | 'bold';

>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
export interface BusinessAnalysisRequest {
  business_name: string;
  business_description: string;
  industry?: BusinessIndustry;
<<<<<<< HEAD
  target_audience: string;
=======
  target_audience?: string;
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
  business_goals: string[];
  existing_brand_colors?: string[];
  preferred_style?: DesignStyle;
  website_url?: string;
  competitors?: string[];
}

<<<<<<< HEAD
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
=======
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

>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
export interface ContextualRecommendation {
  id: string;
  type: 'template' | 'component' | 'content' | 'workflow';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
<<<<<<< HEAD
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
=======
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

>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
export interface BusinessContextAnalyzerProps {
  onAnalysisComplete: (result: BusinessAnalysisResult) => void;
  initialData?: Partial<BusinessAnalysisRequest>;
  isLoading?: boolean;
  className?: string;
}

export interface ContextAwareTemplateSelectorProps {
<<<<<<< HEAD
  businessContext: BusinessAnalysisResult;
=======
  businessContext: BusinessAnalysisResult | null;
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
  onTemplateSelect: (recommendation: TemplateRecommendation) => void;
  maxRecommendations?: number;
  showReasoningDetails?: boolean;
  enableComparison?: boolean;
  className?: string;
}

export interface ContextualRecommendationsProps {
<<<<<<< HEAD
  context: RecommendationContext;
  onRecommendationSelect: (recommendation: ContextualRecommendation) => void;
  maxRecommendations?: number;
  filterByType?: ContextualRecommendation['type'][];
  showPriorityFilter?: boolean;
=======
  businessContext: BusinessAnalysisResult;
  recommendations: TemplateRecommendation[];
  onTemplateSelect: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  onFeedback?: (templateId: string, rating: number, feedback?: string) => void;
  isLoading?: boolean;
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
  className?: string;
}

export interface TemplatePersonalizationProps {
<<<<<<< HEAD
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
=======
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
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
}