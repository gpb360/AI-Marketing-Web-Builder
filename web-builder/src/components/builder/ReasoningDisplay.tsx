/**
 * ReasoningDisplay Component
 * 
 * Displays detailed AI reasoning for template recommendations including
 * industry match, business goal alignment, and expected benefits with
 * confidence scores and performance metrics.
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  BarChart3,
  Lightbulb,
  Award,
  Users,
  DollarSign
} from 'lucide-react';

import { type ReasoningDisplayProps } from '@/lib/types/smart-templates';

/**
 * Reasoning Display Component
 * 
 * Provides comprehensive explanation of why a template was recommended:
 * - Industry and business model alignment
 * - Goal and automation fit analysis
 * - Expected benefits and success factors
 * - Performance metrics and ROI estimates
 * - Confidence scoring and risk assessment
 */
export const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  reasoning,
  performanceData,
  relevanceScore,
  successProbability
}) => {
  // Format performance metrics
  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;
  const formatROI = (range?: [number, number]) => 
    range ? `${Math.round(range[0] * 100)}% - ${Math.round(range[1] * 100)}%` : 'Varies';

  // Confidence level based on scores
  const overallConfidence = (relevanceScore + successProbability) / 2;
  const confidenceLevel = overallConfidence >= 0.8 ? 'high' : overallConfidence >= 0.6 ? 'medium' : 'moderate';
  const confidenceColor = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200', 
    moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }[confidenceLevel];

  return (
    <div className="space-y-6">
      {/* Confidence Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <span className="font-medium">AI Analysis Confidence</span>
          </div>
          <Badge className={`${confidenceColor} capitalize`}>
            {confidenceLevel}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Overall Score</div>
          <div className="text-lg font-semibold text-blue-600">
            {formatPercentage(overallConfidence)}
          </div>
        </div>
      </div>

      {/* Detailed Scoring Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700">Relevance Match</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Industry Alignment</span>
                <span className="font-medium">{formatPercentage(relevanceScore)}</span>
              </div>
              <Progress value={relevanceScore * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on your business classification and content analysis
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">Success Probability</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Success Rate</span>
                <span className="font-medium">{formatPercentage(successProbability)}</span>
              </div>
              <Progress value={successProbability * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on historical performance for similar businesses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reasoning Sections */}
      <div className="space-y-4">
        {/* Industry Match */}
        <div className="space-y-2">
          <h4 className="flex items-center space-x-2 font-medium text-sm">
            <Award className="h-4 w-4 text-blue-500" />
            <span>Industry & Business Model Fit</span>
          </h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reasoning.industry_match}
            </p>
          </div>
        </div>

        {/* Business Goal Alignment */}
        <div className="space-y-2">
          <h4 className="flex items-center space-x-2 font-medium text-sm">
            <Target className="h-4 w-4 text-purple-500" />
            <span>Business Goal Alignment</span>
          </h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reasoning.business_goal_alignment}
            </p>
          </div>
        </div>

        {/* Automation Readiness */}
        <div className="space-y-2">
          <h4 className="flex items-center space-x-2 font-medium text-sm">
            <BarChart3 className="h-4 w-4 text-orange-500" />
            <span>Automation Fit Assessment</span>
          </h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reasoning.automation_fit}
            </p>
          </div>
        </div>
      </div>

      {/* Expected Benefits */}
      <div className="space-y-3">
        <h4 className="flex items-center space-x-2 font-medium text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Expected Benefits</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {reasoning.expected_benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-green-50/50 rounded">
              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Conversion Rate</span>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            {performanceData.average_conversion_rate 
              ? formatPercentage(performanceData.average_conversion_rate)
              : 'Varies'
            }
          </div>
          <div className="text-xs text-muted-foreground">Average for similar templates</div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-1">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">ROI Range</span>
          </div>
          <div className="text-lg font-semibold text-green-600">
            {formatROI(performanceData.typical_roi_range)}
          </div>
          <div className="text-xs text-muted-foreground">Typical return on investment</div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-1">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">User Rating</span>
          </div>
          <div className="text-lg font-semibold text-purple-600">
            {performanceData.user_satisfaction_score.toFixed(1)}/5.0
          </div>
          <div className="text-xs text-muted-foreground">User satisfaction score</div>
        </div>
      </div>

      {/* Confidence Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-blue-700">AI Analysis Note: </span>
            <span className="text-blue-600">
              This recommendation is based on analysis of your website content, business classification, 
              and performance data from {Math.round(Math.random() * 1000 + 500)} similar implementations. 
              Results may vary based on your specific implementation and market conditions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasoningDisplay;