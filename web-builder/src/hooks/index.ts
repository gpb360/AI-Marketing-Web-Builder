/**
 * Hooks Index
 * Central export point for all custom hooks
 */

export { useAuth } from './useAuth';
export { useTemplates, useTemplate, useFeaturedTemplates } from './useTemplates';
export { useWorkflows, useWorkflow, useWorkflowExecutions } from './useWorkflows';
export { useContacts, useContact, useEmailCampaigns, useCRMAnalytics } from './useCRM';
export { usePublishing } from './usePublishing';

// Re-export types for convenience
export type {
  LoadingState
} from '@/lib/api/types';