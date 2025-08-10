/**
 * Template Analytics Service
 * Comprehensive tracking and monitoring for template adoption and success rates
 */

import { apiClient } from '../client';
import type { TemplateCategory } from '../types';

// Core Analytics Types
export interface TemplateAdoptionMetrics {
  templateId: number;
  templateName: string;
  category: TemplateCategory;
  totalAdoptions: number;
  uniqueUsers: number;
  adoptionRate: number;
  timeToAdopt: number; // Average time from view to adoption (seconds)
  conversionFromView: number; // View-to-adoption conversion rate
  retentionRate: number; // 7-day retention after adoption
  customizationDepth: number; // Average number of modifications made
  completionRate: number; // Percentage who complete initial setup
  publishRate: number; // Percentage who publish after adoption
}

export interface TemplateSuccessMetrics {
  templateId: number;
  performanceScore: number; // Overall success score (0-100)
  userSatisfactionScore: number; // Average rating
  technicalPerformance: {
    loadTime: number;
    mobileResponsiveness: number;
    accessibilityScore: number;
    seoScore: number;
  };
  businessMetrics: {
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    goalCompletions: number;
  };
  engagementMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    returnVisitorRate: number;
    socialShares: number;
  };
}

export interface UserSegmentAnalytics {
  segment: string;
  totalUsers: number;
  adoptionPatterns: {
    preferredCategories: TemplateCategory[];
    avgTemplatesPerUser: number;
    customizationBehavior: 'light' | 'moderate' | 'heavy';
    timeToValue: number; // Days to first publish
  };
  successMetrics: {
    publishRate: number;
    avgPerformanceScore: number;
    retentionRate: number;
  };
}

export interface TemplateComparisonData {
  templateA: number;
  templateB: number;
  metrics: {
    adoptionRate: { a: number; b: number; winner: 'A' | 'B' | 'tie' };
    successRate: { a: number; b: number; winner: 'A' | 'B' | 'tie' };
    userSatisfaction: { a: number; b: number; winner: 'A' | 'B' | 'tie' };
    technicalScore: { a: number; b: number; winner: 'A' | 'B' | 'tie' };
  };
  recommendation: string;
  confidence: number;
}

export interface TemplatePerformanceTrend {
  templateId: number;
  timeRange: 'daily' | 'weekly' | 'monthly';
  dataPoints: Array<{
    date: string;
    adoptions: number;
    completions: number;
    publications: number;
    avgRating: number;
    performanceScore: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
  seasonalFactors?: Array<{
    factor: string;
    impact: number;
  }>;
}

export interface TemplateOptimizationSuggestions {
  templateId: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestions: Array<{
    category: 'design' | 'content' | 'technical' | 'ux';
    title: string;
    description: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
    dataSupport: string;
  }>;
  predictedImpact: {
    adoptionIncrease: number;
    successRateIncrease: number;
    satisfactionIncrease: number;
  };
}

export interface RealTimeAlert {
  id: string;
  templateId: number;
  type: 'adoption_spike' | 'adoption_drop' | 'success_decline' | 'rating_drop' | 'technical_issue';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  actionRequired?: string;
}

export interface TemplateAnalyticsDashboard {
  overview: {
    totalTemplates: number;
    totalAdoptions: number;
    avgSuccessRate: number;
    activeUsers: number;
    topPerformingCategory: TemplateCategory;
  };
  recentTrends: {
    adoptionTrend: 'up' | 'down' | 'stable';
    successTrend: 'up' | 'down' | 'stable';
    qualityTrend: 'up' | 'down' | 'stable';
  };
  topTemplates: Array<{
    id: number;
    name: string;
    adoptions: number;
    successRate: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  alerts: RealTimeAlert[];
  insights: string[];
}

export interface CohortAnalysis {
  cohortId: string;
  cohortDate: string;
  userCount: number;
  adoptionRates: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
    week12: number;
  };
  retentionRates: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
    week12: number;
  };
  avgTemplatesPerUser: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
    week12: number;
  };
}

export interface TemplateRecommendationAnalytics {
  templateId: number;
  recommendationScore: number;
  userFit: {
    demographicMatch: number;
    behaviorMatch: number;
    preferenceMatch: number;
  };
  contextualFactors: {
    industry: string;
    businessSize: string;
    technicalLevel: string;
    designPreference: string;
  };
  predictedSuccess: {
    adoptionProbability: number;
    completionProbability: number;
    satisfactionScore: number;
  };
}

