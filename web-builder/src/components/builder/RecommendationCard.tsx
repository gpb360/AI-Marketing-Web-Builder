/**
 * Recommendation Card Component
 * 
 * Displays individual template recommendations with reasoning and actions
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star,
  TrendingUp,
  Clock,
  Users,
  Eye,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ExternalLink,
  Zap
} from 'lucide-react';

import { TemplateRecommendation } from '@/types/context-aware-templates';

interface RecommendationCardProps {
  recommendation: TemplateRecommendation;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onPreview: () => void;
  onAddToComparison: () => void;
  onFeedback: (rating: number, feedback?: string) => void;
  isInComparison: boolean;
  canAddToComparison: boolean;
  feedback?: number;
  getConfidenceColor: (score: number) => string;
  getConfidenceLevel: (score: number) => string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  viewMode,
  onSelect,
  onPreview,
  onAddToComparison,
  onFeedback,
  isInComparison,
  canAddToComparison,
  feedback,
  getConfidenceColor,
  getConfidenceLevel
}) => {
  const [showFullReasoning, setShowFullReasoning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    template,
    confidenceScore,
    reasoning,
    personalizationSuggestions,
    businessGoalAlignment,
    industryRelevance,
    targetAudienceFit,
    pros,
    cons,
    estimatedConversionRate,
    setupComplexity,
    customizationEffort
  } = recommendation;

  const confidencePercent = Math.round(confidenceScore * 100);
  const conversionPercent = estimatedConversionRate ? Math.round(estimatedConversionRate * 100) : null;

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const cardClassName = viewMode === 'grid' 
    ? 'flex flex-col h-full'
    : 'flex flex-row space-x-4';

  const imageClassName = viewMode === 'grid'
    ? 'w-full h-48 object-cover rounded-t-lg'
    : 'w-32 h-32 object-cover rounded-lg flex-shrink-0';

  return (
    <Card className={`${cardClassName} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group relative`}>
      {/* Template Image */}
      <div className={`relative ${viewMode === 'grid' ? 'w-full h-48' : 'w-32 h-32'} bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden`}>
        {!imageError && template?.thumbnail ? (
          <>
            <img
              src={template.thumbnail}
              alt={template.name}
              className={`${imageClassName} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className={`absolute inset-0 ${imageClassName} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
            )}
          </>
        ) : (
          <div className={`${imageClassName} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}>
            <Star className="h-8 w-8 text-white" />
          </div>
        )}
        
        {/* Confidence Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getConfidenceColor(confidenceScore)} font-medium`}>
            {confidencePercent}% match
          </Badge>
        </div>

        {/* Comparison Indicator */}
        {isInComparison && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-600 text-white">
              <BarChart3 className="h-3 w-3 mr-1" />
              Comparing
            </Badge>
          </div>
        )}

        {/* Preview Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            onClick={onPreview}
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1 py-2'} space-y-3`}>
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
              {template?.name || 'Unnamed Template'}
            </h3>
            <div className="flex gap-1">
              {template?.category && (
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              )}
            </div>
          </div>
          
          {template?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {conversionPercent && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              <span>{conversionPercent}% CVR</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>~{customizationEffort * 5}min setup</span>
          </div>
          
          <Badge className={getComplexityColor(setupComplexity)} variant="outline">
            {setupComplexity} complexity
          </Badge>
        </div>

        {/* Business Goal Alignment */}
        {businessGoalAlignment && businessGoalAlignment.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Goal Alignment:</div>
            <div className="space-y-1">
              {businessGoalAlignment.slice(0, 2).map((goal, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{goal.goal}</span>
                  <div className="flex items-center gap-1">
                    <Progress value={goal.alignment} className="w-12 h-1" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{goal.alignment}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalization Suggestions Preview */}
        {personalizationSuggestions && personalizationSuggestions.length > 0 && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">AI Suggestions</span>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-200">
              {personalizationSuggestions.slice(0, 1).map((suggestion, index) => (
                <div key={index}>• {suggestion.title}</div>
              ))}
              {personalizationSuggestions.length > 1 && (
                <div className="text-blue-600 dark:text-blue-400">
                  +{personalizationSuggestions.length - 1} more suggestions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pros/Cons Summary */}
        {(pros.length > 0 || cons.length > 0) && showFullReasoning && (
          <div className="space-y-2 text-xs">
            {pros.length > 0 && (
              <div>
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">Pros:</div>
                <ul className="list-disc list-inside text-green-600 dark:text-green-400 space-y-0.5">
                  {pros.slice(0, 2).map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <div className="font-medium text-red-700 dark:text-red-300 mb-1">Considerations:</div>
                <ul className="list-disc list-inside text-red-600 dark:text-red-400 space-y-0.5">
                  {cons.slice(0, 2).map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Reasoning Toggle */}
        <div className="pt-2">
          <Button
            onClick={() => setShowFullReasoning(!showFullReasoning)}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600 dark:text-gray-400 p-0 h-auto"
          >
            {showFullReasoning ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show details
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSelect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-1" />
            Select Template
          </Button>
          
          <Button
            onClick={onPreview}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          {canAddToComparison && !isInComparison && (
            <Button
              onClick={onAddToComparison}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Feedback Section */}
        {feedback !== undefined && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Your rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onFeedback(rating)}
                    className={`w-4 h-4 ${
                      rating <= feedback
                        ? 'text-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationCard;