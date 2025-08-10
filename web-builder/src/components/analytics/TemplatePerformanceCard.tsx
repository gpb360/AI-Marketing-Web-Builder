/**
 * Template Performance Card
 * Displays key performance metrics for individual templates
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Clock,
  CheckCircle,
  Eye,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useTemplateAnalytics } from '@/hooks/useTemplateAnalytics';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TemplatePerformanceCardProps {
  templateId: number;
  templateName: string;
  category: string;
  showDetails?: boolean;
  onViewDetails?: () => void;
}

export default function TemplatePerformanceCard({
  templateId,
  templateName,
  category,
  showDetails = false,
  onViewDetails
}: TemplatePerformanceCardProps) {
  const {
    adoptionMetrics,
    successMetrics,
    performanceTrends,
    loading,
    error
  } = useTemplateAnalytics({ templateId, timeRange: '30d' });

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !adoptionMetrics || !successMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Unable to load performance data
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (current: number, trend?: string) => {
    if (trend === 'improving' || current > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'declining' || current < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{templateName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              <Badge variant="outline" className="mr-2">{category}</Badge>
              Template #{templateId}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getSuccessRateColor(successMetrics.performanceScore)}>
              {successMetrics.performanceScore.toFixed(1)}% Success
            </Badge>
            {getTrendIcon(0, performanceTrends?.trend)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Adoptions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{adoptionMetrics.totalAdoptions.toLocaleString()}</span>
              {getTrendIcon(adoptionMetrics.adoptionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {adoptionMetrics.conversionFromView.toFixed(1)}% conversion
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{successMetrics.userSatisfactionScore.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= successMetrics.userSatisfactionScore
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              User satisfaction
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Time to Adopt</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {Math.round(adoptionMetrics.timeToAdopt / 60)}m
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average time
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {adoptionMetrics.completionRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Setup completion
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Retention (7d)</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${adoptionMetrics.retentionRate}%` }}
                  />
                </div>
                <span className="font-medium">{adoptionMetrics.retentionRate.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Publish Rate</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${adoptionMetrics.publishRate}%` }}
                  />
                </div>
                <span className="font-medium">{adoptionMetrics.publishRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Performance */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Technical Performance</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className={`text-lg font-bold ${getPerformanceColor(successMetrics.technicalPerformance.loadTime)}`}>
                {successMetrics.technicalPerformance.loadTime.toFixed(1)}s
              </div>
              <div className="text-muted-foreground">Load</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getPerformanceColor(successMetrics.technicalPerformance.mobileResponsiveness)}`}>
                {successMetrics.technicalPerformance.mobileResponsiveness.toFixed(0)}
              </div>
              <div className="text-muted-foreground">Mobile</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getPerformanceColor(successMetrics.technicalPerformance.accessibilityScore)}`}>
                {successMetrics.technicalPerformance.accessibilityScore.toFixed(0)}
              </div>
              <div className="text-muted-foreground">A11y</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getPerformanceColor(successMetrics.technicalPerformance.seoScore)}`}>
                {successMetrics.technicalPerformance.seoScore.toFixed(0)}
              </div>
              <div className="text-muted-foreground">SEO</div>
            </div>
          </div>
        </div>

        {/* Trend Chart (if showing details) */}
        {showDetails && performanceTrends && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Performance Trend</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={performanceTrends.dataPoints}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="performanceScore"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Business Metrics */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Conversion Rate</span>
              <p className="font-medium">{successMetrics.businessMetrics.conversionRate.toFixed(2)}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bounce Rate</span>
              <p className="font-medium">{successMetrics.businessMetrics.bounceRate.toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Session Duration</span>
              <p className="font-medium">{Math.round(successMetrics.businessMetrics.avgSessionDuration / 60)}m</p>
            </div>
            <div>
              <span className="text-muted-foreground">Page Views</span>
              <p className="font-medium">{successMetrics.engagementMetrics.pageViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>Updated 5 min ago</span>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}