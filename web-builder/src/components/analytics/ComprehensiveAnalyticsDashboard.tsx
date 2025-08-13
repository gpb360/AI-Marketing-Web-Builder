/**
 * Comprehensive Analytics Dashboard for Story 3.3
 * Main dashboard displaying performance metrics, conversion funnels, business impact,
 * real-time monitoring, and trend predictions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { analyticsService } from '../../lib/api/services/analytics';
import type { 
  ComprehensiveWorkflowAnalytics, 
  AnalyticsTimePeriod, 
  PerformanceAnomaly,
  AnomalySeverity 
} from '../../lib/api/types';

interface ComprehensiveAnalyticsDashboardProps {
  workflowId: number;
  workflowName?: string;
  defaultTimePeriod?: AnalyticsTimePeriod;
  enableRealTime?: boolean;
  className?: string;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#64748b',
  accent: '#8b5cf6'
};

const ANOMALY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
};

export default function ComprehensiveAnalyticsDashboard({
  workflowId,
  workflowName,
  defaultTimePeriod = 'WEEK' as AnalyticsTimePeriod,
  enableRealTime = true,
  className = ''
}: ComprehensiveAnalyticsDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<AnalyticsTimePeriod>(defaultTimePeriod);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Main analytics query
  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['workflow-analytics', workflowId, timePeriod],
    queryFn: () => analyticsService.getWorkflowAnalytics(workflowId, {
      time_period: timePeriod,
      include_predictions: true,
      include_anomalies: true
    }),
    refetchInterval: enableRealTime ? 30000 : false, // Refresh every 30 seconds if real-time enabled
    staleTime: 10000 // Data is fresh for 10 seconds
  });

  // Real-time metrics query (faster refresh)
  const { data: realTimeData } = useQuery({
    queryKey: ['real-time-metrics', workflowId],
    queryFn: () => analyticsService.getRealTimeMetrics(workflowId),
    refetchInterval: enableRealTime ? 5000 : false, // Refresh every 5 seconds
    enabled: enableRealTime
  });

  const analytics = analyticsData?.data;
  const realTimeMetrics = realTimeData?.metrics;

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workflow-analytics', workflowId] }),
        queryClient.invalidateQueries({ queryKey: ['real-time-metrics', workflowId] })
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, workflowId]);

  // Export handler
  const handleExport = useCallback(async (format: 'pdf' | 'csv') => {
    try {
      const response = await analyticsService.exportAnalyticsData(workflowId, {
        format,
        time_period: timePeriod,
        include_charts: format === 'pdf',
        include_raw_data: format === 'csv'
      });

      // In a real implementation, you might show a toast notification
      console.log('Export started:', response.export_id);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [workflowId, timePeriod]);

  // Format numbers for display
  const formatNumber = (value: number, type: 'percentage' | 'currency' | 'time' | 'count' = 'count') => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'time':
        return `${value.toFixed(1)}s`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  // Get trend icon and color
  const getTrendIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  // Prepare funnel chart data
  const funnelData = analytics?.conversion_funnel.stages.map((stage, index) => ({
    name: stage.stage_name,
    value: stage.completion_count,
    fill: `hsl(${220 + index * 30}, 70%, ${60 + index * 5}%)`
  })) || [];

  // Prepare anomaly timeline data
  const anomalyTimelineData = analytics?.detected_anomalies.map(anomaly => ({
    timestamp: new Date(anomaly.timestamp).toLocaleDateString(),
    severity: anomaly.severity,
    metric: anomaly.metric_name,
    deviation: Math.abs(anomaly.deviation_percentage),
    description: anomaly.description
  })) || [];

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">No analytics data available for this workflow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            {workflowName || analytics.workflow_name} • {timePeriod} Analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Period Selector */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as AnalyticsTimePeriod)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HOUR">Last Hour</option>
            <option value="DAY">Last Day</option>
            <option value="WEEK">Last Week</option>
            <option value="MONTH">Last Month</option>
            <option value="QUARTER">Last Quarter</option>
            <option value="YEAR">Last Year</option>
          </select>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* Export options would go here in a dropdown */}
          </div>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {enableRealTime && realTimeMetrics && (
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live</span>
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date(realTimeMetrics.last_updated).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-gray-500">Active Users:</span>
                <span className="ml-1 font-semibold">{realTimeMetrics.active_users}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Executions:</span>
                <span className="ml-1 font-semibold">{realTimeMetrics.current_executions}</span>
              </div>
              <div>
                <span className="text-gray-500">Success Rate:</span>
                <span className="ml-1 font-semibold text-green-600">
                  {formatNumber(realTimeMetrics.success_rate, 'percentage')}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Execution Count */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.performance_metrics.execution_count)}
              </p>
              {analytics.previous_period_comparison && (
                getTrendIndicator(
                  analytics.performance_metrics.execution_count,
                  analytics.previous_period_comparison.execution_count
                )
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(analytics.performance_metrics.success_rate, 'percentage')}
              </p>
              {analytics.previous_period_comparison && (
                getTrendIndicator(
                  analytics.performance_metrics.success_rate,
                  analytics.previous_period_comparison.success_rate
                )
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Average Execution Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.performance_metrics.avg_execution_time, 'time')}
              </p>
              {analytics.previous_period_comparison && (
                getTrendIndicator(
                  analytics.performance_metrics.avg_execution_time,
                  analytics.previous_period_comparison.avg_execution_time
                )
              )}
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* ROI */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(analytics.business_impact.roi_percentage, 'percentage')}
              </p>
              {analytics.previous_period_comparison && (
                getTrendIndicator(
                  analytics.business_impact.roi_percentage,
                  analytics.previous_period_comparison.roi_percentage
                )
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="funnel">Conversion</TabsTrigger>
          <TabsTrigger value="business">Business Impact</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </Tabs>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="success_rate" 
                    stroke={COLORS.success} 
                    strokeWidth={2}
                    name="Success Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="execution_time" 
                    stroke={COLORS.warning} 
                    strokeWidth={2}
                    name="Avg Time (s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Key Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                {analytics.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Execution Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Median Time</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.performance_metrics.median_execution_time, 'time')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">95th Percentile</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.performance_metrics.p95_execution_time, 'time')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-semibold text-red-600">
                    {formatNumber(analytics.performance_metrics.error_rate, 'percentage')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Throughput</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.performance_metrics.throughput)} /hr
                  </span>
                </div>
              </div>
            </Card>

            {/* Resource Utilization */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Used', value: analytics.performance_metrics.resource_utilization },
                      { name: 'Available', value: 1 - analytics.performance_metrics.resource_utilization }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell fill={COLORS.primary} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number, 'percentage')} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <span className="text-2xl font-bold">
                  {formatNumber(analytics.performance_metrics.resource_utilization, 'percentage')}
                </span>
                <p className="text-sm text-gray-600">Resource Utilization</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Overall Conversion Rate</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(analytics.conversion_funnel.overall_conversion_rate, 'percentage')}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {analytics.conversion_funnel.stages.map((stage, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">{stage.stage_name}</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Conversion: {formatNumber(stage.conversion_rate, 'percentage')}</p>
                        <p>Avg. Time: {formatNumber(stage.avg_time_in_stage, 'time')}</p>
                        <p>Drop-offs: {formatNumber(stage.drop_off_count)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Optimization Opportunities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Optimization Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.conversion_funnel.optimization_opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{opportunity}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Business Impact Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Time Savings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Time Savings</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatNumber(analytics.business_impact.time_savings_hours)} hrs
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Productivity improvement: {formatNumber(analytics.business_impact.productivity_improvement, 'percentage')}
              </p>
            </Card>

            {/* Cost Savings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold">Cost Savings</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(analytics.business_impact.cost_savings_usd, 'currency')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This {timePeriod.toLowerCase()}
              </p>
            </Card>

            {/* Revenue Attribution */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Revenue Impact</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {formatNumber(analytics.business_impact.revenue_attribution_usd, 'currency')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                User satisfaction: {formatNumber(analytics.business_impact.user_satisfaction_score)}/100
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          {analytics.detected_anomalies.length > 0 ? (
            <>
              {/* Anomaly Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(
                  analytics.detected_anomalies.reduce((acc, anomaly) => {
                    acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
                    return acc;
                  }, {} as Record<AnomalySeverity, number>)
                ).map(([severity, count]) => (
                  <Card key={severity} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{severity}</p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <AlertTriangle 
                        className={`w-6 h-6`}
                        style={{ color: ANOMALY_COLORS[severity as AnomalySeverity] }}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Anomaly List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
                <div className="space-y-4">
                  {analytics.detected_anomalies.map((anomaly, index) => (
                    <div key={index} className="border-l-4 pl-4 py-3" style={{ borderColor: ANOMALY_COLORS[anomaly.severity] }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="secondary"
                            className="capitalize"
                            style={{ backgroundColor: ANOMALY_COLORS[anomaly.severity], color: 'white' }}
                          >
                            {anomaly.severity}
                          </Badge>
                          <span className="font-medium">{anomaly.metric_name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(anomaly.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Deviation:</span> {formatNumber(anomaly.deviation_percentage, 'percentage')}
                        <span className="ml-4 font-medium">Expected:</span> {anomaly.expected_value}
                        <span className="ml-4 font-medium">Actual:</span> {anomaly.actual_value}
                      </div>
                      {anomaly.suggested_actions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Suggested Actions:</p>
                          <ul className="text-sm text-gray-600 ml-4 list-disc">
                            {anomaly.suggested_actions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Anomalies Detected</h3>
              <p className="text-gray-600">Your workflow is performing within expected parameters.</p>
            </Card>
          )}

          {/* Trend Predictions */}
          {analytics.trend_predictions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Trend Predictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.trend_predictions.map((prediction, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{prediction.metric_name}</span>
                      <Badge variant={prediction.trend_direction === 'increasing' ? 'default' : 'secondary'}>
                        {prediction.trend_direction}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Current: {prediction.current_value}</p>
                      <p>Predicted: {prediction.predicted_value}</p>
                      <p>Confidence: {formatNumber(prediction.prediction_confidence, 'percentage')}</p>
                      <p>Horizon: {prediction.time_horizon}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}