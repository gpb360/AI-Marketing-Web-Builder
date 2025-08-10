/**
 * Canvas Debugging Integration Utilities
 * 
 * Integration utilities for Story 3.1: Visual Workflow Debugging
 * Provides Canvas-to-Debugger integration patterns and utilities
 * 
 * Features:
 * - Canvas component transformation utilities
 * - Debugging state management helpers
 * - Performance optimization patterns
 * - Integration event handlers
 * 
 * @author Integration Coordinator - Story 3.1 Implementation
 */

import { ComponentData } from '@/types/builder';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CanvasDebuggerNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isWorkflowNode: boolean;
}

export interface CanvasDebuggerStats {
  total: number;
  workflowNodes: number;
  connectedRatio: number;
  performance: {
    renderTime: number;
    lastUpdate: Date;
  };
}

export interface DebuggerIntegrationConfig {
  enableRealTime: boolean;
  showOverlays: boolean;
  debugMode: 'basic' | 'detailed' | 'expert';
  panelWidth: number;
  autoConnect: boolean;
}

export interface CanvasDebuggerEvents {
  onDebugStart: (workflowId: number) => void;
  onDebugStop: () => void;
  onPanelToggle: (isOpen: boolean) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onWorkflowExecute: (workflowId: number, nodeIds: string[]) => void;
}

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform Canvas components to WorkflowDebugger node format
 */
export function transformCanvasComponentsToNodes(
  components: ComponentData[]
): CanvasDebuggerNode[] {
  return components.map(component => ({
    id: component.id,
    type: component.type,
    name: component.name,
    position: component.position,
    size: component.size,
    isWorkflowNode: component.isConnectedToWorkflow || false
  }));
}

/**
 * Calculate Canvas debugging statistics
 */
export function calculateCanvasDebuggerStats(
  components: ComponentData[]
): CanvasDebuggerStats {
  const total = components.length;
  const workflowNodes = components.filter(c => c.isConnectedToWorkflow).length;
  const connectedRatio = total > 0 ? (workflowNodes / total) * 100 : 0;
  
  return {
    total,
    workflowNodes,
    connectedRatio,
    performance: {
      renderTime: performance.now(),
      lastUpdate: new Date()
    }
  };
}

/**
 * Filter workflow-enabled components
 */
export function filterWorkflowComponents(
  components: ComponentData[]
): ComponentData[] {
  return components.filter(component => component.isConnectedToWorkflow);
}

/**
 * Group components by workflow connection status
 */
export function groupComponentsByWorkflowStatus(
  components: ComponentData[]
): {
  connected: ComponentData[];
  disconnected: ComponentData[];
  stats: { connected: number; disconnected: number; ratio: number };
} {
  const connected = components.filter(c => c.isConnectedToWorkflow);
  const disconnected = components.filter(c => !c.isConnectedToWorkflow);
  
  return {
    connected,
    disconnected,
    stats: {
      connected: connected.length,
      disconnected: disconnected.length,
      ratio: components.length > 0 ? (connected.length / components.length) * 100 : 0
    }
  };
}

// ============================================================================
// INTEGRATION STATE MANAGEMENT
// ============================================================================

/**
 * Default debugger integration configuration
 */
export const DEFAULT_DEBUGGER_CONFIG: DebuggerIntegrationConfig = {
  enableRealTime: true,
  showOverlays: true,
  debugMode: 'detailed',
  panelWidth: 320,
  autoConnect: true
};

/**
 * Create debugging integration configuration
 */
export function createDebuggerIntegrationConfig(
  overrides: Partial<DebuggerIntegrationConfig> = {}
): DebuggerIntegrationConfig {
  return {
    ...DEFAULT_DEBUGGER_CONFIG,
    ...overrides
  };
}

/**
 * Validate debugger integration requirements
 */
