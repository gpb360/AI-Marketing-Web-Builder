/**
 * Workflow Intelligence Hub
 * 
 * Integration component that combines Magic Connector and Smart Component Suggestions
 * Provides a unified interface for AI-powered workflow building and optimization
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Workflow, 
  Target, 
  Sparkles, 
  Zap,
  ArrowRight,
  Settings,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartComponentSuggestions } from './SmartComponentSuggestions';
import { MagicConnector } from './MagicConnector';
import { 
  ComponentSuggestion, 
  WorkflowContext, 
  componentSuggestionEngine 
} from '@/lib/ai/component-suggestion-engine';
import { 
  ComponentAnalysis,
  componentAnalyzer 
} from '@/lib/ai/component-analyzer';

interface WorkflowIntelligenceHubProps {
  workflowId?: string;
  currentComponents: any[];
  onComponentAdd: (component: any) => void;
  onWorkflowConnect: (workflowId: string, component: any) => void;
  businessContext?: {
    industry: string;
    target_audience: string;
    business_goals: string[];
    workflow_type: WorkflowContext['workflow_type'];
    conversion_stage: WorkflowContext['conversion_funnel_stage'];
  };
  className?: string;
}

interface IntelligenceInsight {
  type: 'component_gap' | 'workflow_optimization' | 'conversion_opportunity' | 'automation_potential';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action_required: boolean;
  quick_fix_available: boolean;
}

export const WorkflowIntelligenceHub: React.FC<WorkflowIntelligenceHubProps> = ({
  workflowId,
  currentComponents,
  onComponentAdd,
  onWorkflowConnect,
  businessContext,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [showMagicConnector, setShowMagicConnector] = useState(false);
  const [insights, setInsights] = useState<IntelligenceInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize workflow context
  useEffect(() => {
    if (businessContext) {
      const context: WorkflowContext = {
        workflow_id: workflowId,
        workflow_type: businessContext.workflow_type,
        current_components: currentComponents,
        missing_components: [],
        business_goals: businessContext.business_goals,
        target_audience: businessContext.target_audience,
        industry: businessContext.industry,
        conversion_funnel_stage: businessContext.conversion_stage
      };
      setWorkflowContext(context);
    }
  }, [businessContext, currentComponents, workflowId]);

  // Generate intelligence insights
  useEffect(() => {
    if (workflowContext) {
      generateInsights();
    }
  }, [workflowContext]);

  const generateInsights = useCallback(async () => {
    if (!workflowContext) return;

    setIsAnalyzing(true);
    try {
      // Analyze workflow gaps
      const gapAnalysis = await componentSuggestionEngine.analyzeWorkflowGaps(workflowContext);
      
      // Generate component analyses
      const componentAnalyses = await Promise.all(
        currentComponents.map(component => componentAnalyzer.analyzeComponent(component))
      );

      const newInsights: IntelligenceInsight[] = [];

      // Component gap insights
      if (gapAnalysis.critical_gaps.length > 0) {
        newInsights.push({
          type: 'component_gap',
          title: 'Critical Component Gaps Detected',
          description: `Missing ${gapAnalysis.critical_gaps.length} essential components for optimal workflow performance`,
          impact: 'high',
          action_required: true,
          quick_fix_available: true
        });
      }

      // Workflow optimization insights
      if (gapAnalysis.completeness_score < 0.8) {
        newInsights.push({
          type: 'workflow_optimization',
          title: 'Workflow Optimization Available',
          description: `Current completeness: ${Math.round(gapAnalysis.completeness_score * 100)}%. Add suggested components to improve performance.`,
          impact: 'medium',
          action_required: false,
          quick_fix_available: true
        });
      }

      // Automation potential insights
      const highAutomationComponents = componentAnalyses.filter(
        analysis => analysis.suggestedWorkflows.some(w => w.autoConnectable)
      );
      
      if (highAutomationComponents.length > 0) {
        newInsights.push({
          type: 'automation_potential',
          title: 'Automation Opportunities Found',
          description: `${highAutomationComponents.length} components can be automatically connected to workflows`,
          impact: 'high',
          action_required: false,
          quick_fix_available: true
        });
      }

      // Conversion optimization insights
      const formComponents = currentComponents.filter(c => c.type === 'form' || c.type === 'contact-form');
      if (formComponents.length > 0 && workflowContext.conversion_funnel_stage === 'consideration') {
        newInsights.push({
          type: 'conversion_opportunity',
          title: 'Conversion Optimization Potential',
          description: 'Form components detected in consideration stage. Add trust signals and social proof.',
          impact: 'medium',
          action_required: false,
          quick_fix_available: true
        });
      }

      setInsights(newInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [workflowContext, currentComponents]);

  const handleComponentSelect = (suggestion: ComponentSuggestion) => {
    // Convert suggestion to actual component data
    const component = {
      id: `component-${Date.now()}`,
      type: suggestion.type,
      name: suggestion.name,
      props: suggestion.component_config.default_props,
      metadata: {
        ai_suggested: true,
        suggestion_id: suggestion.id,
        confidence: suggestion.confidence
      }
    };
    
    onComponentAdd(component);
  };

  const handleWorkflowOptimize = (suggestions: ComponentSuggestion[]) => {
    // Auto-add top 3 highest confidence suggestions
    const topSuggestions = suggestions
      .filter(s => s.confidence > 0.8)
      .slice(0, 3);
    
    topSuggestions.forEach(suggestion => {
      handleComponentSelect(suggestion);
    });
  };

  const openMagicConnectorForComponent = (component: any) => {
    setSelectedComponent(component);
    setShowMagicConnector(true);
  };

  const getInsightIcon = (type: IntelligenceInsight['type']) => {
    switch (type) {
      case 'component_gap':
        return <Target className="h-4 w-4" />;
      case 'workflow_optimization':
        return <Workflow className="h-4 w-4" />;
      case 'conversion_opportunity':
        return <TrendingUp className="h-4 w-4" />;
      case 'automation_potential':
        return <Zap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (impact: IntelligenceInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderInsightCard = (insight: IntelligenceInsight, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              getInsightColor(insight.impact)
            )}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-xs ${getInsightColor(insight.impact)}`}>
                  {insight.impact} impact
                </Badge>
                {insight.quick_fix_available && (
                  <Badge variant="secondary" className="text-xs">
                    Quick fix available
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {insight.action_required && (
            <Button size="sm" variant="outline">
              Take Action
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Workflow Health Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Workflow Intelligence Overview
          </CardTitle>
          <CardDescription>
            AI analysis of your workflow completeness and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentComponents.length}</div>
              <div className="text-sm text-blue-700">Active Components</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.quick_fix_available).length}
              </div>
              <div className="text-sm text-green-700">Quick Wins Available</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-sm text-purple-700">High Impact Opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Intelligence Insights</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Analyzing...
            </div>
          )}
        </div>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map(renderInsightCard)}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium">No Insights Available</h4>
              <p className="text-sm text-gray-600">
                {isAnalyzing ? 'Analyzing your workflow...' : 'Your workflow appears to be well optimized.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2 h-12"
              onClick={() => setActiveTab('suggestions')}
            >
              <Target className="h-4 w-4" />
              View Component Suggestions
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-12"
              onClick={() => setActiveTab('magic-connector')}
            >
              <Zap className="h-4 w-4" />
              Auto-Connect Components
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMagicConnectorTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Magic Connector
          </CardTitle>
          <CardDescription>
            AI-powered component analysis and automatic workflow connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentComponents.map((component, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openMagicConnectorForComponent(component)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{component.name || component.type}</h4>
                        <p className="text-sm text-gray-600">Type: {component.type}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {currentComponents.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium">No Components Yet</h4>
                <p className="text-sm text-gray-600">
                  Add components to your workflow to see Magic Connector suggestions.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Workflow Intelligence Hub</h1>
            <p className="text-gray-600">
              AI-powered workflow analysis and optimization recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <Target className="h-4 w-4" />
            Component Suggestions
          </TabsTrigger>
          <TabsTrigger value="magic-connector" className="gap-2">
            <Zap className="h-4 w-4" />
            Magic Connector
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          {workflowContext ? (
            <SmartComponentSuggestions
              workflowContext={workflowContext}
              onComponentSelect={handleComponentSelect}
              onWorkflowOptimize={handleWorkflowOptimize}
              maxSuggestions={8}
              showAnalysis={true}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium">Business Context Required</h3>
                <p className="text-sm text-gray-600">
                  Please provide business context to generate component suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="magic-connector" className="mt-6">
          {renderMagicConnectorTab()}
        </TabsContent>
      </Tabs>

      {/* Magic Connector Modal */}
      {showMagicConnector && selectedComponent && (
        <MagicConnector
          component={selectedComponent}
          onWorkflowConnect={onWorkflowConnect}
          onClose={() => setShowMagicConnector(false)}
          autoShow={true}
        />
      )}
    </div>
  );
};

export default WorkflowIntelligenceHub;