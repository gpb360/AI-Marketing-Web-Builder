/**
 * Project API Service
 */

import apiClient from '../client';
import type { 
  Project, 
  ProjectCreate, 
  ProjectUpdate,
  ProjectFilters,
  PaginatedResponse 
} from '../types';

export class ProjectService {
  /**
   * Get user's projects with optional filters
   */
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.template) params.append('template', filters.template);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const query = params.toString();
      const url = query ? `/projects?${query}` : '/projects';
      
      return await apiClient.get<PaginatedResponse<Project>>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    try {
      return await apiClient.get<Project>(`/projects/${projectId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: ProjectCreate): Promise<Project> {
    try {
      return await apiClient.post<Project>('/projects', projectData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    try {
      return await apiClient.put<Project>(`/projects/${projectId}`, updates);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${projectId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicate a project
   */
  async duplicateProject(projectId: string, newName?: string): Promise<Project> {
    try {
      return await apiClient.post<Project>(`/projects/${projectId}/duplicate`, {
        name: newName
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save project components (autosave)
   */
  async saveProjectComponents(projectId: string, components: any[]): Promise<Project> {
    try {
      return await apiClient.put<Project>(`/projects/${projectId}/components`, {
        components
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(projectId: string): Promise<{
    views: number;
    conversions: number;
    conversionRate: number;
    viewHistory: Array<{ date: string; views: number }>;
    conversionHistory: Array<{ date: string; conversions: number }>;
  }> {
    try {
      return await apiClient.get(`/projects/${projectId}/analytics`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Publish project
   */
  async publishProject(projectId: string, publishConfig?: {
    customDomain?: string;
    seoSettings?: Record<string, any>;
    performanceOptimization?: boolean;
  }): Promise<{
    success: boolean;
    taskId: string;
    publishedUrl?: string;
    message: string;
  }> {
    try {
      return await apiClient.post(`/projects/${projectId}/publish`, publishConfig || {});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unpublish project
   */
  async unpublishProject(projectId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post(`/projects/${projectId}/unpublish`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export project as static files
   */
  async exportProject(projectId: string, format: 'html' | 'zip' = 'zip'): Promise<Blob> {
    try {
      const response = await apiClient.client.get(`/projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create project from template
   */
  async createFromTemplate(templateId: string, projectName: string): Promise<Project> {
    try {
      return await apiClient.post<Project>('/projects/from-template', {
        templateId,
        name: projectName
      });
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const projectService = new ProjectService();

// Export for use in components and hooks
export default projectService;