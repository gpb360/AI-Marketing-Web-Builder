"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Activity, 
  Settings,
  Zap,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import PredictionCard from './PredictionCard';
import ThresholdOptimizationPanel from './ThresholdOptimizationPanel';
import { RemediationControlPanel } from './RemediationControlPanel';
import { slaRemediationService } from '@/lib/api/services/sla-remediation';

interface SLAPrediction {
  violation_type: string;
  probability: number;
  confidence_score: number;
  predicted_time: string;
  recommended_actions: any[];
  historical_accuracy: number;
}

interface SLAMetrics {
  current_violations: number;
  resolved_today: number;
  avg_resolution_time: number;
  success_rate: number;
}

interface SLADashboardProps {
  workflowId?: number;
  className?: string;
}

export const SLADashboard: React.FC<SLADashboardProps> = ({
  workflowId,
  className = ""
}) => {
  const [predictions, setPredictions] = useState<SLAPrediction[]>([]);
  const [metrics, setMetrics] = useState<SLAMetrics>({
    current_violations: 2,
    resolved_today: 8,
    avg_resolution_time: 14.5,
    success_rate: 94.2
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // SLA violation types from backend specification
  const violationTypes = [
    'pr_review_time',
    'build_time', 
    'test_execution',
    'deployment_time',
    'agent_response',
    'task_completion'
  ];

  useEffect(() => {
    loadPredictions();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const loadPredictions = async () => {
    if (!workflowId) return;
    
    setLoading(true);
    try {
      // Mock predictions for demo - in production would call API
      const mockPredictions: SLAPrediction[] = [
        {
          violation_type: 'build_time',
          probability: 0.87,
          confidence_score: 0.91,
          predicted_time: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
          recommended_actions: [
            {
              action: 'scale_build_agents',
              description: 'Increase build agent capacity',
              confidence: 0.9,
              estimated_impact: '30% reduction in build time'
            }
          ],
          historical_accuracy: 0.89
        },
        {
          violation_type: 'pr_review_time',
          probability: 0.73,
          confidence_score: 0.82,
          predicted_time: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
          recommended_actions: [
            {
              action: 'notify_reviewers',
              description: 'Send urgent review notification',
              confidence: 0.85,
              estimated_impact: '50% faster review completion'
            }
          ],
          historical_accuracy: 0.84
        }
      ];
      
      setPredictions(mockPredictions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAction = async (action: string) => {
    console.log('Taking action:', action);
    // In production, would call API to execute action
  };

  const handleDismissPrediction = (index: number) => {
    setPredictions(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyOptimizationRecommendation = async (recommendation: any) => {
    console.log('Applying optimization recommendation:', recommendation);
    // In production, would call threshold management API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success feedback
      alert(`Threshold optimization applied for ${recommendation.service_type}. 
             Monitoring will begin automatically.`);
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      alert('Failed to apply optimization. Please try again.');
    }
  };

  const handleRollbackChange = async (changeId: string) => {
    console.log('Rolling back change:', changeId);
    // In production, would call rollback API
    try {
      if (confirm('Are you sure you want to rollback this threshold change?')) {
        // Simulate rollback API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert('Threshold change has been rolled back successfully.');
      }
    } catch (error) {
      console.error('Failed to rollback change:', error);
      alert('Failed to rollback change. Please try again.');
    }
  };

  const handleManualOverride = async (executionId: string, action: string) => {
    console.log('Manual override:', { executionId, action });
    try {
      if (action === 'stop') {
        await slaRemediationService.stopRemediation(executionId, 'User requested manual stop');
      } else if (action === 'escalate') {
        await slaRemediationService.escalateRemediation(executionId, 'User requested manual escalation');
      } else {
        // Generic manual override
        await slaRemediationService.manualOverride(executionId, {
          action: action as any,
          reason: `User requested manual ${action}`,
          user_id: 'current_user' // In production, get from auth context
        });
      }
      
      alert(`Manual override "${action}" applied successfully to remediation ${executionId}`);
    } catch (error) {
      console.error('Failed to perform manual override:', error);
      alert('Failed to perform manual override. Please try again.');
    }
  };

  const handleEscalationControl = async (escalationId: string, action: string) => {
    console.log('Escalation control:', { escalationId, action });
    try {
      await slaRemediationService.controlEscalation(
        escalationId, 
        action, 
        `User requested escalation ${action}`
      );
      
      alert(`Escalation "${action}" applied successfully to escalation ${escalationId}`);
    } catch (error) {
      console.error('Failed to control escalation:', error);
      alert('Failed to control escalation. Please try again.');
    }
  };

  const handleViewRemediationDetails = async (itemId: string, type: 'remediation' | 'escalation') => {
    console.log('View details:', { itemId, type });
    try {
      if (type === 'remediation') {
        const details = await slaRemediationService.getExecution(itemId);
        // In production, would open detailed modal with execution details
        alert(`Remediation Details:\nStatus: ${details.status}\nStrategy: ${details.strategy_id}\nActions: ${details.actions_completed.join(', ')}`);
      } else {
        // For escalations, could fetch escalation details if API supports it
        alert(`Opening detailed view for escalation: ${itemId}`);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
      alert('Failed to load details. Please try again.');
    }
  };

  const getSeverityCount = (severity: 'high' | 'medium' | 'low') => {
    return predictions.filter(p => {
      if (severity === 'high') return p.probability >= 0.9 && p.confidence_score >= 0.85;
      if (severity === 'medium') return p.probability >= 0.7 && p.confidence_score >= 0.75;
      return p.probability < 0.7 || p.confidence_score < 0.75;
    }).length;
  };

  const formatViolationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SLA Dashboard</h2>
          <p className="text-gray-600">
            Predictive monitoring and violation prevention
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadPredictions}
            disabled={loading}
          >
<<<<<<< HEAD
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
=======
            <Refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
>>>>>>> 88dc70d760890df4c1470ad1b6f22db85a5cd44b
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Violations</p>
              <p className="text-2xl font-bold text-red-600">{metrics.current_violations}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{metrics.resolved_today}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold">{metrics.avg_resolution_time}m</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.success_rate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="predictions" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Predictions ({predictions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="remediation" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Remediation</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Real-time Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {/* Prediction Alerts Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Violation Predictions</h3>
              <div className="flex space-x-2">
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{getSeverityCount('high')} High</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{getSeverityCount('medium')} Medium</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{getSeverityCount('low')} Low</span>
                </Badge>
              </div>
            </div>

            {predictions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No SLA violations predicted</p>
                <p className="text-sm text-gray-500">All systems operating within normal parameters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {predictions.map((prediction, index) => (
                  <PredictionCard
                    key={`${prediction.violation_type}-${index}`}
                    prediction={prediction}
                    onTakeAction={handleTakeAction}
                    onDismiss={() => handleDismissPrediction(index)}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* SLA Remediation Tab */}
        <TabsContent value="remediation" className="space-y-4">
          <RemediationControlPanel
            onManualOverride={handleManualOverride}
            onEscalationControl={handleEscalationControl}
            onViewDetails={handleViewRemediationDetails}
          />
        </TabsContent>

        {/* Threshold Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <ThresholdOptimizationPanel
            serviceTypes={violationTypes}
            onApplyRecommendation={handleApplyOptimizationRecommendation}
            onRollbackChange={handleRollbackChange}
          />
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">System Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {violationTypes.map(type => (
                <div key={type} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {formatViolationType(type)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Normal
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    Avg: 2.4s | Target: &lt;5s
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded">
                  <p className="text-sm text-gray-600">Overall Accuracy</p>
                  <p className="text-xl font-bold text-green-600">87.3%</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-sm text-gray-600">Predictions Made</p>
                  <p className="text-xl font-bold">1,247</p>
                </div>
              </div>
              
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <div>
                  <p className="font-medium">Model Performance</p>
                  <p className="text-sm text-gray-600">
                    Prediction accuracy is above the 85% target threshold.
                    Model was last retrained 3 days ago.
                  </p>
                </div>
              </Alert>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SLADashboard;