/**
 * Analytics Configuration Component
 * Configure analytics tracking, alerts, and monitoring preferences
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Settings,
  Database,
  Shield,
  Mail,
  Slack,
  Webhook,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Zap,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

interface AlertThreshold {
  id: string;
  metric: 'adoption_rate' | 'success_rate' | 'user_satisfaction' | 'technical_score' | 'conversion_rate';
  condition: 'above' | 'below' | 'equals' | 'change_percent';
  threshold: number;
  timeWindow: '5m' | '15m' | '1h' | '24h' | '7d';
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'in_app';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

interface TrackingPreference {
  category: string;
  enabled: boolean;
  dataRetention: '30d' | '90d' | '1y' | 'indefinite';
  anonymize: boolean;
}

const defaultThresholds: Omit<AlertThreshold, 'id'>[] = [
  {
    metric: 'adoption_rate',
    condition: 'below',
    threshold: 20,
    timeWindow: '24h',
    severity: 'warning',
    enabled: true
  },
  {
    metric: 'success_rate',
    condition: 'below',
    threshold: 50,
    timeWindow: '24h',
    severity: 'critical',
    enabled: true
  },
  {
    metric: 'user_satisfaction',
    condition: 'below',
    threshold: 3.5,
    timeWindow: '7d',
    severity: 'warning',
    enabled: true
  },
  {
    metric: 'technical_score',
    condition: 'below',
    threshold: 70,
    timeWindow: '1h',
    severity: 'critical',
    enabled: true
  }
];

const defaultChannels: Omit<NotificationChannel, 'id'>[] = [
  {
    type: 'in_app',
    name: 'In-App Notifications',
    config: {},
    enabled: true
  },
  {
    type: 'email',
    name: 'Email Notifications',
    config: { recipients: [] },
    enabled: false
  }
];

const defaultTrackingPreferences: TrackingPreference[] = [
  { category: 'Template Adoption', enabled: true, dataRetention: '1y', anonymize: false },
  { category: 'User Behavior', enabled: true, dataRetention: '90d', anonymize: true },
  { category: 'Performance Metrics', enabled: true, dataRetention: '1y', anonymize: false },
  { category: 'Technical Analytics', enabled: true, dataRetention: '30d', anonymize: false },
  { category: 'Business Metrics', enabled: true, dataRetention: '1y', anonymize: false }
];

export default function AnalyticsConfiguration() {
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [trackingPreferences, setTrackingPreferences] = useState<TrackingPreference[]>(defaultTrackingPreferences);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('5m');
  const [enableRealTimeTracking, setEnableRealTimeTracking] = useState(true);
  const [enablePredictiveAlerts, setEnablePredictiveAlerts] = useState(true);
  const [dataExportSettings, setDataExportSettings] = useState({
    frequency: 'weekly',
    format: 'xlsx',
    includeRawData: false
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Initialize with default values
    setAlertThresholds(
      defaultThresholds.map((threshold, index) => ({
        id: `threshold-${index}`,
        ...threshold
      }))
    );
    setNotificationChannels(
      defaultChannels.map((channel, index) => ({
        id: `channel-${index}`,
        ...channel
      }))
    );
  }, []);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'adoption_rate':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'success_rate':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'user_satisfaction':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'technical_score':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'slack':
        return <Slack className="h-4 w-4 text-green-500" />;
      case 'webhook':
        return <Webhook className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const addAlertThreshold = () => {
    const newThreshold: AlertThreshold = {
      id: `threshold-${Date.now()}`,
      metric: 'adoption_rate',
      condition: 'below',
      threshold: 0,
      timeWindow: '1h',
      severity: 'warning',
      enabled: true
    };
    setAlertThresholds(prev => [...prev, newThreshold]);
  };

  const updateAlertThreshold = (id: string, updates: Partial<AlertThreshold>) => {
    setAlertThresholds(prev =>
      prev.map(threshold =>
        threshold.id === id ? { ...threshold, ...updates } : threshold
      )
    );
  };

  const removeAlertThreshold = (id: string) => {
    setAlertThresholds(prev => prev.filter(threshold => threshold.id !== id));
  };

  const addNotificationChannel = () => {
    const newChannel: NotificationChannel = {
      id: `channel-${Date.now()}`,
      type: 'email',
      name: 'New Channel',
      config: {},
      enabled: false
    };
    setNotificationChannels(prev => [...prev, newChannel]);
  };

  const updateNotificationChannel = (id: string, updates: Partial<NotificationChannel>) => {
    setNotificationChannels(prev =>
      prev.map(channel =>
        channel.id === id ? { ...channel, ...updates } : channel
      )
    );
  };

  const removeNotificationChannel = (id: string) => {
    setNotificationChannels(prev => prev.filter(channel => channel.id !== id));
  };

  const updateTrackingPreference = (category: string, updates: Partial<TrackingPreference>) => {
    setTrackingPreferences(prev =>
      prev.map(pref =>
        pref.category === category ? { ...pref, ...updates } : pref
      )
    );
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Here you would save the configuration to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Analytics Configuration</span>
          </h2>
          <p className="text-muted-foreground">Configure tracking, alerts, and monitoring preferences</p>
        </div>
        <Button onClick={saveConfiguration} disabled={saving} className="flex items-center space-x-2">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alert Thresholds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="tracking">Data Tracking</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        {/* Alert Thresholds */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alert Thresholds</CardTitle>
                <Button onClick={addAlertThreshold} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Threshold
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertThresholds.map((threshold) => (
                <Card key={threshold.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="space-y-2">
                      <Label>Metric</Label>
                      <Select
                        value={threshold.metric}
                        onValueChange={(value: any) => updateAlertThreshold(threshold.id, { metric: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adoption_rate">Adoption Rate</SelectItem>
                          <SelectItem value="success_rate">Success Rate</SelectItem>
                          <SelectItem value="user_satisfaction">User Satisfaction</SelectItem>
                          <SelectItem value="technical_score">Technical Score</SelectItem>
                          <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select
                        value={threshold.condition}
                        onValueChange={(value: any) => updateAlertThreshold(threshold.id, { condition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="change_percent">% Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={threshold.threshold}
                        onChange={(e) => updateAlertThreshold(threshold.id, { threshold: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Time Window</Label>
                      <Select
                        value={threshold.timeWindow}
                        onValueChange={(value: any) => updateAlertThreshold(threshold.id, { timeWindow: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5m">5 minutes</SelectItem>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select
                        value={threshold.severity}
                        onValueChange={(value: any) => updateAlertThreshold(threshold.id, { severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={threshold.enabled}
                          onCheckedChange={(checked) => updateAlertThreshold(threshold.id, { enabled: checked })}
                        />
                        <Badge className={getSeverityColor(threshold.severity)}>
                          {threshold.severity}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlertThreshold(threshold.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Channels</CardTitle>
                <Button onClick={addNotificationChannel} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationChannels.map((channel) => (
                <Card key={channel.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(channel.type)}
                      <h3 className="font-medium">{channel.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={(checked) => updateNotificationChannel(channel.id, { enabled: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotificationChannel(channel.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={channel.type}
                        onValueChange={(value: any) => updateNotificationChannel(channel.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_app">In-App</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="webhook">Webhook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={channel.name}
                        onChange={(e) => updateNotificationChannel(channel.id, { name: e.target.value })}
                        placeholder="Channel name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Configuration</Label>
                      {channel.type === 'email' && (
                        <Input
                          placeholder="email@example.com"
                          value={channel.config.email || ''}
                          onChange={(e) => updateNotificationChannel(channel.id, {
                            config: { ...channel.config, email: e.target.value }
                          })}
                        />
                      )}
                      {channel.type === 'slack' && (
                        <Input
                          placeholder="Webhook URL"
                          value={channel.config.webhook_url || ''}
                          onChange={(e) => updateNotificationChannel(channel.id, {
                            config: { ...channel.config, webhook_url: e.target.value }
                          })}
                        />
                      )}
                      {channel.type === 'webhook' && (
                        <Input
                          placeholder="Webhook URL"
                          value={channel.config.url || ''}
                          onChange={(e) => updateNotificationChannel(channel.id, {
                            config: { ...channel.config, url: e.target.value }
                          })}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tracking */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Tracking Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trackingPreferences.map((pref) => (
                <div key={pref.category} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(checked) => updateTrackingPreference(pref.category, { enabled: checked })}
                    />
                    <div>
                      <h3 className="font-medium">{pref.category}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>Retention: {pref.dataRetention}</span>
                        <span>•</span>
                        <span>{pref.anonymize ? 'Anonymized' : 'Non-anonymized'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={pref.dataRetention}
                      onValueChange={(value: any) => updateTrackingPreference(pref.category, { dataRetention: value })}
                      disabled={!pref.enabled}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="1y">1 year</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={pref.anonymize}
                        onCheckedChange={(checked) => updateTrackingPreference(pref.category, { anonymize: checked })}
                        disabled={!pref.enabled}
                      />
                      <Shield className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All data collection complies with GDPR, CCPA, and other privacy regulations. 
              Users can opt out of tracking at any time through their privacy settings.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Real-Time Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Real-Time Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track user actions in real-time</p>
                  </div>
                  <Switch
                    checked={enableRealTimeTracking}
                    onCheckedChange={setEnableRealTimeTracking}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Auto-Refresh Interval</Label>
                  <Select value={autoRefreshInterval} onValueChange={setAutoRefreshInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 minute</SelectItem>
                      <SelectItem value="5m">5 minutes</SelectItem>
                      <SelectItem value="15m">15 minutes</SelectItem>
                      <SelectItem value="30m">30 minutes</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Predictive Alerts</Label>
                    <p className="text-sm text-muted-foreground">Use AI to predict potential issues</p>
                  </div>
                  <Switch
                    checked={enablePredictiveAlerts}
                    onCheckedChange={setEnablePredictiveAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Export Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Frequency</Label>
                  <Select
                    value={dataExportSettings.frequency}
                    onValueChange={(value) => setDataExportSettings(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={dataExportSettings.format}
                    onValueChange={(value) => setDataExportSettings(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Raw Data</Label>
                    <p className="text-sm text-muted-foreground">Export raw event data</p>
                  </div>
                  <Switch
                    checked={dataExportSettings.includeRawData}
                    onCheckedChange={(checked) => setDataExportSettings(prev => ({ ...prev, includeRawData: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}