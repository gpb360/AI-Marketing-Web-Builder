/**
 * Workflow Outcome Preview Component
 * Story #106: Preview mode with expected outcomes and success probability estimates
 * 
 * Shows predicted workflow results including conversion rates, ROI projections,
 * success probability, and risk factors to help users make informed decisions.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Lightbulb
} from 'lucide-react';

import type { 
  SuccessPrediction,
  OutcomePreview,
  CustomizedWorkflowTemplate 
} from '@/lib/api/services/business-workflows';

interface WorkflowOutcomePreviewProps {
  template: CustomizedWorkflowTemplate;
  outcomePreview?: OutcomePreview;
  showDetailed?: boolean;
  className?: string;
}

const WorkflowOutcomePreview: React.FC<WorkflowOutcomePreviewProps> = ({
  template,
  outcomePreview,
  showDetailed = false,
  className = ''
}) => {
  const prediction = template.success_prediction;
  const outcomes = prediction.expected_outcomes;

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Get confidence color based on level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get success probability color and badge variant
  const getSuccessProbabilityDisplay = (probability: number) => {
    const percentage = Math.round(probability * 100);
    if (percentage >= 80) {
      return { color: 'text-green-600', variant: 'default' as const, label: 'High Success' };
    }
    if (percentage >= 60) {
      return { color: 'text-yellow-600', variant: 'secondary' as const, label: 'Medium Success' };
    }
    return { color: 'text-red-600', variant: 'destructive' as const, label: 'Lower Success' };
  };

  const successDisplay = getSuccessProbabilityDisplay(prediction.overall_success_probability);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Success Probability */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Expected Outcomes</CardTitle>
              <CardDescription>AI-predicted results for {template.name}</CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${successDisplay.color}`}>
                {formatPercentage(prediction.overall_success_probability)}
              </div>
              <Badge variant={successDisplay.variant} className="text-xs">
                {successDisplay.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversion Rate */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="font-semibold">
                  {formatPercentage(outcomes.conversion_rate_estimate)}
                </div>
              </div>
            </div>

            {/* ROI Range */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expected ROI</div>
                <div className="font-semibold">
                  {outcomes.roi_estimate[0]}-{outcomes.roi_estimate[1]}%
                </div>
              </div>
            </div>

            {/* Time to Results */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time to Results</div>
                <div className="font-semibold">{outcomes.time_to_results}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Impact Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Impact Projections</CardTitle>
          <CardDescription>Expected monthly results once workflow is optimized</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leads Generated */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">New Leads</span>
              </div>
              <div className="text-lg font-bold">
                {outcomes.monthly_impact.leads_generated[0]}-{outcomes.monthly_impact.leads_generated[1]}
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>

            {/* Time Saved */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Time Saved</span>
              </div>
              <div className="text-lg font-bold">
                {outcomes.monthly_impact.time_saved_hours[0]}-{outcomes.monthly_impact.time_saved_hours[1]}h
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>

            {/* Revenue Impact */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Revenue Impact</span>
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(outcomes.monthly_impact.revenue_impact[0])}-{formatCurrency(outcomes.monthly_impact.revenue_impact[1])}
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Scenarios */}
      {showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Success Scenarios</CardTitle>
            <CardDescription>Different outcome scenarios based on adoption and execution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prediction.success_scenarios.map((scenario, index) => {
                const scenarioColors = {
                  optimistic: 'border-green-200 bg-green-50',
                  realistic: 'border-blue-200 bg-blue-50',
                  conservative: 'border-yellow-200 bg-yellow-50'
                };

                return (
                  <div 
                    key={scenario.scenario} 
                    className={`p-4 border rounded-lg ${scenarioColors[scenario.scenario]}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium capitalize">{scenario.scenario} Scenario</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatPercentage(scenario.probability)} likelihood
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(scenario.conversion_rate)} conversion
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">ROI Range</div>
                        <div className="font-medium">{scenario.roi[0]}-{scenario.roi[1]}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Conversion</div>
                        <div className="font-medium">{formatPercentage(scenario.conversion_rate)}</div>
                      </div>
                      <div className="text-center md:col-span-1 col-span-2">
                        <div className="text-sm text-muted-foreground">Probability</div>
                        <div className="font-medium">{formatPercentage(scenario.probability)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium mb-1">Key Assumptions:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {scenario.key_assumptions.map((assumption, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1 h-1 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Success Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Success Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Key Success Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prediction.expected_outcomes && 
               prediction.optimization_recommendations.slice(0, 4).map((factor, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.risk_factors.slice(0, 3).map((risk, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{risk.risk}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatPercentage(risk.probability)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{risk.mitigation}</div>
                  <Progress value={risk.probability * 100} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Confidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <span>Prediction Confidence</span>
          </CardTitle>
          <CardDescription>
            How confident our AI is in these predictions based on similar workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Overall Confidence</span>
            <span className={`font-medium ${getConfidenceColor(prediction.confidence_level)}`}>
              {formatPercentage(prediction.confidence_level)}
            </span>
          </div>
          <Progress value={prediction.confidence_level * 100} className="mb-4" />
          
          <div className="space-y-2">
            {prediction.prediction_factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{factor.factor}</span>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={factor.rating === 'high' ? 'default' : factor.rating === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {factor.rating}
                  </Badge>
                  <span className="font-medium">{Math.round(factor.impact * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmark Comparison */}
      {prediction.benchmark_comparisons && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Industry Benchmark Comparison</CardTitle>
            <CardDescription>How this workflow compares to industry standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Industry Average</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Conversion: {formatPercentage(prediction.benchmark_comparisons.industry_average.conversion_rate)}</div>
                    <div>Setup Time: {prediction.benchmark_comparisons.industry_average.setup_time}</div>
                    <div>ROI: {prediction.benchmark_comparisons.industry_average.roi[0]}-{prediction.benchmark_comparisons.industry_average.roi[1]}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Top Performers</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Conversion: {formatPercentage(prediction.benchmark_comparisons.top_performers.conversion_rate)}</div>
                    <div>Setup Time: {prediction.benchmark_comparisons.top_performers.setup_time}</div>
                    <div>ROI: {prediction.benchmark_comparisons.top_performers.roi[0]}-{prediction.benchmark_comparisons.top_performers.roi[1]}%</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">Your Prediction</div>
                <div className="text-sm text-blue-700">{prediction.benchmark_comparisons.predicted_vs_industry}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowOutcomePreview;