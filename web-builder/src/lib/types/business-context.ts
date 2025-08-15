/**
 * Comprehensive Business Context Types
 * 
 * Enhanced TypeScript interfaces for business context with runtime validation
 * Part of Story 1.3: Frontend Context-Aware Template Integration (AC: 5)
 */

import { z } from 'zod';

// =============================================================================
// Core Business Types with Zod Validation
// =============================================================================

export const BusinessIndustrySchema = z.enum([
  'technology',
  'healthcare', 
  'finance',
  'education',
  'retail',
  'manufacturing',
  'real-estate',
  'food-service',
  'professional-services',
  'nonprofit',
  'entertainment',
  'fitness',
  'automotive',
  'beauty',
  'travel',
  'consulting',
  'legal',
  'marketing',
  'construction',
  'agriculture',
  'media',
  'transportation',
  'other'
]);

export const BusinessTypeSchema = z.enum(['b2b', 'b2c', 'marketplace', 'portfolio', 'nonprofit']);

export const DesignStyleSchema = z.enum(['modern', 'classic', 'minimal', 'bold', 'elegant', 'creative']);

export const ToneSchema = z.enum(['professional', 'casual', 'friendly', 'authoritative', 'creative']);

// =============================================================================
// Business Analysis Request & Response Schemas
// =============================================================================

export const BusinessAnalysisRequestSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_description: z.string().min(20, 'Business description must be at least 20 characters'),
  industry: BusinessIndustrySchema.optional(),
  target_audience: z.string().optional(),
  business_goals: z.array(z.string()).min(1, 'At least one business goal is required'),
  existing_brand_colors: z.array(z.string()).optional(),
  preferred_style: DesignStyleSchema.optional(),
  website_url: z.string().url().optional(),
  competitors: z.array(z.string()).optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  budget_range: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  geographic_focus: z.enum(['local', 'regional', 'national', 'international']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

export const IndustryClassificationSchema = z.object({
  primary: BusinessIndustrySchema,
  secondary: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  sub_categories: z.array(z.string()).optional(),
  market_maturity: z.enum(['emerging', 'growing', 'mature', 'declining']).optional()
});

export const TargetAudienceSchema = z.object({
  demographics: z.array(z.string()),
  psychographics: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  age_groups: z.array(z.string()).optional(),
  income_levels: z.array(z.string()).optional(),
  tech_savviness: z.enum(['low', 'medium', 'high']).optional(),
  decision_making_style: z.enum(['analytical', 'intuitive', 'consensus', 'authority']).optional()
});

export const BrandPersonalitySchema = z.object({
  traits: z.array(z.string()),
  tone: ToneSchema,
  confidence: z.number().min(0).max(1),
  voice_attributes: z.array(z.string()).optional(),
  emotional_connection: z.enum(['rational', 'emotional', 'balanced']).optional(),
  brand_archetype: z.string().optional()
});

export const BusinessAnalysisResultSchema = z.object({
  industry_classification: IndustryClassificationSchema,
  target_audience: TargetAudienceSchema,
  business_type: BusinessTypeSchema,
  content_requirements: z.array(z.string()),
  design_preferences: z.record(z.string(), z.number()),
  brand_personality: BrandPersonalitySchema,
  competitive_analysis: z.object({
    direct_competitors: z.array(z.string()),
    competitive_advantages: z.array(z.string()),
    market_positioning: z.string()
  }).optional(),
  technical_requirements: z.object({
    integrations_needed: z.array(z.string()),
    performance_requirements: z.array(z.string()),
    compliance_needs: z.array(z.string())
  }).optional(),
  success_metrics: z.object({
    primary_kpis: z.array(z.string()),
    conversion_goals: z.array(z.string()),
    engagement_targets: z.record(z.string(), z.number())
  }).optional()
});

// =============================================================================
// Template & Recommendation Schemas
// =============================================================================

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  thumbnail: z.string().url(),
  preview_url: z.string().url(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  business_types: z.array(z.string()).optional(),
  design_attributes: z.record(z.string(), z.number()).optional(),
  technical_specs: z.object({
    page_load_speed: z.number(),
    mobile_score: z.number(),
    accessibility_score: z.number(),
    seo_score: z.number()
  }).optional(),
  pricing_tier: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  customization_level: z.enum(['low', 'medium', 'high']).optional(),
  maintenance_effort: z.enum(['low', 'medium', 'high']).optional()
});

export const RecommendationReasoningSchema = z.object({
  industryAlignment: z.string(),
  audienceFit: z.string(),
  featureBenefits: z.array(z.string()),
  designRationale: z.string(),
  competitive_advantages: z.array(z.string()).optional(),
  risk_factors: z.array(z.string()).optional(),
  implementation_notes: z.array(z.string()).optional()
});

