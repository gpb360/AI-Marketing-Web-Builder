/**
 * A/B Testing Interface Component
 * 
 * A/B testing capabilities for workflow variations with automated winner selection
 * Part of Story 3.3 - Performance Analytics Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  TestTube2, 
  Play, 
  Pause, 
  Trophy, 
  Target, 
  BarChart3, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Activity
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types for A/B testing
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  workflowId: string;
  workflowName: string;
  startDate: string;
  endDate?: string;
  trafficSplit: number; // 0-100 percentage for variant A
  variants: {
    variantA: ABTestVariant;
    variantB: ABTestVariant;
  };
  results?: ABTestResults;
  settings: {
    minSampleSize: number;
    maxDuration: number; // days
    significanceLevel: number; // 0.95 for 95%
    autoStop: boolean;
    earlyWinnerDetection: boolean;
  };
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  metrics: {
    participants: number;
    conversions: number;
    conversionRate: number;
    avgResponseTime: number;
    successRate: number;
  };
}

interface ABTestResults {
  winner?: 'variantA' | 'variantB' | 'inconclusive';
  confidence: number;
  pValue: number;
  effectSize: number;
  improvementPercent: number;
  statisticalSignificance: boolean;
  recommendation: string;
  detailedAnalysis: {
    conversionRateImprovement: number;
    responseTimeImprovement: number;
    successRateImprovement: number;
    businessImpact: number;
  };
}

export const ABTestingInterface: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<string>('test-001');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock A/B test data
  const [abTests, setAbTests] = useState<ABTest[]>([
    {
      id: 'test-001',
      name: 'Lead Generation Optimization',
      description: 'Testing improved lead capture form vs current implementation',
      status: 'running',
      workflowId: 'wf-001',
      workflowName: 'Lead Generation Workflow',
      startDate: '2024-01-15T10:00:00Z',
      trafficSplit: 50,
      variants: {
        variantA: {
          id: 'variant-a-001',
          name: 'Current Implementation',
          description: 'Existing lead generation workflow',
          configuration: { formFields: 3, validation: 'basic' },
          metrics: {
            participants: 1245,
            conversions: 89,
            conversionRate: 7.15,
            avgResponseTime: 2.8,
            successRate: 94.2
          }
        },
        variantB: {
          id: 'variant-b-001',
          name: 'Optimized Form',
          description: 'Streamlined form with better UX',
          configuration: { formFields: 2, validation: 'smart' },
          metrics: {
            participants: 1189,
            conversions: 103,
            conversionRate: 8.66,
            avgResponseTime: 2.1,
            successRate: 96.8
          }
        }
      },
      results: {
        winner: 'variantB',
        confidence: 97.5,
        pValue: 0.012,
        effectSize: 0.21,
        improvementPercent: 21.1,
        statisticalSignificance: true,
        recommendation: 'Deploy Variant B - significant improvement in conversion rate',
        detailedAnalysis: {
          conversionRateImprovement: 21.1,
          responseTimeImprovement: 25.0,
          successRateImprovement: 2.8,
          businessImpact: 15600
        }
      },
      settings: {
        minSampleSize: 1000,
        maxDuration: 30,
        significanceLevel: 0.95,
        autoStop: true,
        earlyWinnerDetection: true
      }
    },
    {
      id: 'test-002',
      name: 'Email Template Comparison',
      description: 'Testing personalized vs standard email templates',
      status: 'running',
      workflowId: 'wf-002',
      workflowName: 'Email Marketing Workflow',
      startDate: '2024-01-20T14:00:00Z',
      trafficSplit: 60,
      variants: {
        variantA: {
          id: 'variant-a-002',
          name: 'Standard Template',
          description: 'Current email template design',
          configuration: { personalization: false, subject: 'standard' },
          metrics: {
            participants: 892,
            conversions: 41,
            conversionRate: 4.6,
            avgResponseTime: 1.2,
            successRate: 92.1
          }
        },
        variantB: {
          id: 'variant-b-002',
          name: 'Personalized Template',
          description: 'AI-personalized email content',
          configuration: { personalization: true, subject: 'dynamic' },
          metrics: {
            participants: 595,
            conversions: 34,
            conversionRate: 5.7,
            avgResponseTime: 1.4,
            successRate: 94.3
          }
        }
      },
      settings: {
        minSampleSize: 800,
        maxDuration: 21,
        significanceLevel: 0.95,
        autoStop: false,
        earlyWinnerDetection: true
      }
    }
  ]);

  // Performance comparison data for charts
  const performanceComparisonData = [
    { metric: 'Conversion Rate', variantA: 7.15, variantB: 8.66, improvement: 21.1 },
    { metric: 'Response Time', variantA: 2.8, variantB: 2.1, improvement: 25.0 },
    { metric: 'Success Rate', variantA: 94.2, variantB: 96.8, improvement: 2.8 }
  ];

  // Time series data for the running test
  const timeSeriesData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      variantA: 7.0 + Math.random() * 0.5 + i * 0.01,
      variantB: 8.0 + Math.random() * 0.8 + i * 0.05,
      participants: 50 + i * 10
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentTest = abTests.find(test => test.id === selectedTest);

  // Render test status badge
  const renderStatusBadge = (status: ABTest['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      running: { color: 'bg-green-100 text-green-800', icon: Play },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render variant comparison card
  const renderVariantCard = (variant: ABTestVariant, label: string, isWinner?: boolean) => (
    <Card className={`relative ${isWinner ? 'border-green-500 bg-green-50' : ''}`}>
      {isWinner && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-100 text-green-800">
            <Trophy className="h-3 w-3 mr-1" />
            Winner
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">
          {label}: {variant.name}
        </CardTitle>
        <CardDescription>{variant.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{variant.metrics.participants.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{variant.metrics.conversionRate.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{variant.metrics.avgResponseTime.toFixed(1)}s</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{variant.metrics.successRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render test results
  const renderTestResults = (results: ABTestResults) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Statistical Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{results.confidence.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Confidence Level</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{results.pValue.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">P-Value</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">+{results.improvementPercent.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Improvement</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">${results.detailedAnalysis.businessImpact.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Business Impact</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            results.statisticalSignificance ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {results.statisticalSignificance ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-semibold">
                {results.statisticalSignificance ? 'Statistically Significant' : 'Not Yet Significant'}
              </span>
            </div>
            <p className="text-sm">{results.recommendation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Conversion Rate</h4>
              <div className="flex items-center gap-2">
                <Progress value={Math.abs(results.detailedAnalysis.conversionRateImprovement)} className="flex-1" />
                <span className="text-sm font-medium">+{results.detailedAnalysis.conversionRateImprovement.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Response Time</h4>
              <div className="flex items-center gap-2">
                <Progress value={Math.abs(results.detailedAnalysis.responseTimeImprovement)} className="flex-1" />
                <span className="text-sm font-medium">+{results.detailedAnalysis.responseTimeImprovement.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Success Rate</h4>
              <div className="flex items-center gap-2">
                <Progress value={Math.abs(results.detailedAnalysis.successRateImprovement)} className="flex-1" />
                <span className="text-sm font-medium">+{results.detailedAnalysis.successRateImprovement.toFixed(1)}%</span>
              </div>
            </div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTube2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">A/B Testing</h2>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {abTests.map(test => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name} - {renderStatusBadge(test.status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>
      </div>

      {currentTest && (
        <>
          {/* Test Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentTest.name}</CardTitle>
                  <CardDescription>{currentTest.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(currentTest.status)}
                  <div className="text-right text-sm">
                    <div>Started: {new Date(currentTest.startDate).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      Traffic Split: {currentTest.trafficSplit}% / {100 - currentTest.trafficSplit}%
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {currentTest.status === 'running' ? (
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Test
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Resume Test
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variant Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderVariantCard(
              currentTest.variants.variantA, 
              'Variant A', 
              currentTest.results?.winner === 'variantA'
            )}
            {renderVariantCard(
              currentTest.variants.variantB, 
              'Variant B', 
              currentTest.results?.winner === 'variantB'
            )}
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Conversion rate comparison over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)}%`,
                        name === 'variantA' ? 'Variant A' : 'Variant B'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="variantA" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Variant A"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="variantB" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Variant B"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Detailed Metrics Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="variantA" fill="#3b82f6" name="Variant A" />
                    <Bar dataKey="variantB" fill="#10b981" name="Variant B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {currentTest.results && renderTestResults(currentTest.results)}

          {/* Test Actions */}
          {currentTest.results?.statisticalSignificance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Winner Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Variant B shows significant improvement
                    </h4>
                    <p className="text-sm text-green-700">
                      Deploy Variant B for {currentTest.results.improvementPercent.toFixed(1)}% improvement 
                      and ${currentTest.results.detailedAnalysis.businessImpact.toLocaleString()} business impact
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Deploy Gradually
                    </Button>
                    <Button>
                      Deploy to All Traffic
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Active Tests Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All A/B Tests Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {abTests.map(test => (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {test.workflowName} • Started {new Date(test.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(test.status)}
                  {test.results?.statisticalSignificance && (
                    <Badge className="bg-green-100 text-green-800">
                      +{test.results.improvementPercent.toFixed(1)}%
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTest(test.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};