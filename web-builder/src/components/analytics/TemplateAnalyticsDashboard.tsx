/**
 * Template Analytics Dashboard
 * Comprehensive dashboard for template adoption tracking and success rate monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Download,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle,
  Globe,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { templateAnalyticsService } from '@/lib/api/services/template-analytics';
import type {
  TemplateAnalyticsDashboard as DashboardData,
  RealTimeAlert,
  UserSegmentAnalytics,
  CohortAnalysis,
} from '@/lib/api/services/template-analytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  category?: string;
  segment?: 'industry' | 'company_size' | 'technical_level' | 'geography';
}

export default function TemplateAnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [segmentData, setSegmentData] = useState<UserSegmentAnalytics[]>([]);
  const [cohortData, setCohortData] = useState<CohortAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '30d',
    segment: 'industry'
  });
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboard, alertsData, segments, cohorts] = await Promise.all([
        templateAnalyticsService.getAnalyticsDashboard(),
        templateAnalyticsService.getRealTimeAlerts(),
        templateAnalyticsService.getUserSegmentAnalytics(filters.segment),
        templateAnalyticsService.getCohortAnalysis(
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ]);

      setDashboardData(dashboard);
      setAlerts(alertsData);
      setSegmentData(segments);
      setCohortData(cohorts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.segment]);

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const blob = await templateAnalyticsService.exportAnalytics(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await templateAnalyticsService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getAlertColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium">Unable to load analytics data</h3>
        <Button onClick={loadDashboardData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor template adoption, success rates, and user behavior
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={filters.timeRange}
            onValueChange={(value: '7d' | '30d' | '90d' | '1y') =>
              setFilters(prev => ({ ...prev, timeRange: value }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('xlsx')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} variant={getAlertColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </AlertDescription>
            </Alert>
          ))}
          {alerts.length > 3 && (
            <p className="text-sm text-muted-foreground">
              And {alerts.length - 3} more alerts...
            </p>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.overview.totalTemplates}</p>
                <p className="text-sm text-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.overview.totalAdoptions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Adoptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.overview.avgSuccessRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.overview.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Top Templates</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adoption Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Adoption Trends
                  {getTrendIcon(dashboardData.recentTrends.adoptionTrend)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.topTemplates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="adoptions"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success Rate Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Success Rate Distribution
                  {getTrendIcon(dashboardData.recentTrends.successTrend)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.topTemplates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topTemplates.map((template, index) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.adoptions.toLocaleString()} adoptions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{template.successRate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                      {getTrendIcon(template.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4" />
            <Select
              value={filters.segment}
              onValueChange={(value: 'industry' | 'company_size' | 'technical_level' | 'geography') =>
                setFilters(prev => ({ ...prev, segment: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry</SelectItem>
                <SelectItem value="company_size">Company Size</SelectItem>
                <SelectItem value="technical_level">Technical Level</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalUsers"
                      label={({ segment, percent }) => `${segment} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentData.map((segment) => (
                    <div key={segment.segment} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{segment.segment}</h3>
                        <Badge variant="outline">{segment.totalUsers} users</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Publish Rate</p>
                          <p className="font-medium">{segment.successMetrics.publishRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <p className="font-medium">{segment.successMetrics.avgPerformanceScore.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Retention</p>
                          <p className="font-medium">{segment.successMetrics.retentionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Cohort Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-left p-2">Users</th>
                      <th className="text-left p-2">Week 1</th>
                      <th className="text-left p-2">Week 2</th>
                      <th className="text-left p-2">Week 4</th>
                      <th className="text-left p-2">Week 8</th>
                      <th className="text-left p-2">Week 12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohortId} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohortDate}</td>
                        <td className="p-2">{cohort.userCount}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${cohort.retentionRates.week1}%` }}
                            />
                            <span>{cohort.retentionRates.week1.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${cohort.retentionRates.week2}%` }}
                            />
                            <span>{cohort.retentionRates.week2.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${cohort.retentionRates.week4}%` }}
                            />
                            <span>{cohort.retentionRates.week4.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${cohort.retentionRates.week8}%` }}
                            />
                            <span>{cohort.retentionRates.week8.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${cohort.retentionRates.week12}%` }}
                            />
                            <span>{cohort.retentionRates.week12.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Optimize Top Performers</h4>
                      <p className="text-sm text-muted-foreground">
                        Focus optimization efforts on templates with high adoption but low success rates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Address Segment Gaps</h4>
                      <p className="text-sm text-muted-foreground">
                        Create more templates targeting underserved user segments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Improve Onboarding</h4>
                      <p className="text-sm text-muted-foreground">
                        Enhance template customization guides to improve completion rates
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}