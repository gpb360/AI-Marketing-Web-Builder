/**
 * Context-Aware Builder - Main Integration Component
 * 
 * Orchestrates the complete flow from business context collection to template personalization
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ContextAwareTemplateLoading } from '@/components/ui/loading-skeleton';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Target,
  Sparkles,
  Wand2,
  Save,
  Eye,
  RefreshCw,
  Lightbulb,
  Users,
  Building2,
  Palette
} from 'lucide-react';

// Import the 4 core components
import { BusinessContextAnalyzer } from './BusinessContextAnalyzer';
import { ContextAwareTemplateSelector } from './ContextAwareTemplateSelector';
import { ContextualRecommendations } from './ContextualRecommendations';
import { TemplatePersonalization } from './TemplatePersonalization';

// Import types
import {
  BusinessAnalysisResult,
  TemplateRecommendation,
  Template,
  PersonalizationSettings,
  TemplateCustomization,
  TemplatePreview,
  CustomizedTemplate
} from '@/types/context-aware-templates';

interface ContextAwareBuilderProps {
  onTemplateComplete?: (customizedTemplate: CustomizedTemplate) => void;
  onStepChange?: (step: number, data?: any) => void;
  initialStep?: number;
  enablePreview?: boolean;
  showProgress?: boolean;
  className?: string;
}

type BuilderStep = 'analysis' | 'selection' | 'recommendations' | 'personalization' | 'preview';

interface StepConfig {
  id: BuilderStep;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const BUILDER_STEPS: StepConfig[] = [
  {
    id: 'analysis',
    title: 'Business Analysis',
    description: 'Tell us about your business',
    icon: Building2,
    color: 'blue'
  },
  {
    id: 'selection',
    title: 'Template Selection',
    description: 'Choose from AI recommendations',
    icon: Target,
    color: 'green'
  },
  {
    id: 'recommendations',
    title: 'AI Insights',
    description: 'Review detailed recommendations',
    icon: Lightbulb,
    color: 'yellow'
  },
  {
    id: 'personalization',
    title: 'Personalization',
    description: 'Customize your template',
    icon: Palette,
    color: 'purple'
  },
  {
    id: 'preview',
    title: 'Final Preview',
    description: 'Review and save',
    icon: Eye,
    color: 'indigo'
  }
];

export const ContextAwareBuilder: React.FC<ContextAwareBuilderProps> = ({
  onTemplateComplete,
  onStepChange,
  initialStep = 0,
  enablePreview = true,
  showProgress = true,
  className = ''
}) => {
  // State Management
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [businessContext, setBusinessContext] = useState<BusinessAnalysisResult | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<TemplateRecommendation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [personalizationSettings, setPersonalizationSettings] = useState<PersonalizationSettings | null>(null);
  const [templateCustomization, setTemplateCustomization] = useState<TemplateCustomization | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepData, setStepData] = useState<Record<string, any>>({});

  // Current step configuration
  const currentStep = BUILDER_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === BUILDER_STEPS.length - 1;

  // Progress calculation
  const progress = useMemo(() => {
    return ((currentStepIndex + 1) / BUILDER_STEPS.length) * 100;
  }, [currentStepIndex]);

  // Step validation
  const canProceedToNext = useMemo(() => {
    switch (currentStep.id) {
      case 'analysis':
        return !!businessContext;
      case 'selection':
        return !!selectedRecommendation || !!selectedTemplate;
      case 'recommendations':
        return !!selectedTemplate;
      case 'personalization':
        return !!templateCustomization;
      case 'preview':
        return true;
      default:
        return false;
    }
  }, [currentStep.id, businessContext, selectedRecommendation, selectedTemplate, templateCustomization]);

  // Step change handler
  const handleStepChange = useCallback((stepIndex: number, data?: any) => {
    setCurrentStepIndex(stepIndex);
    setError(null);
    
    if (data) {
      setStepData(prev => ({
        ...prev,
        [BUILDER_STEPS[stepIndex].id]: data
      }));
    }
    
    if (onStepChange) {
      onStepChange(stepIndex, data);
    }
  }, [onStepChange]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (canProceedToNext && !isLastStep) {
      handleStepChange(currentStepIndex + 1);
    }
  }, [canProceedToNext, isLastStep, currentStepIndex, handleStepChange]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      handleStepChange(currentStepIndex - 1);
    }
  }, [isFirstStep, currentStepIndex, handleStepChange]);

  const handleStepClick = useCallback((stepIndex: number) => {
    // Only allow clicking on completed steps or the next step
    if (stepIndex <= currentStepIndex + 1) {
      handleStepChange(stepIndex);
    }
  }, [currentStepIndex, handleStepChange]);

  // Business Analysis completion
  const handleAnalysisComplete = useCallback(async (result: BusinessAnalysisResult) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setBusinessContext(result);
      
      // Auto-proceed to template selection
      setTimeout(() => {
        setIsLoading(false);
        handleNext();
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to process business analysis');
      setIsLoading(false);
    }
  }, [handleNext]);

  // Template selection from selector
  const handleTemplateSelect = useCallback((recommendation: TemplateRecommendation) => {
    setSelectedRecommendation(recommendation);
    setSelectedTemplate(recommendation.template);
    
    // Set recommendations for the next step
    if (businessContext) {
      // Mock recommendations - in real app, this would be fetched
      setRecommendations([recommendation]);
    }
    
    // Auto-proceed to recommendations
    setTimeout(() => {
      handleNext();
    }, 500);
  }, [businessContext, handleNext]);

  // Template selection from recommendations
  const handleRecommendationTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
    
    // Auto-proceed to personalization
    setTimeout(() => {
      handleNext();
    }, 500);
  }, [handleNext]);

  // Template preview
  const handleTemplatePreview = useCallback((template: Template) => {
    // Handle preview logic
    console.log('Previewing template:', template);
  }, []);

  // Personalization updates
  const handlePersonalizationUpdate = useCallback((customization: TemplateCustomization) => {
    setTemplateCustomization(customization);
  }, []);

  const handlePreviewUpdate = useCallback((preview: TemplatePreview) => {
    setPreviewData(preview);
  }, []);

  // Save final template
  const handleSaveTemplate = useCallback((customizedTemplate: CustomizedTemplate) => {
    if (onTemplateComplete) {
      onTemplateComplete(customizedTemplate);
    }
    
    // Could also show success message or redirect
    console.log('Template saved:', customizedTemplate);
  }, [onTemplateComplete]);

  // Error handler
  const handleError = useCallback((error: Error) => {
    setError(error.message);
    setIsLoading(false);
  }, []);

  // Retry current step
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(false);
    // Trigger re-render of current step
  }, []);

  // Reset builder
  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setBusinessContext(null);
    setSelectedRecommendation(null);
    setSelectedTemplate(null);
    setRecommendations([]);
    setPersonalizationSettings(null);
    setTemplateCustomization(null);
    setPreviewData(null);
    setError(null);
    setStepData({});
  }, []);

  // Render step content
  const renderStepContent = () => {
    if (isLoading) {
      return (
        <ContextAwareTemplateLoading
          type={currentStep.id === 'analysis' ? 'analysis' : 
                currentStep.id === 'selection' ? 'recommendations' :
                currentStep.id === 'recommendations' ? 'contextual' :
                'personalization'}
          className="min-h-[500px]"
        />
      );
    }

    if (error) {
      return (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
            <Button onClick={handleReset} variant="outline">
              Start Over
            </Button>
          </div>
        </Card>
      );
    }

    switch (currentStep.id) {
      case 'analysis':
        return (
          <BusinessContextAnalyzer
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading}
          />
        );

      case 'selection':
        return (
          <ContextAwareTemplateSelector
            businessContext={businessContext}
            onTemplateSelect={handleTemplateSelect}
            maxRecommendations={8}
            showReasoningDetails={true}
            enableComparison={true}
          />
        );

      case 'recommendations':
        return (
          <ContextualRecommendations
            businessContext={businessContext!}
            recommendations={recommendations}
            onTemplateSelect={handleRecommendationTemplateSelect}
            onPreviewTemplate={handleTemplatePreview}
          />
        );

      case 'personalization':
        return (
          <TemplatePersonalization
            selectedTemplate={selectedTemplate!}
            businessContext={businessContext!}
            onPersonalizationUpdate={handlePersonalizationUpdate}
            onPreviewUpdate={handlePreviewUpdate}
            onSaveTemplate={handleSaveTemplate}
            initialSettings={personalizationSettings || undefined}
          />
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Your Template is Ready!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review your customized template and save when ready
                  </p>
                </div>
              </div>
            </Card>

            {/* Template Summary */}
            {selectedTemplate && (
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Template Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</Label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedTemplate.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</Label>
                    <p className="text-gray-900 dark:text-gray-100">{businessContext?.industry_classification.primary}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Type</Label>
                    <p className="text-gray-900 dark:text-gray-100">{businessContext?.business_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customizations</Label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {templateCustomization ? 'Applied' : 'None'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Final Actions */}
            <div className="flex gap-3 justify-center">
              {enablePreview && (
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Template
                </Button>
              )}
              <Button 
                onClick={() => {
                  if (selectedTemplate && businessContext && templateCustomization) {
                    const customizedTemplate: CustomizedTemplate = {
                      id: `${selectedTemplate.id}-customized-${Date.now()}`,
                      original_template_id: selectedTemplate.id,
                      name: `${selectedTemplate.name} (Customized)`,
                      customizations: templateCustomization,
                      preview_data: previewData || {
                        template_id: selectedTemplate.id,
                        preview_url: selectedTemplate.preview_url,
                        preview_images: [],
                        device_previews: { desktop: '', tablet: '', mobile: '' },
                        estimated_load_time: 2.1,
                        performance_score: 94
                      },
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    handleSaveTemplate(customizedTemplate);
                  }
                }}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      className={className}
      enableRetry={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Progress Header */}
        {showProgress && (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI-Powered Template Builder
                  </h2>
                  <Badge variant="outline">
                    Step {currentStepIndex + 1} of {BUILDER_STEPS.length}
                  </Badge>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                {BUILDER_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  const isClickable = index <= currentStepIndex + 1;
                  const IconComponent = step.icon;

                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => isClickable && handleStepClick(index)}
                        disabled={!isClickable}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : isClickable
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <IconComponent className="h-4 w-4" />
                          )}
                        </div>
                        <div className="hidden md:block text-left">
                          <div className="text-sm font-medium">{step.title}</div>
                          <div className="text-xs opacity-70">{step.description}</div>
                        </div>
                      </button>
                      {index < BUILDER_STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-2 hidden md:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Current Step Content */}
        <div className="min-h-[600px]">
          {renderStepContent()}
        </div>

        {/* Navigation Footer */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  currentStep.color === 'blue' ? 'bg-blue-600' :
                  currentStep.color === 'green' ? 'bg-green-600' :
                  currentStep.color === 'yellow' ? 'bg-yellow-600' :
                  currentStep.color === 'purple' ? 'bg-purple-600' :
                  'bg-indigo-600'
                } text-white`}>
                  <currentStep.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {currentStep.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStep.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start New Template
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ContextAwareBuilder;