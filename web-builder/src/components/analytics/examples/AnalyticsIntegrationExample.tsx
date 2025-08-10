/**
 * Analytics Integration Example
 * Demonstrates how to integrate analytics tracking into existing components
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TemplateAnalyticsDashboard,
  TemplatePerformanceCard,
  RealTimeAlerts,
  useTemplateAnalytics,
  useAnalyticsDashboard
} from '@/components/analytics';
import { Eye, Heart, Share2, Download, Edit, Publish } from 'lucide-react';

// Example: Enhanced Template Card with Analytics Tracking
interface TemplateCardWithAnalyticsProps {
  template: {
    id: number;
    name: string;
    category: string;
    description: string;
    thumbnail_url?: string;
    is_featured: boolean;
  };
  currentUserId: number;
  onSelectTemplate: (templateId: number) => void;
}

function TemplateCardWithAnalytics({
  template,
  currentUserId,
  onSelectTemplate
}: TemplateCardWithAnalyticsProps) {
  const [viewStartTime] = useState(Date.now());
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  const {
    trackAdoption,
    trackCustomization,
    trackCompletion,
    adoptionMetrics,
    successMetrics
  } = useTemplateAnalytics({ templateId: template.id });

  // Track template view when component mounts
  useEffect(() => {
    if (!hasTrackedView) {
      // Simulate template view tracking
      setHasTrackedView(true);
      // In a real app, you'd track this with your analytics service
      console.log(`Template ${template.id} viewed by user ${currentUserId}`);
    }
  }, [template.id, currentUserId, hasTrackedView]);

  const handleSelectTemplate = useCallback(async () => {
    const viewDuration = Math.round((Date.now() - viewStartTime) / 1000);
    
    try {
      // Track template adoption
      await trackAdoption({
        userId: currentUserId,
        source: template.is_featured ? 'featured' : 'category',
        context: {
          viewDuration,
          category: template.category,
          position: 'card'
        }
      });

      // Call the parent selection handler
      onSelectTemplate(template.id);
    } catch (error) {
      console.error('Failed to track template adoption:', error);
      // Still proceed with template selection even if tracking fails
      onSelectTemplate(template.id);
    }
  }, [template, currentUserId, viewStartTime, trackAdoption, onSelectTemplate]);

  const handleCustomization = useCallback(async (modificationType: 'content' | 'design' | 'layout' | 'style') => {
    try {
      await trackCustomization({
        userId: currentUserId,
        modificationType,
        modificationCount: 1,
        timeSpent: Math.round((Date.now() - viewStartTime) / 1000)
      });
    } catch (error) {
      console.error('Failed to track customization:', error);
    }
  }, [currentUserId, viewStartTime, trackCustomization]);

  const handlePublish = useCallback(async () => {
    try {
      const timeSinceAdoption = Math.round((Date.now() - viewStartTime) / 1000);
      await trackCompletion({
        userId: currentUserId,
        completionType: 'publish',
        timeSinceAdoption,
        customizationsMade: 3 // This would be tracked from actual customizations
      });
    } catch (error) {
      console.error('Failed to track completion:', error);
    }
  }, [currentUserId, viewStartTime, trackCompletion]);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative">
        {template.thumbnail_url && (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        {template.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            Featured
          </Badge>
        )}
        
        {/* Analytics-based performance indicators */}
        {successMetrics && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {successMetrics.performanceScore.toFixed(0)}% Success
            </Badge>
            <Badge variant="outline" className="text-xs">
              ★ {successMetrics.userSatisfactionScore.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{template.name}</span>
          <Badge variant="outline">{template.category}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Analytics-driven metrics display */}
        {adoptionMetrics && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{adoptionMetrics.totalAdoptions} uses</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{adoptionMetrics.retentionRate.toFixed(0)}% retained</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button onClick={handleSelectTemplate} className="flex-1 mr-2">
            Use Template
          </Button>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCustomization('design')}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
            >
              <Publish className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Example: Admin Dashboard with Analytics
function AdminAnalyticsDashboard() {
  const { dashboard, alerts, loading, error } = useAnalyticsDashboard(true, 60000); // Auto-refresh every minute

  if (loading) {
    return <div className="p-8 text-center">Loading analytics dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts - Always Show First */}
      <RealTimeAlerts maxAlerts={3} severity="critical" />
      
      {/* Main Analytics Dashboard */}
      <TemplateAnalyticsDashboard />
      
      {/* Top Performing Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboard?.topTemplates.slice(0, 6).map((template) => (
          <TemplatePerformanceCard
            key={template.id}
            templateId={template.id}
            templateName={template.name}
            category="landing_page" // You'd get this from your template data
            showDetails={true}
            onViewDetails={() => console.log(`View details for template ${template.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

// Example: Template Library with Analytics Integration
function TemplateLibraryWithAnalytics() {
  const [templates] = useState([
    {
      id: 1,
      name: "Modern Landing Page",
      category: "landing_page",
      description: "A sleek, conversion-focused landing page template",
      is_featured: true
    },
    {
      id: 2,
      name: "E-commerce Store",
      category: "ecommerce",
      description: "Complete online store template with shopping cart",
      is_featured: false
    },
    {
      id: 3,
      name: "Portfolio Showcase",
      category: "portfolio",
      description: "Professional portfolio template for creatives",
      is_featured: false
    }
  ]);
  
  const currentUserId = 123; // This would come from your auth system

  const handleTemplateSelection = useCallback((templateId: number) => {
    console.log(`Template ${templateId} selected for customization`);
    // Navigate to template editor or show template preview
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Template Library</h1>
        
        {/* Real-time alerts for template performance */}
        <RealTimeAlerts maxAlerts={2} showOnlyActive={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCardWithAnalytics
            key={template.id}
            template={template}
            currentUserId={currentUserId}
            onSelectTemplate={handleTemplateSelection}
          />
        ))}
      </div>
    </div>
  );
}

