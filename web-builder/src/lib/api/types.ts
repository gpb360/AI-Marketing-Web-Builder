/**
 * API Types and Interfaces for AI Marketing Web Builder Platform
 */

// Base API Response
export interface APIResponse<T = any> {
  data?: T;
  error?: boolean;
  message?: string;
  status_code?: number;
  details?: any;
}

// Pagination
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Template Types
export enum TemplateCategory {
  LANDING_PAGE = "landing_page",
  ECOMMERCE = "ecommerce",
  PORTFOLIO = "portfolio",
  BLOG = "blog",
  CORPORATE = "corporate",
  RESTAURANT = "restaurant",
  HEALTH = "health",
  EDUCATION = "education",
  NON_PROFIT = "non_profit",
  REAL_ESTATE = "real_estate",
  TECHNOLOGY = "technology",
  CREATIVE = "creative"
}

export enum TemplateStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: TemplateCategory;
  status: TemplateStatus;
  preview_image_url?: string;
  thumbnail_url?: string;
  components: any;
  styles: any;
  metadata: any;
  tags: string[];
  is_premium: boolean;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  description: string;
  category: TemplateCategory;
  preview_image_url?: string;
  thumbnail_url?: string;
  components: any;
  styles: any;
  metadata?: any;
  tags?: string[];
  is_premium?: boolean;
  is_featured?: boolean;
}

export interface TemplateUpdate extends Partial<TemplateCreate> {}

