/**
 * Templates API Service
 */

import apiClient from '../client';
import type { 
  Template, 
  TemplateCreate, 
  TemplateUpdate, 
  TemplateFilters,
  PaginatedResponse
} from '../types';
import { templateOptimizationApi, type OptimizationInsight, type PerformanceMetrics, type ABTest } from './template-optimization';

export class TemplateService {
  /**
   * Get all templates with optional filters
   */
  async getTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<Template>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.featured) params.append('featured', filters.featured.toString());
      if (filters?.premium) params.append('premium', filters.premium.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<PaginatedResponse<Template>>(`/templates?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit: number = 10): Promise<Template[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Template>>(`/templates/featured?limit=${limit}`);
      return response.items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: number): Promise<Template> {
    try {
      return await apiClient.get<Template>(`/templates/${templateId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(templateData: TemplateCreate): Promise<Template> {
    try {
      return await apiClient.post<Template>('/templates', templateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing template
   */
  async updateTemplate(templateId: number, templateData: TemplateUpdate): Promise<Template> {
    try {
      return await apiClient.put<Template>(`/templates/${templateId}`, templateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/templates/${templateId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId: number, name?: string): Promise<Template> {
    try {
      return await apiClient.post<Template>(`/templates/${templateId}/duplicate`, {
        name: name || `Copy of Template ${templateId}`
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      return await apiClient.get<Array<{ category: string; count: number }>>('/templates/categories');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string, limit?: number): Promise<Template[]> {
    try {
      const params = new URLSearchParams();
      params.append('category', category);
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get<PaginatedResponse<Template>>(`/templates?${params.toString()}`);
      return response.items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, filters?: Omit<TemplateFilters, 'search'>): Promise<Template[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.featured) params.append('featured', filters.featured.toString());
      if (filters?.premium) params.append('premium', filters.premium.toString());
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<PaginatedResponse<Template>>(`/templates?${params.toString()}`);
      return response.items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload template preview image
   */
  async uploadPreviewImage(templateId: number, imageFile: File): Promise<{ preview_image_url: string }> {
    try {
      return await apiClient.uploadFile(`/templates/${templateId}/preview`, imageFile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload template thumbnail
   */
  async uploadThumbnail(templateId: number, imageFile: File): Promise<{ thumbnail_url: string }> {
    try {
      return await apiClient.uploadFile(`/templates/${templateId}/thumbnail`, imageFile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get template usage analytics
   */
  async getTemplateAnalytics(templateId: number): Promise<{
    usage_count: number;
    conversion_rate: number;
    avg_completion_time: number;
    user_ratings: number;
  }> {
    try {
      return await apiClient.get(`/templates/${templateId}/analytics`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rate template
   */
  async rateTemplate(templateId: number, rating: number, review?: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/templates/${templateId}/rate`, {
        rating,
        review
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get template reviews
   */
  async getTemplateReviews(templateId: number): Promise<Array<{
    id: number;
    user: string;
    rating: number;
    review: string;
    created_at: string;
  }>> {
    try {
      return await apiClient.get(`/templates/${templateId}/reviews`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export template as JSON
   */
  async exportTemplate(templateId: number): Promise<Blob> {
    try {
      const response = await apiClient.client.get(`/templates/${templateId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import template from JSON
   */
  async importTemplate(templateFile: File): Promise<Template> {
    try {
      return await apiClient.uploadFile('/templates/import', templateFile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get optimization insights for template
   */
  async getOptimizationInsights(templateId: number): Promise<{ insights: OptimizationInsight[] }> {
    try {
      return await templateOptimizationApi.getOptimizationInsights(templateId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get performance metrics for template
   */
  async getPerformanceMetrics(templateId: number): Promise<{ metrics: PerformanceMetrics }> {
    try {
      return await templateOptimizationApi.getPerformanceMetrics(templateId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get A/B tests for template
   */
  async getABTests(templateId: number): Promise<{ tests: ABTest[] }> {
    try {
      return await templateOptimizationApi.getABTests(templateId);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const templateService = new TemplateService();

// Export for use in components and hooks
export default templateService;