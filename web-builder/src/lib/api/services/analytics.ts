/**
 * Analytics API Service
 * 
 * Service for communicating with the analytics API endpoints
 * Part of Story 3.3 - Performance Analytics Dashboard
 */

import { apiClient } from '../client';
import type {
  AnalyticsMetrics,
  WorkflowAnalytics,
  ABTestResults,
  ROIAnalytics,
  RealTimeMetrics,
  AlertThreshold,
  ExternalIntegration,
  ExportRequest,
  ExportJob,
  ScheduledReport,
  ReportTemplate,
  PaginatedResponse,
  APIError
} from '../types';

export class AnalyticsService {
  private readonly basePath = '/analytics';

  /**
   * Get comprehensive analytics overview
   */
  async getAnalyticsOverview(params?: {
    timeRange?: string;
    workflowId?: string;
  }): Promise<AnalyticsMetrics> {
    const response = await apiClient.get(`${this.basePath}/overview`, { params });
    return response.data;
  }

  /**
   * Get workflow-specific analytics
   */
  async getWorkflowAnalytics(
    workflowId: string,
    params?: {
      timeRange?: string;
      includeComparison?: boolean;
    }
  ): Promise<WorkflowAnalytics> {
    const response = await apiClient.get(`${this.basePath}/workflows/${workflowId}`, { params });
    return response.data;
  }

  /**
   * Get performance comparison data
   */
  async getPerformanceComparison(params: {
    versionA: string;
    versionB: string;
    workflowId?: string;
    timeRange?: string;
  }): Promise<{
    versionA: WorkflowAnalytics;
    versionB: WorkflowAnalytics;
    comparison: any;
  }> {
    const response = await apiClient.get(`${this.basePath}/comparison`, { params });
    return response.data;
  }

  /**
   * Get ROI analytics
   */
  async getROIAnalytics(params?: {
    timeRange?: string;
    workflowId?: string;
  }): Promise<ROIAnalytics> {
    const response = await apiClient.get(`${this.basePath}/roi`, { params });
    return response.data;
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await apiClient.get(`${this.basePath}/realtime`);
    return response.data;
  }

  /**
   * Subscribe to real-time updates via WebSocket
   */
  subscribeToRealTimeUpdates(callback: (data: RealTimeMetrics) => void): () => void {
    // WebSocket implementation for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/analytics`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => ws.close();
  }

  /**
   * A/B Testing Methods
   */
  async getABTests(): Promise<PaginatedResponse<ABTestResults>> {
    const response = await apiClient.get(`${this.basePath}/ab-tests`);
    return response.data;
  }

  async getABTest(testId: string): Promise<ABTestResults> {
    const response = await apiClient.get(`${this.basePath}/ab-tests/${testId}`);
    return response.data;
  }

  async createABTest(testData: {
    name: string;
    description: string;
    workflowId: string;
    variantA: any;
    variantB: any;
    trafficSplit: number;
    settings: any;
  }): Promise<ABTestResults> {
    const response = await apiClient.post(`${this.basePath}/ab-tests`, testData);
    return response.data;
  }

  async updateABTest(testId: string, updates: Partial<ABTestResults>): Promise<ABTestResults> {
    const response = await apiClient.patch(`${this.basePath}/ab-tests/${testId}`, updates);
    return response.data;
  }

  async startABTest(testId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`${this.basePath}/ab-tests/${testId}/start`);
    return response.data;
  }

  async stopABTest(testId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`${this.basePath}/ab-tests/${testId}/stop`);
    return response.data;
  }

  /**
   * Alert Management
   */
  async getAlertThresholds(): Promise<AlertThreshold[]> {
    const response = await apiClient.get(`${this.basePath}/alerts/thresholds`);
    return response.data;
  }

  async createAlertThreshold(threshold: Omit<AlertThreshold, 'id'>): Promise<AlertThreshold> {
    const response = await apiClient.post(`${this.basePath}/alerts/thresholds`, threshold);
    return response.data;
  }

  async updateAlertThreshold(id: string, updates: Partial<AlertThreshold>): Promise<AlertThreshold> {
    const response = await apiClient.patch(`${this.basePath}/alerts/thresholds/${id}`, updates);
    return response.data;
  }

  async deleteAlertThreshold(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.basePath}/alerts/thresholds/${id}`);
    return response.data;
  }

  async getActiveAlerts(): Promise<any[]> {
    const response = await apiClient.get(`${this.basePath}/alerts/active`);
    return response.data;
  }

  /**
   * External Integrations
   */
  async getExternalIntegrations(): Promise<ExternalIntegration[]> {
    const response = await apiClient.get(`${this.basePath}/integrations`);
    return response.data;
  }

  async createExternalIntegration(integration: Omit<ExternalIntegration, 'id' | 'status'>): Promise<ExternalIntegration> {
    const response = await apiClient.post(`${this.basePath}/integrations`, integration);
    return response.data;
  }

  async updateExternalIntegration(id: string, updates: Partial<ExternalIntegration>): Promise<ExternalIntegration> {
    const response = await apiClient.patch(`${this.basePath}/integrations/${id}`, updates);
    return response.data;
  }

  async testExternalIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.basePath}/integrations/${id}/test`);
    return response.data;
  }

  async syncExternalIntegration(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`${this.basePath}/integrations/${id}/sync`);
    return response.data;
  }

  /**
   * Report Management
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get(`${this.basePath}/reports/templates`);
    return response.data;
  }

  async createReportTemplate(template: Omit<ReportTemplate, 'id'>): Promise<ReportTemplate> {
    const response = await apiClient.post(`${this.basePath}/reports/templates`, template);
    return response.data;
  }

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response = await apiClient.get(`${this.basePath}/reports/scheduled`);
    return response.data;
  }

  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'status'>): Promise<ScheduledReport> {
    const response = await apiClient.post(`${this.basePath}/reports/scheduled`, report);
    return response.data;
  }

  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const response = await apiClient.patch(`${this.basePath}/reports/scheduled/${id}`, updates);
    return response.data;
  }

  /**
   * Export and Download
   */
  async createExport(request: ExportRequest): Promise<ExportJob> {
    const response = await apiClient.post(`${this.basePath}/export`, request);
    return response.data;
  }

  async getExportJobs(): Promise<ExportJob[]> {
    const response = await apiClient.get(`${this.basePath}/export/jobs`);
    return response.data;
  }

  async getExportJob(jobId: string): Promise<ExportJob> {
    const response = await apiClient.get(`${this.basePath}/export/jobs/${jobId}`);
    return response.data;
  }

  async downloadExport(jobId: string): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/export/jobs/${jobId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Configuration
   */
  async getAnalyticsConfiguration(): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/configuration`);
    return response.data;
  }

  async updateAnalyticsConfiguration(config: any): Promise<any> {
    const response = await apiClient.patch(`${this.basePath}/configuration`, config);
    return response.data;
  }

  /**
   * Historical Data
   */
  async getHistoricalTrends(params: {
    metric: string;
    timeRange: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<{ timestamp: string; value: number }[]> {
    const response = await apiClient.get(`${this.basePath}/trends`, { params });
    return response.data;
  }

  /**
   * Anomaly Detection
   */
  async getAnomalies(params?: {
    timeRange?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<any[]> {
    const response = await apiClient.get(`${this.basePath}/anomalies`, { params });
    return response.data;
  }

  /**
   * Performance Benchmarks
   */
  async getPerformanceBenchmarks(params?: {
    industry?: string;
    companySize?: string;
  }): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/benchmarks`, { params });
    return response.data;
  }
}

// Create and export singleton instance
export const analyticsService = new AnalyticsService();