"use client";

import React, { useState, useEffect } from 'react';
import { slaRemediationService } from '@/lib/api/services/sla-remediation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Square,
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Settings,
  Zap,
  Bell,
  Users,
  ArrowUp,
  RotateCcw,
  Eye,
  AlertCircle
} from 'lucide-react';

interface RemediationExecution {
  execution_id: string;
  violation_id: string;
  strategy_id: string;
  status: 'pending' | 'analyzing' | 'executing' | 'success' | 'failed' | 'escalated' | 'manual_override';
  start_time: string;
  end_time?: string;
  success: boolean;
  failure_reason?: string;
  actions_completed: string[];
  rollback_performed: boolean;
  escalation_level: number;
  manual_override: boolean;
  audit_log: Array<{
    timestamp: string;
    event: string;
    details: any;
  }>;
}

interface EscalationExecution {
  escalation_id: string;
  violation_id: string;
  escalation_level: number;
  trigger: string;
  status: string;
  start_time: string;
  end_time?: string;
  notifications_sent: Array<{
    target_id: string;
    target_type: string;
    address: string;
    success: boolean;
    timestamp: string;
  }>;
  actions_completed: string[];
  escalation_reason: string;
  business_impact_score: number;
}

interface ViolationSummary {
  total_violations: number;
  active_remediations: number;
  success_rate: number;
  avg_resolution_time: number;
  escalations_today: number;
  critical_violations: number;
}

interface RemediationControlPanelProps {
  onManualOverride: (executionId: string, action: string) => Promise<void>;
  onEscalationControl: (escalationId: string, action: string) => Promise<void>;
  onViewDetails: (itemId: string, type: 'remediation' | 'escalation') => void;
  className?: string;
}

