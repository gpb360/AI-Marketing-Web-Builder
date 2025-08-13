"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, TrendingUp, CheckCircle, X } from 'lucide-react';

interface ActionRecommendation {
  action: string;
  description: string;
  confidence: number;
  estimated_impact: string;
}

interface SLAPrediction {
  violation_type: string;
  probability: number;
  confidence_score: number;
  predicted_time: string;
  recommended_actions: ActionRecommendation[];
  historical_accuracy: number;
}

interface PredictionCardProps {
  prediction: SLAPrediction;
  onTakeAction: (action: string) => void;
  onDismiss: () => void;
  className?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  onTakeAction,
  onDismiss,
  className = ""
}) => {
  const getSeverityLevel = () => {
    if (prediction.probability >= 0.9 && prediction.confidence_score >= 0.85) {
      return 'high';
    } else if (prediction.probability >= 0.7 && prediction.confidence_score >= 0.75) {
      return 'medium';
    }
    return 'low';
  };

  const getSeverityColor = () => {
    const severity = getSeverityLevel();
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = () => {
    const severity = getSeverityLevel();
    const iconClass = "h-5 w-5";
    
    switch (severity) {
      case 'high': return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'medium': return <TrendingUp className={`${iconClass} text-amber-600`} />;
      default: return <Clock className={`${iconClass} text-blue-600`} />;
    }
  };

  const formatViolationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const getTimeUntilPrediction = () => {
    try {
      const now = new Date();
      const predicted = new Date(prediction.predicted_time);
      const diffMs = predicted.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      
      if (diffMins <= 0) return "Imminent";
      if (diffMins < 60) return `${diffMins} min`;
      if (diffMins < 1440) return `${Math.round(diffMins / 60)} hr`;
      return `${Math.round(diffMins / 1440)} day`;
    } catch {
      return "Unknown";
    }
  };

  return (
    <Card className={`${getSeverityColor()} border-l-4 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getSeverityIcon()}
            <div>
              <h3 className="font-semibold text-sm">
                SLA Violation Predicted
              </h3>
              <p className="text-xs opacity-75">
                {formatViolationType(prediction.violation_type)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {getSeverityLevel().toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Prediction Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="opacity-75">Probability</span>
              <span className="font-medium">{(prediction.probability * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={prediction.probability * 100} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="opacity-75">Confidence</span>
              <span className="font-medium">{(prediction.confidence_score * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={prediction.confidence_score * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* Timing Info */}
        <div className="flex items-center justify-between mb-4 p-2 bg-white/30 rounded">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 opacity-60" />
            <span className="text-xs">Predicted Time</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium">
              {formatDateTime(prediction.predicted_time)}
            </div>
            <div className="text-xs opacity-75">
              in {getTimeUntilPrediction()}
            </div>
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="opacity-75">Model Accuracy</span>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="font-medium">
              {(prediction.historical_accuracy * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Recommended Actions */}
        {prediction.recommended_actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold opacity-90">
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {prediction.recommended_actions.slice(0, 2).map((action, index) => (
                <div key={index} className="bg-white/20 rounded p-2">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-medium">
                      {action.description}
                    </p>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {(action.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">
                      {action.estimated_impact}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTakeAction(action.action)}
                      className="h-6 text-xs px-2 bg-white/10 hover:bg-white/20"
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {prediction.recommended_actions.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs opacity-75 hover:opacity-100"
              >
                View {prediction.recommended_actions.length - 2} more actions
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PredictionCard;