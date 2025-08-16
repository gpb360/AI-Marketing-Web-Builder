/**
 * Magic Connector Component
 * 
 * The heart of the Magic Moment - analyzes components and suggests relevant workflows
 * Provides one-click workflow connection with AI-powered intelligence
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Wand2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  RefreshCw,
  X,
  Settings,
  ExternalLink,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentAnalyzer, ComponentAnalysis, WorkflowSuggestion } from '@/lib/ai/component-analyzer';

interface MagicConnectorProps {
  component: any;
  onWorkflowConnect: (workflowId: string, component: any) => void;
  onClose?: () => void;
  className?: string;
  autoShow?: boolean;
}

export const MagicConnector: React.FC<MagicConnectorProps> = ({
  component,
  onWorkflowConnect,
  onClose,
  className = '',
  autoShow = true
}) => {
  const [analysis, setAnalysis] = useState<ComponentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WorkflowSuggestion | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [magicMomentTriggered, setMagicMomentTriggered] = useState(false);

  // Analyze component when it changes
  useEffect(() => {
    if (component && autoShow) {
      analyzeComponent();
    }
  }, [component, autoShow]);

  const analyzeComponent = useCallback(async () => {
    if (!component) return;

    setIsAnalyzing(true);
    try {
      // Add timeout and fallback for analysis
      const analysisPromise = componentAnalyzer.analyzeComponent(component);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout')), 5000)
      );
      
      const result = await Promise.race([analysisPromise, timeoutPromise]);

      setAnalysis(result);
      
      // Auto-select the highest confidence suggestion
      if (result.suggestedWorkflows.length > 0) {
        setSelectedSuggestion(result.suggestedWorkflows[0]);
      }

      // Trigger magic moment animation for high-confidence suggestions
      if (result.confidence > 0.8 && result.suggestedWorkflows.length > 0) {
        setMagicMomentTriggered(true);
        setTimeout(() => setMagicMomentTriggered(false), 2000);
      }
    } catch (error) {
      console.error('Error analyzing component:', error);
      
      // Provide fallback analysis for timeout or API errors
      setAnalysis({
        confidence: 0.5,
        semanticPurpose: 'generic_component',
        workflowTriggers: [],
        suggestedWorkflows: [],
        businessContext: {
          industry: 'general',
          targetAudience: 'all_users',
          businessGoals: ['engagement']
        }
      });
        
    } finally {
      setIsAnalyzing(false);
    }
  }, [component]);

  const handleConnectWorkflow = useCallback(async (suggestion: WorkflowSuggestion) => {
    if (!suggestion || !component) return;

    setIsConnecting(true);
    try {
      await onWorkflowConnect(suggestion.workflowId, component);
      
      // Success animation
      setTimeout(() => {
        setIsConnecting(false);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error('Error connecting workflow:', error);
      setIsConnecting(false);
    }
  }, [component, onWorkflowConnect, onClose]);

  const renderConfidenceIndicator = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const color = confidence > 0.8 ? 'text-green-600' : 
                  confidence > 0.6 ? 'text-yellow-600' : 'text-gray-600';
    
    return (
      <div className="flex items-center gap-2">
        <Brain className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>
          {percentage}% confidence
        </span>
        <Progress value={percentage} className="w-16 h-2" />
      </div>
    );
  };

  const renderWorkflowSuggestion = (suggestion: WorkflowSuggestion, index: number) => {
    const isSelected = selectedSuggestion?.workflowId === suggestion.workflowId;
    const relevancePercentage = Math.round(suggestion.relevanceScore * 100);

    return (
      <div
        key={suggestion.workflowId}
        className={cn(
          "border rounded-lg p-4 cursor-pointer transition-all duration-200",
          isSelected 
            ? "border-blue-500 bg-blue-50 shadow-md" 
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
        )}
        onClick={() => setSelectedSuggestion(suggestion)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              suggestion.category === 'marketing' ? 'bg-green-100 text-green-600' :
              suggestion.category === 'sales' ? 'bg-blue-100 text-blue-600' :
              suggestion.category === 'support' ? 'bg-purple-100 text-purple-600' :
              suggestion.category === 'ecommerce' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {suggestion.category === 'marketing' && <TrendingUp className="h-4 w-4" />}
              {suggestion.category === 'sales' && <Target className="h-4 w-4" />}
              {suggestion.category === 'support' && <Users className="h-4 w-4" />}
              {suggestion.category === 'ecommerce' && <Sparkles className="h-4 w-4" />}
              {suggestion.category === 'automation' && <Zap className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{suggestion.workflowName}</h4>
              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={suggestion.autoConnectable ? "default" : "secondary"} className="text-xs">
              {relevancePercentage}% match
            </Badge>
            {suggestion.autoConnectable && (
              <div className="flex items-center gap-1 text-green-600">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-medium">Auto-connect</span>
              </div>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="space-y-3 border-t border-gray-200 pt-3">
            {/* Benefits */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Key Benefits:</h5>
              <div className="grid grid-cols-2 gap-2">
                {suggestion.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Fields */}
            {suggestion.requiredFields.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Required Fields:</h5>
                <div className="flex flex-wrap gap-1">
                  {suggestion.requiredFields.map((field, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnectWorkflow(suggestion);
                }}
                disabled={isConnecting}
                className="flex-1"
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Connect Workflow
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!component || !autoShow) return null;

  return (
    <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center z-50", className)}>
      <Card className={cn(
        "w-full max-w-2xl mx-4 transition-all duration-300",
        magicMomentTriggered && "animate-pulse border-blue-500 shadow-2xl"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-lg transition-all duration-300",
                magicMomentTriggered 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                  : "bg-blue-100 text-blue-600"
              )}>
                <Wand2 className={cn(
                  "h-6 w-6 transition-all duration-300",
                  magicMomentTriggered && "animate-bounce"
                )} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Magic Connector
                  {magicMomentTriggered && (
                    <Star className="h-5 w-5 text-yellow-500 animate-spin" />
                  )}
                </CardTitle>
                <CardDescription>
                  AI-powered workflow suggestions for your component
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {analysis && renderConfidenceIndicator(analysis.confidence)}
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="text-gray-600">Analyzing component for workflow opportunities...</span>
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Component Analysis Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-gray-900">Component Analysis</span>
                </div>
                <p className="text-sm text-gray-600">
                  Detected <strong>{analysis.semanticPurpose.replace('_', ' ')}</strong> component 
                  with <strong>{analysis.workflowTriggers.length}</strong> workflow triggers.
                  {analysis.confidence > 0.8 && (
                    <span className="text-green-600 font-medium ml-1">
                      ✨ High-confidence match found!
                    </span>
                  )}
                </p>
              </div>

              {/* Workflow Suggestions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Suggested Workflows ({analysis.suggestedWorkflows.length})
                </h3>
                
                {analysis.suggestedWorkflows.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.suggestedWorkflows.slice(0, 3).map(renderWorkflowSuggestion)}
                    
                    {analysis.suggestedWorkflows.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View {analysis.suggestedWorkflows.length - 3} More Suggestions
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No specific workflow suggestions for this component type.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={analyzeComponent}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-analyze
                    </Button>
                  </div>
                )}
              </div>

              {/* Magic Moment Call to Action */}
              {selectedSuggestion && selectedSuggestion.autoConnectable && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">✨ Magic Moment Ready!</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    This workflow can be auto-connected with one click. 
                    No configuration required - we'll set up everything for you!
                  </p>
                  <Button 
                    onClick={() => handleConnectWorkflow(selectedSuggestion)}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating Magic Moment...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Create Magic Moment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Component analysis failed. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={analyzeComponent}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MagicConnector;