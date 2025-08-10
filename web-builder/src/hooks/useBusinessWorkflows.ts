/**
 * Custom hook for Business Workflow Customization operations
 * Story #106: Add action customization with business-specific integrations and messaging
 * 
 * Provides state management and API operations for AI-powered business workflow
 * customization with intelligent integrations and messaging personalization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import businessWorkflowService, {
  type BusinessAnalysisResult,
  type CustomizedWorkflowTemplate,
  type WorkflowInstantiationResult,
  type WorkflowSuccessInsights,
  type WebsiteAnalysisRequest,
  type TemplateGenerationRequest,
  type WorkflowInstantiationRequest,
  type OutcomePreview
} from '@/lib/api/services/business-workflows';
import type { WorkflowCategory } from '@/lib/api/types';

// Hook state interface
interface BusinessWorkflowState {
  businessAnalysis: BusinessAnalysisResult | null;
  customizedTemplates: CustomizedWorkflowTemplate[];
  instantiationResults: Record<string, WorkflowInstantiationResult>;
  successInsights: Record<number, WorkflowSuccessInsights>;
  outcomepreviews: Record<string, OutcomePreview>;
  
  // Loading states for different operations
  loading: {
    analysis: boolean;
    templates: boolean;
    instantiation: boolean;
    insights: boolean;
    preview: boolean;
  };
  
  // Error states
  errors: {
    analysis: string | null;
    templates: string | null;
    instantiation: string | null;
    insights: string | null;
    preview: string | null;
  };
  
  // Progress tracking
  progress: {
    analysisSteps: AnalysisStep[];
    currentStep: BusinessWorkflowStep;
  };
}

// Analysis step definition
interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}

// Business workflow process steps
type BusinessWorkflowStep = 
  | 'input' 
  | 'analysis' 
  | 'templates' 
  | 'customization' 
  | 'instantiation' 
  | 'success';

// Hook options interface
interface UseBusinessWorkflowsOptions {
  autoGenerateTemplates?: boolean;
  enablePreviewMode?: boolean;
  trackSuccess?: boolean;
  maxTemplatesPerCategory?: number;
  defaultCategories?: WorkflowCategory[];
  cacheResults?: boolean;
}

// Hook return interface
interface UseBusinessWorkflowsResult {
  // State
  state: BusinessWorkflowState;
  
  // Actions
  analyzeBusinessRequirements: (request: WebsiteAnalysisRequest) => Promise<BusinessAnalysisResult>;
  generateCustomizedTemplates: (request: TemplateGenerationRequest) => Promise<CustomizedWorkflowTemplate[]>;
  instantiateWorkflowTemplate: (request: WorkflowInstantiationRequest) => Promise<WorkflowInstantiationResult>;
  getWorkflowSuccessInsights: (workflowId: number, performancePeriodDays?: number) => Promise<WorkflowSuccessInsights>;
  previewTemplateOutcomes: (templateId: string, businessContext: any) => Promise<OutcomePreview>;
  
  // Utility actions
  resetWorkflow: () => void;
  setCurrentStep: (step: BusinessWorkflowStep) => void;
  validateBusinessAnalysis: (analysis: BusinessAnalysisResult) => { isValid: boolean; issues: string[] };
  calculateROI: (template: CustomizedWorkflowTemplate, analysis: BusinessAnalysisResult) => any;
  
  // Progress tracking
  updateAnalysisProgress: (stepId: string, progress: number, completed?: boolean) => void;
  
  // Global state
  isLoading: boolean;
  hasErrors: boolean;
  currentError: string | null;
}

// Default analysis steps
const DEFAULT_ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'content',
    title: 'Content Analysis',
    description: 'Analyzing website content and brand voice',
    completed: false,
    progress: 0
  },
  {
    id: 'classification',
    title: 'Business Classification', 
    description: 'Identifying industry and business model',
    completed: false,
    progress: 0
  },
  {
    id: 'maturity',
    title: 'Marketing Maturity',
    description: 'Assessing automation readiness',
    completed: false,
    progress: 0
  },
  {
    id: 'recommendations',
    title: 'Workflow Recommendations',
    description: 'Generating targeted workflow suggestions',
    completed: false,
    progress: 0
  }
];

// Initial state
const createInitialState = (): BusinessWorkflowState => ({
  businessAnalysis: null,
  customizedTemplates: [],
  instantiationResults: {},
  successInsights: {},
  outcomePreviews: {},
  
  loading: {
    analysis: false,
    templates: false,
    instantiation: false,
    insights: false,
    preview: false
  },
  
  errors: {
    analysis: null,
    templates: null,
    instantiation: null,
    insights: null,
    preview: null
  },
  
  progress: {
    analysisSteps: [...DEFAULT_ANALYSIS_STEPS],
    currentStep: 'input'
  }
});

/**
 * Custom hook for business workflow customization operations
 */
