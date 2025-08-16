'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Brain,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for Epic 4 AI Features
interface BuilderContext {
  industry: string;
  business_type: string;
  page_type: string;
  goals: string[];
  target_audience: string;
  brand_guidelines?: any;
  existing_components: any[];
}

interface ComponentSuggestion {
  component_type: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  expected_impact: string;
  customization_suggestions: string[];
  confidence_score: number;
  ranking_score?: number;
  recommended_component_id?: string;
  performance_data?: {
    conversion_rate: number;
    engagement_score: number;
    performance_score: number;
    usage_count: number;
  };
}

interface ComponentSuggestionsResponse {
  suggestions: ComponentSuggestion[];
  context_analysis: {
    industry: string;
    page_type: string;
    completeness_score: number;
    conversion_funnel_stage: string;
    missing_essentials: string[];
    user_journey_gaps: string[];
  };
  processing_time_ms: number;
  ai_model_used: string;
  cache_hit: boolean;
}

interface ComponentSuggestionsProps {
  context: BuilderContext;
  onAddComponent: (componentType: string, customization?: any) => void;
  onRefreshSuggestions?: () => void;
  className?: string;
}

export function ComponentSuggestions({ 
  context, 
  onAddComponent, 
  onRefreshSuggestions,
  className 
}: ComponentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ComponentSuggestion[]>([]);
  const [contextAnalysis, setContextAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());

  // Load suggestions when context changes
  useEffect(() => {
    if (context.industry && context.business_type) {
      loadSuggestions();
    }
  }, [context.industry, context.business_type, context.page_type]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/ai/component-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          context: context,
          current_components: context.existing_components || [],
          max_suggestions: 5,
          preferences: {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get component suggestions');
      }

      const data: ComponentSuggestionsResponse = await response.json();
      setSuggestions(data.suggestions);
      setContextAnalysis(data.context_analysis);
      setProcessingTime(data.processing_time_ms);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
      console.error('Component suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: ComponentSuggestion, index: number) => {
    try {
      // Add component to builder
      onAddComponent(suggestion.component_type, {
        customizations: suggestion.customization_suggestions,
        aiGenerated: true,
        confidence: suggestion.confidence_score
      });

      // Track acceptance
      setAcceptedSuggestions(prev => new Set(prev).add(suggestion.component_type));

      // Send feedback to API
      await fetch('/api/v1/ai/suggestions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          suggestion_id: `${suggestion.component_type}_${index}`,
          accepted: true,
          feedback_score: 5
        })
      });

    } catch (err) {
      console.error('Failed to accept suggestion:', err);
    }
  };

  const handleRejectSuggestion = async (suggestion: ComponentSuggestion, index: number) => {
    try {
      // Send feedback to API
      await fetch('/api/v1/ai/suggestions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          suggestion_id: `${suggestion.component_type}_${index}`,
          accepted: false,
          feedback_score: 2
        })
      });

      // Remove from suggestions
      setSuggestions(prev => prev.filter((_, i) => i !== index));

    } catch (err) {
      console.error('Failed to reject suggestion:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Zap className="w-3 h-3" />;
      case 'medium': return <Target className="w-3 h-3" />;
      case 'low': return <TrendingUp className="w-3 h-3" />;
      default: return <Lightbulb className="w-3 h-3" />;
    }
  };

  const formatComponentName = (componentType: string) => {
    return componentType
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI Component Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI Component Suggestions
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Epic 4
            </Badge>
          </div>
          <Button
            onClick={onRefreshSuggestions || loadSuggestions}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardTitle>
        
        {processingTime > 0 && (
          <div className="text-sm text-gray-500">
            Generated in {processingTime}ms using AI analysis
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Context Analysis Summary */}
        {contextAnalysis && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Page Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Completeness:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(contextAnalysis.completeness_score * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs">
                        {Math.round(contextAnalysis.completeness_score * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Stage:</span>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {contextAnalysis.conversion_funnel_stage}
                    </Badge>
                  </div>
                </div>
                
                {contextAnalysis.missing_essentials?.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-xs">Missing Essentials:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contextAnalysis.missing_essentials.slice(0, 3).map((essential: string) => (
                        <Badge key={essential} variant="destructive" className="text-xs">
                          {formatComponentName(essential)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error loading suggestions</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button 
              onClick={loadSuggestions}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No suggestions available at the moment.</p>
            <p className="text-sm">Try adjusting your context or adding more components.</p>
          </div>
        )}

        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.component_type}_${index}`}
            className={cn(
              "p-4 rounded-lg border transition-all",
              acceptedSuggestions.has(suggestion.component_type)
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(suggestion.priority)}
                  <h4 className="font-semibold text-gray-900">
                    {formatComponentName(suggestion.component_type)}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(suggestion.priority)} variant="secondary">
                    {suggestion.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence_score * 100)}% confident
                  </Badge>
                  {suggestion.performance_data && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {Math.round(suggestion.performance_data.performance_score * 100)}% performance
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!acceptedSuggestions.has(suggestion.component_type) && (
                  <>
                    <Button
                      onClick={() => handleAcceptSuggestion(suggestion, index)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Add
                    </Button>
                    <Button
                      onClick={() => handleRejectSuggestion(suggestion, index)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {acceptedSuggestions.has(suggestion.component_type) && (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Added
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {suggestion.reasoning}
            </p>

            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Expected Impact
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {suggestion.expected_impact}
                </p>
              </div>

              {suggestion.customization_suggestions?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Customization Tips
                  </span>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {suggestion.customization_suggestions.slice(0, 2).map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.performance_data && (
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Conversion Rate</div>
                    <div className="text-sm font-medium text-green-600">
                      {Math.round(suggestion.performance_data.conversion_rate * 100)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Engagement</div>
                    <div className="text-sm font-medium text-blue-600">
                      {Math.round(suggestion.performance_data.engagement_score * 100)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Usage</div>
                    <div className="text-sm font-medium text-gray-600">
                      {suggestion.performance_data.usage_count}×
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {suggestions.length} AI-powered suggestions
              </span>
              <span>
                Powered by Epic 4 Intelligence
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}