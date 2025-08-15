/**
 * Analytics Dashboard Page
 * 
 * Comprehensive performance analytics dashboard for Story 3.3 + 3.5
 * Features: conversion rates, engagement metrics, A/B testing, ROI analysis, SLA optimization
 */

'use client';

import { Suspense } from 'react';
import { ComprehensiveAnalyticsDashboard } from '@/components/analytics/ComprehensiveAnalyticsDashboard';
import { PerformanceComparisonPanel } from '@/components/analytics/PerformanceComparisonPanel';
import { ROIAnalyticsPanel } from '@/components/analytics/ROIAnalyticsPanel';
import { RealTimeMonitoringPanel } from '@/components/analytics/RealTimeMonitoringPanel';
import { ExportReporting } from '@/components/analytics/ExportReporting';
import { AnalyticsConfiguration } from '@/components/analytics/AnalyticsConfiguration';
import { ABTestingInterface } from '@/components/analytics/ABTestingInterface';
import { ThresholdOptimizationPanel } from '@/components/builder/ThresholdOptimizationPanel';
import { SLADashboard } from '@/components/builder/SLADashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  FileText, 
  Settings,
  TestTube2,
  Gauge,
  Target,
  Zap
} from 'lucide-react';

// Loading skeleton for dashboard sections
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  </div>
);

export default function AnalyticsPage() {
  // Mock service types for SLA optimization
  const serviceTypes = ['build_time', 'pr_review_time', 'test_execution', 'deployment_time'];

  const handleApplyRecommendation = async (recommendation: any) => {
    try {
      // Apply the threshold recommendation
      const response = await fetch('/api/v1/sla-optimization/thresholds/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: recommendation.service_type,
          current_threshold: recommendation.current_threshold,
          proposed_threshold: recommendation.recommended_threshold,
          change_type: 'optimization',
          justification: recommendation.optimization_rationale.business_justification,
          requested_by: 'analytics_dashboard',
          rollback_criteria: recommendation.rollback_criteria
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Auto-apply the change
        await fetch(`/api/v1/sla-optimization/thresholds/change/${result.change_id}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Threshold recommendation applied successfully');
      }
    } catch (error) {
      console.error('Failed to apply threshold recommendation:', error);
    }
  };

  const handleRollbackChange = async (changeId: string) => {
    try {
      const response = await fetch(`/api/v1/sla-optimization/thresholds/change/${changeId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'manual',
          trigger_metrics: {}
        })
      });

      if (response.ok) {
        console.log('Threshold change rolled back successfully');
      }
    } catch (error) {
      console.error('Failed to rollback threshold change:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics & SLA Optimization</h1>
          <p className="text-muted-foreground">
            Comprehensive workflow analytics with AI-powered SLA threshold optimization and ROI insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
<<<<<<< HEAD
        <TabsList className="grid w-full grid-cols-9">
=======
        <TabsList className="grid w-full grid-cols-8">
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
<<<<<<< HEAD
          <TabsTrigger value="sla-monitoring" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            SLA Monitoring
          </TabsTrigger>
=======
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
          <TabsTrigger value="abtesting" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="sla-optimization" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            SLA Optimization
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ComprehensiveAnalyticsDashboard />
          </Suspense>
<<<<<<< HEAD
          
          {/* SLA Summary Integration */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>SLA Performance Summary</CardTitle>
                    <CardDescription>
                      Real-time SLA monitoring and violation prevention
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  // Navigate to SLA monitoring tab
                  const tabTrigger = document.querySelector('[value="sla-monitoring"]') as HTMLElement;
                  tabTrigger?.click();
                }}>
                  <Activity className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-green-700">SLA Success Rate</div>
                  <div className="text-xs text-green-600 mt-1">+2.1% vs last week</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-blue-700">Active Violations</div>
                  <div className="text-xs text-blue-600 mt-1">-3 since yesterday</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">14.5m</div>
                  <div className="text-sm text-yellow-700">Avg Resolution Time</div>
                  <div className="text-xs text-yellow-600 mt-1">-2.3m improvement</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-purple-700">Prediction Accuracy</div>
                  <div className="text-xs text-purple-600 mt-1">Above 85% target</div>
                </div>
              </div>
            </CardContent>
          </Card>
=======
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ComprehensiveAnalyticsDashboard detailed={true} />
          </Suspense>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <PerformanceComparisonPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ROIAnalyticsPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <RealTimeMonitoringPanel />
          </Suspense>
<<<<<<< HEAD
        </TabsContent>

        <TabsContent value="sla-monitoring" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <SLADashboard workflowId={1} className="w-full" />
          </Suspense>
=======
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ABTestingInterface />
          </Suspense>
        </TabsContent>

        <TabsContent value="sla-optimization" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ThresholdOptimizationPanel
              serviceTypes={serviceTypes}
              onApplyRecommendation={handleApplyRecommendation}
              onRollbackChange={handleRollbackChange}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <AnalyticsConfiguration />
            </Suspense>
            <Suspense fallback={<DashboardSkeleton />}>
              <ExportReporting />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}