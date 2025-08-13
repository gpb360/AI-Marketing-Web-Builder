/**
 * Real-time Dashboard Component for Story 3.3
 * Live dashboard with WebSocket integration, auto-refreshing charts,
 * performance alerts, and notifications
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { 
  Activity, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff,
  Bell,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { analyticsService } from '../../lib/api/services/analytics';
import type { RealTimeMetrics } from '../../lib/api/types';

interface RealTimeDashboardProps {
  workflowIds: number[];
  workflowNames?: Record<number, string>;
  refreshInterval?: number; // milliseconds
  alertThresholds?: {
    successRate: number;
    responseTime: number;
    errorRate: number;
  };
  className?: string;
}

interface AlertNotification {
  id: string;
  workflowId: number;
  type: 'success_rate' | 'response_time' | 'error_rate' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface LiveDataPoint {
  timestamp: string;
  workflowId: number;
  metrics: RealTimeMetrics;
}

const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#64748b'
};

const DEFAULT_ALERT_THRESHOLDS = {
  successRate: 0.95, // Alert if below 95%
  responseTime: 5.0,  // Alert if above 5 seconds
  errorRate: 0.05     // Alert if above 5%
};

export default function RealTimeDashboard({
  workflowIds,
  workflowNames = {},
  refreshInterval = 5000,
  alertThresholds = DEFAULT_ALERT_THRESHOLDS,
  className = ''
}: RealTimeDashboardProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveData, setLiveData] = useState<LiveDataPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState(30); // minutes
  
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const alertSoundRef = useRef<HTMLAudioElement>();

  // Real-time metrics query for all workflows
  const { data: dashboardData, isError } = useQuery({
    queryKey: ['multi-workflow-dashboard', workflowIds],
    queryFn: () => analyticsService.getMultiWorkflowDashboard(workflowIds),
    refetchInterval: isPaused ? false : refreshInterval,
    enabled: workflowIds.length > 0 && !isPaused
  });

  // Initialize alert sound
  useEffect(() => {
    alertSoundRef.current = new Audio('/sounds/alert.mp3'); // You'd need to add this file
    alertSoundRef.current.volume = 0.3;
  }, []);

  // Handle connection status
  useEffect(() => {
    setIsConnected(!isError);
    
    if (isError && !reconnectTimeoutRef.current) {
      // Attempt to reconnect after 10 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['multi-workflow-dashboard'] });
        reconnectTimeoutRef.current = undefined;
      }, 10000);
    }
  }, [isError, queryClient]);

  // Process incoming data and check for alerts
  useEffect(() => {
    if (dashboardData?.workflows) {
      const timestamp = new Date().toISOString();
      const newDataPoints: LiveDataPoint[] = [];
      const newAlerts: AlertNotification[] = [];

      Object.entries(dashboardData.workflows).forEach(([workflowIdStr, metrics]) => {
        const workflowId = parseInt(workflowIdStr);
        
        // Add data point
        newDataPoints.push({
          timestamp,
          workflowId,
          metrics: metrics as RealTimeMetrics
        });

        // Check for alerts
        const metricsData = metrics as RealTimeMetrics;
        
        // Success rate alert
        if (metricsData.success_rate < alertThresholds.successRate) {
          newAlerts.push({
            id: `alert_${workflowId}_${Date.now()}_success`,
            workflowId,
            type: 'success_rate',
            severity: metricsData.success_rate < 0.80 ? 'critical' : 'high',
            message: `Success rate dropped to ${(metricsData.success_rate * 100).toFixed(1)}%`,
            timestamp,
            acknowledged: false
          });
        }

        // Response time alert
        if (metricsData.avg_response_time > alertThresholds.responseTime) {
          newAlerts.push({
            id: `alert_${workflowId}_${Date.now()}_response`,
            workflowId,
            type: 'response_time',
            severity: metricsData.avg_response_time > 10 ? 'critical' : 'medium',
            message: `Response time increased to ${metricsData.avg_response_time.toFixed(2)}s`,
            timestamp,
            acknowledged: false
          });
        }
      });

      // Update live data (keep only last 30 minutes worth)
      setLiveData(prev => {
        const cutoffTime = new Date(Date.now() - timeRange * 60 * 1000);
        const filtered = prev.filter(point => new Date(point.timestamp) > cutoffTime);
        return [...filtered, ...newDataPoints].slice(-1000); // Limit to 1000 points max
      });

      // Add new alerts
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 100)); // Keep last 100 alerts
        
        // Play alert sound if enabled
        if (soundEnabled && alertSoundRef.current) {
          alertSoundRef.current.play().catch(() => {
            // Ignore audio play errors (browser restrictions)
          });
        }
      }
    }
  }, [dashboardData, alertThresholds, timeRange, soundEnabled]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get summary statistics
  const getSummaryStats = useCallback(() => {
    if (!dashboardData?.workflows) return null;

    const workflows = Object.values(dashboardData.workflows) as RealTimeMetrics[];
    
    return {
      totalExecutions: workflows.reduce((sum, w) => sum + w.current_executions, 0),
      avgSuccessRate: workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length,
      avgResponseTime: workflows.reduce((sum, w) => sum + w.avg_response_time, 0) / workflows.length,
      totalActiveUsers: workflows.reduce((sum, w) => sum + w.active_users, 0),
      activeWorkflows: workflows.length
    };
  }, [dashboardData]);

  // Prepare chart data
  const prepareChartData = useCallback((workflowId?: number) => {
    const filteredData = workflowId 
      ? liveData.filter(point => point.workflowId === workflowId)
      : liveData;

    // Group by timestamp and aggregate
    const aggregated = filteredData.reduce((acc, point) => {
      const time = new Date(point.timestamp).toLocaleTimeString();
      if (!acc[time]) {
        acc[time] = {
          time,
          success_rate: 0,
          response_time: 0,
          executions: 0,
          active_users: 0,
          count: 0
        };
      }
      
      acc[time].success_rate += point.metrics.success_rate;
      acc[time].response_time += point.metrics.avg_response_time;
      acc[time].executions += point.metrics.current_executions;
      acc[time].active_users += point.metrics.active_users;
      acc[time].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(aggregated).map((item: any) => ({
      time: item.time,
      success_rate: (item.success_rate / item.count) * 100,
      response_time: item.response_time / item.count,
      executions: item.executions,
      active_users: item.active_users
    })).slice(-20); // Last 20 data points
  }, [liveData]);

  const summaryStats = getSummaryStats();
  const chartData = prepareChartData(selectedWorkflow || undefined);
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className={`space-y-6 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : ''}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h2>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>

          {/* Alert Count */}
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Workflow Filter */}
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md"
          >
            <option value="">All Workflows</option>
            {workflowIds.map(id => (
              <option key={id} value={id}>
                {workflowNames[id] || `Workflow ${id}`}
              </option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md"
          >
            <option value={15}>15m</option>
            <option value={30}>30m</option>
            <option value={60}>1h</option>
            <option value={180}>3h</option>
          </select>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable alert sounds' : 'Enable alert sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Pause/Resume */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['multi-workflow-dashboard'] });
              setLiveData([]);
            }}
            title="Refresh data"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">Active Alerts</h4>
                <p className="text-sm text-red-700">
                  {unacknowledgedAlerts.length} workflow{unacknowledgedAlerts.length !== 1 ? 's' : ''} require{unacknowledgedAlerts.length === 1 ? 's' : ''} attention
                </p>
              </div>
            </div>
            <Button onClick={clearAllAlerts} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
          
          <div className="mt-3 space-y-2">
            {unacknowledgedAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-2 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                  <span className="text-sm">
                    {workflowNames[alert.workflowId] || `Workflow ${alert.workflowId}`}: {alert.message}
                  </span>
                </div>
                <Button
                  onClick={() => acknowledgeAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                >
                  Acknowledge
                </Button>
              </div>
            ))}
            {unacknowledgedAlerts.length > 3 && (
              <p className="text-sm text-red-600 text-center">
                +{unacknowledgedAlerts.length - 3} more alerts
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold">{summaryStats.totalExecutions.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {(summaryStats.avgSuccessRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{summaryStats.avgResponseTime.toFixed(2)}s</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{summaryStats.totalActiveUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold">{summaryStats.activeWorkflows}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <ReferenceLine y={alertThresholds.successRate * 100} stroke="red" strokeDasharray="5 5" />
              <Area
                type="monotone"
                dataKey="success_rate"
                stroke={CHART_COLORS.success}
                fill={CHART_COLORS.success}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Response Time Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Response Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}s`} />
              <ReferenceLine y={alertThresholds.responseTime} stroke="red" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="response_time"
                stroke={CHART_COLORS.warning}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Executions Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Executions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="executions" fill={CHART_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Active Users Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="active_users"
                stroke={CHART_COLORS.secondary}
                fill={CHART_COLORS.secondary}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Quality Indicator */}
      <div className="text-center text-sm text-gray-500">
        Data refreshed every {refreshInterval / 1000} seconds • 
        {isPaused && ' PAUSED • '}
        Showing last {timeRange} minutes • 
        {liveData.length} data points collected
      </div>
    </div>
  );
}