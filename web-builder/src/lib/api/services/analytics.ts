/**
 * Analytics API Service for Story 3.3
 * Comprehensive workflow analytics, A/B testing, and performance monitoring
 */

import apiClient from '../client';
import type {
  AnalyticsResponse,
  RealTimeMetricsResponse,
  ABTestCreateRequest,
  ABTestResponse,
  ABTestResult,
  ExportRequest,
  ExportResponse,
  AnalyticsTimePeriod,
  ComprehensiveWorkflowAnalytics,
  RealTimeMetrics
} from '../types';

export class AnalyticsService {
  /**
   * Get comprehensive workflow analytics
   */
  async getWorkflowAnalytics(
    workflowId: number,
    params?: {
      time_period?: AnalyticsTimePeriod;
      include_predictions?: boolean;
      include_anomalies?: boolean;
    }
  ): Promise<AnalyticsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.time_period) searchParams.append('time_period', params.time_period);
      if (params?.include_predictions !== undefined) {
        searchParams.append('include_predictions', params.include_predictions.toString());
      }
      if (params?.include_anomalies !== undefined) {
        searchParams.append('include_anomalies', params.include_anomalies.toString());
      }

      const queryString = searchParams.toString();
      const url = `/analytics/workflows/${workflowId}/analytics${queryString ? `?${queryString}` : ''}`;
      
      return await apiClient.get<AnalyticsResponse>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get real-time performance metrics
   */
  async getRealTimeMetrics(workflowId: number): Promise<RealTimeMetricsResponse> {
    try {
      return await apiClient.get<RealTimeMetricsResponse>(
        `/analytics/workflows/${workflowId}/real-time-metrics`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get dashboard data for multiple workflows
   */
  async getMultiWorkflowDashboard(workflowIds: number[]): Promise<{
    status: string;
    workflows: Record<string, any>;
    summary: {
      total_workflows: number;
      total_executions: number;
      average_success_rate: number;
      last_updated: string;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      workflowIds.forEach(id => searchParams.append('workflow_ids', id.toString()));

      return await apiClient.get(`/analytics/dashboard/multi-workflow?${searchParams.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create A/B test experiment
   */
  async createABTest(
    workflowId: number,
    testRequest: ABTestCreateRequest
  ): Promise<ABTestResponse> {
    try {
      return await apiClient.post<ABTestResponse>(
        `/analytics/workflows/${workflowId}/ab-tests`,
        testRequest
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(
    testId: string,
    includeRawData: boolean = false
  ): Promise<ABTestResult> {
    try {
      const searchParams = new URLSearchParams();
      if (includeRawData) searchParams.append('include_raw_data', 'true');

      const queryString = searchParams.toString();
      const url = `/analytics/ab-tests/${testId}${queryString ? `?${queryString}` : ''}`;
      
      return await apiClient.get<ABTestResult>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Implement winning A/B test variant
   */
  async implementWinningVariant(
    testId: string,
    winningVariant: string
  ): Promise<{
    status: string;
    message: string;
    workflow_id: number;
    implemented_config: any;
    test_results_summary: any;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('winning_variant', winningVariant);

      return await apiClient.post(
        `/analytics/ab-tests/${testId}/implement-winner?${searchParams.toString()}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get variant assignment for user
   */
  async getVariantAssignment(
    workflowId: number,
    userId: string,
    testId: string
  ): Promise<{
    test_id: string;
    user_id: string;
    assigned_variant: string;
    assignment_timestamp: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('test_id', testId);

      return await apiClient.get(
        `/analytics/workflows/${workflowId}/variant-assignment/${userId}?${searchParams.toString()}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    workflowId: number,
    exportRequest: ExportRequest
  ): Promise<ExportResponse> {
    try {
      return await apiClient.post<ExportResponse>(
        `/analytics/workflows/${workflowId}/export`,
        exportRequest
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download exported file
   */
  async downloadExportFile(exportId: string): Promise<Blob> {
    try {
      // Use the raw axios client to get binary data
      const response = await apiClient.client.get(
        `/analytics/exports/${exportId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compare performance across time periods
   */
  async comparePerformancePeriods(
    workflowId: number,
    baselinePeriod: AnalyticsTimePeriod = AnalyticsTimePeriod.MONTH,
    comparisonPeriod: AnalyticsTimePeriod = AnalyticsTimePeriod.WEEK
  ): Promise<{
    baseline_period: string;
    comparison_period: string;
    baseline_metrics: any;
    comparison_metrics: any;
    performance_changes: {
      success_rate_change: number;
      avg_execution_time_change: number;
      throughput_change: number;
      roi_change: number;
    };
    insights: string[];
    analysis_timestamp: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('baseline_period', baselinePeriod);
      searchParams.append('comparison_period', comparisonPeriod);

      return await apiClient.get(
        `/analytics/workflows/${workflowId}/performance-comparison?${searchParams.toString()}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Health check for analytics service
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
    version: string;
  }> {
    try {
      return await apiClient.get('/analytics/health');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get analytics data with caching for dashboard performance
   */
  async getCachedAnalytics(
    workflowId: number,
    timePeriod: AnalyticsTimePeriod,
    cacheKey?: string
  ): Promise<ComprehensiveWorkflowAnalytics> {
    try {
      // In a real implementation, this would check local cache first
      // For now, directly fetch from API
      const response = await this.getWorkflowAnalytics(workflowId, {
        time_period: timePeriod,
        include_predictions: true,
        include_anomalies: true
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stream real-time metrics (for WebSocket integration)
   */
  async startRealTimeStream(
    workflowIds: number[],
    onMetricsUpdate: (data: Record<string, RealTimeMetrics>) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    try {
      // This would establish WebSocket connection in real implementation
      // For now, polling every 5 seconds
      let isActive = true;
      
      const poll = async () => {
        if (!isActive) return;
        
        try {
          const dashboard = await this.getMultiWorkflowDashboard(workflowIds);
          onMetricsUpdate(dashboard.workflows);
        } catch (error) {
          if (onError) onError(error as Error);
        }
        
        if (isActive) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      };
      
      poll(); // Start polling
      
      // Return cleanup function
      return () => {
        isActive = false;
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in components and hooks
export default analyticsService;