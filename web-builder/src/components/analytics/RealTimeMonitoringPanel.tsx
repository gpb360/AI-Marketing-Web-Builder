/**
 * Real-Time Monitoring Panel Component
 * 
 * Real-time performance monitoring with anomaly detection and intelligent alerting
 * Part of Story 3.3 - Performance Analytics Dashboard
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  BellOff, 
  Zap, 
  Clock, 
  Users, 
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Settings,
  Eye,
  XCircle,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Types for real-time monitoring
interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'error';
  threshold: number;
  trend: number[];
  lastUpdated: string;
}

interface SystemAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'error' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  workflowId?: string;
  isRead: boolean;
  isResolved: boolean;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error' | 'maintenance';
  currentExecutions: number;
  avgResponseTime: number;
  successRate: number;
  lastExecution: string;
  queueSize: number;
}

export const RealTimeMonitoringPanel: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [notifications, setNotifications] = useState(true);

  // Real-time metrics state
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([
    {
      id: 'active_workflows',
      name: 'Active Workflows',
      value: 23,
      unit: '',
      status: 'normal',
      threshold: 50,
      trend: [20, 22, 21, 23, 22, 23],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'avg_response_time',
      name: 'Avg Response Time',
      value: 285,
      unit: 'ms',
      status: 'normal',
      threshold: 500,
      trend: [300, 295, 290, 285, 280, 285],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'success_rate',
      name: 'Success Rate',
      value: 98.7,
      unit: '%',
      status: 'normal',
      threshold: 95,
      trend: [98.2, 98.5, 98.3, 98.7, 98.6, 98.7],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'queue_size',
      name: 'Queue Size',
      value: 12,
      unit: '',
      status: 'warning',
      threshold: 10,
      trend: [8, 9, 10, 11, 12, 12],
      lastUpdated: new Date().toISOString()
    }
  ]);

  // System alerts state
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert-001',
      type: 'threshold',
      severity: 'medium',
      title: 'Queue Size Above Threshold',
      message: 'Workflow queue size has exceeded the warning threshold of 10 items',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      workflowId: 'wf-001',
      isRead: false,
      isResolved: false
    },
    {
      id: 'alert-002',
      type: 'anomaly',
      severity: 'low',
      title: 'Response Time Spike Detected',
      message: 'Detected unusual response time pattern in lead generation workflow',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      workflowId: 'wf-002',
      isRead: true,
      isResolved: false
    },
    {
      id: 'alert-003',
      type: 'performance',
      severity: 'high',
      title: 'High Error Rate',
      message: 'Email automation workflow showing increased error rate (5.2%)',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      workflowId: 'wf-003',
      isRead: false,
      isResolved: true
    }
  ]);

  // Workflow status state
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([
    {
      id: 'wf-001',
      name: 'Lead Generation',
      status: 'running',
      currentExecutions: 5,
      avgResponseTime: 245,
      successRate: 98.5,
      lastExecution: new Date(Date.now() - 30000).toISOString(),
      queueSize: 8
    },
    {
      id: 'wf-002',
      name: 'Customer Onboarding',
      status: 'running',
      currentExecutions: 3,
      avgResponseTime: 180,
      successRate: 99.2,
      lastExecution: new Date(Date.now() - 45000).toISOString(),
      queueSize: 2
    },
    {
      id: 'wf-003',
      name: 'Email Automation',
      status: 'error',
      currentExecutions: 0,
      avgResponseTime: 520,
      successRate: 94.8,
      lastExecution: new Date(Date.now() - 120000).toISOString(),
      queueSize: 15
    }
  ]);

  // Real-time data points for charts
  const [chartData, setChartData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5000).toLocaleTimeString(),
      responseTime: Math.floor(Math.random() * 100) + 200,
      successRate: 95 + Math.random() * 5,
      activeUsers: Math.floor(Math.random() * 20) + 40
    }))
  );

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring || !autoRefresh) return;

    const interval = setInterval(() => {
      // Update metrics
      setRealTimeMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 2,
        trend: [...metric.trend.slice(1), metric.value],
        lastUpdated: new Date().toISOString()
      })));

      // Update chart data
      setChartData(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString(),
          responseTime: Math.floor(Math.random() * 100) + 200,
          successRate: 95 + Math.random() * 5,
          activeUsers: Math.floor(Math.random() * 20) + 40
        }
      ]);
    }, parseInt(refreshInterval) * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, autoRefresh, refreshInterval]);

  // Handle alert actions
  const markAlertAsRead = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true } : alert
    ));
  }, []);

  // Render real-time metric card
  const renderMetricCard = (metric: RealTimeMetric) => {
    const statusColors = {
      normal: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      critical: 'border-red-200 bg-red-50',
      error: 'border-red-300 bg-red-100'
    };

    const statusIcons = {
      normal: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      critical: <XCircle className="h-4 w-4 text-red-600" />,
      error: <XCircle className="h-4 w-4 text-red-700" />
    };

    return (
      <Card key={metric.id} className={`transition-all ${statusColors[metric.status]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            {statusIcons[metric.status]}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
            </div>
            
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.trend.map((value, index) => ({ index, value }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={metric.status === 'normal' ? '#10b981' : 
                           metric.status === 'warning' ? '#f59e0b' : '#ef4444'} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render alert item
  const renderAlert = (alert: SystemAlert) => {
    const severityColors = {
      low: 'border-blue-200 bg-blue-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50'
    };

    const severityIcons = {
      low: <Info className="h-4 w-4 text-blue-600" />,
      medium: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      high: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      critical: <XCircle className="h-4 w-4 text-red-600" />
    };

    return (
      <div
        key={alert.id}
        className={`p-3 border rounded-lg transition-all ${severityColors[alert.severity]} ${
          alert.isRead ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {severityIcons[alert.severity]}
            <span className="font-medium">{alert.title}</span>
            {!alert.isRead && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                New
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
        
        <div className="flex items-center gap-2">
          {!alert.isRead && (
            <Button size="sm" variant="outline" onClick={() => markAlertAsRead(alert.id)}>
              Mark as Read
            </Button>
          )}
          {!alert.isResolved && (
            <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
              Resolve
            </Button>
          )}
          {alert.isResolved && (
            <Badge variant="secondary" className="text-xs">
              Resolved
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // Render workflow status
  const renderWorkflowStatus = (workflow: WorkflowStatus) => {
    const statusColors = {
      running: 'bg-green-100 text-green-800',
      idle: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };

    const statusIcons = {
      running: <Activity className="h-3 w-3" />,
      idle: <Pause className="h-3 w-3" />,
      error: <XCircle className="h-3 w-3" />,
      maintenance: <Settings className="h-3 w-3" />
    };

    return (
      <div key={workflow.id} className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">{workflow.name}</h4>
          <Badge className={statusColors[workflow.status]}>
            {statusIcons[workflow.status]}
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Executions</div>
            <div className="font-medium">{workflow.currentExecutions}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Time</div>
            <div className="font-medium">{workflow.avgResponseTime}ms</div>
          </div>
          <div>
            <div className="text-muted-foreground">Success Rate</div>
            <div className="font-medium">{workflow.successRate}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Queue</div>
            <div className="font-medium">{workflow.queueSize}</div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Last execution: {new Date(workflow.lastExecution).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Real-Time Monitoring</CardTitle>
              <div className="flex items-center gap-1">
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-xs ${
                  connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionStatus}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isMonitoring} 
                  onCheckedChange={setIsMonitoring}
                />
                <span className="text-sm">
                  {isMonitoring ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </div>
              
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1s</SelectItem>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeMetrics.map(renderMetricCard)}
      </div>

      {/* Real-Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
              {systemAlerts.filter(a => !a.isRead).length > 0 && (
                <Badge variant="destructive">
                  {systemAlerts.filter(a => !a.isRead).length} new
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {systemAlerts.length > 0 ? (
              systemAlerts.map(renderAlert)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Workflow Status
          </CardTitle>
          <CardDescription>
            Real-time status of all active workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowStatuses.map(renderWorkflowStatus)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};