export const useBusinessWorkflows = (options: UseBusinessWorkflowsOptions = {}): UseBusinessWorkflowsResult => {
  const {
    autoGenerateTemplates = true,
    enablePreviewMode = true,
    trackSuccess = true,
    maxTemplatesPerCategory = 3,
    defaultCategories = ['marketing', 'sales', 'support'] as WorkflowCategory[],
    cacheResults = true
  } = options;
  
  const [state, setState] = useState<BusinessWorkflowState>(createInitialState());
  const cacheRef = useRef<Map<string, any>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Helper to update loading state
  const setLoading = useCallback((operation: keyof BusinessWorkflowState['loading'], loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [operation]: loading }
    }));
  }, []);
  
  // Helper to update error state
  const setError = useCallback((operation: keyof BusinessWorkflowState['errors'], error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [operation]: error }
    }));
  }, []);
  
  // Helper to get cached result
  const getCachedResult = useCallback(<T>(key: string): T | null => {
    if (!cacheResults) return null;
    return cacheRef.current.get(key) || null;
  }, [cacheResults]);
  
  // Helper to cache result
  const setCachedResult = useCallback(<T>(key: string, result: T): void => {
    if (!cacheResults) return;
    cacheRef.current.set(key, result);
  }, [cacheResults]);
  
  // Analyze business requirements
  const analyzeBusinessRequirements = useCallback(async (
    request: WebsiteAnalysisRequest
  ): Promise<BusinessAnalysisResult> => {
    const cacheKey = `analysis-${JSON.stringify(request)}`;
    const cached = getCachedResult<BusinessAnalysisResult>(cacheKey);
    if (cached) {
      setState(prev => ({ ...prev, businessAnalysis: cached }));
      return cached;
    }
    
    setLoading('analysis', true);
    setError('analysis', null);
    
    // Update current step
    setState(prev => ({
      ...prev,
      progress: { ...prev.progress, currentStep: 'analysis' }
    }));
    
    try {
      // Simulate analysis progress
      const steps = [...DEFAULT_ANALYSIS_STEPS];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            analysisSteps: prev.progress.analysisSteps.map((step, index) => ({
              ...step,
              progress: index <= i ? 100 : index === i + 1 ? 50 : 0,
              completed: index <= i
            }))
          }
        }));
      }
      
      // Perform actual analysis
      const result = await businessWorkflowService.analyzeBusinessRequirements(request);
      
      // Validate result quality
      const validation = businessWorkflowService.validateBusinessAnalysis(result);
      if (!validation.isValid) {
        throw new Error(`Analysis quality insufficient: ${validation.missingFields.join(', ')}`);
      }
      
      setState(prev => ({
        ...prev,
        businessAnalysis: result,
        progress: { ...prev.progress, currentStep: 'templates' }
      }));
      
      setCachedResult(cacheKey, result);
      
      // Auto-generate templates if enabled
      if (autoGenerateTemplates && result) {
        setTimeout(async () => {
          try {
            await generateCustomizedTemplates({
              business_analysis: result,
              categories: defaultCategories,
              max_templates_per_category: maxTemplatesPerCategory
            });
          } catch (error) {
            console.warn('Auto-template generation failed:', error);
          }
        }, 1000);
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Business analysis failed';
      setError('analysis', errorMessage);
      
      // Reset to input step on error
      setState(prev => ({
        ...prev,
        progress: { ...prev.progress, currentStep: 'input' }
      }));
      
      throw error;
    } finally {
      setLoading('analysis', false);
    }
  }, [
    getCachedResult, 
    setCachedResult, 
    setLoading, 
    setError, 
    autoGenerateTemplates,
    defaultCategories,
    maxTemplatesPerCategory
  ]);
  
  // Generate customized templates
  const generateCustomizedTemplates = useCallback(async (
    request: TemplateGenerationRequest
  ): Promise<CustomizedWorkflowTemplate[]> => {
    const cacheKey = `templates-${JSON.stringify(request)}`;
    const cached = getCachedResult<CustomizedWorkflowTemplate[]>(cacheKey);
    if (cached) {
      setState(prev => ({ ...prev, customizedTemplates: cached }));
      return cached;
    }
    
    setLoading('templates', true);
    setError('templates', null);
    
    try {
      const templates = await businessWorkflowService.generateCustomizedTemplates(request);
      
      // Validate template quality
      const validTemplates = templates.filter(template => {
        return template.success_probability >= 0.6 && // Minimum success probability
               template.estimated_setup_time <= 60 &&  // Maximum setup time
               template.nodes.length > 0;               // Must have nodes
      });
      
      if (validTemplates.length === 0) {
        throw new Error('No valid templates generated');
      }
      
      // Generate outcome previews if enabled
      if (enablePreviewMode) {
        for (const template of validTemplates) {
          try {
            const preview = await businessWorkflowService.previewTemplateOutcomes(
              template.template_id,
              request.business_analysis
            );
            
            setState(prev => ({
              ...prev,
              outcomePreviews: {
                ...prev.outcomePreviews,
                [template.template_id]: preview
              }
            }));
          } catch (error) {
            console.warn(`Preview generation failed for template ${template.template_id}:`, error);
          }
        }
      }
      
      setState(prev => ({
        ...prev,
        customizedTemplates: validTemplates,
        progress: { ...prev.progress, currentStep: 'customization' }
      }));
      
      setCachedResult(cacheKey, validTemplates);
      return validTemplates;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Template generation failed';
      setError('templates', errorMessage);
      throw error;
    } finally {
      setLoading('templates', false);
    }
  }, [getCachedResult, setCachedResult, setLoading, setError, enablePreviewMode]);
  
  // Instantiate workflow template
  const instantiateWorkflowTemplate = useCallback(async (
    request: WorkflowInstantiationRequest
  ): Promise<WorkflowInstantiationResult> => {
    setLoading('instantiation', true);
    setError('instantiation', null);
    
    try {
      const result = await businessWorkflowService.instantiateWorkflowTemplate(request);
      
      setState(prev => ({
        ...prev,
        instantiationResults: {
          ...prev.instantiationResults,
          [request.template_data.template_id]: result
        },
        progress: { ...prev.progress, currentStep: 'instantiation' }
      }));
      
      // Track success if enabled
      if (trackSuccess && result.workflow_id) {
        setTimeout(async () => {
          try {
            await getWorkflowSuccessInsights(result.workflow_id);
          } catch (error) {
            console.warn('Success tracking failed:', error);
          }
        }, 5000); // Track after 5 seconds
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Template instantiation failed';
      setError('instantiation', errorMessage);
      throw error;
    } finally {
      setLoading('instantiation', false);
    }
  }, [setLoading, setError, trackSuccess]);
  
  // Get workflow success insights
  const getWorkflowSuccessInsights = useCallback(async (
    workflowId: number,
    performancePeriodDays: number = 30
  ): Promise<WorkflowSuccessInsights> => {
    const cacheKey = `insights-${workflowId}-${performancePeriodDays}`;
    const cached = getCachedResult<WorkflowSuccessInsights>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        successInsights: { ...prev.successInsights, [workflowId]: cached }
      }));
      return cached;
    }
    
    setLoading('insights', true);
    setError('insights', null);
    
    try {
      const insights = await businessWorkflowService.getWorkflowSuccessInsights(
        workflowId,
        performancePeriodDays
      );
      
      setState(prev => ({
        ...prev,
        successInsights: { ...prev.successInsights, [workflowId]: insights }
      }));
      
      setCachedResult(cacheKey, insights);
      return insights;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Success insights retrieval failed';
      setError('insights', errorMessage);
      throw error;
    } finally {
      setLoading('insights', false);
    }
  }, [getCachedResult, setCachedResult, setLoading, setError]);
  
  // Preview template outcomes
  const previewTemplateOutcomes = useCallback(async (
    templateId: string,
    businessContext: any
  ): Promise<OutcomePreview> => {
    const cacheKey = `preview-${templateId}-${JSON.stringify(businessContext)}`;
    const cached = getCachedResult<OutcomePreview>(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        outcomePreviews: { ...prev.outcomePreviews, [templateId]: cached }
      }));
      return cached;
    }
    
    setLoading('preview', true);
    setError('preview', null);
    
    try {
      const preview = await businessWorkflowService.previewTemplateOutcomes(
        templateId,
        businessContext
      );
      
      setState(prev => ({
        ...prev,
        outcomePreviews: { ...prev.outcomePreviews, [templateId]: preview }
      }));
      
      setCachedResult(cacheKey, preview);
      return preview;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Outcome preview failed';
      setError('preview', errorMessage);
      throw error;
    } finally {
      setLoading('preview', false);
    }
  }, [getCachedResult, setCachedResult, setLoading, setError]);
  
  // Reset workflow state
  const resetWorkflow = useCallback(() => {
    setState(createInitialState());
    cacheRef.current.clear();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  // Set current step
  const setCurrentStep = useCallback((step: BusinessWorkflowStep) => {
    setState(prev => ({
      ...prev,
      progress: { ...prev.progress, currentStep: step }
    }));
  }, []);
  
  // Validate business analysis
  const validateBusinessAnalysis = useCallback((analysis: BusinessAnalysisResult) => {
    const validation = businessWorkflowService.validateBusinessAnalysis(analysis);
    return {
      isValid: validation.isValid,
      issues: validation.missingFields
    };
  }, []);
  
  // Calculate ROI
  const calculateROI = useCallback((
    template: CustomizedWorkflowTemplate,
    analysis: BusinessAnalysisResult
  ) => {
    return businessWorkflowService.calculateEstimatedROI(template, analysis);
  }, []);
  
  // Update analysis progress
  const updateAnalysisProgress = useCallback((
    stepId: string,
    progress: number,
    completed: boolean = false
  ) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        analysisSteps: prev.progress.analysisSteps.map(step =>
          step.id === stepId
            ? { ...step, progress, completed }
            : step
        )
      }
    }));
  }, []);
  
  // Compute derived state
  const isLoading = Object.values(state.loading).some(loading => loading);
  const hasErrors = Object.values(state.errors).some(error => error !== null);
  const currentError = Object.values(state.errors).find(error => error !== null) || null;
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    state,
    
    // Actions
    analyzeBusinessRequirements,
    generateCustomizedTemplates,
    instantiateWorkflowTemplate,
    getWorkflowSuccessInsights,
    previewTemplateOutcomes,
    
    // Utility actions
    resetWorkflow,
    setCurrentStep,
    validateBusinessAnalysis,
    calculateROI,
    updateAnalysisProgress,
    
    // Global state
    isLoading,
    hasErrors,
    currentError
  };
};

// Export hook and types
export default useBusinessWorkflows;
export type {
  BusinessWorkflowState,
  BusinessWorkflowStep,
  AnalysisStep,
  UseBusinessWorkflowsOptions,
  UseBusinessWorkflowsResult
};