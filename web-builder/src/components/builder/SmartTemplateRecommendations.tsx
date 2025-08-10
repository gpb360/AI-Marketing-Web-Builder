/**
 * SmartTemplateRecommendations Component - Story 3.2 Task #82
 * 
 * Main component for AI-powered workflow template recommendations with reasoning display.
 * Implements acceptance criteria for Smart Workflow Templates with AI Customization.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Play,
  Eye,
  Star,
  BarChart3,
  Zap
} from 'lucide-react';

import {
  type SmartTemplateRecommendationsProps,
  type SmartTemplateRecommendation,
  type WebsiteAnalysisResult,
  type SmartTemplateLoadingState,
  WorkflowCategory
} from '@/lib/types/smart-templates';

// Subcomponents
import { TemplateRecommendationCard } from './TemplateRecommendationCard';
import { ReasoningDisplay } from './ReasoningDisplay';
import { OutcomePredictionViz } from './OutcomePredictionViz';

// Hooks and services  
import { useSmartTemplateRecommendations } from '@/hooks/useSmartTemplateRecommendations';

/**
 * Main Smart Template Recommendations Component
 * 
 * Features:
 * - AI-powered template analysis and recommendations
 * - Detailed reasoning display with confidence scores
 * - One-click template instantiation
 * - Interactive outcome prediction
 * - Category-based filtering and sorting
 * - Performance metrics and success indicators
 */
