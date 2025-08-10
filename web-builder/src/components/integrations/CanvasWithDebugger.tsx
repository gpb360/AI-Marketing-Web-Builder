/**
 * CanvasWithDebugger Integration Component
 * 
 * Integration wrapper for Story 3.1: Visual Workflow Debugging
 * Provides Canvas debugging integration while maintaining separation of concerns
 * 
 * Features:
 * - Wraps existing Canvas component with debugging capabilities
 * - Integrates WorkflowDebugger with sliding panel
 * - Canvas-to-debugger data transformation
 * - Performance-optimized integration patterns
 * - Non-breaking enhancement of existing Canvas
 * 
 * @author Integration Coordinator - Story 3.1 Implementation
 */

'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Canvas } from '../builder/Canvas';
import { WorkflowDebugger } from '../builder/WorkflowDebugger';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, ChevronRight, ChevronLeft, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CanvasWithDebuggerProps {
  className?: string;
  onComponentSelect?: (componentId: string | null) => void;
  // Debugging Integration Props
  enableDebugging?: boolean;
  workflowId?: number | null;
  debugMode?: 'basic' | 'detailed' | 'expert';
  showWorkflowOverlays?: boolean;
  onDebugToggle?: (enabled: boolean) => void;
  // Canvas passthrough props
  canvasProps?: Record<string, any>;
}

interface DebugPanelState {
  isPanelOpen: boolean;
  debuggingActive: boolean;
  panelWidth: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing debugging panel state with Canvas integration
 */
function useCanvasDebuggingIntegration(
  enableDebugging: boolean, 
  workflowId: number | null
) {
  const [panelState, setPanelState] = useState<DebugPanelState>({
    isPanelOpen: false,
    debuggingActive: false,
    panelWidth: 320, // Default panel width
  });
  
  // Auto-close panel when debugging is disabled
  useEffect(() => {
    if (!enableDebugging) {
      setPanelState(prev => ({
        ...prev,
        isPanelOpen: false,
        debuggingActive: false
      }));
    }
  }, [enableDebugging]);
  
  const togglePanel = useCallback(() => {
    if (enableDebugging && workflowId) {
      setPanelState(prev => ({
        ...prev,
        isPanelOpen: !prev.isPanelOpen
      }));
    }
  }, [enableDebugging, workflowId]);
  
  const startDebugging = useCallback(() => {
    if (enableDebugging && workflowId) {
      setPanelState(prev => ({
        ...prev,
        debuggingActive: true,
        isPanelOpen: true
      }));
    }
  }, [enableDebugging, workflowId]);
  
  const stopDebugging = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      debuggingActive: false
    }));
  }, []);
  
  const setPanelOpen = useCallback((open: boolean) => {
    setPanelState(prev => ({
      ...prev,
      isPanelOpen: open
    }));
  }, []);
  
  return {
    ...panelState,
    togglePanel,
    startDebugging,
    stopDebugging,
    setPanelOpen
  };
}

/**
 * Hook for transforming Canvas data to WorkflowDebugger format
 */
