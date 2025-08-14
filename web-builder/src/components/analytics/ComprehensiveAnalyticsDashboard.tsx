/**
 * Comprehensive Analytics Dashboard Component
 * 
 * Main dashboard for Story 3.3 - Performance Analytics Dashboard
 * Features: conversion rates, engagement metrics, time savings, drill-down capabilities
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Filter,
  Download,
  Calendar,
  Activity,
  Zap,
  Eye,
  MousePointer,
  Gauge
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Types for analytics data
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface ConversionFunnelStage {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface WorkflowPerformanceData {
  workflowId: string;
  workflowName: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
  conversionRate: number;
  timesSaved: number;
  roi: number;
  trend: number[];
  lastUpdated: string;
}

interface AnalyticsDashboardProps {
  detailed?: boolean;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
}

export const ComprehensiveAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  detailed = false,
  timeRange = '30d',
  onTimeRangeChange
}) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Mock data - replace with real API calls
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'conversion_rate',
      name: 'Conversion Rate',
      value: 8.5,
      previousValue: 7.2,
      unit: '%',
      trend: 'up',
      changePercent: 18.1,
      status: 'excellent'
    },
    {
      id: 'engagement_score',
      name: 'Engagement Score',
      value: 92,
      previousValue: 88,
      unit: '/100',
      trend: 'up',
      changePercent: 4.5,
      status: 'excellent'
    },
    {
      id: 'time_saved',
      name: 'Time Saved',
      value: 42.5,
      previousValue: 38.2,
      unit: 'hours',
      trend: 'up',
      changePercent: 11.3,
      status: 'good'
    },
    {
      id: 'roi',
      name: 'ROI',
      value: 325,
      previousValue: 280,
      unit: '%',
      trend: 'up',
      changePercent: 16.1,
      status: 'excellent'
    }
  ]);

  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelStage[]>([
    { stage: 'Landing Page', users: 10000, conversionRate: 100, dropOffRate: 0 },
    { stage: 'Sign Up', users: 6500, conversionRate: 65, dropOffRate: 35 },
    { stage: 'Onboarding', users: 5200, conversionRate: 80, dropOffRate: 20 },
    { stage: 'First Action', users: 3900, conversionRate: 75, dropOffRate: 25 },
    { stage: 'Conversion', users: 2340, conversionRate: 60, dropOffRate: 40 }
  ]);

  const [timeSeriesData, setTimeSeriesData] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      conversions: Math.floor(Math.random() * 100) + 50,
      engagement: Math.floor(Math.random() * 30) + 70,
      timesSaved: Math.floor(Math.random() * 20) + 10,
      roi: Math.floor(Math.random() * 50) + 200
    }))
  );

  const [workflowPerformance, setWorkflowPerformance] = useState<WorkflowPerformanceData[]>([
    {
      workflowId: 'wf-001',
      workflowName: 'Lead Generation Campaign',
      executionCount: 1245,
      successRate: 94.2,
      avgExecutionTime: 2.3,
      conversionRate: 8.7,
      timesSaved: 156.5,
      roi: 420,
      trend: [85, 88, 92, 89, 94],
      lastUpdated: new Date().toISOString()
    },
    {
      workflowId: 'wf-002',
      workflowName: 'Customer Onboarding',
      executionCount: 892,
      successRate: 96.8,
      avgExecutionTime: 1.8,
      conversionRate: 12.3,
      timesSaved: 234.7,
      roi: 380,
      trend: [90, 93, 95, 97, 97],
      lastUpdated: new Date().toISOString()
    },
    {
      workflowId: 'wf-003',
      workflowName: 'Email Marketing Automation',
      executionCount: 2156,
      successRate: 91.5,
      avgExecutionTime: 0.9,
      conversionRate: 5.4,
      timesSaved: 89.2,
      roi: 285,
      trend: [88, 90, 89, 92, 91],
      lastUpdated: new Date().toISOString()
    }
  ]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: string) => {
    const validRange = range as '24h' | '7d' | '30d' | '90d';
    setSelectedTimeRange(validRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
    // Simulate data reload
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, [onTimeRangeChange]);

  // Render metric card
  const renderMetricCard = (metric: PerformanceMetric) => {
    const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                     metric.trend === 'down' ? TrendingDown : Activity;
    
    const statusColors = {
      excellent: 'bg-green-50 text-green-700 border-green-200',
      good: 'bg-blue-50 text-blue-700 border-blue-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      critical: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <Card key={metric.id} className={`transition-all hover:shadow-md ${statusColors[metric.status]}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendIcon className={`h-3 w-3 ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`} />
                <span className={`${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={metric.status === 'excellent' ? 'default' : 
                            metric.status === 'good' ? 'secondary' :
                            metric.status === 'warning' ? 'outline' : 'destructive'}>
                {metric.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render conversion funnel
  const renderConversionFunnel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Conversion Funnel Analysis
        </CardTitle>
        <CardDescription>
          Track user journey and identify optimization opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{stage.stage}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span>{stage.users.toLocaleString()} users</span>
                  <span className="text-green-600">{stage.conversionRate}%</span>
                  {stage.dropOffRate > 0 && (
                    <span className="text-red-600">-{stage.dropOffRate}%</span>
                  )}
                </div>
              </div>
              <div className="relative">
                <Progress value={stage.conversionRate} className="h-6" />
                {index < conversionFunnel.length - 1 && stage.dropOffRate > 20 && (
                  <AlertTriangle className="absolute right-2 top-1 h-4 w-4 text-yellow-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render performance chart
  const renderPerformanceChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Trends
        </CardTitle>
        <CardDescription>
          30-day performance overview with key metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  typeof value === 'number' ? value.toFixed(1) : value,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Conversions"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Engagement"
              />
              <Line 
                type="monotone" 
                dataKey="timesSaved" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Time Saved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Render workflow performance table
  const renderWorkflowPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Workflow Performance
        </CardTitle>
        <CardDescription>
          Individual workflow analytics and optimization insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowPerformance.map((workflow) => (
            <div key={workflow.workflowId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{workflow.workflowName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {workflow.executionCount} executions • {workflow.successRate}% success rate
                  </p>
                </div>
                <Badge variant="outline">
                  ROI: {workflow.roi}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg Time</span>
                  <p className="font-medium">{workflow.avgExecutionTime}s</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversion</span>
                  <p className="font-medium">{workflow.conversionRate}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time Saved</span>
                  <p className="font-medium">{workflow.timesSaved}h</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Optimal</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workflow.trend.map((value, index) => ({ index, value }))}>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Gauge className="h-6 w-6 animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflowPerformance.map(workflow => (
                <SelectItem key={workflow.workflowId} value={workflow.workflowId}>
                  {workflow.workflowName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map(renderMetricCard)}
      </div>

      {/* Main Dashboard Content */}
      {detailed ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderConversionFunnel()}
            {renderPerformanceChart()}
          </div>
          {renderWorkflowPerformance()}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {renderPerformanceChart()}
          </div>
          <div>
            {renderConversionFunnel()}
          </div>
        </div>
      )}
    </div>
  );
};