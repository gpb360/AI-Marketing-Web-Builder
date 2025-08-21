'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Target, 
  TrendingUp, 
  Workflow,
  ArrowRight,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';
import { 
  magicConnector, 
  MagicConnectorAnalysis,
  MagicConnectorSuggestion 
} from '@/lib/ai/magic-connector';

interface MagicConnectorOverlayProps {
  className?: string;
  enabled?: boolean;
  onComponentSelect?: (componentId: string) => void;
  onSuggestionClick?: (componentId: string, suggestion: MagicConnectorSuggestion) => void;
}

interface ComponentMagicState {
  componentId: string;
  analysis: MagicConnectorAnalysis | null;
  loading: boolean;
  hasHighPrioritySuggestions: boolean;
  topSuggestion: MagicConnectorSuggestion | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function MagicConnectorOverlay({ 
  className, 
  enabled = true, 
  onComponentSelect,
  onSuggestionClick 
}: MagicConnectorOverlayProps) {
  const [componentStates, setComponentStates] = useState<Map<string, ComponentMagicState>>(new Map());
  const [showSuggestionTooltip, setShowSuggestionTooltip] = useState<string | null>(null);
  const [analysisQueue, setAnalysisQueue] = useState<Set<string>>(new Set());

  const { components, selectedComponentId, zoom } = useBuilderStore();

  // Memoized component analysis
  const analyzeComponentsBatch = useCallback(async (componentsToAnalyze: ComponentData[]) => {
    if (componentsToAnalyze.length === 0) return;

    const analysisPromises = componentsToAnalyze.map(async (component) => {
      try {
        const context = {
          pageContent: components.map(c => c.name).join(' '),
          businessType: 'general',
          userBehavior: {
            scrollDepth: 75,
            timeOnPage: 30000,
            previousActions: ['page_view']
          }
        };

        const analysis = await magicConnector.analyzeComponent(component, context);
        
        return {
          componentId: component.id,
          analysis,
          loading: false,
          hasHighPrioritySuggestions: analysis.suggestions.some(s => s.priority === 'high'),
          topSuggestion: analysis.suggestions[0] || null,
          position: component.position,
          size: component.size
        };
      } catch (error) {
        console.error(`Failed to analyze component ${component.id}:`, error);
        return {
          componentId: component.id,
          analysis: null,
          loading: false,
          hasHighPrioritySuggestions: false,
          topSuggestion: null,
          position: component.position,
          size: component.size
        };
      }
    });

    const results = await Promise.all(analysisPromises);
    
    setComponentStates(prev => {
      const newStates = new Map(prev);
      results.forEach(result => {
        newStates.set(result.componentId, result);
      });
      return newStates;
    });
  }, [components]);

  // Analyze components when they change
  useEffect(() => {
    if (!enabled || components.length === 0) return;

    // Filter components that haven't been analyzed yet
    const unanalyzedComponents = components.filter(component => 
      !componentStates.has(component.id) && !analysisQueue.has(component.id)
    );

    if (unanalyzedComponents.length > 0) {
      // Add to analysis queue
      setAnalysisQueue(prev => {
        const newQueue = new Set(prev);
        unanalyzedComponents.forEach(component => newQueue.add(component.id));
        return newQueue;
      });

      // Mark components as loading
      setComponentStates(prev => {
        const newStates = new Map(prev);
        unanalyzedComponents.forEach(component => {
          newStates.set(component.id, {
            componentId: component.id,
            analysis: null,
            loading: true,
            hasHighPrioritySuggestions: false,
            topSuggestion: null,
            position: component.position,
            size: component.size
          });
        });
        return newStates;
      });

      // Analyze components (debounced)
      const timeoutId = setTimeout(() => {
        analyzeComponentsBatch(unanalyzedComponents);
        setAnalysisQueue(prev => {
          const newQueue = new Set(prev);
          unanalyzedComponents.forEach(component => newQueue.delete(component.id));
          return newQueue;
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [components, enabled, componentStates, analysisQueue, analyzeComponentsBatch]);

  // Update positions when components move
  useEffect(() => {
    setComponentStates(prev => {
      const newStates = new Map(prev);
      components.forEach(component => {
        const existingState = newStates.get(component.id);
        if (existingState) {
          newStates.set(component.id, {
            ...existingState,
            position: component.position,
            size: component.size
          });
        }
      });
      return newStates;
    });
  }, [components]);

  // Clean up removed components
  useEffect(() => {
    const componentIds = new Set(components.map(c => c.id));
    setComponentStates(prev => {
      const newStates = new Map();
      Array.from(prev.entries()).forEach(([id, state]) => {
        if (componentIds.has(id)) {
          newStates.set(id, state);
        }
      });
      return newStates;
    });
  }, [components]);

  const handleIndicatorClick = useCallback((componentId: string, suggestion?: MagicConnectorSuggestion) => {
    if (suggestion && onSuggestionClick) {
      onSuggestionClick(componentId, suggestion);
    } else if (onComponentSelect) {
      onComponentSelect(componentId);
    }
  }, [onComponentSelect, onSuggestionClick]);

  const handleConnectSuggestion = useCallback(async (componentId: string, suggestion: MagicConnectorSuggestion) => {
    try {
      await magicConnector.connectWorkflow(componentId, suggestion.workflow.workflowId);
      
      // Update component state to show it's connected
      setComponentStates(prev => {
        const newStates = new Map(prev);
        const state = newStates.get(componentId);
        if (state && state.analysis) {
          newStates.set(componentId, {
            ...state,
            analysis: {
              ...state.analysis,
              // Mark suggestion as connected
              suggestions: state.analysis.suggestions.map(s => 
                s.workflow.workflowId === suggestion.workflow.workflowId 
                  ? { ...s, title: `✓ ${s.title.replace('✨ ', '')}` }
                  : s
              )
            }
          });
        }
        return newStates;
      });

      // Update component in store
      useBuilderStore.getState().connectToWorkflow(componentId, suggestion.workflow.workflowId);
      
    } catch (error) {
      console.error('Failed to connect workflow:', error);
    }
  }, []);

  if (!enabled) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {Array.from(componentStates.values()).map(state => (
        <MagicConnectorIndicator
          key={state.componentId}
          state={state}
          zoom={zoom}
          isSelected={selectedComponentId === state.componentId}
          onIndicatorClick={handleIndicatorClick}
          onConnectSuggestion={handleConnectSuggestion}
          showTooltip={showSuggestionTooltip === state.componentId}
          onShowTooltip={() => setShowSuggestionTooltip(state.componentId)}
          onHideTooltip={() => setShowSuggestionTooltip(null)}
        />
      ))}
    </div>
  );
}

interface MagicConnectorIndicatorProps {
  state: ComponentMagicState;
  zoom: number;
  isSelected: boolean;
  onIndicatorClick: (componentId: string, suggestion?: MagicConnectorSuggestion) => void;
  onConnectSuggestion: (componentId: string, suggestion: MagicConnectorSuggestion) => void;
  showTooltip: boolean;
  onShowTooltip: () => void;
  onHideTooltip: () => void;
}

function MagicConnectorIndicator({
  state,
  zoom,
  isSelected,
  onIndicatorClick,
  onConnectSuggestion,
  showTooltip,
  onShowTooltip,
  onHideTooltip
}: MagicConnectorIndicatorProps) {
  const { componentId, analysis, loading, hasHighPrioritySuggestions, topSuggestion, position, size } = state;

  const indicatorPosition = {
    left: (position.x + size.width - 15) * zoom,
    top: (position.y - 5) * zoom,
  };

  const tooltipPosition = {
    left: (position.x + size.width + 10) * zoom,
    top: position.y * zoom,
  };

  if (loading) {
    return (
      <div
        className="absolute pointer-events-auto"
        style={indicatorPosition}
      >
        <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.suggestions.length === 0) {
    return null;
  }

  const priorityColors = {
    high: 'bg-red-500 border-red-600 shadow-red-200',
    medium: 'bg-yellow-500 border-yellow-600 shadow-yellow-200',
    low: 'bg-blue-500 border-blue-600 shadow-blue-200'
  };

  const priority = hasHighPrioritySuggestions ? 'high' : 
    analysis.suggestions.some(s => s.priority === 'medium') ? 'medium' : 'low';

  return (
    <>
      {/* Magic Connector Indicator */}
      <motion.div
        className="absolute pointer-events-auto"
        style={indicatorPosition}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={cn(
            "relative w-6 h-6 border-2 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all",
            priorityColors[priority],
            isSelected && "ring-2 ring-purple-400 ring-offset-1"
          )}
          onClick={() => onIndicatorClick(componentId, topSuggestion || undefined)}
          onMouseEnter={onShowTooltip}
          onMouseLeave={onHideTooltip}
        >
          <Sparkles className="w-3 h-3 text-white" />
          
          {/* Pulse animation for high priority */}
          {priority === 'high' && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
          )}
          
          {/* Connection count badge */}
          {analysis.suggestions.filter(s => s.title.includes('✓')).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Suggestion Tooltip */}
      <AnimatePresence>
        {showTooltip && topSuggestion && (
          <motion.div
            className="absolute pointer-events-auto z-50"
            style={tooltipPosition}
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-1 bg-purple-100 rounded">
                    {topSuggestion.category === 'conversion' && <Target className="w-3 h-3 text-purple-600" />}
                    {topSuggestion.category === 'engagement' && <TrendingUp className="w-3 h-3 text-purple-600" />}
                    {topSuggestion.category === 'automation' && <Workflow className="w-3 h-3 text-purple-600" />}
                    {topSuggestion.category === 'analytics' && <Info className="w-3 h-3 text-purple-600" />}
                  </div>
                  <span className={cn(
                    "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                    priority === 'high' ? 'bg-red-100 text-red-700' :
                    priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {priority.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={onHideTooltip}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Content */}
              <h4 className="font-semibold text-gray-800 text-sm mb-1">
                {topSuggestion.title}
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                {topSuggestion.description}
              </p>

              {/* Impact Preview */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">Conversion</div>
                  <div className="font-semibold text-green-600">
                    {topSuggestion.estimatedImpact.conversionIncrease}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Time Saved</div>
                  <div className="font-semibold text-blue-600">
                    {topSuggestion.estimatedImpact.timesSaved}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {topSuggestion.oneClickSetup && (
                  <button
                    onClick={() => onConnectSuggestion(componentId, topSuggestion)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Connect
                  </button>
                )}
                <button
                  onClick={() => onIndicatorClick(componentId, topSuggestion)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center"
                >
                  View All
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>

              {/* Additional suggestions count */}
              {analysis.suggestions.length > 1 && (
                <div className="mt-2 text-center text-xs text-gray-500">
                  +{analysis.suggestions.length - 1} more suggestions
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MagicConnectorOverlay;