/**
 * Templates Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { templateService } from '@/lib/api/services';
import type { 
  Template, 
  TemplateCreate, 
  TemplateUpdate, 
  TemplateFilters,
  PaginatedResponse,
  LoadingState 
} from '@/lib/api/types';

interface UseTemplatesReturn extends LoadingState {
  templates: Template[];
  totalTemplates: number;
  currentPage: number;
  totalPages: number;
  refreshTemplates: () => Promise<void>;
  loadMore: () => Promise<void>;
  createTemplate: (templateData: TemplateCreate) => Promise<Template>;
  updateTemplate: (templateId: number, templateData: TemplateUpdate) => Promise<Template>;
  deleteTemplate: (templateId: number) => Promise<void>;
  duplicateTemplate: (templateId: number, name?: string) => Promise<Template>;
}

interface UseTemplatesOptions {
  filters?: TemplateFilters;
  autoLoad?: boolean;
  pageSize?: number;
}

export function useTemplates(options: UseTemplatesOptions = {}): UseTemplatesReturn {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 20
  } = options;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await templateService.getTemplates({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize
      });

      if (append) {
        setTemplates(prev => [...prev, ...response.items]);
      } else {
        setTemplates(response.items);
      }

      setTotalTemplates(response.total);
      setCurrentPage(page);
      setTotalPages(response.pages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load templates';
      setError(errorMessage);
      console.error('Load templates error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  const refreshTemplates = useCallback((): Promise<void> => {
    return loadTemplates(1, false);
  }, [loadTemplates]);

  const loadMore = useCallback((): Promise<void> => {
    if (currentPage < totalPages) {
      return loadTemplates(currentPage + 1, true);
    }
    return Promise.resolve();
  }, [loadTemplates, currentPage, totalPages]);

  const createTemplate = useCallback(async (templateData: TemplateCreate): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);

      const newTemplate = await templateService.createTemplate(templateData);
      
      // Add to the beginning of the list
      setTemplates(prev => [newTemplate, ...prev]);
      setTotalTemplates(prev => prev + 1);

      return newTemplate;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create template';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (
    templateId: number, 
    templateData: TemplateUpdate
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedTemplate = await templateService.updateTemplate(templateId, templateData);
      
      // Update in the list
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? updatedTemplate : template
      ));

      return updatedTemplate;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update template';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await templateService.deleteTemplate(templateId);
      
      // Remove from the list
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      setTotalTemplates(prev => prev - 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete template';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (
    templateId: number, 
    name?: string
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);

      const duplicatedTemplate = await templateService.duplicateTemplate(templateId, name);
      
      // Add to the beginning of the list
      setTemplates(prev => [duplicatedTemplate, ...prev]);
      setTotalTemplates(prev => prev + 1);

      return duplicatedTemplate;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to duplicate template';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadTemplates();
    }
  }, [autoLoad, loadTemplates]);

  // Reload when filters change
  useEffect(() => {
    if (autoLoad) {
      loadTemplates(1, false);
    }
  }, [filters, autoLoad, loadTemplates]);

  return {
    templates,
    totalTemplates,
    currentPage,
    totalPages,
    isLoading,
    error,
    refreshTemplates,
    loadMore,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate
  };
}

// Hook for single template
export function useTemplate(templateId: number | null) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const templateData = await templateService.getTemplate(id);
      setTemplate(templateData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load template';
      setError(errorMessage);
      console.error('Load template error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    } else {
      setTemplate(null);
    }
  }, [templateId, loadTemplate]);

  return {
    template,
    isLoading,
    error,
    refreshTemplate: () => templateId ? loadTemplate(templateId) : Promise.resolve()
  };
}

// Hook for featured templates
export function useFeaturedTemplates(limit: number = 10) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedTemplates = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const featuredTemplates = await templateService.getFeaturedTemplates(limit);
      setTemplates(featuredTemplates);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load featured templates';
      setError(errorMessage);
      console.error('Load featured templates error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFeaturedTemplates();
  }, [loadFeaturedTemplates]);

  return {
    templates,
    isLoading,
    error,
    refresh: loadFeaturedTemplates
  };
}