export function validateDebuggerIntegration(
  workflowId: number | null,
  components: ComponentData[]
): {
  isValid: boolean;
  hasWorkflowId: boolean;
  hasComponents: boolean;
  hasWorkflowNodes: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const hasWorkflowId = workflowId !== null && workflowId > 0;
  const hasComponents = components.length > 0;
  const hasWorkflowNodes = components.some(c => c.isConnectedToWorkflow);
  
  if (!hasWorkflowId) {
    errors.push('Valid workflow ID required for debugging integration');
  }
  
  if (!hasComponents) {
    errors.push('Canvas must have components for debugging integration');
  }
  
  if (!hasWorkflowNodes) {
    errors.push('No workflow-connected components found for debugging');
  }
  
  return {
    isValid: hasWorkflowId && hasComponents,
    hasWorkflowId,
    hasComponents,
    hasWorkflowNodes,
    errors
  };
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Throttle function for Canvas debugging updates
 */
export function createThrottledDebuggerUpdate<T extends any[]>(
  fn: (...args: T) => void,
  delay: number = 100
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: T | null = null;
  
  return (...args: T) => {
    lastArgs = args;
    
    if (timeoutId) {
      return;
    }
    
    timeoutId = setTimeout(() => {
      if (lastArgs) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };
}

/**
 * Debounce function for Canvas debugging events
 */
export function createDebouncedDebuggerEvent<T extends any[]>(
  fn: (...args: T) => void,
  delay: number = 300
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Memoize Canvas debugger data transformations
 */
export function memoizeDebuggerTransformation<T, R>(
  transformFn: (input: T) => R,
  keyFn: (input: T) => string
): (input: T) => R {
  const cache = new Map<string, R>();
  
  return (input: T): R => {
    const key = keyFn(input);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = transformFn(input);
    cache.set(key, result);
    
    // Clean cache if it gets too large
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

/**
 * Create Canvas debugger event handlers
 */
export function createCanvasDebuggerEventHandlers(
  workflowId: number | null,
  onEvents?: Partial<CanvasDebuggerEvents>
): Required<CanvasDebuggerEvents> {
  return {
    onDebugStart: (id: number) => {
      console.log(`[CanvasDebugger] Debug started for workflow ${id}`);
      onEvents?.onDebugStart?.(id);
    },
    
    onDebugStop: () => {
      console.log(`[CanvasDebugger] Debug stopped`);
      onEvents?.onDebugStop?.();
    },
    
    onPanelToggle: (isOpen: boolean) => {
      console.log(`[CanvasDebugger] Panel ${isOpen ? 'opened' : 'closed'}`);
      onEvents?.onPanelToggle?.(isOpen);
    },
    
    onNodeSelect: (nodeId: string | null) => {
      console.log(`[CanvasDebugger] Node selected: ${nodeId || 'none'}`);
      onEvents?.onNodeSelect?.(nodeId);
    },
    
    onWorkflowExecute: (id: number, nodeIds: string[]) => {
      console.log(`[CanvasDebugger] Workflow ${id} executed with ${nodeIds.length} nodes`);
      onEvents?.onWorkflowExecute?.(id, nodeIds);
    }
  };
}

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

/**
 * Calculate optimal debugger panel width based on Canvas size
 */
export function calculateOptimalPanelWidth(
  canvasWidth: number,
  minWidth: number = 300,
  maxWidth: number = 400
): number {
  const optimalRatio = 0.25; // 25% of Canvas width
  const calculated = canvasWidth * optimalRatio;
  
  return Math.max(minWidth, Math.min(maxWidth, calculated));
}

/**
 * Generate Canvas debugger integration key for memoization
 */
export function generateDebuggerIntegrationKey(
  workflowId: number | null,
  componentCount: number,
  workflowNodeCount: number
): string {
  return `debugger_${workflowId}_${componentCount}_${workflowNodeCount}`;
}

/**
 * Check if Canvas debugger should be enabled
 */
export function shouldEnableCanvasDebugger(
  enableDebugging: boolean,
  workflowId: number | null,
  workflowNodeCount: number
): boolean {
  return enableDebugging && workflowId !== null && workflowNodeCount > 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CanvasDebuggerNode,
  CanvasDebuggerStats,
  DebuggerIntegrationConfig,
  CanvasDebuggerEvents
};