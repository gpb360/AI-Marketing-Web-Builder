/**
 * Custom hook for Scenario Modeling operations
 * 
 * Provides state management and API operations for scenario modeling functionality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type ScenarioModelingState,
  type ScenarioModelingActions,
  type UseScenarioModelingOptions,
  type UseScenarioModelingResult,
  type ScenarioModelingConfiguration,
  type ScenarioModelingRequest,
  type ScenarioModel,
  type ScenarioPrediction,
  type OptimizationRecommendation,
  type ScenarioSimulationResult,
  type ScenarioComparison,
  type HistoricalPerformanceData,
  type MultiDimensionalAnalysisResult,
  type ScenarioGenerationRequest,
  type PredictionRequest,
  type OptimizationRequest,
  type ScenarioSimulationRequest,
  type HistoricalPerformanceRequest,
  type MultiDimensionalAnalysisRequest
} from '@/lib/types/scenario-modeling';

// API endpoints
const API_BASE = '/api/v1/scenario-modeling';

// Initial state
const initialState: ScenarioModelingState = {
  configurations: [],
  scenarios: {},
  predictions: {},
  recommendations: {},
  simulationResults: {},
  loading: {
    configurations: false,
    scenarios: false,
    predictions: false,
    recommendations: false,
    simulation: false,
    analysis: false
  },
  errors: {}
};

/**
 * Custom hook for scenario modeling operations
 */