export class TemplateAnalyticsService {
  /**
   * Get adoption metrics for a specific template
   */
  async getTemplateAdoptionMetrics(
    templateId: number,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<TemplateAdoptionMetrics> {
    try {
      return await apiClient.get(`/analytics/templates/${templateId}/adoption`, {
        params: { time_range: timeRange }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get success metrics for a template
   */
  async getTemplateSuccessMetrics(
    templateId: number,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<TemplateSuccessMetrics> {
    try {
      return await apiClient.get(`/analytics/templates/${templateId}/success`, {
        params: { time_range: timeRange }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get performance trends for a template
   */
  async getTemplatePerformanceTrends(
    templateId: number,
    timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly',
    period: '30d' | '90d' | '1y' = '90d'
  ): Promise<TemplatePerformanceTrend> {
    try {
      return await apiClient.get(`/analytics/templates/${templateId}/trends`, {
        params: { time_range: timeRange, period }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user segment analytics
   */
  async getUserSegmentAnalytics(
    segmentBy: 'industry' | 'company_size' | 'technical_level' | 'geography' = 'industry'
  ): Promise<UserSegmentAnalytics[]> {
    try {
      return await apiClient.get('/analytics/templates/segments', {
        params: { segment_by: segmentBy }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compare template performance
   */
  async compareTemplates(
    templateIds: number[],
    metrics: Array<'adoption' | 'success' | 'satisfaction' | 'technical'> = ['adoption', 'success']
  ): Promise<TemplateComparisonData[]> {
    try {
      return await apiClient.post('/analytics/templates/compare', {
        template_ids: templateIds,
        metrics
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get optimization suggestions for a template
   */
  async getOptimizationSuggestions(templateId: number): Promise<TemplateOptimizationSuggestions> {
    try {
      return await apiClient.get(`/analytics/templates/${templateId}/optimization`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get analytics dashboard overview
   */
  async getAnalyticsDashboard(): Promise<TemplateAnalyticsDashboard> {
    try {
      return await apiClient.get('/analytics/templates/dashboard');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get real-time alerts
   */
  async getRealTimeAlerts(severity?: 'critical' | 'warning' | 'info'): Promise<RealTimeAlert[]> {
    try {
      return await apiClient.get('/analytics/templates/alerts', {
        params: severity ? { severity } : {}
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.post(`/analytics/templates/alerts/${alertId}/acknowledge`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(
    startDate: string,
    endDate: string,
    groupBy: 'week' | 'month' = 'week'
  ): Promise<CohortAnalysis[]> {
    try {
      return await apiClient.get('/analytics/templates/cohorts', {
        params: { start_date: startDate, end_date: endDate, group_by: groupBy }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(
    userId?: number,
    templateId?: number
  ): Promise<TemplateRecommendationAnalytics[]> {
    try {
      return await apiClient.get('/analytics/templates/recommendations', {
        params: { user_id: userId, template_id: templateId }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track template adoption event
   */
  async trackAdoptionEvent(data: {
    templateId: number;
    userId: number;
    source: 'search' | 'recommendation' | 'category' | 'featured';
    context?: Record<string, any>;
  }): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/analytics/templates/events/adoption', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track template customization event
   */
  async trackCustomizationEvent(data: {
    templateId: number;
    userId: number;
    modificationType: 'content' | 'design' | 'layout' | 'style';
    modificationCount: number;
    timeSpent: number; // in seconds
  }): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/analytics/templates/events/customization', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track template completion event
   */
  async trackCompletionEvent(data: {
    templateId: number;
    userId: number;
    completionType: 'setup' | 'publish' | 'preview';
    timeSinceAdoption: number; // in seconds
    customizationsMade: number;
  }): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/analytics/templates/events/completion', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track template success event
   */
  async trackSuccessEvent(data: {
    templateId: number;
    userId: number;
    successType: 'conversion' | 'engagement' | 'retention' | 'rating';
    value: number;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/analytics/templates/events/success', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get aggregated analytics for multiple templates
   */
  async getBulkAnalytics(
    templateIds: number[],
    metrics: Array<'adoption' | 'success' | 'trends' | 'optimization'>,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<Record<number, any>> {
    try {
      return await apiClient.post('/analytics/templates/bulk', {
        template_ids: templateIds,
        metrics,
        time_range: timeRange
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    format: 'csv' | 'json' | 'xlsx',
    templateIds?: number[],
    dateRange?: { start: string; end: string }
  ): Promise<Blob> {
    try {
      const response = await apiClient.client.get('/analytics/templates/export', {
        params: {
          format,
          template_ids: templateIds?.join(','),
          ...dateRange
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get predictive analytics
   */
  async getPredictiveAnalytics(templateId: number): Promise<{
    futureAdoptions: { period: string; predicted: number; confidence: number }[];
    successPrediction: { score: number; factors: string[] };
    optimizationPotential: { current: number; potential: number; actions: string[] };
  }> {
    try {
      return await apiClient.get(`/analytics/templates/${templateId}/predictions`);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const templateAnalyticsService = new TemplateAnalyticsService();

// Export for use in components and hooks
export default templateAnalyticsService;