// Example: Template Editor with Analytics Tracking
function TemplateEditorWithAnalytics({ templateId }: { templateId: number }) {
  const { trackCustomization, trackCompletion } = useTemplateAnalytics({ templateId });
  const [customizationCount, setCustomizationCount] = useState(0);
  const [editorStartTime] = useState(Date.now());
  const currentUserId = 123;

  const handleContentChange = useCallback(async () => {
    setCustomizationCount(prev => prev + 1);
    
    await trackCustomization({
      userId: currentUserId,
      modificationType: 'content',
      modificationCount: customizationCount + 1,
      timeSpent: Math.round((Date.now() - editorStartTime) / 1000)
    });
  }, [trackCustomization, currentUserId, customizationCount, editorStartTime]);

  const handleDesignChange = useCallback(async () => {
    setCustomizationCount(prev => prev + 1);
    
    await trackCustomization({
      userId: currentUserId,
      modificationType: 'design',
      modificationCount: customizationCount + 1,
      timeSpent: Math.round((Date.now() - editorStartTime) / 1000)
    });
  }, [trackCustomization, currentUserId, customizationCount, editorStartTime]);

  const handlePublish = useCallback(async () => {
    const timeSinceStart = Math.round((Date.now() - editorStartTime) / 1000);
    
    await trackCompletion({
      userId: currentUserId,
      completionType: 'publish',
      timeSinceAdoption: timeSinceStart,
      customizationsMade: customizationCount
    });
  }, [trackCompletion, currentUserId, customizationCount, editorStartTime]);

  const handlePreview = useCallback(async () => {
    const timeSinceStart = Math.round((Date.now() - editorStartTime) / 1000);
    
    await trackCompletion({
      userId: currentUserId,
      completionType: 'preview',
      timeSinceAdoption: timeSinceStart,
      customizationsMade: customizationCount
    });
  }, [trackCompletion, currentUserId, customizationCount, editorStartTime]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Template Editor</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          {/* Editor Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleContentChange} className="w-full mb-2">
                Edit Text
              </Button>
              <Button onClick={handleContentChange} className="w-full">
                Add Image
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDesignChange} className="w-full mb-2">
                Change Colors
              </Button>
              <Button onClick={handleDesignChange} className="w-full">
                Update Layout
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Insight */}
          <TemplatePerformanceCard
            templateId={templateId}
            templateName="Current Template"
            category="landing_page"
            showDetails={false}
          />
        </div>

        <div className="lg:col-span-3">
          {/* Template Preview/Editor Canvas */}
          <Card className="h-96">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground">Template Editor Canvas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Export all examples
export {
  TemplateCardWithAnalytics,
  AdminAnalyticsDashboard,
  TemplateLibraryWithAnalytics,
  TemplateEditorWithAnalytics
};