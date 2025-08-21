'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Settings,
  BarChart3,
  Target,
  Workflow,
  Brain,
  X,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';
import { 
  magicConnector, 
  MagicConnectorAnalysis, 
  MagicConnectorSuggestion,
  WorkflowConnection 
} from '@/lib/ai/magic-connector';

interface MagicConnectorPanelProps {
  className?: string;
  selectedComponentId?: string | null;
  onClose?: () => void;
}

export function MagicConnectorPanel({ 
  className, 
  selectedComponentId, 
  onClose 
}: MagicConnectorPanelProps) {
  const [analysis, setAnalysis] = useState<MagicConnectorAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'connections'>('suggestions');
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);

  const { getSelectedComponent, components } = useBuilderStore();

  // Get current component
  const selectedComponent = useMemo(() => {
    return selectedComponentId ? 
      components.find(c => c.id === selectedComponentId) || getSelectedComponent() : 
      getSelectedComponent();
  }, [selectedComponentId, components, getSelectedComponent]);

  // Analyze component when selection changes
  useEffect(() => {
    if (selectedComponent) {
      analyzeComponent(selectedComponent);
    } else {
      setAnalysis(null);
    }
  }, [selectedComponent]);

  const analyzeComponent = useCallback(async (component: ComponentData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Enhanced context for better analysis
      const context = {
        pageContent: components.map(c => c.name).join(' '),
        businessType: 'general', // Could be inferred from page content
        userBehavior: {
          scrollDepth: 75,
          timeOnPage: 30000,
          previousActions: ['page_view', 'component_select']
        }
      };

      const componentAnalysis = await magicConnector.analyzeComponent(component, context);
      setAnalysis(componentAnalysis);
    } catch (err) {
      console.error('Magic Connector analysis failed:', err);
      setError('Failed to analyze component. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [components]);

  const handleConnectWorkflow = useCallback(async (suggestion: MagicConnectorSuggestion) => {
    if (!selectedComponent) return;

    try {
      setLoading(true);
      const connection = await magicConnector.connectWorkflow(
        selectedComponent.id,
        suggestion.workflow.workflowId,
        { source: 'magic_connector_panel' }
      );
      
      setConnections(prev => [...prev, connection]);
      
      // Update component in store to show it's connected
      useBuilderStore.getState().connectToWorkflow(
        selectedComponent.id, 
        suggestion.workflow.workflowId
      );
      
      // Show success message (could use toast notification)
      console.log('Workflow connected successfully!');
    } catch (err) {
      console.error('Failed to connect workflow:', err);
      setError('Failed to connect workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedComponent]);

  if (!selectedComponent) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <div className="mb-4">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Magic Connector
          </h3>
          <p className="text-gray-600 text-sm">
            Select a component to see intelligent workflow suggestions
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            How Magic Connector Works
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Analyzes component purpose and context</li>
            <li>• Suggests relevant automation workflows</li>
            <li>• Enables one-click workflow connections</li>
            <li>• Predicts performance improvements</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            Magic Connector
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          Analyzing: <span className="font-medium">{selectedComponent.name}</span>
        </div>
        
        {/* Performance Predictions */}
        {analysis?.performancePredictions && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded p-2 text-center">
              <div className="text-xs text-green-600 font-medium">Conversion</div>
              <div className="text-sm font-bold text-green-700">
                {Math.round(analysis.performancePredictions.conversionProbability * 100)}%
              </div>
            </div>
            <div className="bg-blue-50 rounded p-2 text-center">
              <div className="text-xs text-blue-600 font-medium">Engagement</div>
              <div className="text-sm font-bold text-blue-700">
                {Math.round(analysis.performancePredictions.engagementScore * 100)}%
              </div>
            </div>
            <div className="bg-purple-50 rounded p-2 text-center">
              <div className="text-xs text-purple-600 font-medium">Auto Potential</div>
              <div className="text-sm font-bold text-purple-700">
                {Math.round(analysis.performancePredictions.automationPotential * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'suggestions', label: 'Workflows', icon: Workflow },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'connections', label: 'Active', icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center",
                activeTab === tab.id
                  ? "border-b-2 border-purple-500 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600">Analyzing component...</p>
          </div>
        )}

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">Analysis Error</span>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && analysis && (
          <AnimatePresence mode="wait">
            {activeTab === 'suggestions' && (
              <WorkflowSuggestions 
                key="suggestions"
                suggestions={analysis.suggestions}
                quickActions={analysis.quickActions}
                onConnect={handleConnectWorkflow}
              />
            )}
            
            {activeTab === 'insights' && (
              <ComponentInsights 
                key="insights"
                insights={analysis.contextualInsights}
                opportunities={analysis.automationOpportunities}
                analysis={analysis.analysis}
              />
            )}
            
            {activeTab === 'connections' && (
              <ActiveConnections 
                key="connections"
                connections={connections}
                componentId={selectedComponent.id}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Sub-components

function WorkflowSuggestions({ 
  suggestions, 
  quickActions, 
  onConnect 
}: {
  suggestions: MagicConnectorSuggestion[];
  quickActions: any[];
  onConnect: (suggestion: MagicConnectorSuggestion) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No workflow suggestions available for this component.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Quick Actions
          </h4>
          <div className="space-y-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-left hover:from-yellow-100 hover:to-orange-100 transition-colors"
              >
                <div className="font-medium text-gray-800">{action.label}</div>
                <div className="text-sm text-gray-600">{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Suggestions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          Recommended Workflows
        </h4>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard 
              key={index}
              suggestion={suggestion}
              onConnect={() => onConnect(suggestion)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SuggestionCard({ 
  suggestion, 
  onConnect 
}: {
  suggestion: MagicConnectorSuggestion;
  onConnect: () => void;
}) {
  const priorityColors = {
    high: 'from-red-50 to-pink-50 border-red-200',
    medium: 'from-yellow-50 to-orange-50 border-yellow-200',
    low: 'from-gray-50 to-gray-100 border-gray-200'
  };

  const categoryIcons = {
    conversion: Target,
    engagement: TrendingUp,
    automation: Workflow,
    analytics: BarChart3
  };

  const CategoryIcon = categoryIcons[suggestion.category];

  return (
    <div className={cn(
      "p-4 bg-gradient-to-r border rounded-lg",
      priorityColors[suggestion.priority]
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 bg-white rounded-lg mr-3">
            <CategoryIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h5 className="font-semibold text-gray-800">{suggestion.title}</h5>
            <div className="flex items-center mt-1">
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              )}>
                {suggestion.priority.toUpperCase()}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-xs text-gray-600 capitalize">
                {suggestion.category}
              </span>
            </div>
          </div>
        </div>
        
        {suggestion.oneClickSetup && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
            1-Click
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>

      {/* Impact Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600">Conversion</div>
          <div className="font-semibold text-green-600 text-sm">
            {suggestion.estimatedImpact.conversionIncrease}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Time Saved</div>
          <div className="font-semibold text-blue-600 text-sm">
            {suggestion.estimatedImpact.timesSaved}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Engagement</div>
          <div className="font-semibold text-purple-600 text-sm">
            {suggestion.estimatedImpact.engagementBoost}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Key Benefits:</div>
        <div className="grid grid-cols-1 gap-1">
          {suggestion.workflow.benefits.slice(0, 2).map((benefit, idx) => (
            <div key={idx} className="flex items-center text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {suggestion.setupComplexity} setup
        </div>
        
        <button
          onClick={onConnect}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          Connect
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

function ComponentInsights({ 
  insights, 
  opportunities, 
  analysis 
}: {
  insights: string[];
  opportunities: string[];
  analysis: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-6"
    >
      {/* AI Analysis Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <Brain className="w-4 h-4 mr-2 text-purple-600" />
          AI Analysis
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Purpose:</span>{' '}
            <span className="font-medium text-gray-800">
              {analysis.semanticPurpose.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Confidence:</span>{' '}
            <span className="font-medium text-gray-800">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Triggers:</span>{' '}
            <span className="font-medium text-gray-800">
              {analysis.workflowTriggers.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Opportunities */}
      {opportunities.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Automation Opportunities
          </h4>
          <div className="space-y-2">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Workflow className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ActiveConnections({ 
  connections, 
  componentId 
}: {
  connections: WorkflowConnection[];
  componentId: string;
}) {
  const componentConnections = connections.filter(c => c.componentId === componentId);

  if (componentConnections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6 text-center"
      >
        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No active workflow connections.</p>
        <p className="text-sm text-gray-500 mt-1">
          Connect workflows from the suggestions tab to see them here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      <h4 className="font-semibold text-gray-800">Active Connections</h4>
      
      {componentConnections.map(connection => (
        <div key={connection.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-gray-800">{connection.workflowName}</h5>
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              connection.status === 'active' ? 'bg-green-100 text-green-700' :
              connection.status === 'connected' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {connection.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-600">Conversions</div>
              <div className="font-semibold text-green-600">
                {connection.analytics.conversions}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Impressions</div>
              <div className="font-semibold text-blue-600">
                {connection.analytics.impressions}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">CTR</div>
              <div className="font-semibold text-purple-600">
                {connection.analytics.clickThrough}%
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Confidence: {Math.round(connection.confidence * 100)}%
            </span>
            <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}