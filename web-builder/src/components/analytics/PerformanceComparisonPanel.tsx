/**
 * Performance Comparison Panel Component
 * 
 * Comparison between different workflow versions with statistical significance testing
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
  TrendingUp, 
  TrendingDown, 
  GitCompare, 
  BarChart3, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ArrowRight,
  Trophy,
  Target,
  Clock,
  DollarSign
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
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

// Types for comparison data
interface WorkflowVersion {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  isActive: boolean;
  performance: {
    successRate: number;
    avgExecutionTime: number;
    conversionRate: number;
    errorRate: number;
    throughput: number;
    userSatisfaction: number;
  };
  statistics: {
    sampleSize: number;
    confidenceLevel: number;
    pValue: number;
    effectSize: number;
    isSignificant: boolean;
  };
}

interface ComparisonResult {
  metric: string;
  versionA: {
    value: number;
    confidence: [number, number];
  };
  versionB: {
    value: number;
    confidence: [number, number];
  };
  improvement: number;
  pValue: number;
  isSignificant: boolean;
  recommendation: 'version_a' | 'version_b' | 'inconclusive';
}

export const PerformanceComparisonPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedVersionA, setSelectedVersionA] = useState<string>('v1.2.0');
  const [selectedVersionB, setSelectedVersionB] = useState<string>('v1.3.0');
  const [comparisonType, setComparisonType] = useState<'versions' | 'periods' | 'segments'>('versions');

  // Mock data for workflow versions
  const workflowVersions: WorkflowVersion[] = [
    {
      id: 'v1.2.0',
      name: 'Lead Generation Workflow',
      version: 'v1.2.0',
      createdAt: '2024-01-15',
      isActive: false,
      performance: {
        successRate: 92.5,
        avgExecutionTime: 2.8,
        conversionRate: 7.2,
        errorRate: 7.5,
        throughput: 156,
        userSatisfaction: 4.2
      },
      statistics: {
        sampleSize: 1245,
        confidenceLevel: 95,
        pValue: 0.032,
        effectSize: 0.18,
        isSignificant: true
      }
    },
    {
      id: 'v1.3.0',
      name: 'Lead Generation Workflow',
      version: 'v1.3.0',
      createdAt: '2024-02-01',
      isActive: true,
      performance: {
        successRate: 95.8,
        avgExecutionTime: 2.1,
        conversionRate: 8.7,
        errorRate: 4.2,
        throughput: 203,
        userSatisfaction: 4.6
      },
      statistics: {
        sampleSize: 1089,
        confidenceLevel: 95,
        pValue: 0.008,
        effectSize: 0.24,
        isSignificant: true
      }
    }
  ];

  // Mock comparison results
  const comparisonResults: ComparisonResult[] = [
    {
      metric: 'Success Rate',
      versionA: { value: 92.5, confidence: [91.2, 93.8] },
      versionB: { value: 95.8, confidence: [94.6, 97.0] },
      improvement: 3.6,
      pValue: 0.008,
      isSignificant: true,
      recommendation: 'version_b'
    },
    {
      metric: 'Conversion Rate',
      versionA: { value: 7.2, confidence: [6.8, 7.6] },
      versionB: { value: 8.7, confidence: [8.2, 9.2] },
      improvement: 20.8,
      pValue: 0.003,
      isSignificant: true,
      recommendation: 'version_b'
    },
    {
      metric: 'Avg Execution Time',
      versionA: { value: 2.8, confidence: [2.6, 3.0] },
      versionB: { value: 2.1, confidence: [1.9, 2.3] },
      improvement: 25.0,
      pValue: 0.001,
      isSignificant: true,
      recommendation: 'version_b'
    },
    {
      metric: 'User Satisfaction',
      versionA: { value: 4.2, confidence: [4.0, 4.4] },
      versionB: { value: 4.6, confidence: [4.4, 4.8] },
      improvement: 9.5,
      pValue: 0.012,
      isSignificant: true,
      recommendation: 'version_b'
    }
  ];

  // Time series comparison data
  const timeSeriesComparison = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      versionA: Math.random() * 20 + 80 + Math.sin(i / 5) * 5,
      versionB: Math.random() * 20 + 88 + Math.sin(i / 4) * 6,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const versionA = workflowVersions.find(v => v.id === selectedVersionA);
  const versionB = workflowVersions.find(v => v.id === selectedVersionB);

  // Render statistical significance badge
  const renderSignificanceBadge = (pValue: number, isSignificant: boolean) => (
    <div className="flex items-center gap-2">
      {isSignificant ? (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Significant
        </Badge>
      ) : (
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Significant
        </Badge>
      )}
      <span className="text-sm text-muted-foreground">
        p = {pValue.toFixed(3)}
      </span>
    </div>
  );

  // Render comparison metric card
  const renderComparisonCard = (result: ComparisonResult) => {
    const isImprovement = result.improvement > 0;
    const ImprovementIcon = isImprovement ? TrendingUp : TrendingDown;
    
    return (
      <Card key={result.metric} className="transition-all hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{result.metric}</CardTitle>
            {renderSignificanceBadge(result.pValue, result.isSignificant)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Version Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Version A</div>
                <div className="text-2xl font-bold">
                  {result.versionA.value}
                  {result.metric === 'Avg Execution Time' ? 's' : 
                   result.metric.includes('Rate') ? '%' : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  CI: {result.versionA.confidence[0].toFixed(1)} - {result.versionA.confidence[1].toFixed(1)}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Version B</div>
                <div className="text-2xl font-bold">
                  {result.versionB.value}
                  {result.metric === 'Avg Execution Time' ? 's' : 
                   result.metric.includes('Rate') ? '%' : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  CI: {result.versionB.confidence[0].toFixed(1)} - {result.versionB.confidence[1].toFixed(1)}
                </div>
              </div>
            </div>

            {/* Improvement Indicator */}
            <div className="text-center">
              <div className={`flex items-center justify-center gap-2 ${
                isImprovement ? 'text-green-600' : 'text-red-600'
              }`}>
                <ImprovementIcon className="h-4 w-4" />
                <span className="font-semibold">
                  {Math.abs(result.improvement).toFixed(1)}% 
                  {isImprovement ? ' improvement' : ' decline'}
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="text-center">
              {result.recommendation === 'version_b' ? (
                <Badge className="bg-green-100 text-green-800">
                  <Trophy className="h-3 w-3 mr-1" />
                  Version B Recommended
                </Badge>
              ) : result.recommendation === 'version_a' ? (
                <Badge className="bg-blue-100 text-blue-800">
                  <Trophy className="h-3 w-3 mr-1" />
                  Version A Recommended
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Info className="h-3 w-3 mr-1" />
                  Inconclusive
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render version summary
  const renderVersionSummary = (version: WorkflowVersion, label: string) => (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {label}: {version.version}
          </CardTitle>
          {version.isActive && (
            <Badge variant="default">Active</Badge>
          )}
        </div>
        <CardDescription>
          Created {new Date(version.createdAt).toLocaleDateString()} • 
          Sample size: {version.statistics.sampleSize.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{version.performance.successRate}%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{version.performance.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{version.performance.avgExecutionTime}s</div>
            <div className="text-sm text-muted-foreground">Avg Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Performance Comparison</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={comparisonType} onValueChange={setComparisonType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="versions">Compare Versions</SelectItem>
              <SelectItem value="periods">Compare Periods</SelectItem>
              <SelectItem value="segments">Compare Segments</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedVersionA} onValueChange={setSelectedVersionA}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflowVersions.map(version => (
                <SelectItem key={version.id} value={version.id}>
                  {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <ArrowRight className="h-4 w-4 self-center text-muted-foreground" />
          
          <Select value={selectedVersionB} onValueChange={setSelectedVersionB}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflowVersions.map(version => (
                <SelectItem key={version.id} value={version.id}>
                  {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Version Summaries */}
      {versionA && versionB && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderVersionSummary(versionA, 'Version A')}
          {renderVersionSummary(versionB, 'Version B')}
        </div>
      )}

      {/* Performance Trends Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends Comparison
          </CardTitle>
          <CardDescription>
            30-day performance comparison with statistical analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name === 'versionA' ? 'Version A' : 'Version B'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="versionA" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Version A"
                />
                <Line 
                  type="monotone" 
                  dataKey="versionB" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Version B"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metric Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparisonResults.map(renderComparisonCard)}
      </div>

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Statistical Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {comparisonResults.filter(r => r.isSignificant).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Statistically Significant Improvements
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-muted-foreground">Confidence Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versionB?.statistics.effectSize.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Effect Size</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Recommendation</span>
            </div>
            <p className="text-green-700">
              Version B shows statistically significant improvements across all key metrics. 
              Recommend deploying Version B to all users for an estimated{' '}
              <strong>20.8% improvement in conversion rate</strong> and{' '}
              <strong>25% reduction in execution time</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};