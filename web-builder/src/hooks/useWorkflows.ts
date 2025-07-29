/**
 * Workflows Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/lib/api/services';
import type { 
  Workflow, 
  WorkflowCreate, 
  WorkflowUpdate, 
  WorkflowExecution,
  PaginatedResponse,
  LoadingState 
} from '@/lib/api/types';

interface UseWorkflowsReturn extends LoadingState {
  workflows: Workflow[];
  totalWorkflows: number;
  currentPage: number;
  totalPages: number;
  refreshWorkflows: () => Promise<void>;
  loadMore: () => Promise<void>;
  createWorkflow: (workflowData: WorkflowCreate) => Promise<Workflow>;
  updateWorkflow: (workflowId: number, workflowData: WorkflowUpdate) => Promise<Workflow>;
  deleteWorkflow: (workflowId: number) => Promise<void>;
  duplicateWorkflow: (workflowId: number, name?: string) => Promise<Workflow>;
  executeWorkflow: (workflowId: number, triggerData?: any) => Promise<WorkflowExecution>;
  activateWorkflow: (workflowId: number) => Promise<Workflow>;
  deactivateWorkflow: (workflowId: number) => Promise<Workflow>;
}

interface UseWorkflowsOptions {
  filters?: {
    status?: string;
    search?: string;
  };
  autoLoad?: boolean;
  pageSize?: number;
}

export function useWorkflows(options: UseWorkflowsOptions = {}): UseWorkflowsReturn {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 20
  } = options;

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await workflowService.getWorkflows({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize
      });

      if (append) {
        setWorkflows(prev => [...prev, ...response.items]);
      } else {
        setWorkflows(response.items);
      }

      setTotalWorkflows(response.total);
      setCurrentPage(page);
      setTotalPages(response.pages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load workflows';
      setError(errorMessage);
      console.error('Load workflows error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  const refreshWorkflows = useCallback((): Promise<void> => {
    return loadWorkflows(1, false);
  }, [loadWorkflows]);

  const loadMore = useCallback((): Promise<void> => {
    if (currentPage < totalPages) {
      return loadWorkflows(currentPage + 1, true);
    }
    return Promise.resolve();
  }, [loadWorkflows, currentPage, totalPages]);

  const createWorkflow = useCallback(async (workflowData: WorkflowCreate): Promise<Workflow> => {
    try {
      setIsLoading(true);
      setError(null);

      const newWorkflow = await workflowService.createWorkflow(workflowData);
      
      // Add to the beginning of the list
      setWorkflows(prev => [newWorkflow, ...prev]);
      setTotalWorkflows(prev => prev + 1);

      return newWorkflow;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWorkflow = useCallback(async (
    workflowId: number, 
    workflowData: WorkflowUpdate
  ): Promise<Workflow> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedWorkflow = await workflowService.updateWorkflow(workflowId, workflowData);
      
      // Update in the list
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId ? updatedWorkflow : workflow
      ));

      return updatedWorkflow;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWorkflow = useCallback(async (workflowId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await workflowService.deleteWorkflow(workflowId);
      
      // Remove from the list
      setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
      setTotalWorkflows(prev => prev - 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateWorkflow = useCallback(async (
    workflowId: number, 
    name?: string
  ): Promise<Workflow> => {
    try {
      setIsLoading(true);
      setError(null);

      const duplicatedWorkflow = await workflowService.duplicateWorkflow(workflowId, name);
      
      // Add to the beginning of the list
      setWorkflows(prev => [duplicatedWorkflow, ...prev]);
      setTotalWorkflows(prev => prev + 1);

      return duplicatedWorkflow;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to duplicate workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeWorkflow = useCallback(async (
    workflowId: number, 
    triggerData?: any
  ): Promise<WorkflowExecution> => {
    try {
      setError(null);

      const execution = await workflowService.executeWorkflow(workflowId, triggerData);
      
      // Update execution count in the workflow
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, execution_count: workflow.execution_count + 1 }
          : workflow
      ));

      return execution;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to execute workflow';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const activateWorkflow = useCallback(async (workflowId: number): Promise<Workflow> => {
    try {
      setError(null);

      const activatedWorkflow = await workflowService.activateWorkflow(workflowId);
      
      // Update in the list
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId ? activatedWorkflow : workflow
      ));

      return activatedWorkflow;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to activate workflow';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deactivateWorkflow = useCallback(async (workflowId: number): Promise<Workflow> => {
    try {
      setError(null);

      const deactivatedWorkflow = await workflowService.deactivateWorkflow(workflowId);
      
      // Update in the list
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId ? deactivatedWorkflow : workflow
      ));

      return deactivatedWorkflow;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to deactivate workflow';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load workflows on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadWorkflows();
    }
  }, [autoLoad, loadWorkflows]);

  // Reload when filters change
  useEffect(() => {
    if (autoLoad) {
      loadWorkflows(1, false);
    }
  }, [filters, autoLoad, loadWorkflows]);

  return {
    workflows,
    totalWorkflows,
    currentPage,
    totalPages,
    isLoading,
    error,
    refreshWorkflows,
    loadMore,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    executeWorkflow,
    activateWorkflow,
    deactivateWorkflow
  };
}

// Hook for single workflow
export function useWorkflow(workflowId: number | null) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflow = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const workflowData = await workflowService.getWorkflow(id);
      setWorkflow(workflowData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load workflow';
      setError(errorMessage);
      console.error('Load workflow error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    } else {
      setWorkflow(null);
    }
  }, [workflowId, loadWorkflow]);

  return {
    workflow,
    isLoading,
    error,
    refreshWorkflow: () => workflowId ? loadWorkflow(workflowId) : Promise.resolve()
  };
}

// Hook for workflow executions
export function useWorkflowExecutions(workflowId: number | null) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExecutions = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await workflowService.getWorkflowExecutions(id, { limit: 50 });
      setExecutions(response.items);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load workflow executions';
      setError(errorMessage);
      console.error('Load workflow executions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadExecutions(workflowId);
    } else {
      setExecutions([]);
    }
  }, [workflowId, loadExecutions]);

  return {
    executions,
    isLoading,
    error,
    refreshExecutions: () => workflowId ? loadExecutions(workflowId) : Promise.resolve()
  };
}