/**
 * A/B Testing Interface for Story 3.3
 * Components for creating, monitoring, and analyzing A/B test experiments
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  Clock, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Settings,
  Copy,
  Download,
  Eye
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { analyticsService } from '../../lib/api/services/analytics';
import type { 
  ABTestCreateRequest, 
  ABTestResult, 
  ABTestGoal, 
  WorkflowVariantRequest 
} from '../../lib/api/types';

interface ABTestingInterfaceProps {
  workflowId: number;
  workflowName?: string;
  onTestCreated?: (testId: string) => void;
  className?: string;
}

const GOAL_OPTIONS = [
  { value: 'CONVERSION_RATE', label: 'Conversion Rate', description: 'Optimize for higher conversion rates' },
  { value: 'EXECUTION_TIME', label: 'Execution Time', description: 'Optimize for faster execution' },
  { value: 'SUCCESS_RATE', label: 'Success Rate', description: 'Optimize for higher success rates' },
  { value: 'USER_ENGAGEMENT', label: 'User Engagement', description: 'Optimize for better user engagement' },
  { value: 'REVENUE', label: 'Revenue', description: 'Optimize for revenue generation' },
  { value: 'COST_PER_EXECUTION', label: 'Cost per Execution', description: 'Optimize for cost efficiency' }
];

const COLORS = {
  control: '#3b82f6',
  treatment: '#10b981',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

export default function ABTestingInterface({
  workflowId,
  workflowName,
  onTestCreated,
  className = ''
}: ABTestingInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form for creating A/B tests
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ABTestCreateRequest>({
    defaultValues: {
      test_name: '',
      test_description: '',
      goal_metric: 'CONVERSION_RATE' as ABTestGoal,
      variants: [
        {
          variant_id: 'control',
          variant_name: 'Control',
          workflow_config: {},
          traffic_allocation: 0.5,
          is_control: true,
          description: 'Original workflow configuration'
        },
        {
          variant_id: 'treatment',
          variant_name: 'Treatment',
          workflow_config: {},
          traffic_allocation: 0.5,
          is_control: false,
          description: 'Modified workflow configuration'
        }
      ],
      minimum_sample_size: 1000,
      minimum_detectable_effect: 0.05,
      significance_level: 0.05,
      statistical_power: 0.80,
      max_duration_days: 30,
      early_stopping_enabled: true
    }
  });

  const { fields: variants, append, remove } = useFieldArray({
    control,
    name: 'variants'
  });

  // Queries
  const { data: activeTests, isLoading: testsLoading } = useQuery({
    queryKey: ['active-ab-tests', workflowId],
    queryFn: () => {
      // In a real implementation, this would fetch active tests for the workflow
      // For now, return empty array
      return Promise.resolve([]);
    }
  });

  const { data: testResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['ab-test-results', selectedTestId],
    queryFn: () => selectedTestId ? analyticsService.getABTestResults(selectedTestId) : null,
    enabled: !!selectedTestId
  });

  // Mutations
  const createTestMutation = useMutation({
    mutationFn: (data: ABTestCreateRequest) => analyticsService.createABTest(workflowId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['active-ab-tests', workflowId] });
      if (onTestCreated) {
        onTestCreated(response.test_id);
      }
      setSelectedTab('monitor');
    }
  });

  const implementWinnerMutation = useMutation({
    mutationFn: ({ testId, variantId }: { testId: string; variantId: string }) =>
      analyticsService.implementWinningVariant(testId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-test-results', selectedTestId] });
    }
  });

  // Form handlers
  const onSubmit = useCallback((data: ABTestCreateRequest) => {
    // Validate traffic allocation sums to 1
    const totalTraffic = data.variants.reduce((sum, variant) => sum + variant.traffic_allocation, 0);
    if (Math.abs(totalTraffic - 1.0) > 0.01) {
      alert('Traffic allocation must sum to 100%');
      return;
    }

    createTestMutation.mutate(data);
  }, [createTestMutation]);

  const addVariant = useCallback(() => {
    const currentVariants = watch('variants');
    const newAllocation = 1 / (currentVariants.length + 1);
    
    // Redistribute traffic equally
    currentVariants.forEach((_, index) => {
      setValue(`variants.${index}.traffic_allocation`, newAllocation);
    });

    append({
      variant_id: `variant_${currentVariants.length}`,
      variant_name: `Variant ${currentVariants.length}`,
      workflow_config: {},
      traffic_allocation: newAllocation,
      is_control: false,
      description: ''
    });
  }, [append, setValue, watch]);

  const removeVariant = useCallback((index: number) => {
    const currentVariants = watch('variants');
    if (currentVariants.length <= 2) return; // Must have at least 2 variants

    remove(index);
    
    // Redistribute traffic equally among remaining variants
    const remainingCount = currentVariants.length - 1;
    const newAllocation = 1 / remainingCount;
    
    setTimeout(() => {
      for (let i = 0; i < remainingCount; i++) {
        setValue(`variants.${i}.traffic_allocation`, newAllocation);
      }
    }, 0);
  }, [remove, setValue, watch]);

  const handleImplementWinner = useCallback((variantId: string) => {
    if (!selectedTestId) return;
    
    if (confirm('Are you sure you want to implement this variant as the winner? This will update your workflow configuration.')) {
      implementWinnerMutation.mutate({ testId: selectedTestId, variantId });
    }
  }, [selectedTestId, implementWinnerMutation]);

  // Helper functions
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Testing</h2>
          <p className="text-gray-600">
            Optimize your workflow performance through controlled experiments
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="monitor">Monitor Tests</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
        </TabsList>

        {/* Create Test Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create New A/B Test</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    {...register('test_name', { required: 'Test name is required' })}
                    placeholder="e.g., Email Subject Line Test"
                  />
                  {errors.test_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.test_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="goal_metric">Primary Goal Metric *</Label>
                  <select
                    id="goal_metric"
                    {...register('goal_metric', { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {GOAL_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="test_description">Description</Label>
                <textarea
                  id="test_description"
                  {...register('test_description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what you're testing and your hypothesis..."
                />
              </div>

              {/* Test Variants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Test Variants</Label>
                  <Button type="button" onClick={addVariant} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <Card key={variant.id} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {watch(`variants.${index}.is_control`) ? 'Control' : `Variant ${index}`}
                        </h4>
                        {variants.length > 2 && !watch(`variants.${index}.is_control`) && (
                          <Button
                            type="button"
                            onClick={() => removeVariant(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`variants.${index}.variant_name`}>Variant Name</Label>
                          <Input
                            {...register(`variants.${index}.variant_name`, { required: true })}
                            placeholder="e.g., Original"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`variants.${index}.traffic_allocation`}>
                            Traffic Allocation (%)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            {...register(`variants.${index}.traffic_allocation`, { 
                              required: true,
                              min: 0.01,
                              max: 1,
                              valueAsNumber: true 
                            })}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setValue(`variants.${index}.traffic_allocation`, value);
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatPercentage(watch(`variants.${index}.traffic_allocation`) || 0)}
                          </p>
                        </div>

                        <div className="flex items-end">
                          <Button type="button" variant="outline" size="sm" className="w-full">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label htmlFor={`variants.${index}.description`}>Description</Label>
                        <Input
                          {...register(`variants.${index}.description`)}
                          placeholder="Describe the changes in this variant..."
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Traffic Allocation Summary */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Traffic Allocation:</span>
                    <span className={`font-semibold ${
                      Math.abs((watch('variants')?.reduce((sum, v) => sum + (v.traffic_allocation || 0), 0) || 0) - 1) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatPercentage(watch('variants')?.reduce((sum, v) => sum + (v.traffic_allocation || 0), 0) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <Label className="text-base font-medium">Advanced Settings</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label htmlFor="minimum_sample_size">Minimum Sample Size</Label>
                    <Input
                      type="number"
                      id="minimum_sample_size"
                      {...register('minimum_sample_size', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="minimum_detectable_effect">Min. Detectable Effect</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="minimum_detectable_effect"
                      {...register('minimum_detectable_effect', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPercentage(watch('minimum_detectable_effect') || 0)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="significance_level">Significance Level</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="significance_level"
                      {...register('significance_level', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPercentage(watch('significance_level') || 0)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="statistical_power">Statistical Power</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="statistical_power"
                      {...register('statistical_power', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPercentage(watch('statistical_power') || 0)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="max_duration_days">Max Duration (Days)</Label>
                    <Input
                      type="number"
                      id="max_duration_days"
                      {...register('max_duration_days', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="early_stopping_enabled"
                      {...register('early_stopping_enabled')}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="early_stopping_enabled" className="text-sm">
                      Enable Early Stopping
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isValid || createTestMutation.isPending}
                  className="px-6"
                >
                  {createTestMutation.isPending ? (
                    <>Creating Test...</>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start A/B Test
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Monitor Tests Tab */}
        <TabsContent value="monitor" className="space-y-6">
          {testsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading active tests...</p>
            </div>
          ) : activeTests && activeTests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTests.map((test: any) => (
                <Card key={test.test_id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{test.test_name}</h3>
                      <p className="text-sm text-gray-600">{test.test_description}</p>
                    </div>
                    <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span>{test.actual_duration_days} / {test.max_duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sample Size:</span>
                      <span>{formatNumber(test.current_sample_size)} / {formatNumber(test.minimum_sample_size)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Statistical Significance:</span>
                      <span className={test.is_significant ? 'text-green-600' : 'text-gray-600'}>
                        {test.is_significant ? 'Significant' : 'Not yet'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTestId(test.test_id);
                        setSelectedTab('results');
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tests</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active A/B tests. Create your first test to start optimizing your workflow.
              </p>
              <Button onClick={() => setSelectedTab('create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Test
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Results & Analysis Tab */}
        <TabsContent value="results" className="space-y-6">
          {selectedTestId && testResults ? (
            <>
              {/* Test Overview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">{testResults.test_name}</h3>
                    <p className="text-gray-600">Test ID: {testResults.test_id}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={testResults.statistical_significance.is_significant ? 'default' : 'secondary'}>
                      {testResults.statistical_significance.is_significant ? 'Significant' : 'In Progress'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {testResults.actual_duration_days} days running
                    </p>
                  </div>
                </div>

                {/* Statistical Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">P-Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {testResults.statistical_significance.p_value.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Confidence Level</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(testResults.statistical_significance.confidence_level)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Effect Size</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {testResults.statistical_significance.effect_size.toFixed(3)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Expected Improvement</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(testResults.expected_improvement)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Variant Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Control Performance */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Control Variant</h4>
                    <Badge variant="secondary">{testResults.control_performance.variant_name}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sample Size:</span>
                      <span className="font-semibold">{formatNumber(testResults.control_performance.sample_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.control_performance.conversion_rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.control_performance.success_rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Execution Time:</span>
                      <span className="font-semibold">{testResults.control_performance.avg_execution_time.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI Estimate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.control_performance.roi_estimate)}</span>
                    </div>
                  </div>
                </Card>

                {/* Treatment Performance */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Treatment Variant</h4>
                    <Badge variant="default">{testResults.treatment_performance.variant_name}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sample Size:</span>
                      <span className="font-semibold">{formatNumber(testResults.treatment_performance.sample_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.treatment_performance.conversion_rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.treatment_performance.success_rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Execution Time:</span>
                      <span className="font-semibold">{testResults.treatment_performance.avg_execution_time.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI Estimate:</span>
                      <span className="font-semibold">{formatPercentage(testResults.treatment_performance.roi_estimate)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Winner Probability Chart */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Winner Probability</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(testResults.winner_probability).map(([variant, probability]) => ({
                        name: variant,
                        value: probability,
                        fill: variant === 'control' ? COLORS.control : COLORS.treatment
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(testResults.winner_probability).map(([variant], index) => (
                        <Cell key={`cell-${index}`} fill={variant === 'control' ? COLORS.control : COLORS.treatment} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatPercentage(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Recommendations */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-l-4 ${
                    testResults.statistical_significance.is_significant 
                      ? 'bg-green-50 border-l-green-500' 
                      : 'bg-yellow-50 border-l-yellow-500'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.statistical_significance.is_significant ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="font-semibold">Statistical Analysis</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {testResults.statistical_significance.recommendation}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Implementation Recommendation</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {testResults.implementation_recommendation}
                    </p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Implementation Complexity:</span> {testResults.implementation_complexity}
                    </div>
                  </div>

                  {testResults.risk_factors.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-l-red-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">Risk Factors</span>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {testResults.risk_factors.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Implementation Actions */}
                {testResults.statistical_significance.is_significant && (
                  <div className="flex justify-between mt-6">
                    <div className="space-x-3">
                      <Button
                        onClick={() => handleImplementWinner(testResults.control_performance.variant_id)}
                        variant="outline"
                        disabled={implementWinnerMutation.isPending}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Implement Control
                      </Button>
                      <Button
                        onClick={() => handleImplementWinner(testResults.treatment_performance.variant_id)}
                        disabled={implementWinnerMutation.isPending}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Implement Treatment
                      </Button>
                    </div>
                    
                    <div className="space-x-3">
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Clone Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Selected</h3>
              <p className="text-gray-600">
                Select an active test from the Monitor tab to view detailed results and analysis.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}