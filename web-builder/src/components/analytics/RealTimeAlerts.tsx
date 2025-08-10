/**
 * Real-Time Alerts Component
 * Displays and manages real-time analytics alerts for template performance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Eye,
  TrendingDown,
  TrendingUp,
  Users,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useTemplateAnalytics';
import type { RealTimeAlert } from '@/lib/api/services/template-analytics';

interface RealTimeAlertsProps {
  maxAlerts?: number;
  showOnlyActive?: boolean;
  severity?: 'critical' | 'warning' | 'info';
}

const AlertIcon = ({ type, severity }: { type: string; severity: string }) => {
  const baseClasses = "h-4 w-4";
  
  switch (severity) {
    case 'critical':
      return <AlertTriangle className={`${baseClasses} text-red-500`} />;
    case 'warning':
      return <AlertCircle className={`${baseClasses} text-yellow-500`} />;
    default:
      return <Info className={`${baseClasses} text-blue-500`} />;
  }
};

const AlertTypeIcon = ({ type }: { type: string }) => {
  const baseClasses = "h-4 w-4";
  
  switch (type) {
    case 'adoption_spike':
      return <TrendingUp className={`${baseClasses} text-green-500`} />;
    case 'adoption_drop':
      return <TrendingDown className={`${baseClasses} text-red-500`} />;
    case 'success_decline':
      return <Star className={`${baseClasses} text-yellow-500`} />;
    case 'rating_drop':
      return <Star className={`${baseClasses} text-orange-500`} />;
    case 'technical_issue':
      return <Zap className={`${baseClasses} text-purple-500`} />;
    default:
      return <Bell className={`${baseClasses} text-gray-500`} />;
  }
};

export default function RealTimeAlerts({
  maxAlerts = 10,
  showOnlyActive = false,
  severity
}: RealTimeAlertsProps) {
  const { alerts, loading, error, refresh, acknowledgeAlert } = useAnalyticsDashboard();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const filteredAlerts = alerts?.filter(alert => {
    if (severity && alert.severity !== severity) return false;
    if (filter !== 'all' && alert.severity !== filter) return false;
    return true;
  }).slice(0, maxAlerts) || [];

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityBadgeColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getAlertTypeName = (type: string) => {
    switch (type) {
      case 'adoption_spike':
        return 'Adoption Spike';
      case 'adoption_drop':
        return 'Adoption Drop';
      case 'success_decline':
        return 'Success Decline';
      case 'rating_drop':
        return 'Rating Drop';
      case 'technical_issue':
        return 'Technical Issue';
      default:
        return 'Alert';
    }
  };

  const formatThresholdMessage = (alert: RealTimeAlert) => {
    const percentage = ((alert.currentValue - alert.threshold) / alert.threshold * 100);
    const direction = percentage > 0 ? 'above' : 'below';
    return `${Math.abs(percentage).toFixed(1)}% ${direction} threshold`;
  };

  const toggleExpanded = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const criticalCount = alerts?.filter(a => a.severity === 'critical').length || 0;
  const warningCount = alerts?.filter(a => a.severity === 'warning').length || 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load alerts</p>
          <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BellRing className="h-5 w-5" />
            <span>Real-Time Alerts</span>
            {(criticalCount > 0 || warningCount > 0) && (
              <div className="flex items-center space-x-1">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalCount} Critical
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="default" className="text-xs">
                    {warningCount} Warning
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'critical' | 'warning' | 'info')}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All clear! No active alerts.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} relative`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center space-x-2 mt-0.5">
                    <AlertIcon type={alert.type} severity={alert.severity} />
                    <AlertTypeIcon type={alert.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {getAlertTypeName(alert.type)}
                      </h4>
                      <Badge variant={getSeverityBadgeColor(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                      {alert.templateId && (
                        <Badge variant="outline" className="text-xs">
                          Template #{alert.templateId}
                        </Badge>
                      )}
                    </div>
                    
                    <AlertDescription className="text-xs mb-2">
                      {alert.message}
                    </AlertDescription>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{formatThresholdMessage(alert)}</span>
                      <span>•</span>
                      <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
                    </div>
                    
                    {expandedAlerts.has(alert.id) && (
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border text-xs">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="font-medium">Current Value:</span>
                            <span className="ml-2">{alert.currentValue.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Threshold:</span>
                            <span className="ml-2">{alert.threshold.toFixed(2)}</span>
                          </div>
                        </div>
                        {alert.actionRequired && (
                          <div>
                            <span className="font-medium">Recommended Action:</span>
                            <p className="mt-1 text-gray-700">{alert.actionRequired}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))
        )}
        
        {alerts && alerts.length > maxAlerts && (
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {maxAlerts} of {alerts.length} alerts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}