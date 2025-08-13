/**
 * Export Reporting Component
 * 
 * Export reports in PDF and CSV formats with customizable templates and scheduling
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar, 
  Mail, 
  Settings, 
  Clock, 
  FileSpreadsheet,
  Image,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

// Types for export and reporting
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'detailed' | 'comparison' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  sections: string[];
  isDefault: boolean;
  lastUsed?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'error';
}

interface ExportJob {
  id: string;
  name: string;
  type: 'pdf' | 'csv' | 'excel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  completedTime?: string;
  downloadUrl?: string;
  fileSize?: number;
}

export const ExportReporting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'templates' | 'scheduled'>('export');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template-executive');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [exportJobId, setExportJobId] = useState<string | null>(null);

  // Mock data for report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'template-executive',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and insights',
      type: 'executive',
      format: 'pdf',
      sections: ['overview', 'key_metrics', 'trends', 'recommendations'],
      isDefault: true,
      lastUsed: '2024-01-20T10:30:00Z'
    },
    {
      id: 'template-detailed',
      name: 'Detailed Analytics Report',
      description: 'Comprehensive report with all metrics and analysis',
      type: 'detailed',
      format: 'pdf',
      sections: ['overview', 'performance', 'comparison', 'roi', 'workflows', 'alerts'],
      isDefault: false,
      lastUsed: '2024-01-18T14:15:00Z'
    },
    {
      id: 'template-comparison',
      name: 'A/B Test Comparison',
      description: 'Focused report on A/B testing results and statistical analysis',
      type: 'comparison',
      format: 'pdf',
      sections: ['test_overview', 'variants', 'results', 'recommendations'],
      isDefault: false
    },
    {
      id: 'template-data-export',
      name: 'Raw Data Export',
      description: 'Export raw analytics data for external analysis',
      type: 'custom',
      format: 'csv',
      sections: ['metrics', 'events', 'user_data'],
      isDefault: false,
      lastUsed: '2024-01-19T09:45:00Z'
    }
  ];

  // Mock scheduled reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'scheduled-001',
      name: 'Weekly Executive Report',
      templateId: 'template-executive',
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '09:00',
      recipients: ['ceo@company.com', 'cmo@company.com'],
      isActive: true,
      nextRun: '2024-01-22T09:00:00Z',
      lastRun: '2024-01-15T09:00:00Z',
      status: 'active'
    },
    {
      id: 'scheduled-002',
      name: 'Monthly Performance Review',
      templateId: 'template-detailed',
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '08:00',
      recipients: ['team@company.com'],
      isActive: true,
      nextRun: '2024-02-01T08:00:00Z',
      lastRun: '2024-01-01T08:00:00Z',
      status: 'active'
    }
  ]);

  // Mock export jobs
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'job-001',
      name: 'Executive Summary Report',
      type: 'pdf',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-20T15:30:00Z',
      completedTime: '2024-01-20T15:32:15Z',
      downloadUrl: '/reports/executive-summary-2024-01-20.pdf',
      fileSize: 2.4
    },
    {
      id: 'job-002',
      name: 'Analytics Data Export',
      type: 'csv',
      status: 'processing',
      progress: 65,
      startTime: '2024-01-20T16:00:00Z'
    }
  ]);

  // Handle export initiation
  const handleExport = () => {
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      name: `${reportTemplates.find(t => t.id === selectedTemplate)?.name} Export`,
      type: exportFormat,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    };

    setExportJobs(prev => [newJob, ...prev]);
    setExportJobId(newJob.id);

    // Simulate export progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? {
                ...job,
                status: 'completed',
                progress: 100,
                completedTime: new Date().toISOString(),
                downloadUrl: `/reports/${newJob.name.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`,
                fileSize: Math.random() * 5 + 1
              }
            : job
        ));
      } else {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress: Math.round(progress) } : job
        ));
      }
    }, 500);
  };

  // Render export tab
  const renderExportTab = () => (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Create and download custom analytics reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Report Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.format === 'pdf' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                        {template.name}
                        {template.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv' | 'excel') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Report
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV Data
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Workbook
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select defaultValue="30d">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workflows">Workflows</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workflows</SelectItem>
                  <SelectItem value="lead-gen">Lead Generation</SelectItem>
                  <SelectItem value="onboarding">Customer Onboarding</SelectItem>
                  <SelectItem value="email">Email Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Include Sections</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {['Overview', 'Performance Metrics', 'ROI Analysis', 'A/B Testing', 'Trends', 'Recommendations'].map(section => (
                <div key={section} className="flex items-center space-x-2">
                  <Checkbox id={section} defaultChecked />
                  <Label htmlFor={section} className="text-sm">{section}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Export Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {job.type === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                  <div>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Started {new Date(job.startTime).toLocaleString()}
                      {job.fileSize && ` • ${job.fileSize.toFixed(1)} MB`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {job.status === 'processing' && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm">{job.progress}%</span>
                    </div>
                  )}
                  
                  {job.status === 'completed' && (
                    <>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                  
                  {job.status === 'failed' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render scheduled reports tab
  const renderScheduledTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>
                Automate report generation and delivery
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map(report => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {reportTemplates.find(t => t.id === report.templateId)?.name} • 
                      {report.frequency} at {report.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {report.status}
                    </Badge>
                    <Switch checked={report.isActive} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Next Run:</span>
                    <div>{new Date(report.nextRun).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recipients:</span>
                    <div>{report.recipients.length} recipient(s)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Run:</span>
                    <div>{report.lastRun ? new Date(report.lastRun).toLocaleString() : 'Never'}</div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-1" />
                    Run Now
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

  // Render templates tab
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Templates
              </CardTitle>
              <CardDescription>
                Customize report layouts and content
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.format === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                      {template.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Sections:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.sections.map(section => (
                          <Badge key={section} variant="outline" className="text-xs">
                            {section.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {template.lastUsed && (
                      <div className="text-xs text-muted-foreground">
                        Last used: {new Date(template.lastUsed).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Image className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {!template.isDefault && (
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <Button 
          variant={activeTab === 'export' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('export')}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
        <Button 
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button 
          variant={activeTab === 'scheduled' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('scheduled')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Scheduled Reports
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'export' && renderExportTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'scheduled' && renderScheduledTab()}
    </div>
  );
};