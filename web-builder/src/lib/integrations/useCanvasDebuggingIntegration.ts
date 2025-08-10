/**
 * Canvas Debugging Integration Hook
 * 
 * Custom hook for Story 3.1: Visual Workflow Debugging
 * Provides Canvas-to-Debugger integration state and logic
 * 
 * Features:
 * - Canvas debugging state management
 * - Performance-optimized data transformations
 * - Event handling and panel management
 * - Integration with WorkflowDebugger component
 * 
 * @author Integration Coordinator - Story 3.1 Implementation
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import {
  transformCanvasComponentsToNodes,
  calculateCanvasDebuggerStats,
  validateDebuggerIntegration,
  createCanvasDebuggerEventHandlers,
  createThrottledDebuggerUpdate,
  memoizeDebuggerTransformation,
  generateDebuggerIntegrationKey,
  shouldEnableCanvasDebugger,
  type CanvasDebuggerNode,
  type CanvasDebuggerStats,
  type DebuggerIntegrationConfig,
  type CanvasDebuggerEvents
} from './canvas-debugging-integration';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CanvasDebuggingState {
  isPanelOpen: boolean;
  debuggingActive: boolean;
  selectedNodeId: string | null;
  lastUpdate: Date;
  panelWidth: number;
}

export interface CanvasDebuggingIntegrationResult {
  // State
  state: CanvasDebuggingState;
  
  // Computed data
  canvasNodes: CanvasDebuggerNode[];
  workflowNodeCount: number;
  canvasStats: CanvasDebuggerStats;
  integrationKey: string;
  
  // Validation
  isIntegrationValid: boolean;
  integrationErrors: string[];
  
  // Actions
  startDebugging: () => void;
  stopDebugging: () => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  selectNode: (nodeId: string | null) => void;
  executeWorkflow: (nodeIds?: string[]) => void;
  
  // Event handlers
  eventHandlers: Required<CanvasDebuggerEvents>;
  
  // Performance
  performanceMetrics: {
    transformationTime: number;
    lastRenderTime: number;
    updateCount: number;
  };
}

export interface UseCanvasDebuggingIntegrationOptions {
  enableDebugging?: boolean;
  workflowId?: number | null;
  config?: Partial<DebuggerIntegrationConfig>;
  eventHandlers?: Partial<CanvasDebuggerEvents>;
  performanceMode?: boolean;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useCanvasDebuggingIntegration({
  enableDebugging = false,
  workflowId = null,
  config = {},
  eventHandlers: customEventHandlers = {},
  performanceMode = true
}: UseCanvasDebuggingIntegrationOptions = {}): CanvasDebuggingIntegrationResult {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<CanvasDebuggingState>({
    isPanelOpen: false,
    debuggingActive: false,
    selectedNodeId: null,
    lastUpdate: new Date(),
    panelWidth: config.panelWidth || 320
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    transformationTime: 0,
    lastRenderTime: 0,
    updateCount: 0
  });
  
  // Refs for performance tracking
  const updateCountRef = useRef(0);
  const lastTransformTimeRef = useRef(0);
  
  // ============================================================================
  // STORE INTEGRATION
  // ============================================================================
  
  const { components } = useBuilderStore();
  
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  
  // Memoized transformation function for Canvas components
  const memoizedTransform = useMemo(() => {
    return memoizeDebuggerTransformation(
      transformCanvasComponentsToNodes,
      (components) => `components_${components.length}_${components.map(c => `${c.id}_${c.isConnectedToWorkflow}`).join('_')}`
    );
  }, []);
  
  // Throttled state update function
  const throttledStateUpdate = useMemo(() => {
    return createThrottledDebuggerUpdate((newState: Partial<CanvasDebuggingState>) => {
      setState(prev => ({ ...prev, ...newState, lastUpdate: new Date() }));
    }, performanceMode ? 100 : 50);
  }, [performanceMode]);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  // Canvas nodes transformation with performance tracking
  const canvasNodes = useMemo(() => {
    const startTime = performance.now();
    const nodes = memoizedTransform(components);
    const endTime = performance.now();
    
    lastTransformTimeRef.current = endTime - startTime;
    updateCountRef.current += 1;
    
    return nodes;
  }, [components, memoizedTransform]);
  
  // Workflow node count
  const workflowNodeCount = useMemo(() => {
    return canvasNodes.filter(node => node.isWorkflowNode).length;
  }, [canvasNodes]);
  
  // Canvas statistics
  const canvasStats = useMemo(() => {
    return calculateCanvasDebuggerStats(components);
  }, [components]);
  
  // Integration key for memoization
  const integrationKey = useMemo(() => {
    return generateDebuggerIntegrationKey(workflowId, components.length, workflowNodeCount);
  }, [workflowId, components.length, workflowNodeCount]);
  
  // Integration validation
  const integrationValidation = useMemo(() => {
    return validateDebuggerIntegration(workflowId, components);
  }, [workflowId, components]);
  
  // Should debugging be enabled
  const shouldEnable = useMemo(() => {
    return shouldEnableCanvasDebugger(enableDebugging, workflowId, workflowNodeCount);
  }, [enableDebugging, workflowId, workflowNodeCount]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const eventHandlers = useMemo(() => {
    return createCanvasDebuggerEventHandlers(workflowId, {
      ...customEventHandlers,
      onDebugStart: (id: number) => {
        throttledStateUpdate({ debuggingActive: true, isPanelOpen: true });
        customEventHandlers.onDebugStart?.(id);
      },
      onDebugStop: () => {
        throttledStateUpdate({ debuggingActive: false });
        customEventHandlers.onDebugStop?.();
      },
      onPanelToggle: (isOpen: boolean) => {
        throttledStateUpdate({ isPanelOpen: isOpen });
        customEventHandlers.onPanelToggle?.(isOpen);
      },
      onNodeSelect: (nodeId: string | null) => {
        throttledStateUpdate({ selectedNodeId: nodeId });
        customEventHandlers.onNodeSelect?.(nodeId);
      }
    });
  }, [workflowId, customEventHandlers, throttledStateUpdate]);
  
  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  
  const startDebugging = useCallback(() => {
    if (shouldEnable) {
      eventHandlers.onDebugStart(workflowId!);
    }
  }, [shouldEnable, eventHandlers, workflowId]);
  
  const stopDebugging = useCallback(() => {
    eventHandlers.onDebugStop();
  }, [eventHandlers]);
  
  const togglePanel = useCallback(() => {
    if (shouldEnable) {
      eventHandlers.onPanelToggle(!state.isPanelOpen);
    }
  }, [shouldEnable, eventHandlers, state.isPanelOpen]);
  
  const setPanelOpen = useCallback((open: boolean) => {
    if (shouldEnable) {
      eventHandlers.onPanelToggle(open);
    }
  }, [shouldEnable, eventHandlers]);
  
  const selectNode = useCallback((nodeId: string | null) => {
    eventHandlers.onNodeSelect(nodeId);
  }, [eventHandlers]);
  
  const executeWorkflow = useCallback((nodeIds?: string[]) => {
    if (workflowId) {
      const selectedNodes = nodeIds || canvasNodes
        .filter(node => node.isWorkflowNode)
        .map(node => node.id);
      eventHandlers.onWorkflowExecute(workflowId, selectedNodes);
    }
  }, [workflowId, canvasNodes, eventHandlers]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Auto-disable debugging when conditions are not met
  useEffect(() => {
    if (!shouldEnable && state.debuggingActive) {
      stopDebugging();
    }
  }, [shouldEnable, state.debuggingActive, stopDebugging]);
  
  // Update performance metrics
  useEffect(() => {
    setPerformanceMetrics(prev => ({
      transformationTime: lastTransformTimeRef.current,
      lastRenderTime: performance.now(),
      updateCount: updateCountRef.current
    }));
  }, [canvasNodes, canvasStats]);
  
  // ============================================================================
  // RETURN VALUE
  // ============================================================================
  
  return {
    // State
    state,
    
    // Computed data
    canvasNodes,
    workflowNodeCount,
    canvasStats,
    integrationKey,
    
    // Validation
    isIntegrationValid: integrationValidation.isValid,
    integrationErrors: integrationValidation.errors,
    
    // Actions
    startDebugging,
    stopDebugging,
    togglePanel,
    setPanelOpen,
    selectNode,
    executeWorkflow,
    
    // Event handlers
    eventHandlers,
    
    // Performance
    performanceMetrics
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CanvasDebuggingState,
  CanvasDebuggingIntegrationResult,
  UseCanvasDebuggingIntegrationOptions
};

export default useCanvasDebuggingIntegration;