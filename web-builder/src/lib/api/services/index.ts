/**
 * API Services Index
 * Central export point for all API services
 */

export { AuthService, authService } from './auth';
export { TemplateService, templateService } from './templates';
export { WorkflowService, workflowService } from './workflows';
export { CRMService, crmService } from './crm';
export { AnalyticsService, analyticsService } from './analytics';
export { templateOptimizationApi } from './template-optimization';

// Re-export types for convenience
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  Template,
  TemplateCreate,
  TemplateUpdate,
  TemplateFilters,
  Workflow,
  WorkflowCreate,
  WorkflowUpdate,
  WorkflowExecution,
  Contact,
  ContactCreate,
  ContactUpdate,
  ContactFilters,
  EmailCampaign,
  EmailCampaignCreate,
  EmailCampaignUpdate,
  PaginatedResponse,
  APIError,
  LoadingState,
  // Analytics types
  ComprehensiveWorkflowAnalytics,
  AnalyticsTimePeriod,
  ABTestCreateRequest,
  ABTestResult,
  ExportRequest,
  RealTimeMetrics
} from '../types';