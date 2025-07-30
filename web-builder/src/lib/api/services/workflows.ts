/**
 * Workflows API Service
 */

import apiClient from '../client';
import type { 
  Workflow, 
  WorkflowCreate, 
  WorkflowUpdate, 
  WorkflowExecution,
  PaginatedResponse
} from '../types';

export class WorkflowService {
  /**
   * Get all workflows with pagination
   */
  async getWorkflows(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Workflow>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.skip) searchParams.append('skip', params.skip.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      return await apiClient.get<PaginatedResponse<Workflow>>(`/workflows?${searchParams.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: number): Promise<Workflow> {
    try {
      return await apiClient.get<Workflow>(`/workflows/${workflowId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(workflowData: WorkflowCreate): Promise<Workflow> {
    try {
      return await apiClient.post<Workflow>('/workflows', workflowData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(workflowId: number, workflowData: WorkflowUpdate): Promise<Workflow> {
    try {
      return await apiClient.put<Workflow>(`/workflows/${workflowId}`, workflowData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/workflows/${workflowId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicate workflow
   */
  async duplicateWorkflow(workflowId: number, name?: string): Promise<Workflow> {
    try {
      return await apiClient.post<Workflow>(`/workflows/${workflowId}/duplicate`, {
        name: name || `Copy of Workflow ${workflowId}`
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(workflowId: number, triggerData?: any): Promise<WorkflowExecution> {
    try {
      return await apiClient.post<WorkflowExecution>(`/workflows/${workflowId}/execute`, {
        trigger_data: triggerData
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(workflowId: number, params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<WorkflowExecution>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.skip) searchParams.append('skip', params.skip.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);

      return await apiClient.get<PaginatedResponse<WorkflowExecution>>(
        `/workflows/${workflowId}/executions?${searchParams.toString()}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single workflow execution
   */
  async getWorkflowExecution(workflowId: number, executionId: number): Promise<WorkflowExecution> {
    try {
      return await apiClient.get<WorkflowExecution>(`/workflows/${workflowId}/executions/${executionId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflowExecution(workflowId: number, executionId: number): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/workflows/${workflowId}/executions/${executionId}/cancel`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId: number): Promise<Workflow> {
    try {
      return await apiClient.post<Workflow>(`/workflows/${workflowId}/activate`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: number): Promise<Workflow> {
    try {
      return await apiClient.post<Workflow>(`/workflows/${workflowId}/deactivate`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Test workflow configuration
   */
  async testWorkflow(workflowData: WorkflowCreate, testData?: any): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      return await apiClient.post('/workflows/test', {
        workflow: workflowData,
        test_data: testData
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(workflowId: number, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    execution_count: number;
    success_rate: number;
    avg_execution_time: number;
    error_rate: number;
    trend_data: Array<{
      date: string;
      executions: number;
      successes: number;
      failures: number;
    }>;
  }> {
    try {
      return await apiClient.get(`/workflows/${workflowId}/analytics?timeframe=${timeframe}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available workflow templates
   */
  async getWorkflowTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    trigger_type: string;
    template: WorkflowCreate;
  }>> {
    try {
      return await apiClient.get('/workflows/templates');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(templateId: string, customizations?: Partial<WorkflowCreate>): Promise<Workflow> {
    try {
      return await apiClient.post<Workflow>(`/workflows/templates/${templateId}/create`, customizations);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow suggestions based on component
   */
  async getWorkflowSuggestions(componentId: string, componentType: string): Promise<Array<{
    name: string;
    description: string;
    confidence: number;
    workflow_template: WorkflowCreate;
  }>> {
    try {
      return await apiClient.post('/workflows/suggestions', {
        component_id: componentId,
        component_type: componentType
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate workflow configuration
   */
  async validateWorkflow(workflowData: WorkflowCreate): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      return await apiClient.post('/workflows/validate', workflowData);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const workflowService = new WorkflowService();

// Export for use in components and hooks
export default workflowService;