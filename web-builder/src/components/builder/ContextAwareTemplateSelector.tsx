/**
 * Context-Aware Template Selector Component
 * 
 * Smart template selection based on business context analysis
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Palette, 
  Layout, 
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw
} from 'lucide-react';

import {
  ContextAwareTemplateSelectorProps,
  TemplateRecommendation,
  BusinessAnalysisResult
} from '@/types/context-aware-templates';
import { sampleTemplates, templateCategories } from '@/data/templates/enhanced-templates';

// Mock API function - replace with actual implementation
const getTemplateRecommendations = async (
  businessContext: BusinessAnalysisResult,
  maxRecommendations: number = 3
): Promise<TemplateRecommendation[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock recommendation logic based on business context
  const recommendations: TemplateRecommendation[] = sampleTemplates
    .slice(0, maxRecommendations)
    .map((template, index) => ({
      template_id: template.id,
      template: template,
      confidence_score: 0.95 - (index * 0.1), // Decreasing confidence
      match_reasoning: {
        industry_alignment: `Perfect match for ${businessContext.industry_classification.primary} businesses`,
        audience_fit: `Designed for ${businessContext.target_audience.demographics.join(', ')} demographics`,
        feature_benefits: [
          'Conversion-optimized layout',
          'Mobile-first responsive design',
          'Industry-specific components',
          'Built-in SEO optimization'
        ],
        design_rationale: `${template.name} aligns with your ${businessContext.brand_personality.tone} brand tone and modern aesthetic preferences`
      },
      customization_preview: {
        hero_text: `Transform Your ${businessContext.industry_classification.primary} Business`,
        cta_buttons: ['Get Started Today', 'Learn More', 'Contact Us'],
        color_scheme: ['#0066CC', '#00A3E0', '#7B68EE'],
        content_sections: [
          {
            id: 'hero-1',
            type: 'hero',
            title: 'Hero Section',
            content: `Customized hero content for ${businessContext.industry_classification.primary}`,
            customized: true,
            ai_generated: true
          },
          {
            id: 'features-1',
            type: 'features',
            title: 'Features Section',
            content: 'Industry-specific feature showcase',
            customized: true,
            ai_generated: true
          }
        ]
      },
      pros: [
        'High conversion rate in your industry',
        'Mobile-optimized design',
        'Fast loading performance',
        'Easy to customize',
        'SEO-ready structure'
      ],
      cons: index === 0 ? [] : [
        'May require additional customization for unique needs',
        'Premium features require upgrade'
      ],
      estimated_conversion_rate: 0.085 - (index * 0.01),
      setup_complexity: index === 0 ? 'low' : index === 1 ? 'medium' : 'high',
      customization_effort: 3 + (index * 2)
    }));

  return recommendations;
};

export const ContextAwareTemplateSelector: React.FC<ContextAwareTemplateSelectorProps> = ({
  businessContext,
  onTemplateSelect,
  maxRecommendations = 3,
  showReasoningDetails = true,
  enableComparison = true,
  className = ''
}) => {
  // State
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'confidence' | 'conversion' | 'complexity'>('confidence');

  // Load recommendations when business context is available
  useEffect(() => {
    if (businessContext) {
      loadRecommendations();
    }
  }, [businessContext, maxRecommendations]);

  const loadRecommendations = useCallback(async () => {
    if (!businessContext) return;
    
    setIsLoading(true);
    try {
      const recs = await getTemplateRecommendations(businessContext, maxRecommendations);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [businessContext, maxRecommendations]);

  // Sort recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence_score - a.confidence_score;
      case 'conversion':
        return (b.estimated_conversion_rate || 0) - (a.estimated_conversion_rate || 0);
      case 'complexity':
        const complexityOrder = { low: 1, medium: 2, high: 3 };
        return complexityOrder[a.setup_complexity] - complexityOrder[b.setup_complexity];
      default:
        return 0;
    }
  });

  // Handle template selection
  const handleTemplateSelect = (recommendation: TemplateRecommendation) => {
    setSelectedTemplateId(recommendation.template_id);
    onTemplateSelect(recommendation);
  };

  // Render confidence indicator
  const renderConfidenceIndicator = (score: number) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium">{Math.round(score * 100)}%</span>
      </div>
      <Progress value={score * 100} className="w-16 h-2" />
    </div>
  );

  // Render setup complexity badge
  const renderComplexityBadge = (complexity: string) => {
    const variants = {
      low: { variant: 'secondary' as const, icon: '🟢', text: 'Easy Setup' },
      medium: { variant: 'outline' as const, icon: '🟡', text: 'Moderate Setup' },
      high: { variant: 'destructive' as const, icon: '🟠', text: 'Advanced Setup' }
    };

    const config = variants[complexity as keyof typeof variants];
    return (
      <Badge variant={config.variant} className="gap-1">
        <span>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  // Render template card
  const renderTemplateCard = (recommendation: TemplateRecommendation, index: number) => (
    <Card 
      key={recommendation.template_id}
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        selectedTemplateId === recommendation.template_id ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {index === 0 && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 gap-1">
            <Sparkles className="h-3 w-3" />
            Best Match
          </Badge>
        </div>
      )}

      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <img 
          src={recommendation.template.thumbnail || '/templates/default-thumbnail.jpg'}
          alt={`${recommendation.template.name} preview`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/templates/default-thumbnail.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button variant="secondary" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Template Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{recommendation.template.name}</h3>
            {renderConfidenceIndicator(recommendation.confidence_score)}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {recommendation.template.description}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {recommendation.estimated_conversion_rate ? 
                `${(recommendation.estimated_conversion_rate * 100).toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <div className="text-xs text-gray-500">Est. Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {recommendation.customization_effort}/10
            </div>
            <div className="text-xs text-gray-500">Setup Effort</div>
          </div>
        </div>

        {/* Match Reasoning (if enabled) */}
        {showReasoningDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Why this template?</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-3 w-3" />
                <span className="line-clamp-1">{recommendation.match_reasoning.audience_fit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-3 w-3" />
                <span className="line-clamp-1">{recommendation.match_reasoning.industry_alignment}</span>
              </div>
            </div>
          </div>
        )}

        {/* Key Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Benefits</h4>
          <div className="flex flex-wrap gap-1">
            {recommendation.match_reasoning.feature_benefits.slice(0, 3).map(benefit => (
              <Badge key={benefit} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Setup Complexity */}
        <div className="flex justify-between items-center">
          {renderComplexityBadge(recommendation.setup_complexity)}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            ~{recommendation.customization_effort * 10} min setup
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span className="font-medium">Pros</span>
              </div>
              <ul className="text-gray-600 space-y-0.5 ml-4">
                {recommendation.pros.slice(0, 2).map(pro => (
                  <li key={pro} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span className="line-clamp-1">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {recommendation.cons.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-medium">Considerations</span>
                </div>
                <ul className="text-gray-600 space-y-0.5 ml-4">
                  {recommendation.cons.slice(0, 2).map(con => (
                    <li key={con} className="flex items-start gap-1">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span className="line-clamp-1">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 gap-2"
            onClick={() => handleTemplateSelect(recommendation)}
            disabled={selectedTemplateId === recommendation.template_id}
          >
            {selectedTemplateId === recommendation.template_id ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Selected
              </>
            ) : (
              <>
                Select Template
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <h3 className="text-lg font-medium">Analyzing Templates</h3>
              <p className="text-gray-600">Finding the perfect templates for your business...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No business context
  if (!businessContext) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Business Analysis Required</h3>
              <p className="text-gray-600">
                Complete the business context analysis to get AI-powered template recommendations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Smart Template Recommendations</h2>
            <p className="text-sm text-gray-600">
              AI-curated templates perfect for your {businessContext.industry_classification.primary} business
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRecommendations}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Button
                variant={sortBy === 'confidence' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('confidence')}
              >
                Confidence
              </Button>
              <Button
                variant={sortBy === 'conversion' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('conversion')}
              >
                Conversion
              </Button>
              <Button
                variant={sortBy === 'complexity' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('complexity')}
              >
                Complexity
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedRecommendations.map((recommendation, index) => 
            renderTemplateCard(recommendation, index)
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Recommendations Found</h3>
              <p className="text-gray-600">
                We couldn't find matching templates for your business context. Try refreshing or adjusting your business information.
              </p>
            </div>
            <Button variant="outline" onClick={loadRecommendations} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};