export const SmartTemplateRecommendations: React.FC<SmartTemplateRecommendationsProps> = ({
  websiteAnalysis,
  onTemplateSelect,
  onTemplateInstantiate,
  maxRecommendations = 8,
  showReasoningDetails = true,
  enablePreview = true,
}) => {
  // State Management
  const [selectedRecommendation, setSelectedRecommendation] = useState<SmartTemplateRecommendation | null>(null);
  const [activeCategory, setActiveCategory] = useState<WorkflowCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'success_rate' | 'setup_time'>('relevance');
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);

  // Custom hook for smart template recommendations
  const {
    recommendations,
    loadingState,
    analyzeWebsite,
    instantiateTemplate,
    provideFeedback
  } = useSmartTemplateRecommendations({
    maxRecommendations,
    autoAnalyze: !!websiteAnalysis
  });

  // Filtered and sorted recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === activeCategory);
    }
    
    // Sort recommendations
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance_score - a.relevance_score;
        case 'success_rate':
          return b.success_probability - a.success_probability;
        case 'setup_time':
          return a.customization_preview.estimated_setup_time - b.customization_preview.estimated_setup_time;
        default:
          return b.relevance_score - a.relevance_score;
      }
    });
    
    return sorted;
  }, [recommendations, activeCategory, sortBy]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<WorkflowCategory | 'all', number> = { all: recommendations.length };
    
    Object.values(WorkflowCategory).forEach(category => {
      stats[category] = recommendations.filter(rec => rec.category === category).length;
    });
    
    return stats;
  }, [recommendations]);

  // Handle template selection
  const handleTemplateSelect = useCallback((recommendation: SmartTemplateRecommendation) => {
    setSelectedRecommendation(recommendation);
    onTemplateSelect(recommendation);
  }, [onTemplateSelect]);

  // Handle template instantiation
  const handleTemplateInstantiate = useCallback(async (recommendation: SmartTemplateRecommendation) => {
    try {
      const result = await instantiateTemplate(recommendation.template_id);
      onTemplateInstantiate(recommendation.template_id, result.customizations_applied);
      
      // Provide positive feedback for instantiated templates
      await provideFeedback({
        recommendation_id: recommendation.template_id,
        user_rating: 5,
        relevance_rating: Math.round(recommendation.relevance_score * 5),
        adoption_status: 'instantiated'
      });
    } catch (error) {
      console.error('Template instantiation failed:', error);
    }
  }, [instantiateTemplate, onTemplateInstantiate, provideFeedback]);

  // Analyze website if provided
  useEffect(() => {
    if (websiteAnalysis && !loadingState.isAnalyzing) {
      // Website analysis already provided, use it directly
      return;
    }
  }, [websiteAnalysis, loadingState.isAnalyzing]);

  // Loading state
  if (loadingState.isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
            <CardTitle>Analyzing Your Website</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Extracting business context and goals...</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
              <span>Analyzing brand voice and audience...</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400"></div>
              <span>Matching with proven workflow templates...</span>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (loadingState.error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-700">Analysis Failed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{loadingState.error}</p>
          <Button 
            variant="outline" 
            onClick={() => websiteAnalysis && analyzeWebsite(websiteAnalysis)}
            disabled={loadingState.isGeneratingRecommendations}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No recommendations state
  if (!loadingState.isGeneratingRecommendations && recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>No Template Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We couldn't find suitable workflow templates for your website. 
            Try providing more context about your business goals.
          </p>
          <Button variant="outline">
            Provide Additional Context
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Analysis Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-500" />
              <CardTitle>AI-Powered Template Recommendations</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{recommendations.length} Templates Found</span>
              </Badge>
              {websiteAnalysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
                >
                  {showAnalysisDetails ? 'Hide' : 'Show'} Analysis
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {showAnalysisDetails && websiteAnalysis && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Business Classification</h4>
                <div className="space-y-1">
                  <Badge variant="outline">{websiteAnalysis.business_classification.industry}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(websiteAnalysis.business_classification.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Brand Voice</h4>
                <Badge variant="outline">{websiteAnalysis.content_analysis.brand_voice}</Badge>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Marketing Maturity</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{websiteAnalysis.marketing_maturity.level}</Badge>
                  <div className="flex items-center">
                    <BarChart3 className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(websiteAnalysis.marketing_maturity.automation_readiness * 100)}% ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as WorkflowCategory | 'all')}>
          <TabsList className="grid grid-cols-5 w-fit">
            <TabsTrigger value="all">All ({categoryStats.all})</TabsTrigger>
            <TabsTrigger value={WorkflowCategory.MARKETING}>
              Marketing ({categoryStats[WorkflowCategory.MARKETING] || 0})
            </TabsTrigger>
            <TabsTrigger value={WorkflowCategory.SALES}>
              Sales ({categoryStats[WorkflowCategory.SALES] || 0})
            </TabsTrigger>
            <TabsTrigger value={WorkflowCategory.SUPPORT}>
              Support ({categoryStats[WorkflowCategory.SUPPORT] || 0})
            </TabsTrigger>
            <TabsTrigger value={WorkflowCategory.ECOMMERCE}>
              E-commerce ({categoryStats[WorkflowCategory.ECOMMERCE] || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="relevance">Relevance Score</option>
            <option value="success_rate">Success Probability</option>
            <option value="setup_time">Setup Time</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loadingState.isGeneratingRecommendations ? (
          // Loading skeletons
          Array.from({ length: 4 }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual recommendations
          filteredRecommendations.map((recommendation) => (
            <TemplateRecommendationCard
              key={recommendation.template_id}
              recommendation={recommendation}
              onSelect={() => handleTemplateSelect(recommendation)}
              onInstantiate={() => handleTemplateInstantiate(recommendation)}
              onPreview={enablePreview ? () => console.log('Preview:', recommendation) : undefined}
              showReasoningDetails={showReasoningDetails}
              isSelected={selectedRecommendation?.template_id === recommendation.template_id}
            />
          ))
        )}
      </div>

      {/* Detailed Reasoning Panel */}
      {selectedRecommendation && showReasoningDetails && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <span>Why This Template?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReasoningDisplay
              reasoning={selectedRecommendation.reasoning}
              performanceData={selectedRecommendation.performance_data}
              relevanceScore={selectedRecommendation.relevance_score}
              successProbability={selectedRecommendation.success_probability}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartTemplateRecommendations;