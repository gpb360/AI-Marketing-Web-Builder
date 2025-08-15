/**
 * Smart Component Suggestions Component
 * 
 * Implementation of Story 3.8: Component Suggestions Implementation
 * Provides intelligent workflow component recommendations that integrate with Magic Connector
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Target, 
  Workflow, 
  Brain, 
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Plus,
  Sparkles,
  Star,
  AlertTriangle,
  Info,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  componentSuggestionEngine, 
  ComponentSuggestion, 
  WorkflowContext, 
  SuggestionAnalysis 
} from '@/lib/ai/component-suggestion-engine';

interface SmartComponentSuggestionsProps {
  workflowContext: WorkflowContext;
  onComponentSelect: (suggestion: ComponentSuggestion) => void;
  onWorkflowOptimize?: (suggestions: ComponentSuggestion[]) => void;
  maxSuggestions?: number;
  className?: string;
  showAnalysis?: boolean;
}

export const SmartComponentSuggestions: React.FC<SmartComponentSuggestionsProps> = ({
  workflowContext,
  onComponentSelect,
  onWorkflowOptimize,
  maxSuggestions = 6,
  className = '',
  showAnalysis = true
}) => {
  const [analysis, setAnalysis] = useState<SuggestionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ComponentSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [error, setError] = useState<string | null>(null);

  // Load component suggestions
  useEffect(() => {
    loadSuggestions();
  }, [workflowContext]);

  const loadSuggestions = useCallback(async () => {
    if (!workflowContext) return;

    setIsLoading(true);
    setError(null);
    try {
      const suggestionAnalysis = await componentSuggestionEngine.suggestComponents(workflowContext);
      setAnalysis(suggestionAnalysis);
    } catch (error) {
      console.error('Failed to load component suggestions:', error);
      setError('Failed to generate component suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [workflowContext]);

  const handleComponentSelect = (suggestion: ComponentSuggestion) => {
    setSelectedSuggestion(suggestion);
    onComponentSelect(suggestion);
  };

  const handleOptimizeWorkflow = () => {
    if (analysis && onWorkflowOptimize) {
      onWorkflowOptimize(analysis.suggested_components);
    }
  };

  const getTypeIcon = (type: ComponentSuggestion['type']) => {
    switch (type) {
      case 'form':
        return <Target className="h-4 w-4" />;
      case 'button':
        return <Zap className="h-4 w-4" />;
      case 'text':
        return <TrendingUp className="h-4 w-4" />;
      case 'image':
        return <Sparkles className="h-4 w-4" />;
      case 'section':
        return <BarChart3 className="h-4 w-4" />;
      case 'interactive':
        return <Brain className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getComplexityBadge = (complexity: number) => {
    const labels = ['', 'Simple', 'Easy', 'Medium', 'Complex', 'Advanced'];
    const colors = ['', 'green', 'blue', 'yellow', 'orange', 'red'];
    return {
      label: labels[complexity] || 'Unknown',
      color: colors[complexity] || 'gray'
    };
  };

  const renderSuggestionCard = (suggestion: ComponentSuggestion) => {
    const complexityBadge = getComplexityBadge(suggestion.implementation.complexity);
    const confidencePercentage = Math.round(suggestion.confidence * 100);

    return (
      <Card 
        key={suggestion.id} 
        className={cn(
          "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
          selectedSuggestion?.id === suggestion.id 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-200 hover:border-blue-300"
        )}
        onClick={() => setSelectedSuggestion(suggestion)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                suggestion.confidence >= 0.8 
                  ? "bg-green-100 text-green-600" 
                  : "bg-blue-100 text-blue-600"
              )}>
                {getTypeIcon(suggestion.type)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                <CardDescription className="mt-1">
                  {suggestion.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getConfidenceColor(suggestion.confidence)} border`}>
                {confidencePercentage}% confident
              </Badge>
              <Badge variant="outline" className={`text-${complexityBadge.color}-600 border-${complexityBadge.color}-200`}>
                {complexityBadge.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* AI Reasoning */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">AI Analysis</h4>
                <p className="text-sm text-blue-700 mt-1">{suggestion.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Workflow Integration Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Workflow className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Workflow Triggers</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestion.workflow_integration.triggers.slice(0, 2).map((trigger, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {trigger}
                  </Badge>
                ))}
                {suggestion.workflow_integration.triggers.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{suggestion.workflow_integration.triggers.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Business Impact</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">{suggestion.business_impact.conversion_impact}</div>
                <Progress 
                  value={suggestion.business_impact.roi_potential * 100} 
                  className="h-1.5"
                />
              </div>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{suggestion.implementation.estimated_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round(suggestion.workflow_integration.automation_potential * 100)}% automation</span>
              </div>
            </div>

            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleComponentSelect(suggestion);
              }}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Component
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWorkflowAnalysis = () => {
    if (!analysis) return null;

    const { workflow_completeness } = analysis;
    const completenessPercentage = Math.round(workflow_completeness.score * 100);

    return (
      <div className="space-y-4">
        {/* Completeness Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Workflow Completeness Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-2xl font-bold text-blue-600">{completenessPercentage}%</span>
              </div>
              <Progress value={completenessPercentage} className="h-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {workflow_completeness.missing_elements.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Missing Elements</span>
                    </div>
                    <div className="space-y-1">
                      {workflow_completeness.missing_elements.slice(0, 3).map((element, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-orange-50 p-2 rounded">
                          {element}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow_completeness.optimization_opportunities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Optimization Opportunities</span>
                    </div>
                    <div className="space-y-1">
                      {workflow_completeness.optimization_opportunities.slice(0, 3).map((opportunity, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          {opportunity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Optimize Action */}
        {onWorkflowOptimize && workflow_completeness.score < 0.8 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Workflow Optimization Available</h4>
                    <p className="text-sm text-gray-600">
                      We can automatically optimize your workflow by adding {analysis.suggested_components.length} recommended components.
                    </p>
                  </div>
                </div>
                <Button onClick={handleOptimizeWorkflow} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Optimize Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h3 className="text-lg font-medium mt-4">Analyzing Workflow Context</h3>
                <p className="text-gray-600">Generating intelligent component suggestions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Error Loading Suggestions</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={loadSuggestions} className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Analysis Available</h3>
            <p className="text-gray-600">Unable to generate component suggestions for this workflow context.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Smart Component Suggestions</h2>
            <p className="text-sm text-gray-600">
              AI-powered recommendations for {workflowContext.workflow_type} workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSuggestions} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Workflow Context Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">
                {workflowContext.workflow_type.replace('_', ' ').toUpperCase()} • {workflowContext.industry}
              </h3>
              <p className="text-sm text-gray-600">
                Stage: {workflowContext.conversion_funnel_stage} • Target: {workflowContext.target_audience}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{analysis.suggested_components.length}</div>
              <div className="text-sm text-gray-600">suggestions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suggestions" className="gap-2">
            <Target className="h-4 w-4" />
            Suggestions ({analysis.suggested_components.length})
          </TabsTrigger>
          {showAnalysis && (
            <TabsTrigger value="analysis" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4 mt-6">
          {analysis.suggested_components.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analysis.suggested_components.slice(0, maxSuggestions).map(renderSuggestionCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Suggestions Available</h3>
                <p className="text-gray-600">
                  Your workflow appears to be complete, or we couldn't identify additional improvement opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {showAnalysis && (
          <TabsContent value="analysis" className="space-y-4 mt-6">
            {renderWorkflowAnalysis()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SmartComponentSuggestions;