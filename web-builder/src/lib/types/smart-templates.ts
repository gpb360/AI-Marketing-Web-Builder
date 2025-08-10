/**
 * Smart Template Types for Story 3.2: Smart Workflow Templates with AI Customization
 * 
 * These types implement the API specifications defined in the story documentation
 * for AI-powered template recommendations and success prediction.
 */

import { WorkflowAction, WorkflowCondition, TriggerType } from '@/lib/api/types';

// Workflow Categories (aligned with backend WorkflowCategory enum)
export enum WorkflowCategory {
  MARKETING = "marketing",
  SUPPORT = "support", 
  SALES = "sales",
  ECOMMERCE = "ecommerce"
}

// Website Analysis Types
export interface WebsiteAnalysisRequest {
  website_url: string;
  additional_context?: {
    business_description?: string;
    target_audience?: string;
    current_marketing_channels?: string[];
  };
  analysis_depth: 'basic' | 'comprehensive';
}

export interface BusinessClassification {
  industry: string;
  sub_industry: string[];
  business_model: 'b2b' | 'b2c' | 'marketplace' | 'saas' | 'nonprofit';
  confidence: number;
}

export interface ContentAnalysis {
  brand_voice: 'professional' | 'casual' | 'technical' | 'creative' | 'friendly';
  target_audience: string[];
  value_propositions: string[];
  existing_workflows: DetectedWorkflow[];
}

export interface MarketingMaturity {
  level: 'basic' | 'intermediate' | 'advanced';
  existing_tools: string[];
  automation_readiness: number;
}

export interface DetectedWorkflow {
  type: string;
  confidence: number;
  description: string;
}

export interface WebsiteAnalysisResult {
  business_classification: BusinessClassification;
  content_analysis: ContentAnalysis;
  marketing_maturity: MarketingMaturity;
}

// Customized Workflow Node Types
export interface CustomizedWorkflowNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  customizations: NodeCustomization[];
}

export interface NodeCustomization {
  field: string;
  original_value: any;
  customized_value: any;
  reason: string;
}

export interface WorkflowConnection {
  source_node_id: string;
  target_node_id: string;
  source_output?: string;
  target_input?: string;
}

// Template Recommendation Types
export interface TemplateReasoningDetail {
  industry_match: string;
  business_goal_alignment: string;
  automation_fit: string;
  expected_benefits: string[];
}

export interface TemplatePerformanceData {
  average_conversion_rate?: number;
  typical_roi_range?: [number, number];
  user_satisfaction_score: number;
}

export interface CustomizationPreview {
  nodes: CustomizedWorkflowNode[];
  connections: WorkflowConnection[];
  estimated_setup_time: number; // minutes
}

export interface SmartTemplateRecommendation {
  template_id: string;
  template_name: string;
  category: WorkflowCategory;
  relevance_score: number; // 0.0 to 1.0
  success_probability: number; // Predicted success rate
  customization_preview: CustomizationPreview;
  reasoning: TemplateReasoningDetail;
  performance_data: TemplatePerformanceData;
}

// Success Prediction Types
export interface PredictionResult {
  success_probability: number;
  expected_conversion_rate: number;
  roi_estimate: [number, number];
  confidence_level: number;
  key_success_factors: string[];
  potential_challenges: string[];
}

export interface ScenarioModeling {
  scenario_name: string;
  modifications: Record<string, any>;
  predicted_impact: {
    conversion_change: number;
    roi_change: number;
    confidence: number;
  };
}

// Component Props Types
export interface SmartTemplateRecommendationsProps {
  websiteAnalysis?: WebsiteAnalysisResult;
  onTemplateSelect: (recommendation: SmartTemplateRecommendation) => void;
  onTemplateInstantiate: (templateId: string, customizations: Record<string, any>) => void;
  maxRecommendations?: number;
  showReasoningDetails?: boolean;
  enablePreview?: boolean;
}

export interface TemplateRecommendationCardProps {
  recommendation: SmartTemplateRecommendation;
  onSelect: () => void;
  onInstantiate: () => void;
  onPreview?: () => void;
  showReasoningDetails: boolean;
  isSelected?: boolean;
}

export interface ReasoningDisplayProps {
  reasoning: TemplateReasoningDetail;
  performanceData: TemplatePerformanceData;
  relevanceScore: number;
  successProbability: number;
}

export interface OutcomePredictionProps {
  prediction: PredictionResult;
  scenarios?: ScenarioModeling[];
  onScenarioSelect?: (scenario: ScenarioModeling) => void;
  interactive?: boolean;
}

// API Response Types
export interface SmartTemplateRecommendationResponse {
  recommendations: SmartTemplateRecommendation[];
  website_analysis: WebsiteAnalysisResult;
  total_recommendations: number;
  analysis_timestamp: string;
}

export interface TemplateInstantiationResponse {
  workflow_id: string;
  workflow_name: string;
  customizations_applied: NodeCustomization[];
  estimated_setup_time: number;
  next_steps: string[];
}

// Loading and Error States
export interface SmartTemplateLoadingState {
  isAnalyzing: boolean;
  isGeneratingRecommendations: boolean;
  isInstantiating: boolean;
  error: string | null;
}

// Analytics and Feedback Types
export interface RecommendationFeedback {
  recommendation_id: string;
  user_rating: number; // 1-5
  relevance_rating: number; // 1-5
  adoption_status: 'selected' | 'instantiated' | 'ignored';
  feedback_text?: string;
}

export interface RecommendationAnalytics {
  template_id: string;
  total_recommendations: number;
  adoption_rate: number;
  average_relevance_score: number;
  success_rate: number;
  user_feedback_average: number;
}