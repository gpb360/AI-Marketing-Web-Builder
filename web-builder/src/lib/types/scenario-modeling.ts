/**
 * Scenario Modeling Types for Advanced Template Configuration Optimization
 * 
 * These types support comprehensive scenario modeling including:
 * - Multi-dimensional parameter space exploration
 * - Predictive analytics with ML models
 * - Monte Carlo simulations for risk assessment
 * - Statistical significance testing
 * - Real-time optimization recommendations
 */

import { WorkflowCategory } from './smart-templates';

// Core Scenario Modeling Types
export enum ScenarioType {
  TRAFFIC_VOLUME = "traffic_volume",
  AUDIENCE_SEGMENT = "audience_segment",
  BUSINESS_GOAL = "business_goal",
  INDUSTRY_CONTEXT = "industry_context",
  SEASONAL_VARIATION = "seasonal_variation",
  COMPETITIVE_LANDSCAPE = "competitive_landscape",
  MARKETING_BUDGET = "marketing_budget",
  TEMPLATE_VARIATION = "template_variation"
}

export enum OptimizationObjective {
  CONVERSION_RATE = "conversion_rate",
  REVENUE = "revenue",
  ENGAGEMENT = "engagement",
  LEAD_QUALITY = "lead_quality",
  COST_EFFICIENCY = "cost_efficiency",
  USER_RETENTION = "user_retention",
  BRAND_AWARENESS = "brand_awareness"
}

// Configuration and Request Types
export interface ScenarioModelingConfiguration {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  scenario_type: ScenarioType;
  optimization_objective: OptimizationObjective;
  base_configuration: Record<string, any>;
  variable_parameters: Record<string, any>;
  constraint_parameters: Record<string, any>;
  business_context: Record<string, any>;
  target_audience: Record<string, any>;
  industry_data: Record<string, any>;
  created_at: string;
  updated_at?: string;
  
  // Computed fields
  scenarios_count?: number;
  active_scenarios_count?: number;
  latest_prediction_date?: string;
}

export interface ScenarioModelingRequest {
  name: string;
  description?: string;
  template_id: string;
  scenario_type: ScenarioType;
  optimization_objective: OptimizationObjective;
  base_configuration?: Record<string, any>;
  variable_parameters?: Record<string, any>;
  constraint_parameters?: Record<string, any>;
  business_context?: Record<string, any>;
  target_audience?: Record<string, any>;
  industry_data?: Record<string, any>;
}

export interface ScenarioGenerationRequest {
  configuration_id: string;
  number_of_scenarios?: number;
  scenario_diversity?: number;
  include_baseline?: boolean;
  optimization_focus?: string[];
}

// Scenario Model Types
export interface ScenarioModel {
  id: string;
  name: string;
  description?: string;
  configuration_id: string;
  parameters: Record<string, any>;
  template_modifications: Record<string, any>;
  context_variables: Record<string, any>;
  prediction_results?: Record<string, any>;
  confidence_score?: number;
  is_baseline: boolean;
  is_active: boolean;
  execution_priority: number;
  created_at: string;
  updated_at?: string;
}

// Prediction Types
export interface ScenarioPrediction {
  id: string;
  scenario_id: string;
  prediction_type: string;
  predicted_value: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  confidence_level: number;
  baseline_value?: number;
  improvement_percentage?: number;
  statistical_significance?: number;
  prediction_horizon_days: number;
  seasonal_adjustment?: number;
  model_version: string;
  feature_importance?: Record<string, any>;
  created_at: string;
}

export interface PredictionRequest {
  scenario_ids: string[];
  prediction_types?: string[];
  prediction_horizon_days?: number;
  confidence_level?: number;
  include_feature_importance?: boolean;
}

export interface PredictionResult {
  predicted_value: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  model_confidence: number;
  feature_importance: number[];
}

// Optimization Types
export interface OptimizationRecommendation {
  id: string;
  recommendation_type: string;
  priority: number;
  title: string;
  description: string;
  rationale: string;
  implementation_steps: string[];
  estimated_effort_hours?: number;
  required_resources: string[];
  expected_impact: Record<string, any>;
  risk_assessment: Record<string, any>;
  success_probability: number;
  status: string;
  created_at: string;
}

export interface OptimizationRequest {
  configuration_id: string;
  max_recommendations?: number;
  minimum_impact_threshold?: number;
  effort_constraint?: string;
  risk_tolerance?: number;
}

// Simulation Types
export interface ScenarioSimulationRequest {
  template_id: string;
  modifications: Record<string, any>;
  business_context?: Record<string, any>;
  target_audience?: Record<string, any>;
  market_conditions?: Record<string, any>;
  simulation_duration_days?: number;
  sample_size?: number;
  monte_carlo_runs?: number;
}

