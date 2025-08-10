/**
 * Template Analytics Hooks
 * React hooks for template adoption tracking and success rate monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { templateAnalyticsService } from '@/lib/api/services/template-analytics';
import type {
  TemplateAdoptionMetrics,
  TemplateSuccessMetrics,
  TemplatePerformanceTrend,
  TemplateAnalyticsDashboard,
  UserSegmentAnalytics,
  RealTimeAlert,
  CohortAnalysis,
  TemplateOptimizationSuggestions,
  TemplateComparisonData,
} from '@/lib/api/services/template-analytics';

interface UseTemplateAnalyticsOptions {
  templateId?: number;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Main analytics hook for a specific template
export function useTemplateAnalytics(options: UseTemplateAnalyticsOptions = {}) {
  const { templateId, timeRange = '30d', autoRefresh = false, refreshInterval = 300000 } = options;
  
  const [adoptionMetrics, setAdoptionMetrics] = useState<AnalyticsState<TemplateAdoptionMetrics>>({
    data: null,
    loading: false,
    error: null
  });
  
  const [successMetrics, setSuccessMetrics] = useState<AnalyticsState<TemplateSuccessMetrics>>({
    data: null,
    loading: false,
    error: null
  });
  
  const [performanceTrends, setPerformanceTrends] = useState<AnalyticsState<TemplatePerformanceTrend>>({
    data: null,
    loading: false,
    error: null
  });
  
  const [optimizations, setOptimizations] = useState<AnalyticsState<TemplateOptimizationSuggestions>>({
    data: null,
    loading: false,
    error: null
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();

  const loadAdoptionMetrics = useCallback(async () => {
    if (!templateId) return;
    
    setAdoptionMetrics(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getTemplateAdoptionMetrics(templateId, timeRange);
      setAdoptionMetrics({ data, loading: false, error: null });
    } catch (error) {
      setAdoptionMetrics({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load adoption metrics'
      });
    }
  }, [templateId, timeRange]);

  const loadSuccessMetrics = useCallback(async () => {
    if (!templateId) return;
    
    setSuccessMetrics(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getTemplateSuccessMetrics(templateId, timeRange);
      setSuccessMetrics({ data, loading: false, error: null });
    } catch (error) {
      setSuccessMetrics({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load success metrics'
      });
    }
  }, [templateId, timeRange]);

  const loadPerformanceTrends = useCallback(async () => {
    if (!templateId) return;
    
    setPerformanceTrends(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getTemplatePerformanceTrends(templateId, 'weekly', '90d');
      setPerformanceTrends({ data, loading: false, error: null });
    } catch (error) {
      setPerformanceTrends({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load performance trends'
      });
    }
  }, [templateId]);

  const loadOptimizations = useCallback(async () => {
    if (!templateId) return;
    
    setOptimizations(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getOptimizationSuggestions(templateId);
      setOptimizations({ data, loading: false, error: null });
    } catch (error) {
      setOptimizations({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load optimization suggestions'
      });
    }
  }, [templateId]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadAdoptionMetrics(),
      loadSuccessMetrics(),
      loadPerformanceTrends(),
      loadOptimizations()
    ]);
  }, [loadAdoptionMetrics, loadSuccessMetrics, loadPerformanceTrends, loadOptimizations]);

  const trackAdoption = useCallback(async (data: {
    userId: number;
    source: 'search' | 'recommendation' | 'category' | 'featured';
    context?: Record<string, any>;
  }) => {
    if (!templateId) return;
    
    try {
      await templateAnalyticsService.trackAdoptionEvent({
        templateId,
        ...data
      });
      // Refresh adoption metrics after tracking
      await loadAdoptionMetrics();
    } catch (error) {
      console.error('Failed to track adoption:', error);
    }
  }, [templateId, loadAdoptionMetrics]);

  const trackCustomization = useCallback(async (data: {
    userId: number;
    modificationType: 'content' | 'design' | 'layout' | 'style';
    modificationCount: number;
    timeSpent: number;
  }) => {
    if (!templateId) return;
    
    try {
      await templateAnalyticsService.trackCustomizationEvent({
        templateId,
        ...data
      });
    } catch (error) {
      console.error('Failed to track customization:', error);
    }
  }, [templateId]);

  const trackCompletion = useCallback(async (data: {
    userId: number;
    completionType: 'setup' | 'publish' | 'preview';
    timeSinceAdoption: number;
    customizationsMade: number;
  }) => {
    if (!templateId) return;
    
    try {
      await templateAnalyticsService.trackCompletionEvent({
        templateId,
        ...data
      });
      // Refresh success metrics after tracking
      await loadSuccessMetrics();
    } catch (error) {
      console.error('Failed to track completion:', error);
    }
  }, [templateId, loadSuccessMetrics]);

  const trackSuccess = useCallback(async (data: {
    userId: number;
    successType: 'conversion' | 'engagement' | 'retention' | 'rating';
    value: number;
    metadata?: Record<string, any>;
  }) => {
    if (!templateId) return;
    
    try {
      await templateAnalyticsService.trackSuccessEvent({
        templateId,
        ...data
      });
      // Refresh success metrics after tracking
      await loadSuccessMetrics();
    } catch (error) {
      console.error('Failed to track success:', error);
    }
  }, [templateId, loadSuccessMetrics]);

  useEffect(() => {
    if (templateId) {
      refreshAll();
    }
  }, [templateId, timeRange, refreshAll]);

  useEffect(() => {
    if (autoRefresh && templateId) {
      intervalRef.current = setInterval(refreshAll, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, templateId, refreshAll]);

  const isLoading = adoptionMetrics.loading || successMetrics.loading || performanceTrends.loading || optimizations.loading;
  const hasError = adoptionMetrics.error || successMetrics.error || performanceTrends.error || optimizations.error;

  return {
    adoptionMetrics: adoptionMetrics.data,
    successMetrics: successMetrics.data,
    performanceTrends: performanceTrends.data,
    optimizations: optimizations.data,
    loading: isLoading,
    error: hasError,
    refresh: refreshAll,
    trackAdoption,
    trackCustomization,
    trackCompletion,
    trackSuccess
  };
}

// Dashboard analytics hook
export function useAnalyticsDashboard(autoRefresh = true, refreshInterval = 300000) {
  const [dashboardData, setDashboardData] = useState<AnalyticsState<TemplateAnalyticsDashboard>>({
    data: null,
    loading: false,
    error: null
  });
  
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const loadDashboard = useCallback(async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getAnalyticsDashboard();
      setDashboardData({ data, loading: false, error: null });
    } catch (error) {
      setDashboardData({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard'
      });
    }
  }, []);

  const loadAlerts = useCallback(async (severity?: 'critical' | 'warning' | 'info') => {
    try {
      const data = await templateAnalyticsService.getRealTimeAlerts(severity);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await templateAnalyticsService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadDashboard(), loadAlerts()]);
  }, [loadDashboard, loadAlerts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refresh, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    dashboard: dashboardData.data,
    alerts,
    loading: dashboardData.loading,
    error: dashboardData.error,
    refresh,
    acknowledgeAlert
  };
}

// User segment analytics hook
export function useUserSegmentAnalytics(segmentBy: 'industry' | 'company_size' | 'technical_level' | 'geography' = 'industry') {
  const [segmentData, setSegmentData] = useState<AnalyticsState<UserSegmentAnalytics[]>>({
    data: null,
    loading: false,
    error: null
  });

  const loadSegmentData = useCallback(async () => {
    setSegmentData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getUserSegmentAnalytics(segmentBy);
      setSegmentData({ data, loading: false, error: null });
    } catch (error) {
      setSegmentData({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load segment data'
      });
    }
  }, [segmentBy]);

  useEffect(() => {
    loadSegmentData();
  }, [loadSegmentData]);

  return {
    segments: segmentData.data,
    loading: segmentData.loading,
    error: segmentData.error,
    refresh: loadSegmentData
  };
}

// Cohort analysis hook
export function useCohortAnalysis(startDate?: string, endDate?: string, groupBy: 'week' | 'month' = 'week') {
  const [cohortData, setCohortData] = useState<AnalyticsState<CohortAnalysis[]>>({
    data: null,
    loading: false,
    error: null
  });

  const loadCohortData = useCallback(async () => {
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    setCohortData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getCohortAnalysis(start, end, groupBy);
      setCohortData({ data, loading: false, error: null });
    } catch (error) {
      setCohortData({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load cohort data'
      });
    }
  }, [startDate, endDate, groupBy]);

  useEffect(() => {
    loadCohortData();
  }, [loadCohortData]);

  return {
    cohorts: cohortData.data,
    loading: cohortData.loading,
    error: cohortData.error,
    refresh: loadCohortData
  };
}

// Template comparison hook
export function useTemplateComparison() {
  const [comparisonData, setComparisonData] = useState<AnalyticsState<TemplateComparisonData[]>>({
    data: null,
    loading: false,
    error: null
  });

  const compareTemplates = useCallback(async (
    templateIds: number[],
    metrics: Array<'adoption' | 'success' | 'satisfaction' | 'technical'> = ['adoption', 'success']
  ) => {
    setComparisonData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.compareTemplates(templateIds, metrics);
      setComparisonData({ data, loading: false, error: null });
    } catch (error) {
      setComparisonData({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to compare templates'
      });
    }
  }, []);

  return {
    comparison: comparisonData.data,
    loading: comparisonData.loading,
    error: comparisonData.error,
    compare: compareTemplates
  };
}

// Bulk analytics hook for multiple templates
export function useBulkTemplateAnalytics(
  templateIds: number[],
  metrics: Array<'adoption' | 'success' | 'trends' | 'optimization'> = ['adoption', 'success'],
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) {
  const [bulkData, setBulkData] = useState<AnalyticsState<Record<number, any>>>({
    data: null,
    loading: false,
    error: null
  });

  const loadBulkData = useCallback(async () => {
    if (templateIds.length === 0) return;
    
    setBulkData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await templateAnalyticsService.getBulkAnalytics(templateIds, metrics, timeRange);
      setBulkData({ data, loading: false, error: null });
    } catch (error) {
      setBulkData({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load bulk analytics'
      });
    }
  }, [templateIds, metrics, timeRange]);

  useEffect(() => {
    loadBulkData();
  }, [loadBulkData]);

  return {
    analytics: bulkData.data,
    loading: bulkData.loading,
    error: bulkData.error,
    refresh: loadBulkData
  };
}