export const PersonalizationSuggestionSchema = z.object({
  type: z.enum(['color', 'content', 'layout', 'animation', 'imagery', 'functionality']),
  title: z.string(),
  description: z.string(),
  preview: z.string(),
  impact: z.string(),
  implementation_effort: z.enum(['low', 'medium', 'high']),
  expected_improvement: z.string().optional(),
  dependencies: z.array(z.string()).optional()
});

export const BusinessGoalAlignmentSchema = z.object({
  goal: z.string(),
  alignment: z.number().min(0).max(100),
  description: z.string(),
  supporting_features: z.array(z.string()).optional(),
  success_indicators: z.array(z.string()).optional()
});

export const TemplateRecommendationSchema = z.object({
  template: TemplateSchema,
  confidenceScore: z.number().min(0).max(1),
  reasoning: RecommendationReasoningSchema,
  personalizationSuggestions: z.array(PersonalizationSuggestionSchema),
  businessGoalAlignment: z.array(BusinessGoalAlignmentSchema),
  industryRelevance: z.number().min(0).max(1),
  targetAudienceFit: z.number().min(0).max(1),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  estimatedConversionRate: z.number().min(0).max(1).optional(),
  setupComplexity: z.enum(['low', 'medium', 'high']),
  customizationEffort: z.number().min(1).max(10),
  roi_potential: z.enum(['low', 'medium', 'high']).optional(),
  time_to_launch: z.string().optional(),
  ongoing_maintenance: z.enum(['minimal', 'moderate', 'intensive']).optional()
});

// =============================================================================
// Enhanced Personalization Schemas
// =============================================================================

export const BrandColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  success: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
  warning: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
  error: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional()
});

export const TypographySchema = z.object({
  heading_font: z.string(),
  body_font: z.string(),
  font_size_scale: z.number().min(0.5).max(2),
  line_height_scale: z.number().min(1).max(2).optional(),
  letter_spacing: z.enum(['tight', 'normal', 'wide']).optional(),
  font_weights: z.object({
    light: z.number().optional(),
    normal: z.number().optional(),
    medium: z.number().optional(),
    semibold: z.number().optional(),
    bold: z.number().optional()
  }).optional()
});

export const ContentPreferencesSchema = z.object({
  tone: ToneSchema,
  content_length: z.enum(['concise', 'detailed', 'comprehensive']),
  use_industry_terms: z.boolean(),
  include_social_proof: z.boolean(),
  cta_style: z.enum(['direct', 'soft', 'urgent', 'consultative']).optional(),
  storytelling_approach: z.enum(['data-driven', 'emotional', 'case-study', 'benefit-focused']).optional(),
  language_complexity: z.enum(['simple', 'moderate', 'technical', 'expert']).optional()
});

export const LayoutPreferencesSchema = z.object({
  component_spacing: z.enum(['tight', 'normal', 'spacious']),
  section_order: z.array(z.string()),
  sidebar_position: z.enum(['left', 'right', 'none']),
  header_style: z.enum(['minimal', 'standard', 'prominent']).optional(),
  footer_style: z.enum(['minimal', 'detailed', 'newsletter-focused']).optional(),
  navigation_style: z.enum(['horizontal', 'vertical', 'hamburger', 'mega-menu']).optional()
});

export const InteractiveElementsSchema = z.object({
  animations: z.boolean(),
  hover_effects: z.boolean(),
  scroll_animations: z.boolean(),
  parallax_effects: z.boolean().optional(),
  video_backgrounds: z.boolean().optional(),
  interactive_forms: z.boolean().optional(),
  chatbot_integration: z.boolean().optional()
});

export const PersonalizationSettingsSchema = z.object({
  brand_colors: BrandColorsSchema,
  typography: TypographySchema,
  content_preferences: ContentPreferencesSchema,
  layout_preferences: LayoutPreferencesSchema,
  interactive_elements: InteractiveElementsSchema,
  seo_preferences: z.object({
    focus_keywords: z.array(z.string()),
    meta_description_style: z.enum(['benefit-focused', 'feature-focused', 'problem-solution']),
    structured_data: z.boolean()
  }).optional(),
  accessibility_requirements: z.object({
    wcag_level: z.enum(['A', 'AA', 'AAA']),
    screen_reader_optimized: z.boolean(),
    high_contrast_mode: z.boolean(),
    keyboard_navigation: z.boolean()
  }).optional()
});

// =============================================================================
// Error Handling & Validation Schemas
// =============================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  severity: z.enum(['error', 'warning', 'info'])
});

export const AnalysisValidationSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(ValidationErrorSchema).optional(),
  suggestions: z.array(z.string()).optional(),
  confidence_score: z.number().min(0).max(1),
  data_completeness: z.number().min(0).max(1)
});

export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.any().optional()
  }).optional(),
  metadata: z.object({
    processing_time: z.number(),
    api_version: z.string(),
    request_id: z.string()
  }).optional()
});

// =============================================================================
// Advanced Analytics & Performance Schemas
// =============================================================================

