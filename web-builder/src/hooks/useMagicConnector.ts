/**
 * Magic Connector Hook
 * 
 * React hook for managing Magic Connector functionality throughout the application
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';
import { 
  magicConnector, 
  MagicConnectorAnalysis, 
  MagicConnectorSuggestion,
  WorkflowConnection,
  MagicConnectorContext 
} from '@/lib/ai/magic-connector';

interface UseMagicConnectorOptions {
  autoAnalyze?: boolean;
  debounceMs?: number;
  cacheResults?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface UseMagicConnectorReturn {
  // Analysis state
  analyses: Map<string, MagicConnectorAnalysis>;
  currentAnalysis: MagicConnectorAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Workflow connections
  connections: WorkflowConnection[];
  activeConnections: WorkflowConnection[];
  
  // Canvas-wide insights
  canvasInsights: {
    totalSuggestions: number;
    highPrioritySuggestions: number;
    automationPotential: number;
    estimatedTimesSaved: string;
    estimatedConversionIncrease: string;
  };
  
  // Actions
  analyzeComponent: (component: ComponentData, context?: MagicConnectorContext) => Promise<MagicConnectorAnalysis>;
  analyzeAllComponents: (context?: MagicConnectorContext) => Promise<void>;
  connectWorkflow: (componentId: string, suggestion: MagicConnectorSuggestion) => Promise<WorkflowConnection>;
  disconnectWorkflow: (connectionId: string) => Promise<void>;
  refreshAnalysis: (componentId?: string) => Promise<void>;
  clearAnalyses: () => void;
  
  // Real-time monitoring
  startMonitoring: (componentId: string) => void;
  stopMonitoring: (componentId: string) => void;
  
  // Bulk operations
  connectAllHighPriority: () => Promise<WorkflowConnection[]>;
  generateCanvasReport: () => Promise<{
    summary: string;
    recommendations: string[];
    automationOpportunities: string[];
    performanceMetrics: Record<string, number>;
  }>;
}

export function useMagicConnector(options: UseMagicConnectorOptions = {}): UseMagicConnectorReturn {
  const {
    autoAnalyze = true,
    debounceMs = 500,
    cacheResults = true,
    enableRealTimeUpdates = false
  } = options;

  // State
  const [analyses, setAnalyses] = useState<Map<string, MagicConnectorAnalysis>>(new Map());
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [monitoredComponents, setMonitoredComponents] = useState<Set<string>>(new Set());

  // Builder store
  const { components, selectedComponentId, getSelectedComponent } = useBuilderStore();

  // Current analysis for selected component
  const currentAnalysis = useMemo(() => {
    if (!selectedComponentId) return null;
    return analyses.get(selectedComponentId) || null;
  }, [selectedComponentId, analyses]);

  // Active connections (status = 'active' or 'connected')
  const activeConnections = useMemo(() => {
    return connections.filter(conn => 
      conn.status === 'active' || conn.status === 'connected'
    );
  }, [connections]);

  // Canvas-wide insights
  const canvasInsights = useMemo(() => {
    const allSuggestions = Array.from(analyses.values())
      .flatMap(analysis => analysis.suggestions);
    
    const highPrioritySuggestions = allSuggestions.filter(s => s.priority === 'high');
    
    const automationPotential = Array.from(analyses.values())
      .reduce((total, analysis) => total + analysis.performancePredictions.automationPotential, 0) / 
      Math.max(analyses.size, 1);

    // Calculate estimated savings from all suggestions
    const timesSaved = allSuggestions
      .map(s => parseFloat(s.estimatedImpact.timesSaved.replace(/[^\d.]/g, '')))
      .reduce((total, hours) => total + (hours || 0), 0);

    const conversionIncrease = allSuggestions
      .map(s => parseFloat(s.estimatedImpact.conversionIncrease.replace(/[^\d.]/g, '')))
      .reduce((total, increase) => total + (increase || 0), 0) / Math.max(allSuggestions.length, 1);

    return {
      totalSuggestions: allSuggestions.length,
      highPrioritySuggestions: highPrioritySuggestions.length,
      automationPotential: Math.round(automationPotential * 100),
      estimatedTimesSaved: `${Math.round(timesSaved)} hours/week`,
      estimatedConversionIncrease: `+${Math.round(conversionIncrease)}%`
    };
  }, [analyses]);

  // Debounced analysis function
  const analyzeComponent = useCallback(async (
    component: ComponentData, 
    context?: MagicConnectorContext
  ): Promise<MagicConnectorAnalysis> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Enhanced context with current page state
      const enhancedContext: MagicConnectorContext = {
        pageContent: components.map(c => c.name).join(' '),
        businessType: 'general', // Could be inferred or set by user
        industry: 'technology', // Could be detected from content
        userBehavior: {
          scrollDepth: 75,
          timeOnPage: Date.now(),
          previousActions: ['component_select', 'analysis_request']
        },
        existingWorkflows: activeConnections.map(c => c.workflowId),
        ...context
      };

      const analysis = await magicConnector.analyzeComponent(component, enhancedContext);
      
      if (cacheResults) {
        setAnalyses(prev => new Map(prev).set(component.id, analysis));
      }
      
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisError(errorMessage);
      console.error('Magic Connector analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [components, activeConnections, cacheResults]);

  // Analyze all components
  const analyzeAllComponents = useCallback(async (context?: MagicConnectorContext) => {
    if (components.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const analysisPromises = components.map(component => 
        analyzeComponent(component, context)
      );

      const results = await Promise.allSettled(analysisPromises);
      
      // Filter successful results
      const successfulAnalyses = results
        .filter((result): result is PromiseFulfilledResult<MagicConnectorAnalysis> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      // Update analyses map
      setAnalyses(prev => {
        const newMap = new Map(prev);
        successfulAnalyses.forEach(analysis => {
          newMap.set(analysis.componentId, analysis);
        });
        return newMap;
      });

      // Check for failed analyses
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} component analyses failed`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch analysis failed';
      setAnalysisError(errorMessage);
      console.error('Batch analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [components, analyzeComponent]);

  // Connect workflow
  const connectWorkflow = useCallback(async (
    componentId: string, 
    suggestion: MagicConnectorSuggestion
  ): Promise<WorkflowConnection> => {
    try {
      const connection = await magicConnector.connectWorkflow(
        componentId, 
        suggestion.workflow.workflowId,
        { source: 'magic_connector_hook', suggestion: suggestion.title }
      );

      setConnections(prev => [...prev, connection]);

      // Update component in builder store
      useBuilderStore.getState().connectToWorkflow(componentId, suggestion.workflow.workflowId);

      return connection;
    } catch (error) {
      console.error('Failed to connect workflow:', error);
      throw error;
    }
  }, []);

  // Disconnect workflow
  const disconnectWorkflow = useCallback(async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Remove from connections
      setConnections(prev => prev.filter(c => c.id !== connectionId));

      // Update component in builder store
      useBuilderStore.getState().disconnectFromWorkflow(connection.componentId);

    } catch (error) {
      console.error('Failed to disconnect workflow:', error);
      throw error;
    }
  }, [connections]);

  // Refresh analysis
  const refreshAnalysis = useCallback(async (componentId?: string) => {
    if (componentId) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        await analyzeComponent(component);
      }
    } else {
      await analyzeAllComponents();
    }
  }, [components, analyzeComponent, analyzeAllComponents]);

  // Clear analyses
  const clearAnalyses = useCallback(() => {
    setAnalyses(new Map());
    setAnalysisError(null);
  }, []);

  // Real-time monitoring
  const startMonitoring = useCallback((componentId: string) => {
    setMonitoredComponents(prev => new Set(prev).add(componentId));
  }, []);

  const stopMonitoring = useCallback((componentId: string) => {
    setMonitoredComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
  }, []);

  // Bulk operations
  const connectAllHighPriority = useCallback(async (): Promise<WorkflowConnection[]> => {
    const highPrioritySuggestions = Array.from(analyses.values())
      .flatMap(analysis => 
        analysis.suggestions
          .filter(s => s.priority === 'high' && s.oneClickSetup)
          .map(s => ({ componentId: analysis.componentId, suggestion: s }))
      );

    const connectionPromises = highPrioritySuggestions.map(({ componentId, suggestion }) =>
      connectWorkflow(componentId, suggestion)
    );

    try {
      const newConnections = await Promise.all(connectionPromises);
      return newConnections;
    } catch (error) {
      console.error('Failed to connect all high priority workflows:', error);
      throw error;
    }
  }, [analyses, connectWorkflow]);

  // Generate canvas report
  const generateCanvasReport = useCallback(async () => {
    const canvasAnalysis = await magicConnector.analyzeCanvas(components);

    return {
      summary: `Analyzed ${components.length} components with ${canvasInsights.totalSuggestions} workflow suggestions (${canvasInsights.highPrioritySuggestions} high-priority). Estimated automation potential: ${canvasInsights.automationPotential}%`,
      recommendations: canvasAnalysis.funnelOptimizations,
      automationOpportunities: Array.from(analyses.values())
        .flatMap(analysis => analysis.automationOpportunities),
      performanceMetrics: {
        totalComponents: components.length,
        analyzedComponents: analyses.size,
        totalSuggestions: canvasInsights.totalSuggestions,
        highPrioritySuggestions: canvasInsights.highPrioritySuggestions,
        activeConnections: activeConnections.length,
        automationPotential: canvasInsights.automationPotential
      }
    };
  }, [components, canvasInsights, analyses, activeConnections]);

  // Auto-analyze when components change
  useEffect(() => {
    if (!autoAnalyze || components.length === 0) return;

    // Debounce the analysis
    const timeoutId = setTimeout(() => {
      // Only analyze new components that haven't been analyzed yet
      const unanalyzedComponents = components.filter(component => 
        !analyses.has(component.id)
      );

      if (unanalyzedComponents.length > 0) {
        // Analyze new components individually to avoid overwhelming the system
        unanalyzedComponents.slice(0, 3).forEach(component => {
          analyzeComponent(component).catch(error => {
            console.warn(`Failed to auto-analyze component ${component.id}:`, error);
          });
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [components, autoAnalyze, debounceMs, analyses, analyzeComponent]);

  // Real-time monitoring effect
  useEffect(() => {
    if (!enableRealTimeUpdates || monitoredComponents.size === 0) return;

    const intervalId = setInterval(async () => {
      for (const componentId of monitoredComponents) {
        try {
          await refreshAnalysis(componentId);
        } catch (error) {
          console.warn(`Real-time monitoring failed for component ${componentId}:`, error);
        }
      }
    }, 10000); // Monitor every 10 seconds

    return () => clearInterval(intervalId);
  }, [enableRealTimeUpdates, monitoredComponents, refreshAnalysis]);

  return {
    // State
    analyses,
    currentAnalysis,
    isAnalyzing,
    analysisError,
    connections,
    activeConnections,
    canvasInsights,
    
    // Actions
    analyzeComponent,
    analyzeAllComponents,
    connectWorkflow,
    disconnectWorkflow,
    refreshAnalysis,
    clearAnalyses,
    
    // Real-time monitoring
    startMonitoring,
    stopMonitoring,
    
    // Bulk operations
    connectAllHighPriority,
    generateCanvasReport
  };
}

// Convenience hook for a single component
export function useMagicConnectorForComponent(componentId: string | null) {
  const magicConnector = useMagicConnector({ autoAnalyze: false });
  const { components } = useBuilderStore();
  
  const component = useMemo(() => 
    componentId ? components.find(c => c.id === componentId) : null,
    [componentId, components]
  );

  const analysis = useMemo(() => 
    componentId ? magicConnector.analyses.get(componentId) : null,
    [componentId, magicConnector.analyses]
  );

  const analyze = useCallback(async () => {
    if (component) {
      return await magicConnector.analyzeComponent(component);
    }
    return null;
  }, [component, magicConnector.analyzeComponent]);

  return {
    component,
    analysis,
    analyze,
    isAnalyzing: magicConnector.isAnalyzing,
    error: magicConnector.analysisError,
    connectWorkflow: magicConnector.connectWorkflow,
    refreshAnalysis: () => magicConnector.refreshAnalysis(componentId || undefined)
  };
}

export default useMagicConnector;