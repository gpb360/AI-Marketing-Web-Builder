/**
 * API Services Index
 * Central export point for all API services
 */

export { AuthService, authService } from './auth';
export { TemplateService, templateService } from './templates';
export { WorkflowService, workflowService } from './workflows';
export { CRMService, crmService } from './crm';
export { templateOptimizationApi } from './template-optimization';
export { AnalyticsService, analyticsService } from './analytics';
export { slaRemediationService } from './sla-remediation';

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
  LoadingState
} from '../types';