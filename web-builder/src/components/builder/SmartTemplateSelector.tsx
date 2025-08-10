/**
 * SmartTemplateSelector Component
 * 
 * Main Smart Template Selection UI with AI recommendations and instant preview
 * Part of Story 3.2: Smart Workflow Templates with AI Customization - Task #69
 * 
 * Features:
 * - Smart template selection with AI-powered recommendations
 * - One-click template instantiation with pre-configured nodes  
 * - Preview mode showing expected workflow outcomes before activation
 * - Integration with existing workflow builder (maintains drag-drop functionality)
 * - Template customization UI with parameter editing
 * - Success probability estimates and performance predictions
 * 
 * @author Frontend Developer Agent - Story 3.2 Task #69 Implementation
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,  
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Brain,
  Zap,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  TrendingUp,
  Search,
  Sparkles,
  Download,
  Eye,
  Settings,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Target,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SmartTemplateRecommendations from './SmartTemplateRecommendations';
import type {
  SmartTemplateSelectorProps,
  SmartTemplateRecommendation,
  WebsiteAnalysisResult,
  WorkflowCategory,
  TemplateCustomization
} from '@/types/smart-templates';

// ============================================================================
// MOCK DATA & UTILITIES
// ============================================================================

const sampleWebsiteAnalysis: WebsiteAnalysisResult = {
  business_classification: {
    industry: 'Software & Technology',
    sub_industry: ['SaaS', 'B2B Software'],
    business_model: 'saas',
    confidence: 0.92
  },
  content_analysis: {
    brand_voice: 'professional',
    target_audience: ['Business owners', 'Marketing professionals', 'Software teams'],
    value_propositions: [
      'Automated workflow creation',
      'Time savings through AI',
      'Better conversion rates',
      'Seamless integrations'
    ],
    existing_workflows: [
      { type: 'email_sequence', confidence: 0.8, description: 'Lead nurturing email campaigns' },
      { type: 'form_submission', confidence: 0.9, description: 'Contact form processing' }
    ]
  },
  marketing_maturity: {
    level: 'intermediate',
    existing_tools: ['Email marketing platform', 'CRM system', 'Analytics tools', 'Chat support'],
    automation_readiness: 0.75
  }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FilterPanel = React.memo<{
  selectedCategory: WorkflowCategory | 'all';
  onCategoryChange: (category: WorkflowCategory | 'all') => void;
  selectedComplexity: string | 'all';
  onComplexityChange: (complexity: string | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}>(({ 
  selectedCategory, 
  onCategoryChange, 
  selectedComplexity, 
  onComplexityChange,
  searchQuery,
  onSearchChange 
}) => {
  const categories = [
    { value: 'all', label: 'All Categories', icon: '🎯' },
    { value: WorkflowCategory.MARKETING, label: 'Marketing', icon: '📈' },
    { value: WorkflowCategory.SALES, label: 'Sales', icon: '💰' },
    { value: WorkflowCategory.SUPPORT, label: 'Support', icon: '🎧' },
    { value: WorkflowCategory.AUTOMATION, label: 'Automation', icon: '⚡' }
  ];

  const complexities = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'high', label: 'Advanced' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search Templates</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value as WorkflowCategory | 'all')}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  selectedCategory === category.value
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                )}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="text-sm font-medium mb-2 block">Complexity</label>
          <div className="space-y-1">
            {complexities.map((complexity) => (
              <button
                key={complexity.value}
                onClick={() => onComplexityChange(complexity.value)}
                className={cn(
                  "w-full p-2 rounded-lg text-left transition-colors text-sm",
                  selectedComplexity === complexity.value
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                {complexity.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FilterPanel.displayName = 'FilterPanel';

const TemplatePreview = React.memo<{
  recommendation: SmartTemplateRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onInstantiate: (customizations: TemplateCustomization[]) => void;
}>(({ recommendation, isOpen, onClose, onInstantiate }) => {
  const [selectedCustomizations, setSelectedCustomizations] = useState<TemplateCustomization[]>(
    recommendation.customizations || []
  );

  const handleInstantiate = useCallback(() => {
    onInstantiate(selectedCustomizations);
    onClose();
  }, [selectedCustomizations, onInstantiate, onClose]);

  const toggleCustomization = useCallback((customizationId: string) => {
    setSelectedCustomizations(prev => 
      prev.some(c => c.id === customizationId)
        ? prev.filter(c => c.id !== customizationId)
        : [...prev, ...recommendation.customizations.filter(c => c.id === customizationId)]
    );
  }, [recommendation.customizations]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Template Preview: {recommendation.template_name}
          </DialogTitle>
          <DialogDescription>
            Review template details and customize before implementation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="customizations">Customizations</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Template Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <Badge className="capitalize">{recommendation.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Complexity:</span>
                          <span className="capitalize font-medium">{recommendation.implementation_complexity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Setup Time:</span>
                          <span className="font-medium">{recommendation.estimated_setup_time} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {(recommendation.success_probability.overall * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
                      <div className="space-y-2">
                        {recommendation.key_benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Workflow Structure</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Workflow className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Workflow Nodes ({recommendation.nodes.length})</span>
                      </div>
                      <div className="grid gap-3">
                        {recommendation.nodes.map((node, index) => (
                          <div key={node.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{node.name}</div>
                              <div className="text-sm text-gray-600">{node.description}</div>
                            </div>
                            <Badge variant="outline" className="ml-auto">
                              {node.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customizations" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI-Suggested Customizations</h3>
                  <div className="space-y-4">
                    {recommendation.customizations.map((customization) => (
                      <div key={customization.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span className="font-medium capitalize">{customization.field.replace('_', ' ')}</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  customization.impact === 'high' ? 'border-red-300 text-red-700' :
                                  customization.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                  'border-green-300 text-green-700'
                                }
                              >
                                {customization.impact} impact
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{customization.reason}</p>
                            <div className="text-xs text-gray-500">
                              Confidence: {(customization.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCustomizations.some(c => c.id === customization.id)}
                            onChange={() => toggleCustomization(customization.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-gray-500">Original:</label>
                            <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                              {JSON.stringify(customization.original_value)}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-500">Suggested:</label>
                            <div className="font-mono bg-blue-50 p-2 rounded mt-1">
                              {JSON.stringify(customization.suggested_value)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Expected Outcomes</h3>
                  <div className="grid gap-4">
                    {recommendation.expected_outcomes.map((outcome, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{outcome.metric}</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-lg font-bold text-green-600">{outcome.improvement}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Expected timeframe: {outcome.timeframe}</span>
                          <span>Confidence: {(outcome.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInstantiate} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Instantiate Template ({selectedCustomizations.length} customizations)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TemplatePreview.displayName = 'TemplatePreview';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SmartTemplateSelector = React.memo<SmartTemplateSelectorProps>(({
  websiteAnalysis = sampleWebsiteAnalysis,
  onTemplateSelect,
  onTemplateInstantiate,
  isLoading = false,
  maxRecommendations = 6,
  showFilters = true,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkflowCategory | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewRecommendation, setPreviewRecommendation] = useState<SmartTemplateRecommendation | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTemplatePreview = useCallback((recommendation: SmartTemplateRecommendation) => {
    setPreviewRecommendation(recommendation);
    setShowPreview(true);
  }, []);

  const handleTemplateSelect = useCallback((recommendation: SmartTemplateRecommendation) => {
    onTemplateSelect(recommendation);
  }, [onTemplateSelect]);

  const handleTemplateInstantiate = useCallback((recommendation: SmartTemplateRecommendation) => {
    onTemplateInstantiate(recommendation.template_id, recommendation.customizations);
  }, [onTemplateInstantiate]);

  const handlePreviewInstantiate = useCallback((customizations: TemplateCustomization[]) => {
    if (previewRecommendation) {
      onTemplateInstantiate(previewRecommendation.template_id, customizations);
    }
  }, [previewRecommendation, onTemplateInstantiate]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading smart templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Smart Template Selection
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered workflow templates customized for your business
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <FilterPanel
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedComplexity={selectedComplexity}
              onComplexityChange={setSelectedComplexity}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={cn("space-y-6", showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Start</h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => setSelectedCategory(WorkflowCategory.MARKETING)}
                >
                  <div className="text-2xl">📈</div>
                  <div className="text-left">
                    <div className="font-medium">Marketing</div>
                    <div className="text-xs text-gray-500">Lead capture & nurture</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => setSelectedCategory(WorkflowCategory.SALES)}
                >
                  <div className="text-2xl">💰</div>
                  <div className="text-left">
                    <div className="font-medium">Sales</div>
                    <div className="text-xs text-gray-500">Pipeline automation</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => setSelectedCategory(WorkflowCategory.SUPPORT)}
                >
                  <div className="text-2xl">🎧</div>
                  <div className="text-left">
                    <div className="font-medium">Support</div>
                    <div className="text-xs text-gray-500">Ticket routing</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Recommendations */}
          <SmartTemplateRecommendations
            websiteAnalysis={websiteAnalysis}
            onTemplateSelect={handleTemplateSelect}
            onTemplateInstantiate={handleTemplateInstantiate}
            maxRecommendations={maxRecommendations}
            showReasoningDetails={true}
            enablePreview={true}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {previewRecommendation && (
        <TemplatePreview
          recommendation={previewRecommendation}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onInstantiate={handlePreviewInstantiate}
        />
      )}
    </div>
  );
});

SmartTemplateSelector.displayName = 'SmartTemplateSelector';

// ============================================================================
// EXPORTS
// ============================================================================

export default SmartTemplateSelector;