/**
 * ROI Analytics Panel Component
 * 
 * Cost analysis including execution time and resource usage with ROI calculations
 * Part of Story 3.3 - Performance Analytics Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap, 
  Calculator, 
  Target, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Percent,
  Timer,
  CreditCard
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

// Types for ROI analytics
interface ROIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'positive' | 'negative' | 'neutral';
  changePercent: number;
  benchmark?: number;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  change: number;
  color: string;
}

interface TimeSavingsAnalysis {
  workflow: string;
  manualTime: number;
  automatedTime: number;
  timeSaved: number;
  costSavings: number;
  frequency: number;
  totalSavings: number;
}

interface BusinessImpactMetric {
  metric: string;
  beforeAutomation: number;
  afterAutomation: number;
  improvement: number;
  businessValue: number;
  unit: string;
}

export const ROIAnalyticsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');

  // Mock ROI metrics data
  const roiMetrics: ROIMetric[] = [
    {
      id: 'total_roi',
      name: 'Total ROI',
      value: 425,
      previousValue: 380,
      unit: '%',
      trend: 'positive',
      changePercent: 11.8,
      benchmark: 250
    },
    {
      id: 'cost_savings',
      name: 'Monthly Cost Savings',
      value: 24500,
      previousValue: 21200,
      unit: '$',
      trend: 'positive',
      changePercent: 15.6
    },
    {
      id: 'time_savings',
      name: 'Time Saved',
      value: 156,
      previousValue: 142,
      unit: 'hours',
      trend: 'positive',
      changePercent: 9.9
    },
    {
      id: 'efficiency_gain',
      name: 'Efficiency Gain',
      value: 67,
      previousValue: 58,
      unit: '%',
      trend: 'positive',
      changePercent: 15.5
    }
  ];

  // Cost breakdown data
  const costBreakdown: CostBreakdown[] = [
    { category: 'Automation Platform', amount: 4200, percentage: 35, change: 5.2, color: '#3b82f6' },
    { category: 'Development & Setup', amount: 2800, percentage: 23, change: -8.1, color: '#10b981' },
    { category: 'Training & Onboarding', amount: 1800, percentage: 15, change: 12.5, color: '#f59e0b' },
    { category: 'Maintenance & Support', amount: 1600, percentage: 13, change: 3.7, color: '#ef4444' },
    { category: 'Integration Costs', amount: 1200, percentage: 10, change: -2.3, color: '#8b5cf6' },
    { category: 'Other', amount: 400, percentage: 4, change: 0.8, color: '#6b7280' }
  ];

  // Time savings analysis data
  const timeSavingsData: TimeSavingsAnalysis[] = [
    {
      workflow: 'Lead Generation',
      manualTime: 4.5,
      automatedTime: 0.3,
      timeSaved: 4.2,
      costSavings: 168,
      frequency: 45,
      totalSavings: 7560
    },
    {
      workflow: 'Customer Onboarding',
      manualTime: 2.8,
      automatedTime: 0.2,
      timeSaved: 2.6,
      costSavings: 104,
      frequency: 32,
      totalSavings: 3328
    },
    {
      workflow: 'Email Campaigns',
      manualTime: 3.2,
      automatedTime: 0.1,
      timeSaved: 3.1,
      costSavings: 124,
      frequency: 28,
      totalSavings: 3472
    },
    {
      workflow: 'Report Generation',
      manualTime: 1.5,
      automatedTime: 0.05,
      timeSaved: 1.45,
      costSavings: 58,
      frequency: 60,
      totalSavings: 3480
    }
  ];

  // Business impact metrics
  const businessImpactMetrics: BusinessImpactMetric[] = [
    {
      metric: 'Lead Response Time',
      beforeAutomation: 24,
      afterAutomation: 2,
      improvement: 91.7,
      businessValue: 18500,
      unit: 'hours'
    },
    {
      metric: 'Customer Satisfaction',
      beforeAutomation: 3.2,
      afterAutomation: 4.6,
      improvement: 43.8,
      businessValue: 12300,
      unit: '/5'
    },
    {
      metric: 'Processing Accuracy',
      beforeAutomation: 92,
      afterAutomation: 99.2,
      improvement: 7.8,
      businessValue: 8900,
      unit: '%'
    },
    {
      metric: 'Team Productivity',
      beforeAutomation: 65,
      afterAutomation: 89,
      improvement: 36.9,
      businessValue: 25600,
      unit: '%'
    }
  ];

  // ROI trend data
  const roiTrendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000);
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      roi: Math.floor(Math.random() * 100) + 300 + i * 10,
      costs: Math.floor(Math.random() * 2000) + 8000,
      savings: Math.floor(Math.random() * 3000) + 15000 + i * 1000,
      efficiency: Math.floor(Math.random() * 20) + 45 + i * 2
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Render ROI metric card
  const renderROIMetricCard = (metric: ROIMetric) => {
    const TrendIcon = metric.trend === 'positive' ? TrendingUp : 
                     metric.trend === 'negative' ? ArrowDownRight : Activity;
    
    const trendColor = metric.trend === 'positive' ? 'text-green-600' : 
                      metric.trend === 'negative' ? 'text-red-600' : 'text-gray-600';

    return (
      <Card key={metric.id} className="transition-all hover:shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}
                {metric.unit !== '$' ? metric.unit : ''}
              </div>
              {metric.benchmark && (
                <Badge variant="outline" className="text-xs">
                  Target: {metric.benchmark}{metric.unit}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span className={`text-sm font-medium ${trendColor}`}>
                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
              </span>
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>

            {metric.benchmark && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to target</span>
                  <span>{Math.min(100, (metric.value / metric.benchmark) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (metric.value / metric.benchmark) * 100)} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render cost breakdown chart
  const renderCostBreakdown = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Cost Breakdown Analysis
        </CardTitle>
        <CardDescription>
          Monthly automation costs and spending distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  labelLine={false}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {costBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${item.amount.toLocaleString()}</div>
                  <div className={`text-xs ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render time savings analysis
  const renderTimeSavingsAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Savings Analysis
        </CardTitle>
        <CardDescription>
          Detailed breakdown of time and cost savings by workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeSavingsData.map((workflow) => (
            <div key={workflow.workflow} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{workflow.workflow}</h4>
                <Badge className="bg-green-100 text-green-800">
                  ${workflow.totalSavings.toLocaleString()} saved
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Manual Time</div>
                  <div className="font-medium">{workflow.manualTime}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Automated Time</div>
                  <div className="font-medium">{workflow.automatedTime}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time Saved</div>
                  <div className="font-medium text-green-600">{workflow.timeSaved}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Frequency/Month</div>
                  <div className="font-medium">{workflow.frequency}x</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Efficiency improvement</span>
                  <span>{((workflow.timeSaved / workflow.manualTime) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(workflow.timeSaved / workflow.manualTime) * 100} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render ROI trends chart
  const renderROITrends = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          ROI Performance Trends
        </CardTitle>
        <CardDescription>
          12-month ROI progression and cost-benefit analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roiTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'roi' ? `${value}%` : `$${value.toLocaleString()}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="costs" fill="#ef4444" name="Costs" />
              <Bar yAxisId="left" dataKey="savings" fill="#10b981" name="Savings" />
              <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={3} name="ROI %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Render business impact metrics
  const renderBusinessImpact = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Business Impact Metrics
        </CardTitle>
        <CardDescription>
          Quantified business improvements from workflow automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessImpactMetrics.map((metric) => (
            <div key={metric.metric} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">{metric.metric}</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Before</div>
                  <div className="text-lg font-bold text-red-600">
                    {metric.beforeAutomation}{metric.unit}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">After</div>
                  <div className="text-lg font-bold text-green-600">
                    {metric.afterAutomation}{metric.unit}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Improvement</span>
                  <span className="text-sm font-bold text-green-600">
                    {metric.improvement}%
                  </span>
                </div>
                <Progress value={metric.improvement} className="h-2" />
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Business Value: </span>
                  <span className="font-semibold">${metric.businessValue.toLocaleString()}</span>
                </div>
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
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <h2 className="text-lg font-semibold">ROI Analytics</h2>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            ROI Calculator
          </Button>
        </div>
      </div>

      {/* Key ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roiMetrics.map(renderROIMetricCard)}
      </div>

      {/* ROI Trends Chart */}
      {renderROITrends()}

      {/* Cost Analysis and Time Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCostBreakdown()}
        {renderTimeSavingsAnalysis()}
      </div>

      {/* Business Impact Metrics */}
      {renderBusinessImpact()}

      {/* ROI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ROI Summary & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">425%</div>
              <div className="text-sm text-green-700">Current ROI</div>
              <div className="text-xs text-muted-foreground mt-1">
                Exceeding target by 70%
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$294K</div>
              <div className="text-sm text-blue-700">Annual Savings</div>
              <div className="text-xs text-muted-foreground mt-1">
                vs $72K investment
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">4.2 months</div>
              <div className="text-sm text-orange-700">Payback Period</div>
              <div className="text-xs text-muted-foreground mt-1">
                Break-even achieved
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Key Recommendations</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Expand automation to customer support workflows for additional 15% ROI improvement</li>
              <li>• Optimize lead generation workflow to reduce execution time by 25%</li>
              <li>• Consider premium features for enhanced analytics and reporting capabilities</li>
              <li>• Scale successful workflows to additional departments for multiplied ROI</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};