export const useScenarioModeling = (options: UseScenarioModelingOptions = {}): UseScenarioModelingResult => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealTimeUpdates = false,
    cacheResults = true,
    backgroundSync = false
  } = options;

  const [state, setState] = useState<ScenarioModelingState>(initialState);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to make API requests
  const makeRequest = useCallback(async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }, []);

  // Update loading state helper
  const updateLoading = useCallback((key: keyof ScenarioModelingState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
    
    // Update global loading
    if (value) {
      setGlobalLoading(true);
    } else {
      setTimeout(() => {
        setState(current => {
          const hasLoading = Object.values(current.loading).some(loading => loading);
          setGlobalLoading(hasLoading);
          return current;
        });
      }, 100);
    }
  }, []);

  // Update error state helper
  const updateError = useCallback((key: keyof ScenarioModelingState['errors'], error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
    
    if (error) {
      setGlobalError(error);
    } else {
      // Clear global error if no other errors
      setTimeout(() => {
        setState(current => {
          const hasErrors = Object.values(current.errors).some(err => err !== null && err !== undefined);
          setGlobalError(hasErrors ? Object.values(current.errors).find(err => err) || null : null);
          return current;
        });
      }, 100);
    }
  }, []);

  // Actions
  const actions: ScenarioModelingActions = {
    createConfiguration: useCallback(async (request: ScenarioModelingRequest): Promise<ScenarioModelingConfiguration> => {
      updateLoading('configurations', true);
      updateError('configurations', null);
      
      try {
        const response = await makeRequest<{ configuration_id: string }>('/configurations', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        // Fetch the created configuration
        const configuration = await makeRequest<ScenarioModelingConfiguration>(`/configurations/${response.configuration_id}`);
        
        setState(prev => ({
          ...prev,
          configurations: [...prev.configurations, configuration]
        }));
        
        return configuration;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create configuration';
        updateError('configurations', errorMessage);
        throw error;
      } finally {
        updateLoading('configurations', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    generateScenarios: useCallback(async (request: ScenarioGenerationRequest): Promise<ScenarioModel[]> => {
      updateLoading('scenarios', true);
      updateError('scenarios', null);
      
      try {
        await makeRequest(`/scenarios/generate`, {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        // Fetch generated scenarios
        const scenarios = await makeRequest<ScenarioModel[]>(`/scenarios/${request.configuration_id}`);
        
        setState(prev => ({
          ...prev,
          scenarios: {
            ...prev.scenarios,
            [request.configuration_id]: scenarios
          }
        }));
        
        return scenarios;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate scenarios';
        updateError('scenarios', errorMessage);
        throw error;
      } finally {
        updateLoading('scenarios', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    generatePredictions: useCallback(async (request: PredictionRequest): Promise<ScenarioPrediction[]> => {
      updateLoading('predictions', true);
      updateError('predictions', null);
      
      try {
        const response = await makeRequest<{ predictions: any[] }>('/predictions/generate', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        const predictions: ScenarioPrediction[] = [];
        
        // Fetch predictions for each scenario
        for (const scenarioId of request.scenario_ids) {
          const scenarioPredictions = await makeRequest<ScenarioPrediction[]>(`/predictions/${scenarioId}`);
          predictions.push(...scenarioPredictions);
          
          setState(prev => ({
            ...prev,
            predictions: {
              ...prev.predictions,
              [scenarioId]: scenarioPredictions
            }
          }));
        }
        
        return predictions;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate predictions';
        updateError('predictions', errorMessage);
        throw error;
      } finally {
        updateLoading('predictions', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    generateRecommendations: useCallback(async (request: OptimizationRequest): Promise<OptimizationRecommendation[]> => {
      updateLoading('recommendations', true);
      updateError('recommendations', null);
      
      try {
        await makeRequest('/recommendations/generate', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        // Fetch generated recommendations
        const recommendations = await makeRequest<OptimizationRecommendation[]>(`/recommendations/${request.configuration_id}`);
        
        setState(prev => ({
          ...prev,
          recommendations: {
            ...prev.recommendations,
            [request.configuration_id]: recommendations
          }
        }));
        
        return recommendations;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations';
        updateError('recommendations', errorMessage);
        throw error;
      } finally {
        updateLoading('recommendations', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    runSimulation: useCallback(async (request: ScenarioSimulationRequest): Promise<ScenarioSimulationResult> => {
      updateLoading('simulation', true);
      updateError('simulation', null);
      
      try {
        const result = await makeRequest<ScenarioSimulationResult>('/simulate', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        setState(prev => ({
          ...prev,
          simulationResults: {
            ...prev.simulationResults,
            [request.template_id]: [...(prev.simulationResults[request.template_id] || []), result]
          }
        }));
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to run simulation';
        updateError('simulation', errorMessage);
        throw error;
      } finally {
        updateLoading('simulation', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    compareScenarios: useCallback(async (configurationId: string): Promise<ScenarioComparison> => {
      updateLoading('analysis', true);
      updateError('analysis', null);
      
      try {
        const comparison = await makeRequest<ScenarioComparison>(`/scenarios/compare/${configurationId}`);
        return comparison;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to compare scenarios';
        updateError('analysis', errorMessage);
        throw error;
      } finally {
        updateLoading('analysis', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    analyzeHistoricalPerformance: useCallback(async (request: HistoricalPerformanceRequest): Promise<HistoricalPerformanceData> => {
      updateLoading('analysis', true);
      updateError('analysis', null);
      
      try {
        const analysis = await makeRequest<HistoricalPerformanceData>('/analysis/historical-performance', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        return analysis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze historical performance';
        updateError('analysis', errorMessage);
        throw error;
      } finally {
        updateLoading('analysis', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    runMultiDimensionalAnalysis: useCallback(async (request: MultiDimensionalAnalysisRequest): Promise<MultiDimensionalAnalysisResult> => {
      updateLoading('analysis', true);
      updateError('analysis', null);
      
      try {
        const analysis = await makeRequest<MultiDimensionalAnalysisResult>('/analysis/multi-dimensional', {
          method: 'POST',
          body: JSON.stringify(request)
        });
        
        return analysis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to run multi-dimensional analysis';
        updateError('analysis', errorMessage);
        throw error;
      } finally {
        updateLoading('analysis', false);
      }
    }, [makeRequest, updateLoading, updateError]),

    deleteConfiguration: useCallback(async (configurationId: string): Promise<void> => {
      updateLoading('configurations', true);
      updateError('configurations', null);
      
      try {
        await makeRequest(`/configurations/${configurationId}`, {
          method: 'DELETE'
        });
        
        setState(prev => ({
          ...prev,
          configurations: prev.configurations.filter(config => config.id !== configurationId),
          scenarios: {
            ...prev.scenarios,
            [configurationId]: undefined
          },
          recommendations: {
            ...prev.recommendations,
            [configurationId]: undefined
          }
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete configuration';
        updateError('configurations', errorMessage);
        throw error;
      } finally {
        updateLoading('configurations', false);
      }
    }, [makeRequest, updateLoading, updateError])
  };

  // Load initial data
  const loadConfigurations = useCallback(async () => {
    if (state.loading.configurations) return;
    
    updateLoading('configurations', true);
    updateError('configurations', null);
    
    try {
      const configurations = await makeRequest<ScenarioModelingConfiguration[]>('/configurations');
      
      setState(prev => ({
        ...prev,
        configurations
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load configurations';
      updateError('configurations', errorMessage);
    } finally {
      updateLoading('configurations', false);
    }
  }, [makeRequest, updateLoading, updateError, state.loading.configurations]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadConfigurations();
    // Could load other data here if needed
  }, [loadConfigurations]);

  // Reset state
  const reset = useCallback(() => {
    setState(initialState);
    setGlobalLoading(false);
    setGlobalError(null);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refresh, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    state,
    actions,
    loading: globalLoading,
    error: globalError,
    refresh,
    reset
  };
};

export default useScenarioModeling;