export interface ScenarioSimulationResult {
  simulation_id: string;
  template_id: string;
  modifications: Record<string, any>;
  predicted_outcomes: Record<string, any>;
  confidence_intervals: Record<string, Record<string, number>>;
  risk_metrics: Record<string, number>;
  baseline_comparison: Record<string, number>;
  improvement_probability: number;
  sensitivity_analysis: Record<string, number>;
  scenario_robustness: number;
  implementation_complexity: 'low' | 'medium' | 'high';
  simulation_parameters: Record<string, any>;
  computation_time_seconds: number;
  created_at: string;
}

// Analysis Types
export interface ScenarioComparison {
  configuration_id: string;
  comparison_type: string;
  scenarios: ScenarioModel[];
  predictions: ScenarioPrediction[];
  best_performing_scenario?: string;
  performance_ranking: Array<{ scenario_id: string; score: number }>;
  statistical_significance_matrix: Record<string, Record<string, number>>;
  key_insights: string[];
  recommended_scenario?: string;
  confidence_in_recommendation?: number;
}

export interface HistoricalPerformanceRequest {
  template_ids: string[];
  date_range_start: string;
  date_range_end: string;
  metrics?: string[];
  aggregation_level?: string;
  include_external_factors?: boolean;
}

export interface HistoricalPerformanceData {
  template_ids: string[];
  date_range_start: string;
  date_range_end: string;
  performance_data: Record<string, Array<Record<string, any>>>;
  aggregated_metrics: Record<string, Record<string, number>>;
  trend_analysis: Record<string, string>;
  seasonal_patterns: Record<string, number[]>;
  correlation_matrix: Record<string, Record<string, number>>;
  performance_insights: string[];
  anomaly_detection: Array<{
    date: string;
    metric: string;
    value: number;
    expected_range: [number, number];
    severity: string;
  }>;
  data_quality_score: number;
  created_at: string;
}

// Multi-dimensional Analysis
export interface MultiDimensionalAnalysisRequest {
  configuration_id: string;
  dimensions: string[];
  interaction_effects?: boolean;
  max_combinations?: number;
}

export interface MultiDimensionalAnalysisResult {
  configuration_id: string;
  dimensions_analyzed: string[];
  dimension_effects: Record<string, Record<string, number>>;
  interaction_effects: Record<string, number>;
  optimal_combinations: Array<{
    combination: Record<string, string>;
    predicted_performance: number;
    confidence: number;
  }>;
  top_performing_combinations: Array<{
    rank: number;
    combination: Record<string, string>;
    performance_score: number;
  }>;
  dimension_importance_ranking: Array<{
    dimension: string;
    importance: number;
  }>;
  configuration_recommendations: Array<{
    recommendation: string;
    expected_lift: number;
    confidence: number;
  }>;
  next_experiments: Array<{
    experiment_name: string;
    parameters: Record<string, any>;
    expected_duration_days: number;
  }>;
  created_at: string;
}

// Component Props Types
export interface ScenarioModelingDashboardProps {
  templateId?: string;
  onConfigurationCreate?: (config: ScenarioModelingConfiguration) => void;
  onScenarioGenerate?: (scenarioIds: string[]) => void;
  onPredictionComplete?: (predictions: ScenarioPrediction[]) => void;
  onRecommendationSelect?: (recommendation: OptimizationRecommendation) => void;
  className?: string;
}

export interface ScenarioConfigurationBuilderProps {
  templateId: string;
  onConfigurationCreate: (config: ScenarioModelingConfiguration) => void;
  onCancel?: () => void;
  initialValues?: Partial<ScenarioModelingRequest>;
}

export interface ScenarioGeneratorProps {
  configurationId: string;
  onScenariosGenerated: (scenarios: ScenarioModel[]) => void;
  onError?: (error: string) => void;
}

export interface PredictionEngineProps {
  scenarios: ScenarioModel[];
  onPredictionsGenerated: (predictions: ScenarioPrediction[]) => void;
  predictionTypes?: string[];
  confidenceLevel?: number;
}

export interface ScenarioComparisonProps {
  configurationId: string;
  scenarios: ScenarioModel[];
  predictions: ScenarioPrediction[];
  onScenarioSelect?: (scenario: ScenarioModel) => void;
  comparisonMetrics?: string[];
}

export interface OptimizationRecommendationsProps {
  configurationId: string;
  recommendations: OptimizationRecommendation[];
  onRecommendationImplement?: (recommendation: OptimizationRecommendation) => void;
  onRecommendationDismiss?: (recommendationId: string) => void;
  filterByPriority?: number;
  filterByStatus?: string;
}

