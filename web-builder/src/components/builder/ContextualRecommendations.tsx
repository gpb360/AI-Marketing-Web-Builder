/**
 * Contextual Recommendations Component
 * 
 * Provides context-based template and component suggestions
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Layers, 
  FileText, 
  Workflow,
  Star,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

import {
  ContextualRecommendationsProps,
  ContextualRecommendation,
  RecommendationContext
} from '@/types/context-aware-templates';

// Mock recommendations data - replace with actual API calls
const generateMockRecommendations = (context: RecommendationContext): ContextualRecommendation[] => {
  const { business_analysis, current_template } = context;
  
  const templateRecommendations: ContextualRecommendation[] = [
    {
      id: 'template-1',
      type: 'template',
      title: 'SaaS Landing Page Pro',
      description: 'High-converting template specifically designed for SaaS businesses',
      reasoning: `Based on your ${business_analysis.industry_classification.primary} industry classification and B2B business model, this template has shown 23% higher conversion rates.`,
      confidence: 0.92,
      priority: 'high',
      implementation_effort: 3,
      expected_impact: '15-25% increase in lead generation',
      action_url: '/templates/saas-landing-pro',
      preview_data: {
        thumbnail: '/templates/saas-landing-pro-thumb.jpg',
        conversion_rate: 0.087,
        industry_fit: 95
      }
    },
    {
      id: 'template-2',
      type: 'template',
      title: 'B2B Service Provider',
      description: 'Professional template for service-based businesses',
      reasoning: 'Matches your target audience demographics and professional brand tone',
      confidence: 0.84,
      priority: 'medium',
      implementation_effort: 4,
      expected_impact: '10-18% improvement in user engagement'
    }
  ];

  const componentRecommendations: ContextualRecommendation[] = [
    {
      id: 'comp-1',
      type: 'component',
      title: 'Customer Testimonial Carousel',
      description: 'Social proof component to build trust with potential customers',
      reasoning: `Your industry benefits significantly from social proof. Companies in ${business_analysis.industry_classification.primary} see 34% more conversions with testimonials.`,
      confidence: 0.89,
      priority: 'high',
      implementation_effort: 2,
      expected_impact: 'Increase trust and conversions by 20-30%'
    },
    {
      id: 'comp-2',
      type: 'component',
      title: 'Feature Comparison Table',
      description: 'Help visitors understand your value proposition clearly',
      reasoning: 'B2B customers need detailed feature information to make decisions',
      confidence: 0.76,
      priority: 'medium',
      implementation_effort: 3,
      expected_impact: 'Reduce decision time by 15%'
    },
    {
      id: 'comp-3',
      type: 'component',
      title: 'ROI Calculator',
      description: 'Interactive tool to demonstrate value to potential customers',
      reasoning: 'SaaS businesses with ROI calculators see 40% more qualified leads',
      confidence: 0.81,
      priority: 'high',
      implementation_effort: 5,
      expected_impact: 'Generate 25-40% more qualified leads'
    }
  ];

  const contentRecommendations: ContextualRecommendation[] = [
    {
      id: 'content-1',
      type: 'content',
      title: 'Industry-Specific Headlines',
      description: 'Customize headlines for your target audience',
      reasoning: `Headlines mentioning "${business_analysis.industry_classification.primary}" perform 45% better in your industry`,
      confidence: 0.93,
      priority: 'high',
      implementation_effort: 1,
      expected_impact: 'Improve headline engagement by 30-45%'
    },
    {
      id: 'content-2',
      type: 'content',
      title: 'Pain Point Messaging',
      description: 'Address specific challenges your audience faces',
      reasoning: 'Your target audience responds well to problem-solution messaging',
      confidence: 0.85,
      priority: 'medium',
      implementation_effort: 2,
      expected_impact: 'Increase message resonance by 25%'
    }
  ];

  const workflowRecommendations: ContextualRecommendation[] = [
    {
      id: 'workflow-1',
      type: 'workflow',
      title: 'Lead Nurturing Sequence',
      description: 'Automated email sequence for new leads',
      reasoning: 'B2B leads need 5-7 touchpoints before converting. This workflow increases conversion by 65%.',
      confidence: 0.88,
      priority: 'high',
      implementation_effort: 4,
      expected_impact: 'Increase lead conversion by 50-65%'
    },
    {
      id: 'workflow-2',
      type: 'workflow',
      title: 'Demo Request Follow-up',
      description: 'Automated follow-up for demo requests',
      reasoning: 'Quick follow-up on demo requests increases show-up rates by 40%',
      confidence: 0.82,
      priority: 'medium',
      implementation_effort: 3,
      expected_impact: 'Improve demo show-up rate by 35-40%'
    }
  ];

  return [
    ...templateRecommendations,
    ...componentRecommendations,
    ...contentRecommendations,
    ...workflowRecommendations
  ];
};

export const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  context,
  onRecommendationSelect,
  maxRecommendations = 10,
  filterByType,
  showPriorityFilter = true,
  className = ''
}) => {
  // State
  const [recommendations, setRecommendations] = useState<ContextualRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'priority' | 'effort'>('confidence');
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative'>>({});

  // Load recommendations
  useEffect(() => {
    loadRecommendations();
  }, [context]);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockRecs = generateMockRecommendations(context);
      setRecommendations(mockRecs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by type
    if (filterByType && filterByType.length > 0) {
      filtered = filtered.filter(rec => filterByType.includes(rec.type));
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(rec => rec.type === activeTab);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(rec => rec.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'effort':
          return a.implementation_effort - b.implementation_effort;
        default:
          return 0;
      }
    });

    return filtered.slice(0, maxRecommendations);
  }, [recommendations, filterByType, activeTab, priorityFilter, sortBy, maxRecommendations]);

  // Handle recommendation feedback
  const handleFeedback = (id: string, type: 'positive' | 'negative') => {
    setFeedback(prev => ({ ...prev, [id]: type }));
    // Here you would typically send feedback to your analytics service
  };

  // Render recommendation card
  const renderRecommendationCard = (recommendation: ContextualRecommendation) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'template': return <Layers className="h-4 w-4" />;
        case 'component': return <Target className="h-4 w-4" />;
        case 'content': return <FileText className="h-4 w-4" />;
        case 'workflow': return <Workflow className="h-4 w-4" />;
        default: return <Lightbulb className="h-4 w-4" />;
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'text-red-600 bg-red-50 border-red-200';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'low': return 'text-green-600 bg-green-50 border-green-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <Card key={recommendation.id} className="p-6 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                {getTypeIcon(recommendation.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
              </div>
            </div>
            <Badge className={`${getPriorityColor(recommendation.priority)} border`}>
              {recommendation.priority} priority
            </Badge>
          </div>

          {/* Confidence and Metrics */}
          <div className="flex items-center gap-6 py-2 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {Math.round(recommendation.confidence * 100)}% confidence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {recommendation.implementation_effort}/5 effort
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{recommendation.expected_impact}</span>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">AI Analysis</h4>
                <p className="text-sm text-blue-700 mt-1">{recommendation.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(recommendation.id, 'positive')}
                className={`gap-1 ${
                  feedback[recommendation.id] === 'positive' ? 'bg-green-50 text-green-700' : ''
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(recommendation.id, 'negative')}
                className={`gap-1 ${
                  feedback[recommendation.id] === 'negative' ? 'bg-red-50 text-red-700' : ''
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
                Not helpful
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.action_url && (
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
              )}
              <Button 
                onClick={() => onRecommendationSelect(recommendation)}
                className="gap-1"
              >
                Apply
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Get recommendation counts by type
  const getCountByType = (type: string) => {
    if (type === 'all') return recommendations.length;
    return recommendations.filter(r => r.type === type).length;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <h3 className="text-lg font-medium">Analyzing Context</h3>
              <p className="text-gray-600">Finding personalized recommendations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <div>
            <h2 className="text-xl font-semibold">Smart Recommendations</h2>
            <p className="text-sm text-gray-600">
              AI-powered suggestions based on your business context and industry best practices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showPriorityFilter && (
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={loadRecommendations} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Business Context Summary */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">
              Recommendations for {context.business_analysis.industry_classification.primary} business
            </h3>
            <p className="text-sm text-blue-700">
              Targeting {context.business_analysis.target_audience.demographics.join(', ')} • 
              {context.business_analysis.business_type.toUpperCase()} model • 
              {context.business_analysis.brand_personality.tone} tone
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{recommendations.length}</div>
            <div className="text-sm text-blue-600">suggestions</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            All ({getCountByType('all')})
          </TabsTrigger>
          <TabsTrigger value="template" className="gap-2">
            <Layers className="h-4 w-4" />
            Templates ({getCountByType('template')})
          </TabsTrigger>
          <TabsTrigger value="component" className="gap-2">
            <Target className="h-4 w-4" />
            Components ({getCountByType('component')})
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Content ({getCountByType('content')})
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <Workflow className="h-4 w-4" />
            Workflows ({getCountByType('workflow')})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value={activeTab} className="space-y-0">
            {filteredRecommendations.length > 0 ? (
              <div className="space-y-4">
                {filteredRecommendations.map(renderRecommendationCard)}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Lightbulb className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Recommendations</h3>
                    <p className="text-gray-600">
                      No suggestions found for the current filters. Try adjusting your criteria.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setActiveTab('all');
                    setPriorityFilter('all');
                  }}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};