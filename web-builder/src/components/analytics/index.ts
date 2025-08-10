/**
 * Analytics Components Index
 * Exports all template analytics components for easy importing
 */

export { default as TemplateAnalyticsDashboard } from './TemplateAnalyticsDashboard';
export { default as TemplatePerformanceCard } from './TemplatePerformanceCard';
export { default as RealTimeAlerts } from './RealTimeAlerts';
export { default as TemplateComparisonView } from './TemplateComparisonView';
export { default as AnalyticsConfiguration } from './AnalyticsConfiguration';

// Re-export analytics service and hooks for convenience
export { templateAnalyticsService } from '@/lib/api/services/template-analytics';
export {
  useTemplateAnalytics,
  useAnalyticsDashboard,
  useUserSegmentAnalytics,
  useCohortAnalysis,
  useTemplateComparison,
  useBulkTemplateAnalytics
} from '@/hooks/useTemplateAnalytics';

// Export types for external use
export type {
  TemplateAdoptionMetrics,
  TemplateSuccessMetrics,
  TemplatePerformanceTrend,
  TemplateAnalyticsDashboard as TemplateAnalyticsDashboardData,
  UserSegmentAnalytics,
  RealTimeAlert,
  CohortAnalysis,
  TemplateOptimizationSuggestions,
  TemplateComparisonData,
  TemplateRecommendationAnalytics
} from '@/lib/api/services/template-analytics';