export const TemplateAnalyticsSchema = z.object({
  template_id: z.string(),
  performance_score: z.number().min(0).max(100),
  accessibility_score: z.number().min(0).max(100),
  mobile_score: z.number().min(0).max(100),
  seo_score: z.number().min(0).max(100),
  load_time: z.number().min(0),
  conversion_potential: z.number().min(0).max(100),
  user_engagement_score: z.number().min(0).max(100),
  bounce_rate_prediction: z.number().min(0).max(1),
  time_on_page_prediction: z.number().min(0),
  technical_debt_score: z.number().min(0).max(100).optional()
});

export const BusinessImpactMetricsSchema = z.object({
  estimated_conversion_lift: z.number(),
  expected_user_engagement: z.number(),
  brand_alignment_score: z.number().min(0).max(100),
  market_differentiation: z.number().min(0).max(100),
  implementation_risk: z.enum(['low', 'medium', 'high']),
  maintenance_complexity: z.enum(['simple', 'moderate', 'complex']),
  scalability_rating: z.number().min(1).max(10),
  future_proof_score: z.number().min(0).max(100)
});

// =============================================================================
// Type Exports (from Zod schemas)
// =============================================================================

export type BusinessIndustry = z.infer<typeof BusinessIndustrySchema>;
export type BusinessType = z.infer<typeof BusinessTypeSchema>;
export type DesignStyle = z.infer<typeof DesignStyleSchema>;
export type Tone = z.infer<typeof ToneSchema>;

export type BusinessAnalysisRequest = z.infer<typeof BusinessAnalysisRequestSchema>;
export type IndustryClassification = z.infer<typeof IndustryClassificationSchema>;
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;
export type BrandPersonality = z.infer<typeof BrandPersonalitySchema>;
export type BusinessAnalysisResult = z.infer<typeof BusinessAnalysisResultSchema>;

export type Template = z.infer<typeof TemplateSchema>;
export type RecommendationReasoning = z.infer<typeof RecommendationReasoningSchema>;
export type PersonalizationSuggestion = z.infer<typeof PersonalizationSuggestionSchema>;
export type BusinessGoalAlignment = z.infer<typeof BusinessGoalAlignmentSchema>;
export type TemplateRecommendation = z.infer<typeof TemplateRecommendationSchema>;

export type BrandColors = z.infer<typeof BrandColorsSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type ContentPreferences = z.infer<typeof ContentPreferencesSchema>;
export type LayoutPreferences = z.infer<typeof LayoutPreferencesSchema>;
export type InteractiveElements = z.infer<typeof InteractiveElementsSchema>;
export type PersonalizationSettings = z.infer<typeof PersonalizationSettingsSchema>;

export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type AnalysisValidation = z.infer<typeof AnalysisValidationSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;

export type TemplateAnalytics = z.infer<typeof TemplateAnalyticsSchema>;
export type BusinessImpactMetrics = z.infer<typeof BusinessImpactMetricsSchema>;

// =============================================================================
// Utility Functions for Validation
// =============================================================================

export const validateBusinessAnalysisRequest = (data: unknown): AnalysisValidation => {
  try {
    BusinessAnalysisRequestSchema.parse(data);
    return {
      isValid: true,
      errors: [],
      confidence_score: 1,
      data_completeness: 1
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        severity: 'error' as const
      }));

      return {
        isValid: false,
        errors: validationErrors,
        confidence_score: 0,
        data_completeness: 0.5
      };
    }
    
    return {
      isValid: false,
      errors: [{
        field: 'unknown',
        message: 'Unknown validation error',
        code: 'UNKNOWN_ERROR',
        severity: 'error'
      }],
      confidence_score: 0,
      data_completeness: 0
    };
  }
};

export const validateTemplateRecommendation = (data: unknown): boolean => {
  try {
    TemplateRecommendationSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const validatePersonalizationSettings = (data: unknown): boolean => {
  try {
    PersonalizationSettingsSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

// =============================================================================
// Default Values & Factories
// =============================================================================

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

// =============================================================================
// Type Guards
// =============================================================================

export const isBusinessAnalysisResult = (data: unknown): data is BusinessAnalysisResult => {
  try {
    BusinessAnalysisResultSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const isTemplateRecommendation = (data: unknown): data is TemplateRecommendation => {
  try {
    TemplateRecommendationSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const isTemplate = (data: unknown): data is Template => {
  try {
    TemplateSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export default {
  // Schemas
  BusinessAnalysisRequestSchema,
  BusinessAnalysisResultSchema,
  TemplateRecommendationSchema,
  PersonalizationSettingsSchema,
  
  // Validation functions
  validateBusinessAnalysisRequest,
  validateTemplateRecommendation,
  validatePersonalizationSettings,
  
  // Type guards
  isBusinessAnalysisResult,
  isTemplateRecommendation,
  isTemplate,
  
  // Default factories
  createDefaultPersonalizationSettings,
  createDefaultBrandColors,
  createDefaultTypography,
  createDefaultContentPreferences,
  createDefaultLayoutPreferences,
  createDefaultInteractiveElements
};