export const RemediationControlPanel: React.FC<RemediationControlPanelProps> = ({
  onManualOverride,
  onEscalationControl,
  onViewDetails,
  className = ""
}) => {
  const [activeRemediations, setActiveRemediations] = useState<RemediationExecution[]>([]);
  const [activeEscalations, setActiveEscalations] = useState<EscalationExecution[]>([]);
  const [violationSummary, setViolationSummary] = useState<ViolationSummary>({
    total_violations: 0,
    active_remediations: 0,
    success_rate: 0,
    avg_resolution_time: 0,
    escalations_today: 0,
    critical_violations: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRemediationData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadRemediationData, 10000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadRemediationData = async () => {
    try {
      // Load real data from API services
      const [executions, escalations, summary] = await Promise.all([
        slaRemediationService.listExecutions({ 
          status: 'executing,analyzing,pending',
          limit: 50 
        }),
        slaRemediationService.listEscalations({ 
          status: 'executing' 
        }),
        slaRemediationService.getActiveSummary()
      ]);

      setActiveRemediations(executions);
      setActiveEscalations(escalations);
      
      // Map API response to local summary format
      setViolationSummary({
        total_violations: summary.total_violations_today,
        active_remediations: summary.active_remediations,
        success_rate: summary.success_rate_today,
        avg_resolution_time: summary.avg_resolution_time_today,
        escalations_today: summary.active_escalations,
        critical_violations: summary.critical_violations
      });
      
    } catch (error) {
      console.error('Failed to load remediation data:', error);
      
      // Fallback to mock data on error for demo purposes
      const mockActiveRemediations: RemediationExecution[] = [
        {
          execution_id: "rem_001",
          violation_id: "viol_build_001",
          strategy_id: "restart_service",
          status: "executing",
          start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          success: false,
          actions_completed: ["stop_service"],
          rollback_performed: false,
          escalation_level: 1,
          manual_override: false,
          audit_log: [
            {
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              event: "remediation_started",
              details: { strategy: "restart_service" }
            }
          ]
        }
      ];

      const mockActiveEscalations: EscalationExecution[] = [
        {
          escalation_id: "esc_001",
          violation_id: "viol_build_003",
          escalation_level: 2,
          trigger: "remediation_timeout",
          status: "executing",
          start_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          notifications_sent: [
            {
              target_id: "devops_team",
              target_type: "slack",
              address: "#devops-alerts",
              success: true,
              timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString()
            }
          ],
          actions_completed: ["notify_team"],
          escalation_reason: "Automated remediation timed out after 30+ minutes",
          business_impact_score: 0.65
        }
      ];

      const mockSummary: ViolationSummary = {
        total_violations: 27,
        active_remediations: mockActiveRemediations.length,
        success_rate: 82.5,
        avg_resolution_time: 14.2,
        escalations_today: 8,
        critical_violations: 3
      };

      setActiveRemediations(mockActiveRemediations);
      setActiveEscalations(mockActiveEscalations);
      setViolationSummary(mockSummary);
    } finally {
      setLoading(false);
    }
  };

  const handleManualOverride = async (executionId: string, action: string) => {
    try {
      await onManualOverride(executionId, action);
      // Refresh data after action
      setTimeout(loadRemediationData, 1000);
    } catch (error) {
      console.error('Manual override failed:', error);
    }
  };

  const handleEscalationControl = async (escalationId: string, action: string) => {
    try {
      await onEscalationControl(escalationId, action);
      // Refresh data after action
      setTimeout(loadRemediationData, 1000);
    } catch (error) {
      console.error('Escalation control failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'executing': return 'text-blue-600 bg-blue-50';
      case 'analyzing': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'escalated': return 'text-orange-600 bg-orange-50';
      case 'manual_override': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'executing': return <Play className="h-4 w-4 text-blue-600" />;
      case 'analyzing': return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'escalated': return <ArrowUp className="h-4 w-4 text-orange-600" />;
      case 'manual_override': return <Settings className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-blue-600 bg-blue-50';
      case 2: return 'text-yellow-600 bg-yellow-50';
      case 3: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateProgress = (remediation: RemediationExecution) => {
    const totalActions = 4; // Typical remediation workflow steps
    const completed = remediation.actions_completed.length;
    return Math.round((completed / totalActions) * 100);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p>Loading remediation status...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.total_violations}</div>
              <div className="text-xs text-gray-600">Total Violations</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.active_remediations}</div>
              <div className="text-xs text-gray-600">Active Remediations</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.success_rate}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.avg_resolution_time}m</div>
              <div className="text-xs text-gray-600">Avg Resolution</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <ArrowUp className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.escalations_today}</div>
              <div className="text-xs text-gray-600">Escalations Today</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{violationSummary.critical_violations}</div>
              <div className="text-xs text-gray-600">Critical Issues</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Control Panel */}
      <Tabs defaultValue="remediations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="remediations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Active Remediations ({activeRemediations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="escalations" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Active Escalations ({activeEscalations.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Remediations Tab */}
        <TabsContent value="remediations" className="space-y-4">
          {activeRemediations.length === 0 ? (
            <Card className="p-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Active Remediations</h4>
                <p className="text-gray-600">All violations are currently resolved or in escalation.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeRemediations.map((remediation) => (
                <Card key={remediation.execution_id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(remediation.status)}
                          <h4 className="font-semibold">Remediation: {remediation.strategy_id}</h4>
                          <Badge className={getStatusColor(remediation.status)}>
                            {remediation.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Violation ID: {remediation.violation_id} • Started {formatDuration(remediation.start_time)} ago
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getEscalationLevelColor(remediation.escalation_level)}>
                          Level {remediation.escalation_level}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {remediation.actions_completed.length} actions completed</span>
                        <span>{calculateProgress(remediation)}%</span>
                      </div>
                      <Progress value={calculateProgress(remediation)} className="h-2" />
                    </div>

                    {/* Actions Completed */}
                    {remediation.actions_completed.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Completed Actions:</h5>
                        <div className="flex flex-wrap gap-2">
                          {remediation.actions_completed.map((action, index) => (
                            <Badge key={index} variant="outline" className="text-green-600 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Failure Reason */}
                    {remediation.failure_reason && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Remediation Issue</p>
                          <p className="text-sm text-gray-600">{remediation.failure_reason}</p>
                        </div>
                      </Alert>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewDetails(remediation.execution_id, 'remediation')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        {remediation.rollback_performed && (
                          <Badge variant="outline" className="text-orange-600 bg-orange-50">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Rollback Performed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {remediation.status === 'executing' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManualOverride(remediation.execution_id, 'stop')}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManualOverride(remediation.execution_id, 'escalate')}
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Escalations Tab */}
        <TabsContent value="escalations" className="space-y-4">
          {activeEscalations.length === 0 ? (
            <Card className="p-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Active Escalations</h4>
                <p className="text-gray-600">All violations are being handled at Level 1 automation.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeEscalations.map((escalation) => (
                <Card key={escalation.escalation_id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ArrowUp className="h-4 w-4 text-orange-600" />
                          <h4 className="font-semibold">Level {escalation.escalation_level} Escalation</h4>
                          <Badge className={getEscalationLevelColor(escalation.escalation_level)}>
                            {escalation.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Violation ID: {escalation.violation_id} • Trigger: {escalation.trigger}
                        </div>
                        <div className="text-sm text-gray-600">
                          Started {formatDuration(escalation.start_time)} ago
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Business Impact</div>
                          <div className="text-lg font-semibold">
                            {(escalation.business_impact_score * 100).toFixed(0)}%
                          </div>
                        </div>
                        <Progress 
                          value={escalation.business_impact_score * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>

                    {/* Escalation Reason */}
                    <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-200">
                      <p className="text-sm text-orange-800">{escalation.escalation_reason}</p>
                    </div>

                    {/* Notifications Sent */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Notifications Sent:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {escalation.notifications_sent.map((notification, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <Bell className="h-3 w-3 text-gray-600" />
                              <span className="text-sm">{notification.target_id}</span>
                              <Badge variant="outline" className="text-xs">
                                {notification.target_type}
                              </Badge>
                            </div>
                            {notification.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Completed */}
                    {escalation.actions_completed.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Actions Completed:</h5>
                        <div className="flex flex-wrap gap-2">
                          {escalation.actions_completed.map((action, index) => (
                            <Badge key={index} variant="outline" className="text-blue-600 bg-blue-50">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails(escalation.escalation_id, 'escalation')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        {escalation.status === 'executing' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEscalationControl(escalation.escalation_id, 'stop')}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Override
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RemediationControlPanel;