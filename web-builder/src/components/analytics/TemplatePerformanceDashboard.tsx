/**
 * Template Performance Dashboard Component
 * 
 * Comprehensive dashboard for template performance analytics with real-time
 * ranking updates, optimization recommendations, and trend analysis.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Lightbulb,
  Award,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  totalPageViews: number;
  totalSessions: number;
  totalConversions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  avgPageLoadTime: number;
  totalUsage: number;
  successRate: number;
  workflowSuccessRate: number;
  avgSatisfaction: number;
  trafficSources: Record<string, number>;
  deviceDistribution: {
    mobileUsers: number;
    desktopUsers: number;
    mobileRatio: number;
  };
  avgScrollDepth: number;
  formCompletionRate: number;
}

interface PerformanceScores {
  overallScore: number;
  conversionScore: number;
  uxScore: number;
  engagementScore: number;
  successScore: number;
}

interface RankingInfo {
  templateId: string;
  overallRank: number;
  categoryRank: number;
  performanceBand: string;
  overallScore: number;
  rankChange7d: number;
  rankChange30d: number;
  avgRating: number;
  ratingCount: number;
}

interface OptimizationRecommendation {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedImprovement: number;
  confidenceScore: number;
  effortLevel: string;
  estimatedTimeHours: number;
}

interface TemplatePerformanceDashboardProps {
  templateId: string;
  templateName: string;
  category: string;
  dateRangeDays?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const TemplatePerformanceDashboard: React.FC<TemplatePerformanceDashboardProps> = ({
  templateId,
  templateName,
  category,
  dateRangeDays = 30,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data state
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [scores, setScores] = useState<PerformanceScores | null>(null);
  const [ranking, setRanking] = useState<RankingInfo | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // Load performance dashboard data
      const response = await fetch(
        `/api/v1/templates/${templateId}/performance-dashboard?date_range_days=${dateRangeDays}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const dashboardData = await response.json();
      
      setMetrics(dashboardData.performanceMetrics);
      setScores(dashboardData.performanceScores);
      setRanking(dashboardData.rankingInfo);
      setLastUpdated(new Date());

      // Load recommendations
      const recResponse = await fetch(
        `/api/v1/templates/${templateId}/optimization-recommendations?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (recResponse.ok) {
        const recommendationsData = await recResponse.json();
        setRecommendations(recommendationsData);
      }

      // Load trend data
      const trendResponse = await fetch(
        `/api/v1/templates/${templateId}/ranking-trends?period_days=${dateRangeDays}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (trendResponse.ok) {
        const trendDataResponse = await trendResponse.json();
        setTrendData(trendDataResponse.trendData || []);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [templateId, dateRangeDays]);

  // Trigger new analysis
  const triggerAnalysis = useCallback(async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch(
        `/api/v1/templates/${templateId}/analyze?date_range_days=${dateRangeDays}&force_refresh=true`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger analysis');
      }

      // Wait a moment then reload data
      setTimeout(() => {
        loadDashboardData();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to trigger analysis');
      console.error('Analysis trigger error:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [templateId, dateRangeDays, loadDashboardData]);

  // Load data on mount and set up auto-refresh
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadDashboardData, autoRefresh, refreshInterval]);

  // Utility functions
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceBandColor = (band: string): string => {
    const colors = {
      'top_performer': 'bg-green-500',
      'good': 'bg-blue-500',
      'average': 'bg-yellow-500',
      'poor': 'bg-orange-500',
      'underperforming': 'bg-red-500'
    };
    return colors[band as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'critical': 'destructive',
      'high': 'destructive',
      'medium': 'default',
      'low': 'secondary'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading performance dashboard...</span>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={loadDashboardData} className="mt-2" size="sm">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Performance</h1>
          <p className="text-muted-foreground">
            {templateName} • {category}
            {lastUpdated && (
              <span className="ml-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={triggerAnalysis}
            disabled={analyzing}
            size="sm"
            variant="outline"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          <Button onClick={loadDashboardData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      {metrics && scores && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scores.overallScore.toFixed(1)}</div>
              <Progress value={scores.overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.conversionRate)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalConversions} of {metrics.totalPageViews} views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.bounceRate)}</div>
              <p className="text-xs text-muted-foreground">
                Lower is better
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(metrics.avgSessionDuration)}</div>
              <p className="text-xs text-muted-foreground">
                Load time: {metrics.avgPageLoadTime.toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ranking Information */}
      {ranking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Template Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">#{ranking.overallRank}</div>
                <p className="text-sm text-muted-foreground">Overall Rank</p>
                {ranking.rankChange7d !== 0 && (
                  <div className="flex items-center justify-center mt-1">
                    {ranking.rankChange7d > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{Math.abs(ranking.rankChange7d)} (7d)</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">#{ranking.categoryRank}</div>
                <p className="text-sm text-muted-foreground">Category Rank</p>
                <Badge 
                  className={`mt-1 ${getPerformanceBandColor(ranking.performanceBand)}`}
                  variant="secondary"
                >
                  {ranking.performanceBand.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-1" />
                  <span className="text-3xl font-bold">{ranking.avgRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ranking.ratingCount} ratings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {metrics && scores && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                  <CardDescription>Detailed scoring across key areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Conversion</span>
                        <span className="text-sm">{scores.conversionScore.toFixed(1)}</span>
                      </div>
                      <Progress value={scores.conversionScore} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">User Experience</span>
                        <span className="text-sm">{scores.uxScore.toFixed(1)}</span>
                      </div>
                      <Progress value={scores.uxScore} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Engagement</span>
                        <span className="text-sm">{scores.engagementScore.toFixed(1)}</span>
                      </div>
                      <Progress value={scores.engagementScore} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm">{scores.successScore.toFixed(1)}</span>
                      </div>
                      <Progress value={scores.successScore} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.trafficSources).map(([source, count]) => {
                      const total = Object.values(metrics.trafficSources).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={source} className="flex justify-between items-center">
                          <span className="capitalize text-sm">{source}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24">
                              <Progress value={percentage} />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Template adoption and success metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{metrics.totalUsage}</div>
                      <p className="text-sm text-muted-foreground">Total Uses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPercentage(metrics.successRate)}</div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPercentage(metrics.workflowSuccessRate)}</div>
                      <p className="text-sm text-muted-foreground">Workflow Success</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{metrics.avgSatisfaction.toFixed(1)}/5</div>
                      <p className="text-sm text-muted-foreground">User Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Mobile vs Desktop usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Mobile', value: metrics.deviceDistribution.mobileUsers, fill: '#8884d8' },
                          { name: 'Desktop', value: metrics.deviceDistribution.desktopUsers, fill: '#82ca9d' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#82ca9d" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>User interaction and engagement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Scroll Depth</span>
                      <span className="text-sm">{formatPercentage(metrics.avgScrollDepth)}</span>
                    </div>
                    <Progress value={metrics.avgScrollDepth * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Form Completion</span>
                      <span className="text-sm">{formatPercentage(metrics.formCompletionRate)}</span>
                    </div>
                    <Progress value={metrics.formCompletionRate * 100} />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page Load Time: <span className="font-medium">{metrics.avgPageLoadTime.toFixed(1)}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Trends</CardTitle>
              <CardDescription>Performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="overallRank"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Overall Rank"
                    />
                    <Line
                      type="monotone"
                      dataKey="categoryRank"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Category Rank"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No trend data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        {rec.title}
                      </CardTitle>
                      <Badge variant={getPriorityColor(rec.priority) as any}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <CardDescription>
                      {rec.type} • {rec.effortLevel} effort • ~{rec.estimatedTimeHours}h
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-sm">+{rec.estimatedImprovement}% impact</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-sm">{(rec.confidenceScore * 100).toFixed(0)}% confidence</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No optimization recommendations available yet</p>
                  <Button onClick={triggerAnalysis} className="mt-2" size="sm">
                    Generate Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatePerformanceDashboard;