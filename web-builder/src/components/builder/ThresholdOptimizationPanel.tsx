"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Settings,
  Zap,
  Target,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';

interface ThresholdOptimizationRecommendation {
  service_type: string;
  current_threshold: number;
  recommended_threshold: number;
  optimization_rationale: {
    statistical_basis: string;
    reliability_impact: string;
    achievability_improvement: string;
    business_justification: string;
  };
  predicted_outcomes: {
    expected_violation_rate: number;
    reliability_score_change: number;
    team_stress_reduction: number;
    cost_impact: number;
    customer_satisfaction_change: number;
  };
  confidence_score: number;
  implementation_risk: 'low' | 'medium' | 'high';
  rollback_criteria: string[];
  optimization_timestamp: string;
  model_version: string;
}

interface ThresholdChangeRecord {
  change_id: string;
  service_type: string;
  previous_threshold: number;
  new_threshold: number;
  status: 'pending' | 'applied' | 'monitoring' | 'success' | 'failed' | 'rolled_back';
  requested_by: string;
  requested_at: string;
  applied_at?: string;
  rollback_at?: string;
  impact_assessment: {
    expected_violation_rate_change: number;
    performance_impact_estimate: number;
    risk_level: 'low' | 'medium' | 'high';
    confidence_score: number;
    business_impact_score: number;
  };
  actual_impact?: {
    violation_rate_change: number;
    performance_improvement: number;
    reliability_improvement: number;
  };
}

interface OptimizationPanelProps {
  serviceTypes: string[];
  onApplyRecommendation: (recommendation: ThresholdOptimizationRecommendation) => Promise<void>;
  onRollbackChange: (changeId: string) => Promise<void>;
  className?: string;
}

export const ThresholdOptimizationPanel: React.FC<OptimizationPanelProps> = ({
  serviceTypes,
  onApplyRecommendation,
  onRollbackChange,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<ThresholdOptimizationRecommendation[]>([]);
  const [changeHistory, setChangeHistory] = useState<ThresholdChangeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(serviceTypes[0] || '');
  const [lastOptimization, setLastOptimization] = useState<Date>(new Date());

  useEffect(() => {
    loadOptimizationRecommendations();
    loadChangeHistory();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => {
      loadOptimizationRecommendations();
      loadChangeHistory();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [serviceTypes]);

  const loadOptimizationRecommendations = async () => {
    setLoading(true);
    try {
      // Mock recommendations - in production would call optimization API
      const mockRecommendations: ThresholdOptimizationRecommendation[] = [
        {
          service_type: 'build_time',
          current_threshold: 1800,
          recommended_threshold: 2100,
          optimization_rationale: {
            statistical_basis: 'Threshold set above 95th percentile (1950s) based on 2,450 samples',
            reliability_impact: 'Expected 12.3% improvement in reliability',
            achievability_improvement: 'More achievable threshold (16.7% increase) reduces team stress',
            business_justification: 'Low violation rate expected to improve customer satisfaction and reduce operational overhead'
          },
          predicted_outcomes: {
            expected_violation_rate: 0.08,
            reliability_score_change: 12.3,
            team_stress_reduction: 25.6,
            cost_impact: -850,
            customer_satisfaction_change: 8.4
          },
          confidence_score: 0.87,
          implementation_risk: 'low',
          rollback_criteria: [
            'Violation rate exceeds 15% for 24 hours',
            'Service performance degrades by >25% from baseline',
            'Customer satisfaction scores drop by >10%'
          ],
          optimization_timestamp: new Date().toISOString(),
          model_version: '1.0'
        },
        {
          service_type: 'pr_review_time',
          current_threshold: 7200,
          recommended_threshold: 6300,
          optimization_rationale: {
            statistical_basis: 'Optimized using statistical analysis of 1,850 performance samples',
            reliability_impact: 'Expected 8.7% improvement in reliability',
            achievability_improvement: 'Tighter threshold (12.5% decrease) improves service quality',
            business_justification: 'Balanced approach maintaining reliability while reducing false alarms'
          },
          predicted_outcomes: {
            expected_violation_rate: 0.12,
            reliability_score_change: 8.7,
            team_stress_reduction: 15.2,
            cost_impact: -320,
            customer_satisfaction_change: 5.1
          },
          confidence_score: 0.74,
          implementation_risk: 'medium',
          rollback_criteria: [
            'Violation rate exceeds 20% for 24 hours',
            'Manual escalations increase by >50%',
            'Team productivity metrics decline by >15%'
          ],
          optimization_timestamp: new Date().toISOString(),
          model_version: '1.0'
        }
      ];
      
      setRecommendations(mockRecommendations);
      setLastOptimization(new Date());
    } catch (error) {
      console.error('Failed to load optimization recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChangeHistory = async () => {
    try {
      // Mock change history - in production would call API
      const mockHistory: ThresholdChangeRecord[] = [
        {
          change_id: 'tc_1704123456_build_time',
          service_type: 'build_time',
          previous_threshold: 1800,
          new_threshold: 2100,
          status: 'monitoring',
          requested_by: 'system_optimizer',
          requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          impact_assessment: {
            expected_violation_rate_change: -0.07,
            performance_impact_estimate: 16.7,
            risk_level: 'low',
            confidence_score: 0.87,
            business_impact_score: 0.65
          },
          actual_impact: {
            violation_rate_change: -0.09,
            performance_improvement: 14.2,
            reliability_improvement: 11.8
          }
        },
        {
          change_id: 'tc_1703987654_test_execution',
          service_type: 'test_execution',
          previous_threshold: 900,
          new_threshold: 1080,
          status: 'success',
          requested_by: 'admin_user',
          requested_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
          impact_assessment: {
            expected_violation_rate_change: -0.05,
            performance_impact_estimate: 20.0,
            risk_level: 'medium',
            confidence_score: 0.72,
            business_impact_score: 0.42
          },
          actual_impact: {
            violation_rate_change: -0.06,
            performance_improvement: 18.5,
            reliability_improvement: 9.3
          }
        }
      ];
      
      setChangeHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load change history:', error);
    }
  };

  const handleApplyRecommendation = async (recommendation: ThresholdOptimizationRecommendation) => {
    try {
      await onApplyRecommendation(recommendation);
      // Reload data after applying
      setTimeout(() => {
        loadOptimizationRecommendations();
        loadChangeHistory();
      }, 1000);
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    }
  };

  const formatServiceType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'monitoring': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'rolled_back': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">SLA Threshold Optimization</h3>
          <p className="text-gray-600">
            AI-powered threshold recommendations and change management
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            Last optimized: {lastOptimization.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadOptimizationRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Change History</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {loading ? (
            <Card className="p-6">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p>Analyzing performance data and generating recommendations...</p>
              </div>
            </Card>
          ) : recommendations.length === 0 ? (
            <Card className="p-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">All Thresholds Optimized</h4>
                <p className="text-gray-600">
                  Current thresholds are performing optimally. Check back later for new recommendations.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold">
                            {formatServiceType(recommendation.service_type)}
                          </h4>
                          <Badge className={getRiskColor(recommendation.implementation_risk)}>
                            {recommendation.implementation_risk.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            Current: {formatDuration(recommendation.current_threshold)}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                          <span>
                            Recommended: {formatDuration(recommendation.recommended_threshold)}
                          </span>
                          <span className="text-blue-600">
                            ({recommendation.recommended_threshold > recommendation.current_threshold ? '+' : ''}
                            {((recommendation.recommended_threshold - recommendation.current_threshold) / recommendation.current_threshold * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Confidence</div>
                          <div className="text-lg font-semibold">
                            {(recommendation.confidence_score * 100).toFixed(0)}%
                          </div>
                        </div>
                        <Progress 
                          value={recommendation.confidence_score * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>

                    {/* Predicted Outcomes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          {recommendation.predicted_outcomes.reliability_score_change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600">Reliability Change</div>
                        <div className="font-semibold">
                          {recommendation.predicted_outcomes.reliability_score_change > 0 ? '+' : ''}
                          {recommendation.predicted_outcomes.reliability_score_change.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-xs text-gray-600">Violation Rate</div>
                        <div className="font-semibold">
                          {(recommendation.predicted_outcomes.expected_violation_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-xs text-gray-600">Stress Reduction</div>
                        <div className="font-semibold">
                          {recommendation.predicted_outcomes.team_stress_reduction.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-xs text-gray-600">Cost Impact</div>
                        <div className="font-semibold">
                          ${Math.abs(recommendation.predicted_outcomes.cost_impact).toFixed(0)}
                          {recommendation.predicted_outcomes.cost_impact < 0 ? ' saved' : ' cost'}
                        </div>
                      </div>
                    </div>

                    {/* Rationale */}
                    <div className="space-y-2">
                      <h5 className="font-medium">Optimization Rationale</h5>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Statistical Basis:</strong> {recommendation.optimization_rationale.statistical_basis}</div>
                        <div><strong>Business Impact:</strong> {recommendation.optimization_rationale.business_justification}</div>
                      </div>
                    </div>

                    {/* Rollback Criteria */}
                    <div className="space-y-2">
                      <h5 className="font-medium flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Rollback Criteria
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {recommendation.rollback_criteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-gray-500">
                        Model v{recommendation.model_version} • 
                        Generated {new Date(recommendation.optimization_timestamp).toLocaleString()}
                      </div>
                      
                      <Button 
                        onClick={() => handleApplyRecommendation(recommendation)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Apply Recommendation
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Change History Tab */}
        <TabsContent value="history" className="space-y-4">
          {changeHistory.length === 0 ? (
            <Card className="p-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Change History</h4>
                <p className="text-gray-600">
                  No threshold changes have been made recently.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {changeHistory.map((change) => (
                <Card key={change.change_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">
                          {formatServiceType(change.service_type)}
                        </h4>
                        <Badge variant="outline" className={getStatusColor(change.status)}>
                          {change.status.toUpperCase()}
                        </Badge>
                        <Badge className={getRiskColor(change.impact_assessment.risk_level)}>
                          {change.impact_assessment.risk_level.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDuration(change.previous_threshold)}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>{formatDuration(change.new_threshold)}</span>
                        <span>by {change.requested_by}</span>
                        <span>{new Date(change.requested_at).toLocaleDateString()}</span>
                      </div>
                      
                      {change.actual_impact && (
                        <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-green-50 rounded">
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Violation Rate</div>
                            <div className="font-semibold text-green-600">
                              {change.actual_impact.violation_rate_change > 0 ? '+' : ''}
                              {(change.actual_impact.violation_rate_change * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Performance</div>
                            <div className="font-semibold text-green-600">
                              +{change.actual_impact.performance_improvement.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">Reliability</div>
                            <div className="font-semibold text-green-600">
                              +{change.actual_impact.reliability_improvement.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {change.status === 'monitoring' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onRollbackChange(change.change_id)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Optimization Effectiveness</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Changes Applied</span>
                  <span className="font-semibold">{changeHistory.filter(c => c.status !== 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {changeHistory.length > 0 ? 
                      Math.round(changeHistory.filter(c => c.status === 'success').length / changeHistory.length * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Reliability Improvement</span>
                  <span className="font-semibold text-blue-600">
                    {changeHistory.filter(c => c.actual_impact).length > 0 ?
                      (changeHistory
                        .filter(c => c.actual_impact)
                        .reduce((sum, c) => sum + (c.actual_impact?.reliability_improvement || 0), 0) /
                       changeHistory.filter(c => c.actual_impact).length).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Model Performance</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Prediction Accuracy</span>
                  <span className="font-semibold">87.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendations Generated</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Version</span>
                  <span className="font-semibold">v1.0</span>
                </div>
              </div>
            </Card>
          </div>
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <div>
              <p className="font-medium">Optimization Performance</p>
              <p className="text-sm text-gray-600">
                SLA threshold optimization has improved overall system reliability by 15.2% 
                while reducing operational stress by 28.7% over the past 30 days.
              </p>
            </div>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThresholdOptimizationPanel;