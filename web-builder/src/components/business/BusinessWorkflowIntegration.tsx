/**
 * Business Workflow Integration Component
 * Story #106: Integration bridge between business customization and workflow builder
 * 
 * Seamlessly integrates AI-powered business customization with the existing 
 * drag-and-drop workflow builder, maintaining all existing functionality while
 * adding intelligent business-specific features.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Workflow, 
  Brain, 
  Zap, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';

import BusinessWorkflowCustomizer from './BusinessWorkflowCustomizer';
import WorkflowOutcomePreview from './WorkflowOutcomePreview';
import useBusinessWorkflows, { type BusinessWorkflowStep } from '@/hooks/useBusinessWorkflows';
import workflowService from '@/lib/api/services/workflows';
import type { 
  CustomizedWorkflowTemplate, 
  BusinessAnalysisResult,
  WorkflowInstantiationResult 
} from '@/lib/api/services/business-workflows';
import type { Workflow, WorkflowCreate } from '@/lib/api/types';

interface BusinessWorkflowIntegrationProps {
  onWorkflowSelected?: (workflowId: number) => void;
  onOpenWorkflowBuilder?: (workflow: Workflow) => void;
  onTemplateApplied?: (template: CustomizedWorkflowTemplate) => void;
  initialWebsiteUrl?: string;
  workflowBuilderComponent?: React.ComponentType<any>;
}

interface IntegrationMode {
  mode: 'business' | 'builder' | 'hybrid';
  activeTemplate: CustomizedWorkflowTemplate | null;
  createdWorkflow: Workflow | null;
}

const BusinessWorkflowIntegration: React.FC<BusinessWorkflowIntegrationProps> = ({
  onWorkflowSelected,
  onOpenWorkflowBuilder,
  onTemplateApplied,
  initialWebsiteUrl,
  workflowBuilderComponent: WorkflowBuilderComponent
}) => {
  // Business workflow hook
  const {
    state: businessState,
    analyzeBusinessRequirements,
    generateCustomizedTemplates,
    instantiateWorkflowTemplate,
    previewTemplateOutcomes,
    setCurrentStep,
    resetWorkflow,
    isLoading,
    hasErrors,
    currentError
  } = useBusinessWorkflows({
    autoGenerateTemplates: true,
    enablePreviewMode: true,
    trackSuccess: true
  });

  // Integration state
  const [integrationMode, setIntegrationMode] = useState<IntegrationMode>({
    mode: 'business',
    activeTemplate: null,
    createdWorkflow: null
  });

  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomizedWorkflowTemplate | null>(null);
  const [workflowBuilderState, setWorkflowBuilderState] = useState<any>(null);

  // Handle workflow creation from business analysis
  const handleWorkflowCreated = useCallback(async (workflowId: number) => {
    try {
      // Fetch the created workflow
      const workflow = await workflowService.getWorkflow(workflowId);
      
      setIntegrationMode(prev => ({
        ...prev,
        createdWorkflow: workflow
      }));

      // Notify parent components
      if (onWorkflowSelected) {
        onWorkflowSelected(workflowId);
      }

    } catch (error) {
      console.error('Failed to fetch created workflow:', error);
    }
  }, [onWorkflowSelected]);

  // Handle template selection for preview
  const handleTemplateSelected = useCallback((template: CustomizedWorkflowTemplate) => {
    setSelectedTemplate(template);
    setIntegrationMode(prev => ({
      ...prev,
      activeTemplate: template
    }));

    if (onTemplateApplied) {
      onTemplateApplied(template);
    }
  }, [onTemplateApplied]);

  // Handle switching to workflow builder with template
  const handleOpenInBuilder = useCallback(async (template: CustomizedWorkflowTemplate) => {
    if (!businessState.businessAnalysis) return;

    try {
      // Create a draft workflow from the template
      const workflowData: WorkflowCreate = {
        name: `${template.name} - Draft`,
        description: template.description,
        category: template.category as any,
        trigger_type: 'manual' as any,
        nodes: template.nodes,
        connections: template.connections,
        settings: {
          template_id: template.template_id,
          business_analysis: businessState.businessAnalysis,
          customizations_applied: template.customizations_applied,
          ai_generated: true,
          draft_mode: true
        }
      };

      const draftWorkflow = await workflowService.createWorkflow(workflowData);
      
      setIntegrationMode({
        mode: 'builder',
        activeTemplate: template,
        createdWorkflow: draftWorkflow
      });

      if (onOpenWorkflowBuilder) {
        onOpenWorkflowBuilder(draftWorkflow);
      }

    } catch (error) {
      console.error('Failed to create draft workflow:', error);
    }
  }, [businessState.businessAnalysis, onOpenWorkflowBuilder]);

  // Handle switching modes
  const handleModeChange = useCallback((mode: IntegrationMode['mode']) => {
    setIntegrationMode(prev => ({ ...prev, mode }));
    
    if (mode === 'business') {
      setCurrentStep('input');
    }
  }, [setCurrentStep]);

  // Get integration status
  const getIntegrationStatus = useCallback(() => {
    const { businessAnalysis, customizedTemplates } = businessState;
    const { createdWorkflow, activeTemplate } = integrationMode;

    if (createdWorkflow) {
      return {
        status: 'completed',
        message: 'Workflow successfully created and ready for use',
        icon: CheckCircle,
        color: 'text-green-600'
      };
    }

    if (activeTemplate) {
      return {
        status: 'template_ready',
        message: 'AI-customized template ready for instantiation',
        icon: Sparkles,
        color: 'text-blue-600'
      };
    }

    if (customizedTemplates.length > 0) {
      return {
        status: 'templates_generated',
        message: `${customizedTemplates.length} customized templates available`,
        icon: Workflow,
        color: 'text-purple-600'
      };
    }

    if (businessAnalysis) {
      return {
        status: 'analyzed',
        message: 'Business analysis complete, generating templates...',
        icon: Brain,
        color: 'text-orange-600'
      };
    }

    return {
      status: 'ready',
      message: 'Ready to analyze your business and generate workflows',
      icon: Sparkles,
      color: 'text-gray-600'
    };
  }, [businessState, integrationMode]);

  // Render business customizer
  const renderBusinessCustomizer = () => (
    <BusinessWorkflowCustomizer
      onWorkflowCreated={handleWorkflowCreated}
      initialWebsiteUrl={initialWebsiteUrl}
    />
  );

  // Render template integration panel
  const renderTemplateIntegration = () => {
    const { customizedTemplates } = businessState;
    
    if (customizedTemplates.length === 0) {
      return (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Generate AI-customized templates first to see integration options
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Template Integration</h3>
            <p className="text-muted-foreground">
              Choose how to apply your AI-customized workflows
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="ml-4"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customizedTemplates.map((template) => (
            <Card key={template.template_id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>
                      {template.category} • Success: {Math.round(template.success_probability * 100)}%
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {template.estimated_setup_time} min
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                {/* Integration Options */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleTemplateSelected(template)}
                    className="w-full"
                    variant={selectedTemplate?.template_id === template.template_id ? "default" : "outline"}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Instant Deploy
                  </Button>
                  
                  <Button
                    onClick={() => handleOpenInBuilder(template)}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize in Builder
                  </Button>
                </div>

                {/* Template Features */}
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Nodes: {template.nodes.length}</div>
                    <div>Integrations: {template.integration_requirements.length}</div>
                    <div>AI Customizations: {template.customizations_applied.length}</div>
                  </div>
                </div>
              </CardContent>

              {/* Preview overlay */}
              {showPreview && selectedTemplate?.template_id === template.template_id && (
                <div className="absolute inset-0 bg-white/95 rounded-lg p-4 overflow-auto">
                  <WorkflowOutcomePreview
                    template={template}
                    showDetailed={false}
                    className="h-full"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render workflow builder integration
  const renderWorkflowBuilder = () => {
    if (!WorkflowBuilderComponent) {
      return (
        <div className="text-center py-8">
          <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Workflow builder component not available
          </p>
        </div>
      );
    }

    const { activeTemplate, createdWorkflow } = integrationMode;

    return (
      <div className="space-y-6">
        {/* Builder Header */}
        {activeTemplate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                    AI-Enhanced Workflow Builder
                  </CardTitle>
                  <CardDescription>
                    Editing: {activeTemplate.name} with intelligent customizations
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {activeTemplate.customizations_applied.length} AI customizations
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModeChange('business')}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Back to Business
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Success Probability:</span>
                  <div className="font-medium text-green-600">
                    {Math.round(activeTemplate.success_probability * 100)}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Setup Time:</span>
                  <div className="font-medium">
                    {activeTemplate.estimated_setup_time} minutes
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <div className="font-medium capitalize">
                    {activeTemplate.category}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Builder Component */}
        <div className="border rounded-lg">
          <WorkflowBuilderComponent
            initialWorkflow={createdWorkflow}
            templateData={activeTemplate}
            businessAnalysis={businessState.businessAnalysis}
            onWorkflowUpdated={(workflow: Workflow) => {
              setIntegrationMode(prev => ({ 
                ...prev, 
                createdWorkflow: workflow 
              }));
            }}
            enhancedMode={true}
          />
        </div>
      </div>
    );
  };

  const integrationStatus = getIntegrationStatus();
  const StatusIcon = integrationStatus.icon;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI-Powered Workflow Platform</h1>
          <p className="text-muted-foreground">
            Intelligent business analysis meets powerful workflow automation
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${integrationStatus.color}`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium">{integrationStatus.message}</span>
          </div>
          
          {hasErrors && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetWorkflow}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {currentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{currentError}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={integrationMode.mode} onValueChange={(value) => handleModeChange(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">
            <Brain className="h-4 w-4 mr-2" />
            AI Business Analysis
          </TabsTrigger>
          <TabsTrigger value="hybrid" disabled={businessState.customizedTemplates.length === 0}>
            <Sparkles className="h-4 w-4 mr-2" />
            Template Integration
          </TabsTrigger>
          <TabsTrigger value="builder" disabled={!integrationMode.activeTemplate}>
            <Workflow className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          {renderBusinessCustomizer()}
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-6">
          {renderTemplateIntegration()}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          {renderWorkflowBuilder()}
        </TabsContent>
      </Tabs>

      {/* Preview Modal/Panel */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workflow Outcome Preview</CardTitle>
                  <CardDescription>{selectedTemplate.name}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent>
                <WorkflowOutcomePreview
                  template={selectedTemplate}
                  showDetailed={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessWorkflowIntegration;