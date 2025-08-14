/**
 * Business Context Analyzer Component
 * 
 * Analyzes business information and provides context for template recommendations
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Target, Palette, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';

import {
  BusinessContextAnalyzerProps,
  BusinessAnalysisRequest,
  BusinessAnalysisResult,
  BusinessIndustry
} from '@/types/context-aware-templates';

const industries: BusinessIndustry[] = [
  'technology', 'healthcare', 'finance', 'education', 'retail',
  'manufacturing', 'real-estate', 'food-service', 'professional-services',
  'nonprofit', 'entertainment', 'fitness', 'automotive', 'beauty', 'travel', 'other'
];

const businessGoals = [
  'Generate leads',
  'Increase brand awareness',
  'Drive online sales',
  'Educate customers',
  'Build community',
  'Showcase portfolio',
  'Collect feedback',
  'Support customers',
  'Recruit talent',
  'Partner outreach'
];

const designStyles = ['modern', 'classic', 'minimal', 'bold'] as const;

export const BusinessContextAnalyzer: React.FC<BusinessContextAnalyzerProps> = ({
  onAnalysisComplete,
  initialData,
  isLoading: externalLoading,
  className = ''
}) => {
  // Form State
  const [formData, setFormData] = useState<BusinessAnalysisRequest>({
    business_name: initialData?.business_name || '',
    business_description: initialData?.business_description || '',
    industry: initialData?.industry || undefined,
    target_audience: initialData?.target_audience || '',
    business_goals: initialData?.business_goals || [],
    existing_brand_colors: initialData?.existing_brand_colors || [],
    preferred_style: initialData?.preferred_style || undefined,
    website_url: initialData?.website_url || '',
    competitors: initialData?.competitors || []
  });

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<BusinessAnalysisResult | null>(null);

  // Brand Colors State
  const [colorInput, setColorInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');

  // Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required';
    }

    if (!formData.business_description.trim() || formData.business_description.length < 20) {
      errors.business_description = 'Business description must be at least 20 characters';
    }

    if (formData.business_goals.length === 0) {
      errors.business_goals = 'Please select at least one business goal';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Form Handlers
  const handleInputChange = (field: keyof BusinessAnalysisRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.business_goals;
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    handleInputChange('business_goals', updatedGoals);
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !formData.existing_brand_colors?.includes(colorInput.trim())) {
      const updatedColors = [...(formData.existing_brand_colors || []), colorInput.trim()];
      handleInputChange('existing_brand_colors', updatedColors);
      setColorInput('');
    }
  };

  const handleRemoveColor = (color: string) => {
    const updatedColors = formData.existing_brand_colors?.filter(c => c !== color) || [];
    handleInputChange('existing_brand_colors', updatedColors);
  };

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !formData.competitors?.includes(competitorInput.trim())) {
      const updatedCompetitors = [...(formData.competitors || []), competitorInput.trim()];
      handleInputChange('competitors', updatedCompetitors);
      setCompetitorInput('');
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    const updatedCompetitors = formData.competitors?.filter(c => c !== competitor) || [];
    handleInputChange('competitors', updatedCompetitors);
  };

  // Analysis Simulation (replace with actual API call)
  const performAnalysis = useCallback(async () => {
    if (!validateForm()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate analysis steps
      const steps = [
        { message: 'Analyzing business description...', duration: 1000 },
        { message: 'Classifying industry and market...', duration: 1500 },
        { message: 'Identifying target audience...', duration: 1200 },
        { message: 'Analyzing competitors...', duration: 800 },
        { message: 'Generating recommendations...', duration: 1000 }
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setAnalysisStep(step.message);
        setAnalysisProgress(((i + 1) / steps.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }

      // Mock analysis result
      const mockResult: BusinessAnalysisResult = {
        industry_classification: {
          primary: formData.industry || 'technology',
          secondary: ['software', 'digital services'],
          confidence: 0.87
        },
        target_audience: {
          demographics: ['25-45 years', 'professionals', 'tech-savvy'],
          psychographics: ['efficiency-focused', 'growth-oriented', 'innovation-seeking'],
          confidence: 0.92
        },
        business_type: formData.business_goals.includes('Drive online sales') ? 'b2c' : 'b2b',
        content_requirements: [
          'Clear value proposition',
          'Feature comparisons',
          'Customer testimonials',
          'Pricing information',
          'Contact forms'
        ],
        design_preferences: {
          modern: 0.85,
          minimal: 0.70,
          professional: 0.80,
          colorful: 0.45
        },
        brand_personality: {
          traits: ['innovative', 'trustworthy', 'efficient'],
          tone: 'professional',
          confidence: 0.78
        }
      };

      setAnalysisResult(mockResult);
      onAnalysisComplete(mockResult);

    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
      setAnalysisProgress(0);
    }
  }, [formData, validateForm, onAnalysisComplete]);

  // Render Analysis Results
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Analysis Complete</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Industry Classification */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <h4 className="font-medium">Industry Classification</h4>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Primary: </span>
                <Badge variant="default">{analysisResult.industry_classification.primary}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Secondary: </span>
                <div className="flex gap-1 flex-wrap">
                  {analysisResult.industry_classification.secondary.map(sec => (
                    <Badge key={sec} variant="secondary" className="text-xs">{sec}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {Math.round(analysisResult.industry_classification.confidence * 100)}%
              </div>
            </div>
          </Card>

          {/* Target Audience */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              <h4 className="font-medium">Target Audience</h4>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Demographics: </span>
                <div className="flex gap-1 flex-wrap">
                  {analysisResult.target_audience.demographics.slice(0, 3).map(demo => (
                    <Badge key={demo} variant="outline" className="text-xs">{demo}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Psychographics: </span>
                <div className="flex gap-1 flex-wrap">
                  {analysisResult.target_audience.psychographics.slice(0, 2).map(psycho => (
                    <Badge key={psycho} variant="outline" className="text-xs">{psycho}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Business Type & Brand Personality */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4" />
              <h4 className="font-medium">Business Profile</h4>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Type: </span>
                <Badge variant={analysisResult.business_type === 'b2b' ? 'default' : 'secondary'}>
                  {analysisResult.business_type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Brand Tone: </span>
                <Badge variant="outline">{analysisResult.brand_personality.tone}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Traits: </span>
                <div className="flex gap-1 flex-wrap">
                  {analysisResult.brand_personality.traits.map(trait => (
                    <Badge key={trait} variant="secondary" className="text-xs">{trait}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Design Preferences */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4" />
              <h4 className="font-medium">Design Preferences</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(analysisResult.design_preferences)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([style, score]) => (
                  <div key={style} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{style}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={score * 100} className="w-16 h-2" />
                      <span className="text-xs text-gray-500">{Math.round(score * 100)}%</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Business Context Analysis</h2>
      </div>

      {!analysisResult ? (
        <Card className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); performAnalysis(); }} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Enter your business name"
                    className={validationErrors.business_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.business_name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.business_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="business_description">Business Description *</Label>
                <Textarea
                  id="business_description"
                  value={formData.business_description}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  placeholder="Describe your business, what you do, and what makes you unique..."
                  rows={4}
                  className={validationErrors.business_description ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.business_description && (
                    <p className="text-red-500 text-sm">{validationErrors.business_description}</p>
                  )}
                  <p className="text-gray-500 text-sm ml-auto">{formData.business_description.length} characters</p>
                </div>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Textarea
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="Describe your ideal customers (age, profession, interests, pain points)..."
                  rows={3}
                />
              </div>
            </div>

            {/* Business Goals */}
            <div className="space-y-4">
              <div>
                <Label>Business Goals *</Label>
                <p className="text-sm text-gray-600">Select your primary objectives for this website</p>
                {validationErrors.business_goals && (
                  <p className="text-red-500 text-sm">{validationErrors.business_goals}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {businessGoals.map(goal => (
                  <Button
                    key={goal}
                    type="button"
                    variant={formData.business_goals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGoalToggle(goal)}
                    className="justify-start text-left"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            {/* Brand & Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand & Style</h3>
              
              <div>
                <Label>Preferred Design Style</Label>
                <Select value={formData.preferred_style} onValueChange={(value) => handleInputChange('preferred_style', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred style" />
                  </SelectTrigger>
                  <SelectContent>
                    {designStyles.map(style => (
                      <SelectItem key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Brand Colors</Label>
                <p className="text-sm text-gray-600">Add colors from your existing brand (hex codes or color names)</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="#0066CC or Blue"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                  />
                  <Button type="button" onClick={handleAddColor} size="sm">Add</Button>
                </div>
                {formData.existing_brand_colors && formData.existing_brand_colors.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.existing_brand_colors.map(color => (
                      <Badge key={color} variant="secondary" className="gap-1">
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div>
                <Label htmlFor="website_url">Current Website (optional)</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label>Key Competitors</Label>
                <p className="text-sm text-gray-600">Add competitor websites or company names for analysis</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    placeholder="competitor.com or Company Name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                  />
                  <Button type="button" onClick={handleAddCompetitor} size="sm">Add</Button>
                </div>
                {formData.competitors && formData.competitors.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.competitors.map(competitor => (
                      <Badge key={competitor} variant="outline" className="gap-1">
                        {competitor}
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetitor(competitor)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isAnalyzing || externalLoading}
                className="w-full md:w-auto min-w-48"
              >
                {isAnalyzing || externalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Business Context
                  </>
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            {(isAnalyzing || externalLoading) && (
              <div className="space-y-2">
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-sm text-center text-gray-600">{analysisStep}</p>
              </div>
            )}
          </form>
        </Card>
      ) : (
        renderAnalysisResults()
      )}
    </div>
  );
};