/**
 * Smart Templates Page - Context-Aware Template Selection
 * 
 * Main page for the AI-powered template recommendation and personalization flow
 * Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Palette,
  Wand2,
  Eye,
  Download,
  Clock,
  TrendingUp
} from 'lucide-react';

// Import our new components
import { BusinessContextAnalyzer } from '@/components/builder/BusinessContextAnalyzer';
import { ContextAwareTemplateSelector } from '@/components/builder/ContextAwareTemplateSelector';
import { ContextualRecommendations } from '@/components/builder/ContextualRecommendations';
import { TemplatePersonalization } from '@/components/builder/TemplatePersonalization';

// Import types
import {
  BusinessAnalysisResult,
  TemplateRecommendation,
  ContextualRecommendation,
  PersonalizedTemplate,
  RecommendationContext
} from '@/types/context-aware-templates';

type FlowStep = 'analysis' | 'templates' | 'recommendations' | 'personalization' | 'complete';

interface FlowState {
  currentStep: FlowStep;
  businessContext: BusinessAnalysisResult | null;
  selectedTemplate: TemplateRecommendation | null;
  personalizedTemplate: PersonalizedTemplate | null;
  completedSteps: FlowStep[];
}

export default function SmartTemplatesPage() {
  // Flow state
  const [flowState, setFlowState] = useState<FlowState>({
    currentStep: 'analysis',
    businessContext: null,
    selectedTemplate: null,
    personalizedTemplate: null,
    completedSteps: []
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Step management
  const steps: Array<{
    id: FlowStep;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    estimatedTime: string;
  }> = [
    {
      id: 'analysis',
      title: 'Business Analysis',
      description: 'Tell us about your business',
      icon: Brain,
      estimatedTime: '2-3 min'
    },
    {
      id: 'templates',
      title: 'Smart Templates',
      description: 'AI-curated template recommendations',
      icon: Sparkles,
      estimatedTime: '1-2 min'
    },
    {
      id: 'recommendations',
      title: 'Smart Suggestions',
      description: 'Components and optimization tips',
      icon: Lightbulb,
      estimatedTime: '1 min'
    },
    {
      id: 'personalization',
      title: 'Personalization',
      description: 'Customize your template',
      icon: Palette,
      estimatedTime: '3-5 min'
    },
    {
      id: 'complete',
      title: 'Ready to Build',
      description: 'Your personalized template is ready',
      icon: CheckCircle2,
      estimatedTime: 'Done!'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === flowState.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Navigation helpers
  const goToStep = useCallback(async (step: FlowStep) => {
    setIsTransitioning(true);
    
    // Add a smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setFlowState(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: prev.completedSteps.includes(prev.currentStep) 
        ? prev.completedSteps 
        : [...prev.completedSteps, prev.currentStep]
    }));
    
    setIsTransitioning(false);
  }, []);

  const goToNextStep = useCallback(() => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      goToStep(steps[nextStepIndex].id);
    }
  }, [currentStepIndex, steps, goToStep]);

  const goToPreviousStep = useCallback(() => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      goToStep(steps[prevStepIndex].id);
    }
  }, [currentStepIndex, steps, goToStep]);

  // Event handlers
  const handleAnalysisComplete = useCallback((result: BusinessAnalysisResult) => {
    setFlowState(prev => ({
      ...prev,
      businessContext: result
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleTemplateSelect = useCallback((recommendation: TemplateRecommendation) => {
    setFlowState(prev => ({
      ...prev,
      selectedTemplate: recommendation
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleRecommendationSelect = useCallback((recommendation: ContextualRecommendation) => {
    // Handle recommendation selection (could show in a modal or apply directly)
    console.log('Selected recommendation:', recommendation);
    // For now, just go to personalization
    goToNextStep();
  }, [goToNextStep]);

  const handlePersonalizationComplete = useCallback((personalizedTemplate: PersonalizedTemplate) => {
    setFlowState(prev => ({
      ...prev,
      personalizedTemplate
    }));
    goToNextStep();
  }, [goToNextStep]);

  // Render step indicator
  const renderStepIndicator = () => (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-900">
              Smart Template Builder
            </h3>
            <Badge variant="secondary" className="text-blue-700 bg-blue-100">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-blue-100" />
          <div className="text-sm text-blue-600">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const isCompleted = flowState.completedSteps.includes(step.id);
            const isCurrent = step.id === flowState.currentStep;
            const isAccessible = index <= currentStepIndex || isCompleted;
            
            return (
              <motion.div
                key={step.id}
                className={`relative p-3 rounded-lg cursor-pointer transition-all ${
                  isCurrent 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : isAccessible
                    ? 'bg-white border border-blue-200 hover:bg-blue-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => isAccessible ? goToStep(step.id) : null}
                whileHover={isAccessible ? { scale: 1.02 } : {}}
                whileTap={isAccessible ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className="h-4 w-4" />
                  {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs opacity-75">{step.estimatedTime}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );

  // Render current step content
  const renderStepContent = () => {
    if (isTransitioning) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Transitioning...</p>
          </div>
        </div>
      );
    }

    switch (flowState.currentStep) {
      case 'analysis':
        return (
          <BusinessContextAnalyzer
            onAnalysisComplete={handleAnalysisComplete}
            className="max-w-4xl mx-auto"
          />
        );

      case 'templates':
        return flowState.businessContext ? (
          <ContextAwareTemplateSelector
            businessContext={flowState.businessContext}
            onTemplateSelect={handleTemplateSelect}
            maxRecommendations={6}
            showReasoningDetails={true}
            enableComparison={true}
            className="max-w-6xl mx-auto"
          />
        ) : null;

      case 'recommendations':
        return flowState.businessContext ? (
          <ContextualRecommendations
            businessContext={flowState.businessContext}
            recommendations={[]}
            onTemplateSelect={(template) => console.log('Selected template:', template)}
            onPreviewTemplate={(template) => console.log('Previewing template:', template)}
            onFeedback={(templateId, rating, feedback) => console.log('Feedback:', templateId, rating, feedback)}
            isLoading={false}
            className="max-w-6xl mx-auto"
          />
        ) : null;

      case 'personalization':
        return flowState.selectedTemplate && flowState.businessContext ? (
          <TemplatePersonalization
            template={flowState.selectedTemplate.template}
            businessContext={flowState.businessContext}
            onPersonalizationComplete={handlePersonalizationComplete}
            showPreview={true}
            className="max-w-6xl mx-auto"
          />
        ) : null;

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold">Your Template is Ready!</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your personalized template has been created with AI-powered customizations 
                tailored specifically for your {flowState.businessContext?.industry_classification.primary} business.
              </p>
            </div>

            {/* Template Summary */}
            {flowState.selectedTemplate && (
              <Card className="p-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Template Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{flowState.selectedTemplate.template.name}</div>
                        <div className="text-sm text-gray-600">Selected Template</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">
                          {Math.round(flowState.selectedTemplate.confidenceScore * 100)}% Match
                        </div>
                        <div className="text-sm text-gray-600">AI Confidence</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">
                          {flowState.personalizedTemplate?.estimated_setup_time || 15} min
                        </div>
                        <div className="text-sm text-gray-600">Setup Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Wand2 className="h-5 w-5" />
                Start Building
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Eye className="h-5 w-5" />
                Preview Template
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Download Assets
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI-Powered Template Builder
                </h1>
                <p className="text-gray-600">
                  Let AI create the perfect template for your business
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            {flowState.currentStep !== 'analysis' && flowState.currentStep !== 'complete' && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {flowState.currentStep !== 'personalization' && (
                  <Button 
                    onClick={goToNextStep}
                    className="gap-2"
                    disabled={
                      (flowState.currentStep === 'templates' && !flowState.selectedTemplate) ||
                      (flowState.currentStep === 'recommendations' && !flowState.selectedTemplate)
                    }
                  >
                    Skip
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flowState.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}