export interface TemplateList {
  templates: Template[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  featured?: boolean;
  premium?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
}

// Template Component Types
export interface TemplateComponent {
  id: number;
  name: string;
  description: string;
  component_type: string;
  category: string;
  config_schema: any;
  default_props: any;
  usage_count: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateComponentCreate {
  name: string;
  description: string;
  component_type: string;
  category: string;
  config_schema: any;
  default_props?: any;
  is_premium?: boolean;
}

export interface TemplateComponentUpdate extends Partial<TemplateComponentCreate> {}

// Workflow Types
export enum WorkflowStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  PAUSED = "paused"
}

export enum TriggerType {
  FORM_SUBMISSION = "form_submission",
  PAGE_VIEW = "page_view",
  EMAIL_CLICK = "email_click",
  TIME_BASED = "time_based",
  WEBHOOK = "webhook",
  MANUAL = "manual"
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_config: any;
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  status: WorkflowStatus;
  is_active: boolean;
  execution_count: number;
  success_rate: number;
  last_executed_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id?: number;
  type: string;
  config: any;
  order: number;
}

export interface WorkflowCondition {
  id?: number;
  field: string;
  operator: string;
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_config: any;
  actions?: WorkflowAction[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowUpdate extends Partial<WorkflowCreate> {
  status?: WorkflowStatus;
  is_active?: boolean;
}

export interface WorkflowExecution {
  id: number;
  workflow_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger_data: any;
  result: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

// CRM Types
export enum ContactStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  UNSUBSCRIBED = "unsubscribed",
  BOUNCED = "bounced"
}

export interface Contact {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
  tags: string[];
  custom_fields: Record<string, any>;
  lead_score: number;
  source?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  source?: string;
}

export interface ContactUpdate extends Partial<ContactCreate> {
  status?: ContactStatus;
  lead_score?: number;
}

export interface ContactFilters {
  status?: ContactStatus;
  tags?: string[];
  search?: string;
  skip?: number;
  limit?: number;
}

export interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  template_id?: number;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignCreate {
  name: string;
  subject: string;
  content: string;
  template_id?: number;
  scheduled_at?: string;
  recipient_filters?: any;
}

export interface EmailCampaignUpdate extends Partial<EmailCampaignCreate> {
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description?: string;
  template_id?: number;
  components: any;
  styles: any;
  settings: any;
  domain?: string;
  is_published: boolean;
  published_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  template_id?: number;
  components?: any;
  styles?: any;
  settings?: any;
}

export interface ProjectUpdate extends Partial<ProjectCreate> {
  domain?: string;
  is_published?: boolean;
}

// Analytics Types
export interface AnalyticsOverview {
  total_projects: number;
  total_workflows: number;
  total_contacts: number;
  active_campaigns: number;
}

export interface WorkflowAnalytics {
  workflow_id: number;
  executions_today: number;
  executions_week: number;
  executions_month: number;
  success_rate: number;
  avg_execution_time: number;
}

export interface ComponentAnalytics {
  component_id: number;
  usage_count: number;
  conversion_rate: number;
  avg_engagement_time: number;
}

// Error Types
export interface APIError {
  error: boolean;
  message: string;
  status_code: number;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Query Parameters
export interface QueryParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

// Analytics Types for Story 3.3
export enum AnalyticsTimePeriod {
  HOUR = '1h',
  DAY = '1d',
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ABTestGoal {
  CONVERSION_RATE = 'conversion_rate',
  EXECUTION_TIME = 'execution_time',
  SUCCESS_RATE = 'success_rate',
  USER_ENGAGEMENT = 'user_engagement',
  REVENUE = 'revenue',
  COST_PER_EXECUTION = 'cost_per_execution'
}

export interface PerformanceMetrics {
  execution_count: number;
  success_rate: number;
  avg_execution_time: number;
  median_execution_time: number;
  p95_execution_time: number;
  error_rate: number;
  throughput: number;
  resource_utilization: number;
}

export interface ConversionFunnelStage {
  stage_name: string;
  entry_count: number;
  completion_count: number;
  conversion_rate: number;
  drop_off_count: number;
  avg_time_in_stage: number;
}

export interface ConversionFunnel {
  stages: ConversionFunnelStage[];
  overall_conversion_rate: number;
  total_drop_offs: number;
  optimization_opportunities: string[];
}

export interface BusinessImpactMetrics {
  time_savings_hours: number;
  cost_savings_usd: number;
  revenue_attribution_usd: number;
  roi_percentage: number;
  productivity_improvement: number;
  user_satisfaction_score: number;
}

export interface PerformanceAnomaly {
  timestamp: string;
  metric_name: string;
  actual_value: number;
  expected_value: number;
  deviation_percentage: number;
  severity: AnomalySeverity;
  description: string;
  suggested_actions: string[];
}

export interface TrendPrediction {
  metric_name: string;
  current_value: number;
  predicted_value: number;
  prediction_confidence: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  time_horizon: string;
  confidence_interval: [number, number];
}

export interface ComprehensiveWorkflowAnalytics {
  workflow_id: number;
  workflow_name: string;
  time_period: AnalyticsTimePeriod;
  analysis_timestamp: string;
  performance_metrics: PerformanceMetrics;
  conversion_funnel: ConversionFunnel;
  business_impact: BusinessImpactMetrics;
  detected_anomalies: PerformanceAnomaly[];
  trend_predictions: TrendPrediction[];
  previous_period_comparison?: Record<string, number>;
  benchmark_comparison?: Record<string, number>;
  key_insights: string[];
  recommendations: string[];
}

export interface RealTimeMetrics {
  current_executions: number;
  success_rate: number;
  avg_response_time: number;
  active_users: number;
  last_updated: string;
}

export interface WorkflowVariantRequest {
  variant_id: string;
  variant_name: string;
  workflow_config: Record<string, any>;
  traffic_allocation: number;
  is_control?: boolean;
  description?: string;
}

export interface ABTestCreateRequest {
  test_name: string;
  test_description?: string;
  variants: WorkflowVariantRequest[];
  goal_metric: ABTestGoal;
  minimum_sample_size?: number;
  minimum_detectable_effect?: number;
  significance_level?: number;
  statistical_power?: number;
  max_duration_days?: number;
  early_stopping_enabled?: boolean;
}

export interface StatisticalSignificance {
  is_significant: boolean;
  p_value: number;
  confidence_level: number;
  effect_size: number;
  statistical_power: number;
  sample_size_a: number;
  sample_size_b: number;
  test_statistic: number;
  degrees_of_freedom?: number;
  test_type: string;
  recommendation: string;
  confidence_interval: [number, number];
}

export interface VariantPerformance {
  variant_id: string;
  variant_name: string;
  sample_size: number;
  conversion_rate: number;
  avg_execution_time: number;
  success_rate: number;
  total_conversions: number;
  revenue_per_user: number;
  cost_per_conversion: number;
  roi_estimate: number;
  conversion_rate_ci: [number, number];
  execution_time_ci: [number, number];
}

export interface ABTestResult {
  test_id: string;
  test_name: string;
  workflow_id: number;
  status: string;
  goal_metric: string;
  start_date: string;
  end_date?: string;
  actual_duration_days: number;
  control_performance: VariantPerformance;
  treatment_performance: VariantPerformance;
  statistical_significance: StatisticalSignificance;
  winner_probability: Record<string, number>;
  expected_improvement: number;
  business_impact_estimate: number;
  implementation_recommendation: string;
  confidence_level: number;
  risk_factors: string[];
  implementation_complexity: 'low' | 'medium' | 'high';
}

export interface ExportRequest {
  format: 'pdf' | 'csv' | 'json';
  time_period?: AnalyticsTimePeriod;
  include_charts?: boolean;
  include_raw_data?: boolean;
  template?: string;
  custom_sections?: string[];
}

export interface AnalyticsResponse {
  status: string;
  data: ComprehensiveWorkflowAnalytics;
  metadata: Record<string, any>;
}

export interface RealTimeMetricsResponse {
  workflow_id: number;
  metrics: RealTimeMetrics;
  timestamp: string;
}

export interface ABTestResponse {
  status: string;
  test_id: string;
  message: string;
  test_url: string;
  estimated_duration_days: number;
}

export interface ExportResponse {
  status: string;
  message: string;
  export_id: string;
  estimated_completion_time: string;
  download_url: string;
}