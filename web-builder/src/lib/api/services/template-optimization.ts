import { apiClient } from '../client';
import { Template } from '@/types/builder';

export interface OptimizationInsight {
  id: string;
  type: 'conversion' | 'engagement' | 'performance' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: string;
  effort: string;
  actionItems: string[];
}

export interface PerformanceMetrics {
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageViews: number;
  trends: {
    conversion: number;
    bounce: number;
    duration: number;
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  conversionRate: number;
  views: number;
  isWinner: boolean;
  isControl: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  variants: ABTestVariant[];
  requiredSampleSize: number;
  estimatedDurationDays: number;
}

export interface ContentSuggestion {
  id: string;
  type: string;
  suggestion: string;
  impact: string;
  category: string;
}

export interface ConversionPrediction {
  predictedConversionRate: number;
  confidenceScore: number;
  optimizationPotential: number;
  factors: Array<{
    name: string;
    impact: string;
  }>;
}

export interface PerformanceDashboard {
  templateInfo: {
    id: number;
    name: string;
    category: string;
    createdAt: string;
  };
  performanceMetrics: PerformanceMetrics;
  trends: any;
  optimizationOpportunities: any[];
  benchmarks: any;
  recommendations: any[];
}

export interface IndustryBenchmark {
  conversionRate: {
    avg: number;
    top10: number;
    bottom10: number;
  };
  bounceRate: {
    avg: number;
    top10: number;
    bottom10: number;
  };
  avgSessionDuration: {
    avg: number;
    top10: number;
    bottom10: number;
  };
  bestPractices: string[];
}

export const templateOptimizationApi = {
  // Optimization insights
  async getOptimizationInsights(templateId: number) {
    const response = await apiClient.get(
      `/optimization/templates/${templateId}/optimization-insights`
    );
    return response.data;
  },

  // Performance metrics
  async getPerformanceMetrics(templateId: number) {
    const response = await apiClient.get(
      `/optimization/templates/${templateId}/performance-dashboard`
    );
    return response.data;
  },

  // A/B Testing
  async createABTest(
    templateId: number,
    testConfig: {
      name: string;
      hypothesis: string;
      primaryMetric: string;
      variants: Array<{
        type: string;
        focus: string;
        description: string;
      }>;
    }
  ) {
    const response = await apiClient.post(
      `/optimization/templates/${templateId}/ab-tests`,
      testConfig
    );
    return response.data;
  },

  async startABTest(testId: number) {
    const response = await apiClient.post(
      `/optimization/ab-tests/${testId}/start`
    );
    return response.data;
  },

  async stopABTest(testId: number, reason?: string) {
    const response = await apiClient.post(
      `/optimization/ab-tests/${testId}/stop`,
      { reason }
    );
    return response.data;
  },

  async getABTestResults(testId: number) {
    const response = await apiClient.get(
      `/optimization/ab-tests/${testId}/results`
    );
    return response.data;
  },

  async recordTestEvent(
    testId: number,
    variantId: string,
    eventType: string,
    userId?: string,
    metadata?: any
  ) {
    const response = await apiClient.post(
      `/optimization/ab-tests/${testId}/events`,
      {
        variant_id: variantId,
        event_type: eventType,
        user_id: userId,
        metadata
      }
    );
    return response.data;
  },

  async getABTests(templateId: number) {
    const response = await apiClient.get(
      `/optimization/templates/${templateId}/ab-tests`
    );
    return response.data;
  },

  // Content suggestions
  async getContentSuggestions(
    templateId: number,
    industry: string = 'general',
    targetAudience: Record<string, any> = {}
  ) {
    const response = await apiClient.get(
      `/optimization/templates/${templateId}/content-suggestions`,
      {
        params: {
          industry,
          target_audience: JSON.stringify(targetAudience)
        }
      }
    );
    return response.data;
  },

  // Conversion prediction
  async getConversionPrediction(templateId: number) {
    const response = await apiClient.get(
      `/optimization/templates/${templateId}/conversion-prediction`
    );
    return response.data;
  },

  // Industry benchmarks
  async getIndustryBenchmarks(category: string) {
    const response = await apiClient.get(
      '/optimization/templates/optimization/benchmarks',
      { params: { category } }
    );
    return response.data;
  },

  // Batch operations
  async getAllOptimizationData(templateId: number) {
    const [
      insights,
      metrics,
      prediction,
      benchmarks
    ] = await Promise.all([
      this.getOptimizationInsights(templateId),
      this.getPerformanceMetrics(templateId),
      this.getConversionPrediction(templateId),
      this.getIndustryBenchmarks('landing_page')
    ]);

    return {
      insights,
      metrics,
      prediction,
      benchmarks
    };
  }
};