/**
 * TemplateRecommendationCard Component
 * 
 * Individual card component for displaying template recommendations with key metrics,
 * reasoning highlights, and action buttons for selection and instantiation.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Eye, 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';

import { type TemplateRecommendationCardProps, WorkflowCategory } from '@/lib/types/smart-templates';

// Category display configurations
const categoryConfig: Record<WorkflowCategory, { icon: React.ElementType; color: string; label: string }> = {
  [WorkflowCategory.MARKETING]: {
    icon: Target,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    label: 'Marketing'
  },
  [WorkflowCategory.SALES]: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Sales'
  },
  [WorkflowCategory.SUPPORT]: {
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Support'
  },
  [WorkflowCategory.ECOMMERCE]: {
    icon: Star,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'E-commerce'
  }
};

/**
 * Template Recommendation Card Component
 * 
 * Displays a single template recommendation with:
 * - Template name and category
 * - Relevance score and success probability
 * - Key benefits preview
 * - Estimated setup time
 * - Action buttons for selection and instantiation
 */
export const TemplateRecommendationCard: React.FC<TemplateRecommendationCardProps> = ({
  recommendation,
  onSelect,
  onInstantiate,
  onPreview,
  showReasoningDetails,
  isSelected = false
}) => {
  const categoryInfo = categoryConfig[recommendation.category];
  const CategoryIcon = categoryInfo.icon;

  // Format success probability as percentage
  const successPercentage = Math.round(recommendation.success_probability * 100);
  const relevancePercentage = Math.round(recommendation.relevance_score * 100);

  // Extract key benefits (first 3 from reasoning)
  const keyBenefits = recommendation.reasoning.expected_benefits.slice(0, 3);

  // Format ROI range if available
  const roiRange = recommendation.performance_data.typical_roi_range;
  const roiDisplay = roiRange 
    ? `${Math.round(roiRange[0] * 100)}% - ${Math.round(roiRange[1] * 100)}%`
    : 'Varies';

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{recommendation.template_name}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">
                {categoryInfo.label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">
                {relevancePercentage}% match
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">
                {successPercentage}% success rate
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Relevance and Success Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Relevance</span>
              <span className="font-medium">{relevancePercentage}%</span>
            </div>
            <Progress value={relevancePercentage} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Success Probability</span>
              <span className="font-medium">{successPercentage}%</span>
            </div>
            <Progress value={successPercentage} className="h-1" />
          </div>
        </div>

        {/* Key Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Key Benefits:</h4>
          <ul className="space-y-1">
            {keyBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 py-2 px-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Setup Time</span>
            </div>
            <div className="text-sm font-medium">
              {recommendation.customization_preview.estimated_setup_time} min
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Expected ROI</span>
            </div>
            <div className="text-sm font-medium">{roiDisplay}</div>
          </div>
        </div>

        {/* Industry Match (if showing reasoning details) */}
        {showReasoningDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Why This Fits:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation.reasoning.industry_match}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button 
            onClick={onInstantiate}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Play className="h-3 w-3 mr-1" />
            Create Workflow
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onSelect}
            size="sm"
            className={isSelected ? 'border-blue-500 text-blue-600' : ''}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          
          {onPreview && (
            <Button variant="ghost" size="sm" onClick={onPreview}>
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* User Satisfaction Score */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>User satisfaction:</span>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {recommendation.performance_data.user_satisfaction_score.toFixed(1)}/5.0
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateRecommendationCard;