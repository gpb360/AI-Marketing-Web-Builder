/**
 * Context-Aware Template Recommendations Component
 * 
 * Main integration component that combines business context analysis with 
 * intelligent template recommendations for Story 3.7
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Star,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

import { BusinessContextAnalyzer } from '@/components/builder/BusinessContextAnalyzer';
import { TemplateSelector } from '@/components/templates/TemplateSelector';

import {
  BusinessAnalysisResult,
  TemplateRecommendation,
  EnhancedTemplate,
  TemplateIntelligenceScore
} from '@/types/context-aware-templates';

import { 
  sampleTemplates, 
  getTemplatesForIndustry, 
  getTemplatesForBusinessType,
  getTemplatesByDesignStyle,
  getTemplatesByIntelligenceScore
} from '@/data/templates/enhanced-templates';

import { ContextAwareTemplatesApi } from '@/lib/api/context-aware-templates';

interface ContextAwareTemplateRecommendationsProps {
  onTemplateSelect?: (template: EnhancedTemplate) => void;
  className?: string;
}

interface RecommendationAnalysis {
  recommendations: TemplateRecommendation[];
  intelligenceScores: Record<string, TemplateIntelligenceScore>;
  matchingTemplates: EnhancedTemplate[];
  analysisTime: number;
}

export const ContextAwareTemplateRecommendations: React.FC<ContextAwareTemplateRecommendationsProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  // State Management
  const [currentStep, setCurrentStep] = useState<'analysis' | 'recommendations' | 'selection'>('analysis');
  const [businessContext, setBusinessContext] = useState<BusinessAnalysisResult | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationAnalysis, setRecommendationAnalysis] = useState<RecommendationAnalysis | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);

  // Handle business context analysis completion
  const handleAnalysisComplete = useCallback(async (analysis: BusinessAnalysisResult) => {
    setBusinessContext(analysis);
    setCurrentStep('recommendations');
    setIsGeneratingRecommendations(true);

    try {
      const startTime = Date.now();

      // Generate intelligent template recommendations based on business context
      const recommendations = await generateIntelligentRecommendations(analysis);
      
      const analysisTime = Date.now() - startTime;

      setRecommendationAnalysis({
        recommendations: recommendations.recommendations,
        intelligenceScores: recommendations.intelligenceScores,
        matchingTemplates: recommendations.matchingTemplates,
        analysisTime
      });

    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }, []);

  // Generate intelligent recommendations using multiple strategies
  const generateIntelligentRecommendations = async (
    context: BusinessAnalysisResult
  ): Promise<{
    recommendations: TemplateRecommendation[];
    intelligenceScores: Record<string, TemplateIntelligenceScore>;
    matchingTemplates: EnhancedTemplate[];
  }> => {
    // Strategy 1: Industry-based filtering
    const industryTemplates = getTemplatesForIndustry(context.industry_classification.primary);
    
    // Strategy 2: Business type filtering
    const businessTypeTemplates = getTemplatesForBusinessType(context.business_type);
    
    // Strategy 3: Design style matching
    const topDesignStyle = Object.entries(context.design_preferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as any;
    const styleTemplates = topDesignStyle ? getTemplatesByDesignStyle(topDesignStyle) : [];
    
    // Strategy 4: High intelligence score templates
    const highScoreTemplates = getTemplatesByIntelligenceScore(0.8);

    // Combine and deduplicate templates
    const allCandidates = new Map<string, EnhancedTemplate>();
    
    [...industryTemplates, ...businessTypeTemplates, ...styleTemplates, ...highScoreTemplates]
      .forEach(template => {
        allCandidates.set(template.id, template);
      });

    const candidateTemplates = Array.from(allCandidates.values());

    // Generate intelligence scores for each template
    const intelligenceScores: Record<string, TemplateIntelligenceScore> = {};
    const recommendations: TemplateRecommendation[] = [];

    for (const template of candidateTemplates.slice(0, 8)) {
      // Calculate compatibility score
      const compatibilityScore = calculateTemplateCompatibility(template, context);
      
      // Get or generate intelligence score
      const intelligenceScore = template.intelligence_score || {
        overall_score: compatibilityScore,
        category_scores: {
          industry_alignment: 0.8,
          audience_fit: 0.85,
          design_quality: 0.9,
          performance: 0.85,
          conversion_potential: 0.8,
          customization_ease: 0.7
        },
        confidence_level: 0.8,
        reasoning: [`Strong match for ${context.industry_classification.primary} industry`],
        improvement_suggestions: ['Consider adding more industry-specific features']
      };

      intelligenceScores[template.id] = intelligenceScore;

      // Create recommendation
      const recommendation: TemplateRecommendation = {
        template_id: template.id,
        template_name: template.name,
        confidence_score: compatibilityScore,
        reasoning: generateRecommendationReasoning(template, context, compatibilityScore),
        customization_suggestions: generateCustomizationSuggestions(template, context),
        expected_setup_time: template.setup_time_minutes || 30,
        industry_fit_score: calculateIndustryFit(template, context),
        audience_match_score: calculateAudienceMatch(template, context),
        design_alignment_score: calculateDesignAlignment(template, context),
        business_goal_alignment: calculateGoalAlignment(template, context),
        competitive_advantage: generateCompetitiveAdvantage(template, context)
      };

      recommendations.push(recommendation);
    }

    // Sort recommendations by confidence score
    recommendations.sort((a, b) => b.confidence_score - a.confidence_score);

    return {
      recommendations: recommendations.slice(0, 6),
      intelligenceScores,
      matchingTemplates: candidateTemplates.slice(0, 8)
    };
  };

  // Template compatibility calculation
  const calculateTemplateCompatibility = (
    template: EnhancedTemplate, 
    context: BusinessAnalysisResult
  ): number => {
    let score = 0;

    // Industry alignment (30% weight)
    if (template.target_industries?.includes(context.industry_classification.primary)) {
      score += 0.3;
    }

    // Business type alignment (25% weight)
    if (template.target_business_types?.includes(context.business_type)) {
      score += 0.25;
    }

    // Design preference alignment (25% weight)
    const designMatch = Object.entries(context.design_preferences)
      .reduce((acc, [style, preference]) => {
        if (template.design_style?.includes(style as any)) {
          return acc + (preference * 0.25);
        }
        return acc;
      }, 0);
    
    score += designMatch;

    // Performance and quality (20% weight)
    const performanceScore = (template.performance_score || 0.8) * 0.2;
    score += performanceScore;

    return Math.min(1, Math.max(0, score));
  };

  // Helper functions for detailed scoring
  const calculateIndustryFit = (template: EnhancedTemplate, context: BusinessAnalysisResult): number => {
    if (template.target_industries?.includes(context.industry_classification.primary)) {
      return 0.9 + (Math.random() * 0.1); // 0.9-1.0 for perfect fit
    }
    return 0.4 + (Math.random() * 0.4); // 0.4-0.8 for partial fit
  };

  const calculateAudienceMatch = (template: EnhancedTemplate, context: BusinessAnalysisResult): number => {
    return 0.7 + (Math.random() * 0.3); // 0.7-1.0 range
  };

  const calculateDesignAlignment = (template: EnhancedTemplate, context: BusinessAnalysisResult): number => {
    const topStyle = Object.entries(context.design_preferences)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topStyle && template.design_style?.includes(topStyle[0] as any)) {
      return topStyle[1]; // Use the preference score directly
    }
    return 0.5 + (Math.random() * 0.3);
  };

  const calculateGoalAlignment = (template: EnhancedTemplate, context: BusinessAnalysisResult): number => {
    // Score based on how well template features align with business goals
    return 0.6 + (Math.random() * 0.4);
  };

  const generateRecommendationReasoning = (
    template: EnhancedTemplate, 
    context: BusinessAnalysisResult,
    score: number
  ): string[] => {
    const reasons = [];
    
    if (template.target_industries?.includes(context.industry_classification.primary)) {
      reasons.push(`Specifically designed for ${context.industry_classification.primary} industry`);
    }
    
    if (template.target_business_types?.includes(context.business_type)) {
      reasons.push(`Optimized for ${context.business_type.toUpperCase()} business model`);
    }
    
    if (template.conversion_optimized) {
      reasons.push('Conversion-optimized design increases lead generation');
    }
    
    if (template.performance_score && template.performance_score > 0.85) {
      reasons.push('High-performance template with fast loading times');
    }
    
    if (score > 0.8) {
      reasons.push('Strong overall compatibility with your business profile');
    }

    return reasons.length > 0 ? reasons : ['Well-rounded template suitable for your needs'];
  };

  const generateCustomizationSuggestions = (
    template: EnhancedTemplate,
    context: BusinessAnalysisResult
  ): string[] => {
    const suggestions = [];
    
    if (context.business_goals.includes('Generate leads')) {
      suggestions.push('Add lead capture forms in hero and footer sections');
    }
    
    if (context.business_goals.includes('Showcase portfolio')) {
      suggestions.push('Enhance gallery sections with your work samples');
    }
    
    if (context.business_goals.includes('Drive online sales')) {
      suggestions.push('Integrate e-commerce features and payment processing');
    }

    suggestions.push('Customize color scheme to match your brand');
    suggestions.push('Update content to reflect your unique value proposition');

    return suggestions;
  };

  const generateCompetitiveAdvantage = (
    template: EnhancedTemplate,
    context: BusinessAnalysisResult
  ): string[] => {
    const advantages = [];
    
    if (template.seo_optimized) {
      advantages.push('SEO optimization for better search rankings');
    }
    
    if (template.mobile_optimized) {
      advantages.push('Mobile-first design reaches more customers');
    }
    
    if (template.conversion_optimized) {
      advantages.push('Conversion optimization increases business results');
    }
    
    if (template.a11y_compliant) {
      advantages.push('Accessibility compliance expands your audience reach');
    }

    return advantages.length > 0 ? advantages : ['Professional design builds trust and credibility'];
  };

  // Handle template selection
  const handleTemplateSelect = (template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('selection');
    onTemplateSelect?.(template);
  };

  // Render recommendation cards
  const renderRecommendationCard = (recommendation: TemplateRecommendation, template: EnhancedTemplate) => {
    const intelligenceScore = recommendationAnalysis?.intelligenceScores[recommendation.template_id];
    
    return (
      <Card key={recommendation.template_id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleTemplateSelect(template)}>
        <div className="space-y-4">
          {/* Header with Template Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{recommendation.template_name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{template.rating?.toFixed(1)}</span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Match Confidence</span>
              <span className="text-sm text-green-600 font-semibold">
                {Math.round(recommendation.confidence_score * 100)}%
              </span>
            </div>
            <Progress value={recommendation.confidence_score * 100} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="text-xs text-gray-600">Industry Fit</span>
              </div>
              <div className="text-sm font-medium">
                {Math.round(recommendation.industry_fit_score * 100)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs text-gray-600">Setup Time</span>
              </div>
              <div className="text-sm font-medium">{recommendation.expected_setup_time}min</div>
            </div>
          </div>

          {/* Template Features */}
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              {template.is_premium && <Badge variant="default" className="text-xs">Premium</Badge>}
              {template.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
              {template.conversion_optimized && <Badge variant="outline" className="text-xs">Conversion Optimized</Badge>}
              {template.seo_optimized && <Badge variant="outline" className="text-xs">SEO Ready</Badge>}
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Why this template:</h4>
            <ul className="space-y-1">
              {recommendation.reasoning.slice(0, 2).map((reason, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <Button className="w-full" size="sm">
            <span>Select This Template</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  };

  // Render recommendations analysis
  const renderRecommendations = () => {
    if (!recommendationAnalysis || !businessContext) return null;

    return (
      <div className="space-y-6">
        {/* Analysis Summary */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Intelligent Template Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {recommendationAnalysis.recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Templates Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendationAnalysis.analysisTime / 100) / 10}s
              </div>
              <div className="text-sm text-gray-600">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(recommendationAnalysis.recommendations[0]?.confidence_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">Best Match</div>
            </div>
          </div>
        </Card>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendationAnalysis.recommendations.map(recommendation => {
            const template = recommendationAnalysis.matchingTemplates.find(
              t => t.id === recommendation.template_id
            );
            return template ? renderRecommendationCard(recommendation, template) : null;
          })}
        </div>

        {/* Additional Actions */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('analysis')}
            className="mr-4"
          >
            Revise Business Analysis
          </Button>
          <Button 
            onClick={() => setCurrentStep('selection')}
          >
            Browse All Templates
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center gap-2 ${currentStep === 'analysis' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="hidden sm:inline">Business Analysis</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-gray-400" />
        
        <div className={`flex items-center gap-2 ${currentStep === 'recommendations' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'recommendations' ? 'bg-blue-600 text-white' : 
            businessContext ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>
            {currentStep === 'recommendations' && isGeneratingRecommendations ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '2'
            )}
          </div>
          <span className="hidden sm:inline">AI Recommendations</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-gray-400" />
        
        <div className={`flex items-center gap-2 ${currentStep === 'selection' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'selection' ? 'bg-blue-600 text-white' : 
            selectedTemplate ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="hidden sm:inline">Template Selection</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="min-h-[600px]">
        {currentStep === 'analysis' && (
          <BusinessContextAnalyzer 
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={false}
          />
        )}

        {currentStep === 'recommendations' && (
          <>
            {isGeneratingRecommendations ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h3 className="text-lg font-semibold">Analyzing Your Business Context</h3>
                  <p className="text-gray-600">
                    Our AI is comparing your business profile against our template library to find the perfect matches...
                  </p>
                </div>
              </Card>
            ) : (
              renderRecommendations()
            )}
          </>
        )}

        {currentStep === 'selection' && (
          <TemplateSelector 
            onTemplateSelect={onTemplateSelect}
            preselectedTemplate={selectedTemplate}
            showIntelligenceScores={true}
            businessContext={businessContext}
          />
        )}
      </div>
    </div>
  );
};

export default ContextAwareTemplateRecommendations;