export interface SimulationRunnerProps {
  templateId: string;
  modifications: Record<string, any>;
  onSimulationComplete: (result: ScenarioSimulationResult) => void;
  onSimulationError?: (error: string) => void;
  simulationConfig?: Partial<ScenarioSimulationRequest>;
}

export interface PerformanceAnalyticsProps {
  templateIds: string[];
  dateRange: {
    start: string;
    end: string;
  };
  onAnalysisComplete?: (analysis: HistoricalPerformanceData) => void;
  metrics?: string[];
}

// State Management Types
export interface ScenarioModelingState {
  configurations: ScenarioModelingConfiguration[];
  scenarios: Record<string, ScenarioModel[]>;
  predictions: Record<string, ScenarioPrediction[]>;
  recommendations: Record<string, OptimizationRecommendation[]>;
  simulationResults: Record<string, ScenarioSimulationResult[]>;
  loading: {
    configurations: boolean;
    scenarios: boolean;
    predictions: boolean;
    recommendations: boolean;
    simulation: boolean;
    analysis: boolean;
  };
  errors: {
    configurations?: string;
    scenarios?: string;
    predictions?: string;
    recommendations?: string;
    simulation?: string;
    analysis?: string;
  };
}

export interface ScenarioModelingActions {
  createConfiguration: (request: ScenarioModelingRequest) => Promise<ScenarioModelingConfiguration>;
  generateScenarios: (request: ScenarioGenerationRequest) => Promise<ScenarioModel[]>;
  generatePredictions: (request: PredictionRequest) => Promise<ScenarioPrediction[]>;
  generateRecommendations: (request: OptimizationRequest) => Promise<OptimizationRecommendation[]>;
  runSimulation: (request: ScenarioSimulationRequest) => Promise<ScenarioSimulationResult>;
  compareScenarios: (configurationId: string) => Promise<ScenarioComparison>;
  analyzeHistoricalPerformance: (request: HistoricalPerformanceRequest) => Promise<HistoricalPerformanceData>;
  runMultiDimensionalAnalysis: (request: MultiDimensionalAnalysisRequest) => Promise<MultiDimensionalAnalysisResult>;
  deleteConfiguration: (configurationId: string) => Promise<void>;
}

// Visualization Types
export interface ScenarioVisualizationData {
  type: 'comparison' | 'prediction' | 'sensitivity' | 'risk' | 'performance';
  data: any[];
  labels: string[];
  colors?: string[];
  title: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface RiskMetrics {
  value_at_risk_5: number;
  conditional_value_at_risk: number;
  risk_adjusted_return: number;
  downside_risk: number;
  volatility: number;
  sharpe_ratio?: number;
}

export interface PerformanceMetrics {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  percentile_25: number;
  percentile_75: number;
  coefficient_of_variation: number;
}

// API Response Types
export interface ScenarioModelingApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Utility Types
export type ScenarioStatus = 'draft' | 'active' | 'completed' | 'archived';
export type PredictionType = 'conversion_rate' | 'revenue' | 'engagement' | 'lead_quality' | 'cost_efficiency';
export type RecommendationStatus = 'pending' | 'approved' | 'implemented' | 'rejected';
export type SimulationStatus = 'queued' | 'running' | 'completed' | 'failed';
export type AnalysisComplexity = 'basic' | 'intermediate' | 'advanced';
export type ConfidenceLevel = 0.90 | 0.95 | 0.99;
export type TimeHorizon = 7 | 14 | 30 | 60 | 90 | 180 | 365;

// Hook Types
export interface UseScenarioModelingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  cacheResults?: boolean;
  backgroundSync?: boolean;
}

export interface UseScenarioModelingResult {
  state: ScenarioModelingState;
  actions: ScenarioModelingActions;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reset: () => void;
}

// Export utility functions type
export interface ScenarioModelingUtils {
  calculateStatisticalSignificance: (sample1: number[], sample2: number[]) => number;
  generateConfidenceInterval: (values: number[], confidenceLevel: number) => [number, number];
  calculateRiskMetrics: (values: number[]) => RiskMetrics;
  calculatePerformanceMetrics: (values: number[]) => PerformanceMetrics;
  formatPredictionValue: (value: number, type: PredictionType) => string;
  assessImplementationComplexity: (modifications: Record<string, any>) => 'low' | 'medium' | 'high';
  validateScenarioConfiguration: (config: Partial<ScenarioModelingRequest>) => { valid: boolean; errors: string[] };
  generateScenarioName: (type: ScenarioType, parameters: Record<string, any>) => string;
}