/**
 * Analytics Dashboard Page for Story 3.3
 * Main page integrating all analytics components
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import ComprehensiveAnalyticsDashboard from '../../../components/analytics/ComprehensiveAnalyticsDashboard';
import ABTestingInterface from '../../../components/analytics/ABTestingInterface';
import ExportReporting from '../../../components/analytics/ExportReporting';
import RealTimeDashboard from '../../../components/analytics/RealTimeDashboard';
import { 
  BarChart3, 
  TestTube, 
  Download, 
  Activity,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';

// Mock data - in a real app, this would come from the workflow service
const MOCK_WORKFLOWS = [
  { id: 1, name: 'Lead Capture Form', status: 'active' },
  { id: 2, name: 'Email Welcome Sequence', status: 'active' },
  { id: 3, name: 'Product Demo Booking', status: 'active' },
  { id: 4, name: 'Customer Onboarding', status: 'paused' }
];

export default function AnalyticsPage() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState('overview');

  const selectedWorkflow = MOCK_WORKFLOWS.find(w => w.id === selectedWorkflowId);
  const activeWorkflowIds = MOCK_WORKFLOWS.filter(w => w.status === 'active').map(w => w.id);
  const workflowNames = MOCK_WORKFLOWS.reduce((acc, w) => {
    acc[w.id] = w.name;
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive performance analytics, A/B testing, and real-time monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Dashboard Settings
          </Button>
          <Button variant="outline" size="sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help & Tutorial
          </Button>
        </div>
      </div>

      {/* Workflow Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Select Workflow</h3>
            <select
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MOCK_WORKFLOWS.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
            {selectedWorkflow && (
              <Badge variant={selectedWorkflow.status === 'active' ? 'default' : 'secondary'}>
                {selectedWorkflow.status}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {activeWorkflowIds.length} active workflow{activeWorkflowIds.length !== 1 ? 's' : ''}
            </span>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Workflow
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Real-time</span>
          </TabsTrigger>
          <TabsTrigger value="abtesting" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>A/B Testing</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Comprehensive Analytics */}
        <TabsContent value="overview" className="space-y-6">
          <ComprehensiveAnalyticsDashboard
            workflowId={selectedWorkflowId}
            workflowName={selectedWorkflow?.name}
            defaultTimePeriod="WEEK"
            enableRealTime={true}
          />
        </TabsContent>

        {/* Real-time Tab - Live Dashboard */}
        <TabsContent value="realtime" className="space-y-6">
          <RealTimeDashboard
            workflowIds={activeWorkflowIds}
            workflowNames={workflowNames}
            refreshInterval={5000}
            alertThresholds={{
              successRate: 0.95,
              responseTime: 5.0,
              errorRate: 0.05
            }}
          />
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="abtesting" className="space-y-6">
          <ABTestingInterface
            workflowId={selectedWorkflowId}
            workflowName={selectedWorkflow?.name}
            onTestCreated={(testId) => {
              console.log('A/B test created:', testId);
              // Could show a success notification here
            }}
          />
        </TabsContent>

        {/* Reports Tab - Export & Reporting */}
        <TabsContent value="reports" className="space-y-6">
          <ExportReporting
            workflowId={selectedWorkflowId}
            workflowName={selectedWorkflow?.name}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h4 className="font-medium text-gray-900">Quick Actions</h4>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTab('abtesting')}>
                <TestTube className="w-4 h-4 mr-2" />
                Start A/B Test
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTab('reports')}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTab('realtime')}>
                <Activity className="w-4 h-4 mr-2" />
                View Live Data
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Analytics powered by AI • Real-time monitoring • Advanced insights
          </div>
        </div>
      </Card>
    </div>
  );
}