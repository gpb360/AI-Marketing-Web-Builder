/**
 * Analytics Configuration Component
 * 
 * Configuration settings for analytics dashboard and external integrations
 * Part of Story 3.3 - Performance Analytics Dashboard
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  Database, 
  Bell, 
  Eye, 
  Shield, 
  Zap, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Link,
  Unlink,
  Key
} from 'lucide-react';

// Types for configuration
interface DashboardSettings {
  refreshInterval: number; // seconds
  autoRefresh: boolean;
  realTimeUpdates: boolean;
  darkMode: boolean;
  compactView: boolean;
  defaultTimeRange: string;
  enableNotifications: boolean;
  enableAlerts: boolean;
}

interface AlertThreshold {
  id: string;
  metric: string;
  condition: 'above' | 'below' | 'equals';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: {
    email: boolean;
    dashboard: boolean;
    webhook?: string;
  };
}

interface ExternalIntegration {
  id: string;
  platform: 'google_analytics' | 'hubspot' | 'salesforce' | 'mixpanel' | 'segment';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: string;
  configuration: {
    apiKey?: string;
    accountId?: string;
    propertyId?: string;
    customFields?: Record<string, string>;
  };
  syncSettings: {
    frequency: 'realtime' | 'hourly' | 'daily';
    metrics: string[];
    enabled: boolean;
  };
}

interface DataRetentionSettings {
  analyticsData: number; // days
  exportedReports: number; // days
  auditLogs: number; // days
  alertHistory: number; // days
  autoCleanup: boolean;
}

export const AnalyticsConfiguration: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'alerts' | 'integrations' | 'data'>('dashboard');

  // Dashboard settings state
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    refreshInterval: 30,
    autoRefresh: true,
    realTimeUpdates: true,
    darkMode: false,
    compactView: false,
    defaultTimeRange: '30d',
    enableNotifications: true,
    enableAlerts: true
  });

  // Alert thresholds state
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>([
    {
      id: 'threshold-001',
      metric: 'conversion_rate',
      condition: 'below',
      value: 5.0,
      severity: 'high',
      enabled: true,
      notifications: {
        email: true,
        dashboard: true,
        webhook: 'https://hooks.slack.com/services/...'
      }
    },
    {
      id: 'threshold-002',
      metric: 'response_time',
      condition: 'above',
      value: 5000,
      severity: 'medium',
      enabled: true,
      notifications: {
        email: false,
        dashboard: true
      }
    },
    {
      id: 'threshold-003',
      metric: 'error_rate',
      condition: 'above',
      value: 2.0,
      severity: 'critical',
      enabled: true,
      notifications: {
        email: true,
        dashboard: true
      }
    }
  ]);

  // External integrations state
  const [externalIntegrations, setExternalIntegrations] = useState<ExternalIntegration[]>([
    {
      id: 'integration-ga',
      platform: 'google_analytics',
      name: 'Google Analytics 4',
      status: 'connected',
      lastSync: '2024-01-20T16:30:00Z',
      configuration: {
        propertyId: 'GA4-PROPERTY-ID',
        accountId: 'GA-ACCOUNT-ID'
      },
      syncSettings: {
        frequency: 'hourly',
        metrics: ['page_views', 'sessions', 'conversions', 'bounce_rate'],
        enabled: true
      }
    },
    {
      id: 'integration-hubspot',
      platform: 'hubspot',
      name: 'HubSpot CRM',
      status: 'connected',
      lastSync: '2024-01-20T15:45:00Z',
      configuration: {
        apiKey: 'hubspot-api-key-***'
      },
      syncSettings: {
        frequency: 'realtime',
        metrics: ['contacts', 'deals', 'emails', 'calls'],
        enabled: true
      }
    },
    {
      id: 'integration-sf',
      platform: 'salesforce',
      name: 'Salesforce',
      status: 'disconnected',
      configuration: {},
      syncSettings: {
        frequency: 'daily',
        metrics: ['leads', 'opportunities', 'accounts'],
        enabled: false
      }
    }
  ]);

  // Data retention settings
  const [dataRetentionSettings, setDataRetentionSettings] = useState<DataRetentionSettings>({
    analyticsData: 730, // 2 years
    exportedReports: 90,
    auditLogs: 365,
    alertHistory: 180,
    autoCleanup: true
  });

  // Render dashboard settings section
  const renderDashboardSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize your analytics dashboard appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">Automatically update dashboard data</p>
              </div>
              <Switch 
                checked={dashboardSettings.autoRefresh}
                onCheckedChange={(checked) => 
                  setDashboardSettings(prev => ({ ...prev, autoRefresh: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Real-time Updates</Label>
                <p className="text-sm text-muted-foreground">Enable live data streaming</p>
              </div>
              <Switch 
                checked={dashboardSettings.realTimeUpdates}
                onCheckedChange={(checked) => 
                  setDashboardSettings(prev => ({ ...prev, realTimeUpdates: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch 
                checked={dashboardSettings.darkMode}
                onCheckedChange={(checked) => 
                  setDashboardSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">Show more data in less space</p>
              </div>
              <Switch 
                checked={dashboardSettings.compactView}
                onCheckedChange={(checked) => 
                  setDashboardSettings(prev => ({ ...prev, compactView: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Refresh Interval: {dashboardSettings.refreshInterval} seconds</Label>
              <Slider
                value={[dashboardSettings.refreshInterval]}
                onValueChange={(value) => 
                  setDashboardSettings(prev => ({ ...prev, refreshInterval: value[0] }))
                }
                max={300}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="default-time-range">Default Time Range</Label>
              <Select 
                value={dashboardSettings.defaultTimeRange}
                onValueChange={(value) => 
                  setDashboardSettings(prev => ({ ...prev, defaultTimeRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive dashboard notifications</p>
            </div>
            <Switch 
              checked={dashboardSettings.enableNotifications}
              onCheckedChange={(checked) => 
                setDashboardSettings(prev => ({ ...prev, enableNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive performance alerts</p>
            </div>
            <Switch 
              checked={dashboardSettings.enableAlerts}
              onCheckedChange={(checked) => 
                setDashboardSettings(prev => ({ ...prev, enableAlerts: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render alerts section
  const renderAlertsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure automatic alerts for performance metrics
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Threshold
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertThresholds.map(threshold => (
              <div key={threshold.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">
                      {threshold.metric.replace('_', ' ')} Alert
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Trigger when {threshold.metric.replace('_', ' ')} is {threshold.condition} {threshold.value}
                      {threshold.metric.includes('rate') ? '%' : 
                       threshold.metric.includes('time') ? 'ms' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        threshold.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        threshold.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        threshold.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {threshold.severity}
                    </Badge>
                    <Switch checked={threshold.enabled} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <div className="font-medium">{threshold.condition} {threshold.value}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div>{threshold.notifications.email ? 'Enabled' : 'Disabled'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dashboard:</span>
                    <div>{threshold.notifications.dashboard ? 'Enabled' : 'Disabled'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Webhook:</span>
                    <div>{threshold.notifications.webhook ? 'Configured' : 'Not set'}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render integrations section
  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>
                Connect with external analytics platforms and CRM systems
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {externalIntegrations.map(integration => (
              <div key={integration.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{integration.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {integration.platform.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                        integration.status === 'error' ? 'bg-red-100 text-red-800' :
                        integration.status === 'configuring' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {integration.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {integration.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                      {integration.status === 'disconnected' && <Unlink className="h-3 w-3 mr-1" />}
                      {integration.status}
                    </Badge>
                    <Switch checked={integration.syncSettings.enabled} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Sync Frequency:</span>
                    <div className="font-medium capitalize">{integration.syncSettings.frequency}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Metrics:</span>
                    <div className="font-medium">{integration.syncSettings.metrics.length} metrics</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Sync:</span>
                    <div className="font-medium">
                      {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {integration.syncSettings.metrics.map(metric => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Zap className="h-4 w-4 mr-1" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Unlink className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm">
                      <Link className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render data management section
  const renderDataSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention Policy
          </CardTitle>
          <CardDescription>
            Configure how long different types of data are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Analytics Data: {dataRetentionSettings.analyticsData} days</Label>
              <Slider
                value={[dataRetentionSettings.analyticsData]}
                onValueChange={(value) => 
                  setDataRetentionSettings(prev => ({ ...prev, analyticsData: value[0] }))
                }
                max={1095} // 3 years
                min={30}
                step={30}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Exported Reports: {dataRetentionSettings.exportedReports} days</Label>
              <Slider
                value={[dataRetentionSettings.exportedReports]}
                onValueChange={(value) => 
                  setDataRetentionSettings(prev => ({ ...prev, exportedReports: value[0] }))
                }
                max={365}
                min={7}
                step={7}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Audit Logs: {dataRetentionSettings.auditLogs} days</Label>
              <Slider
                value={[dataRetentionSettings.auditLogs]}
                onValueChange={(value) => 
                  setDataRetentionSettings(prev => ({ ...prev, auditLogs: value[0] }))
                }
                max={1095}
                min={30}
                step={30}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Alert History: {dataRetentionSettings.alertHistory} days</Label>
              <Slider
                value={[dataRetentionSettings.alertHistory]}
                onValueChange={(value) => 
                  setDataRetentionSettings(prev => ({ ...prev, alertHistory: value[0] }))
                }
                max={730}
                min={30}
                step={30}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Cleanup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete old data based on retention policy
              </p>
            </div>
            <Switch 
              checked={dataRetentionSettings.autoCleanup}
              onCheckedChange={(checked) => 
                setDataRetentionSettings(prev => ({ ...prev, autoCleanup: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymize Data</Label>
                <p className="text-sm text-muted-foreground">Remove personally identifiable information</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Encrypt at Rest</Label>
                <p className="text-sm text-muted-foreground">Encrypt stored analytics data</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Access Logging</Label>
                <p className="text-sm text-muted-foreground">Log all data access attempts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>GDPR Compliance</Label>
                <p className="text-sm text-muted-foreground">Enable GDPR compliance features</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap border-b gap-1">
        <Button 
          variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('dashboard')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button 
          variant={activeSection === 'alerts' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('alerts')}
        >
          <Bell className="h-4 w-4 mr-2" />
          Alerts
        </Button>
        <Button 
          variant={activeSection === 'integrations' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('integrations')}
        >
          <Globe className="h-4 w-4 mr-2" />
          Integrations
        </Button>
        <Button 
          variant={activeSection === 'data' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('data')}
        >
          <Database className="h-4 w-4 mr-2" />
          Data
        </Button>
      </div>

      {/* Section Content */}
      {activeSection === 'dashboard' && renderDashboardSettings()}
      {activeSection === 'alerts' && renderAlertsSection()}
      {activeSection === 'integrations' && renderIntegrationsSection()}
      {activeSection === 'data' && renderDataSection()}

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};