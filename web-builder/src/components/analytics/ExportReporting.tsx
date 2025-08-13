/**
 * Export and Reporting Component for Story 3.3
 * Features for exporting analytics data, scheduled reports, and custom dashboard configuration
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Download, 
  FileText, 
  Calendar, 
  Settings, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  Share2,
  Eye,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Grid,
  Layout
} from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { analyticsService } from '../../lib/api/services/analytics';
import type { 
  ExportRequest, 
  AnalyticsTimePeriod 
} from '../../lib/api/types';

interface ExportReportingProps {
  workflowId: number;
  workflowName?: string;
  className?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv';
  recipients: string[];
  lastSent?: string;
  nextScheduled: string;
  status: 'active' | 'paused' | 'error';
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; width: number; height: number };
  config: any;
}

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Report', description: 'Complete report with charts and analysis', icon: FileText },
  { value: 'csv', label: 'CSV Data', description: 'Raw data for further analysis', icon: FileSpreadsheet },
  { value: 'json', label: 'JSON Data', description: 'Structured data for API integration', icon: FileText }
];

const TEMPLATE_OPTIONS = [
  { value: 'executive', label: 'Executive Summary', description: 'High-level overview for leadership' },
  { value: 'detailed', label: 'Detailed Analysis', description: 'Comprehensive analytics report' },
  { value: 'technical', label: 'Technical Report', description: 'Technical metrics and performance data' },
  { value: 'comparison', label: 'Period Comparison', description: 'Compare performance across time periods' }
];

const WIDGET_TYPES = [
  { type: 'metric', label: 'Key Metric', description: 'Single KPI display', icon: TrendingUp },
  { type: 'chart', label: 'Chart', description: 'Line, bar, or area charts', icon: BarChart3 },
  { type: 'table', label: 'Data Table', description: 'Tabular data display', icon: Grid },
  { type: 'funnel', label: 'Funnel', description: 'Conversion funnel visualization', icon: PieChart }
];

export default function ExportReporting({
  workflowId,
  workflowName,
  className = ''
}: ExportReportingProps) {
  const [selectedTab, setSelectedTab] = useState('export');
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);

  // Export form
  const exportForm = useForm<ExportRequest>({
    defaultValues: {
      format: 'pdf',
      time_period: 'MONTH' as AnalyticsTimePeriod,
      include_charts: true,
      include_raw_data: false,
      template: 'detailed',
      custom_sections: []
    }
  });

  // Scheduled report form
  const reportForm = useForm({
    defaultValues: {
      name: '',
      frequency: 'weekly',
      format: 'pdf',
      recipients: [''],
      template: 'executive',
      time_period: 'WEEK' as AnalyticsTimePeriod
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (data: ExportRequest) => analyticsService.exportAnalyticsData(workflowId, data),
    onSuccess: (response) => {
      // Add to export history
      setExportHistory(prev => [{
        id: response.export_id,
        format: exportForm.getValues('format'),
        created_at: new Date().toISOString(),
        status: 'processing',
        download_url: response.download_url
      }, ...prev]);
    }
  });

  // Form handlers
  const handleExport = useCallback((data: ExportRequest) => {
    exportMutation.mutate(data);
  }, [exportMutation]);

  const handleScheduleReport = useCallback((data: any) => {
    // In a real implementation, this would create a scheduled report
    const newReport: ScheduledReport = {
      id: `report_${Date.now()}`,
      name: data.name,
      frequency: data.frequency,
      format: data.format,
      recipients: data.recipients.filter((email: string) => email.trim()),
      nextScheduled: getNextScheduledDate(data.frequency),
      status: 'active'
    };
    
    setScheduledReports(prev => [newReport, ...prev]);
    reportForm.reset();
  }, [reportForm]);

  const handleDownload = useCallback(async (exportId: string) => {
    try {
      const blob = await analyticsService.downloadExportFile(exportId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_export_${exportId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  // Helper functions
  const getNextScheduledDate = (frequency: string) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export & Reporting</h2>
          <p className="text-gray-600">
            Export analytics data and configure automated reporting
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">One-time Export</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="dashboard">Custom Dashboard</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        {/* One-time Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Export Analytics Data</h3>
            
            <form onSubmit={exportForm.handleSubmit(handleExport)} className="space-y-6">
              {/* Export Format */}
              <div>
                <Label className="text-base font-medium">Export Format</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  {EXPORT_FORMATS.map(format => {
                    const IconComponent = format.icon;
                    return (
                      <label key={format.value} className="relative">
                        <input
                          type="radio"
                          value={format.value}
                          {...exportForm.register('format')}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          exportForm.watch('format') === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                            <div>
                              <p className="font-medium">{format.label}</p>
                              <p className="text-sm text-gray-600">{format.description}</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Time Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_period">Time Period</Label>
                  <select
                    id="time_period"
                    {...exportForm.register('time_period')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DAY">Last Day</option>
                    <option value="WEEK">Last Week</option>
                    <option value="MONTH">Last Month</option>
                    <option value="QUARTER">Last Quarter</option>
                    <option value="YEAR">Last Year</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="template">Report Template</Label>
                  <select
                    id="template"
                    {...exportForm.register('template')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TEMPLATE_OPTIONS.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <Label className="text-base font-medium">Export Options</Label>
                <div className="space-y-3 mt-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...exportForm.register('include_charts')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include charts and visualizations (PDF only)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...exportForm.register('include_raw_data')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include raw data tables</span>
                  </label>
                </div>
              </div>

              {/* Custom Sections */}
              <div>
                <Label className="text-base font-medium">Custom Sections (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {[
                    'Performance Metrics',
                    'Conversion Funnel',
                    'Business Impact',
                    'Anomaly Detection',
                    'Trend Analysis',
                    'Recommendations'
                  ].map(section => (
                    <label key={section} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={section}
                        {...exportForm.register('custom_sections')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{section}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={exportMutation.isPending}
                  className="px-6"
                >
                  {exportMutation.isPending ? (
                    <>Generating Export...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          {/* Create Scheduled Report */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Scheduled Report</h3>
            
            <form onSubmit={reportForm.handleSubmit(handleScheduleReport)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    {...reportForm.register('name', { required: true })}
                    placeholder="e.g., Weekly Performance Report"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    {...reportForm.register('frequency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report_format">Format</Label>
                  <select
                    id="report_format"
                    {...reportForm.register('format')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="report_template">Template</Label>
                  <select
                    id="report_template"
                    {...reportForm.register('template')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TEMPLATE_OPTIONS.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="space-y-2 mt-2">
                  <Input
                    {...reportForm.register('recipients.0')}
                    placeholder="email@example.com"
                    type="email"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Add Recipient
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="px-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </form>
          </Card>

          {/* Existing Scheduled Reports */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scheduled Reports</h3>
            
            {scheduledReports.length > 0 ? (
              <div className="space-y-4">
                {scheduledReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.frequency} • {report.format.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">Recipients:</span>
                        <span className="ml-1">{report.recipients.length} recipients</span>
                      </div>
                      <div>
                        <span className="font-medium">Last Sent:</span>
                        <span className="ml-1">{report.lastSent ? formatDate(report.lastSent) : 'Never'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Next Scheduled:</span>
                        <span className="ml-1">{formatDate(report.nextScheduled)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Reports</h3>
                <p className="text-gray-600">Create your first scheduled report to receive automated analytics.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Custom Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Custom Dashboard Configuration</h3>
              <Button variant="outline" size="sm">
                <Layout className="w-4 h-4 mr-2" />
                Reset Layout
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Widget Library */}
              <div>
                <h4 className="font-medium mb-3">Available Widgets</h4>
                <div className="space-y-2">
                  {WIDGET_TYPES.map(widget => {
                    const IconComponent = widget.icon;
                    return (
                      <div
                        key={widget.type}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          // Add widget to dashboard
                          const newWidget: DashboardWidget = {
                            id: `widget_${Date.now()}`,
                            type: widget.type as any,
                            title: widget.label,
                            size: 'medium',
                            position: { x: 0, y: 0, width: 2, height: 2 },
                            config: {}
                          };
                          setDashboardWidgets(prev => [...prev, newWidget]);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">{widget.label}</p>
                            <p className="text-xs text-gray-600">{widget.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="lg:col-span-2">
                <h4 className="font-medium mb-3">Dashboard Preview</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-96">
                  {dashboardWidgets.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {dashboardWidgets.map(widget => (
                        <div
                          key={widget.id}
                          className={`bg-white border rounded-lg p-3 relative group ${
                            widget.size === 'small' ? 'col-span-1' :
                            widget.size === 'medium' ? 'col-span-2' : 'col-span-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{widget.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setDashboardWidgets(prev => prev.filter(w => w.id !== widget.id));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{widget.type} widget</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Drag widgets here to build your custom dashboard</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Save Dashboard Configuration
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Export History</h3>
            
            {exportHistory.length > 0 ? (
              <div className="space-y-4">
                {exportHistory.map(exportItem => (
                  <div key={exportItem.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{exportItem.format.toUpperCase()}</Badge>
                          <span className="text-sm text-gray-600">
                            {formatDate(exportItem.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Export ID: {exportItem.id}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {exportItem.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : exportItem.status === 'processing' ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm capitalize">{exportItem.status}</span>
                        </div>
                        
                        {exportItem.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(exportItem.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Export History</h3>
                <p className="text-gray-600">Your export history will appear here once you create your first export.</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}