function useCanvasDataTransformation() {
  const { components } = useBuilderStore();
  
  // Transform Canvas components to WorkflowDebugger node format
  const canvasNodes = useMemo(() => {
    return components.map(component => ({
      id: component.id,
      type: component.type,
      name: component.name,
      position: component.position,
      size: component.size,
      isWorkflowNode: component.isConnectedToWorkflow || false
    }));
  }, [components]);

  // Count workflow-connected components
  const workflowNodeCount = useMemo(() => {
    return components.filter(c => c.isConnectedToWorkflow).length;
  }, [components]);
  
  // Calculate Canvas statistics for debugging info
  const canvasStats = useMemo(() => ({
    total: components.length,
    workflowNodes: workflowNodeCount,
    connectedRatio: components.length > 0 ? (workflowNodeCount / components.length) * 100 : 0
  }), [components.length, workflowNodeCount]);
  
  return {
    canvasNodes,
    workflowNodeCount,
    canvasStats
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CanvasWithDebugger = React.memo<CanvasWithDebuggerProps>(({
  className,
  onComponentSelect,
  enableDebugging = false,
  workflowId = null,
  debugMode = 'detailed',
  showWorkflowOverlays = true,
  onDebugToggle,
  canvasProps = {}
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const {
    isPanelOpen,
    debuggingActive,
    panelWidth,
    togglePanel,
    startDebugging,
    stopDebugging,
    setPanelOpen
  } = useCanvasDebuggingIntegration(enableDebugging, workflowId);
  
  const {
    canvasNodes,
    workflowNodeCount,
    canvasStats
  } = useCanvasDataTransformation();
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleDebugToggle = useCallback(() => {
    const newState = !debuggingActive;
    if (newState) {
      startDebugging();
    } else {
      stopDebugging();
    }
    onDebugToggle?.(newState);
  }, [debuggingActive, startDebugging, stopDebugging, onDebugToggle]);
  
  const handlePanelClose = useCallback(() => {
    setPanelOpen(false);
  }, [setPanelOpen]);
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderDebuggingControls = () => {
    if (!enableDebugging || !workflowId) return null;
    
    return (
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {workflowNodeCount > 0 && (
          <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
            <Activity className="w-3 h-3 mr-1" />
            {workflowNodeCount} workflow node{workflowNodeCount !== 1 ? 's' : ''}
          </Badge>
        )}
        
        <Button
          variant={debuggingActive ? "default" : "outline"}
          size="sm"
          onClick={handleDebugToggle}
          className={cn(
            "bg-white/90 backdrop-blur-sm transition-all duration-200",
            debuggingActive && "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <Bug className="w-4 h-4 mr-1" />
          {debuggingActive ? "Stop Debug" : "Debug"}
        </Button>

        {debuggingActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={togglePanel}
            className="bg-white/90 backdrop-blur-sm"
          >
            {isPanelOpen ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    );
  };
  
  const renderDebuggingPanel = () => {
    if (!enableDebugging || !workflowId || !isPanelOpen) return null;
    
    return (
      <div className={cn(
        "fixed right-0 top-0 bottom-0 bg-white border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50",
        isPanelOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{ width: panelWidth }}
      >
        <div className="h-full overflow-hidden flex flex-col">
          <WorkflowDebugger
            workflowId={workflowId}
            isActive={debuggingActive}
            canvasNodes={canvasNodes}
            showStatusOverlays={showWorkflowOverlays}
            showSLAMonitoring={true}
            enableRealTime={true}
            debugMode={debugMode}
            className="flex-1 h-full border-0 shadow-none"
            onClose={handlePanelClose}
          />
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      {/* Enhanced Canvas Container */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isPanelOpen ? `mr-[${panelWidth}px]` : "mr-0"
      )}>
        {/* Canvas with Integration Overlay */}
        <div className="relative">
          <Canvas
            className="w-full h-full"
            onComponentSelect={onComponentSelect}
            {...canvasProps}
          />
          
          {/* Debugging Controls Overlay */}
          {renderDebuggingControls()}
          
          {/* Enhanced Canvas Info with Debug Stats */}
          {enableDebugging && workflowId && canvasStats.total > 0 && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 border">
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  {canvasStats.total} components
                </div>
                {canvasStats.workflowNodes > 0 && (
                  <>
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    <div className="text-xs text-purple-600">
                      {canvasStats.connectedRatio.toFixed(0)}% workflow connected
                    </div>
                  </>
                )}
              </div>
              
              {debuggingActive && (
                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Debugging active
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WorkflowDebugger Panel */}
      {renderDebuggingPanel()}
    </div>
  );
});

CanvasWithDebugger.displayName = 'CanvasWithDebugger';

// ============================================================================
// EXPORTS
// ============================================================================

export default CanvasWithDebugger;

export type { CanvasWithDebuggerProps };