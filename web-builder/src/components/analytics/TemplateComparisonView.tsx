/**
 * Template Comparison View
 * Compare performance metrics across multiple templates
 */

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Equal,
  Crown,
  Users,
  Star,
  Zap,
  Target,
  Search,
  Plus,
  X,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useTemplateComparison } from '@/hooks/useTemplateAnalytics';
import type { TemplateComparisonData } from '@/lib/api/services/template-analytics';

interface Template {
  id: number;
  name: string;
  category: string;
}

interface TemplateComparisonViewProps {
  availableTemplates?: Template[];
  preselectedTemplates?: number[];
}

const MetricCard = ({ 
  title, 
  icon, 
  templateA, 
  templateB, 
  winner, 
  unit = '' 
}: {
  title: string;
  icon: React.ReactNode;
  templateA: number;
  templateB: number;
  winner: 'A' | 'B' | 'tie';
  unit?: string;
}) => {
  const getWinnerIcon = () => {
    switch (winner) {
      case 'A':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'B':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Equal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getValueColor = (isWinner: boolean, isTie: boolean) => {
    if (isTie) return 'text-gray-600';
    return isWinner ? 'text-green-600 font-bold' : 'text-gray-600';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-medium text-sm">{title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            {getWinnerIcon()}
            {winner !== 'tie' && <Crown className="h-3 w-3 text-yellow-500" />}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Template A</span>
            <span className={`font-mono ${getValueColor(winner === 'A', winner === 'tie')}`}>
              {templateA.toFixed(1)}{unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Template B</span>
            <span className={`font-mono ${getValueColor(winner === 'B', winner === 'tie')}`}>
              {templateB.toFixed(1)}{unit}
            </span>
          </div>
          
          {/* Visual comparison bar */}
          <div className="relative h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="absolute h-2 bg-green-500 rounded-full"
              style={{
                width: `${Math.max(templateA, templateB) > 0 ? (templateA / Math.max(templateA, templateB)) * 50 : 0}%`
              }}
            />
            <div
              className="absolute h-2 bg-blue-500 rounded-full right-0"
              style={{
                width: `${Math.max(templateA, templateB) > 0 ? (templateB / Math.max(templateA, templateB)) * 50 : 0}%`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TemplateComparisonView({
  availableTemplates = [],
  preselectedTemplates = []
}: TemplateComparisonViewProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>(preselectedTemplates);
  const [selectedMetrics, setSelectedMetrics] = useState<Array<'adoption' | 'success' | 'satisfaction' | 'technical'>>([
    'adoption',
    'success'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'radar'>('cards');

  const { comparison, loading, error, compare } = useTemplateComparison();

  const filteredTemplates = availableTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = useCallback((templateId: number) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else if (prev.length < 5) { // Limit to 5 templates for comparison
        return [...prev, templateId];
      }
      return prev;
    });
  }, []);

  const handleMetricToggle = useCallback((metric: 'adoption' | 'success' | 'satisfaction' | 'technical') => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  }, []);

  const runComparison = useCallback(async () => {
    if (selectedTemplates.length < 2) return;
    await compare(selectedTemplates, selectedMetrics);
  }, [selectedTemplates, selectedMetrics, compare]);

  const getTemplateInfo = (templateId: number) => {
    return availableTemplates.find(t => t.id === templateId);
  };

  // Transform data for charts
  const getChartData = () => {
    if (!comparison) return [];
    
    return comparison.map((comp, index) => {
      const templateAInfo = getTemplateInfo(comp.templateA);
      const templateBInfo = getTemplateInfo(comp.templateB);
      
      return {
        comparison: `${templateAInfo?.name || `Template ${comp.templateA}`} vs ${templateBInfo?.name || `Template ${comp.templateB}`}`,
        adoptionA: comp.metrics.adoptionRate.a,
        adoptionB: comp.metrics.adoptionRate.b,
        successA: comp.metrics.successRate.a,
        successB: comp.metrics.successRate.b,
        satisfactionA: comp.metrics.userSatisfaction.a,
        satisfactionB: comp.metrics.userSatisfaction.b,
        technicalA: comp.metrics.technicalScore.a,
        technicalB: comp.metrics.technicalScore.b,
      };
    });
  };

  const getRadarData = () => {
    if (!comparison || comparison.length === 0) return [];
    
    const comp = comparison[0]; // Show first comparison for radar
    return [
      {
        metric: 'Adoption Rate',
        A: comp.metrics.adoptionRate.a,
        B: comp.metrics.adoptionRate.b,
      },
      {
        metric: 'Success Rate',
        A: comp.metrics.successRate.a,
        B: comp.metrics.successRate.b,
      },
      {
        metric: 'User Satisfaction',
        A: comp.metrics.userSatisfaction.a,
        B: comp.metrics.userSatisfaction.b,
      },
      {
        metric: 'Technical Score',
        A: comp.metrics.technicalScore.a,
        B: comp.metrics.technicalScore.b,
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Comparison</h2>
          <p className="text-muted-foreground">Compare performance metrics across templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: 'cards' | 'chart' | 'radar') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="chart">Charts</SelectItem>
              <SelectItem value="radar">Radar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Templates to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Selected Templates */}
          {selectedTemplates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTemplates.map(templateId => {
                const template = getTemplateInfo(templateId);
                return (
                  <Badge key={templateId} variant="secondary" className="flex items-center space-x-1">
                    <span>{template?.name || `Template ${templateId}`}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTemplateSelect(templateId)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Available Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedTemplates.includes(template.id) ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.category}</p>
                  </div>
                  {selectedTemplates.includes(template.id) ? (
                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Metrics to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'adoption' as const, label: 'Adoption Rate', icon: <Users className="h-4 w-4" /> },
              { key: 'success' as const, label: 'Success Rate', icon: <Target className="h-4 w-4" /> },
              { key: 'satisfaction' as const, label: 'User Satisfaction', icon: <Star className="h-4 w-4" /> },
              { key: 'technical' as const, label: 'Technical Score', icon: <Zap className="h-4 w-4" /> },
            ].map(metric => (
              <div key={metric.key} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.key}
                  checked={selectedMetrics.includes(metric.key)}
                  onCheckedChange={() => handleMetricToggle(metric.key)}
                />
                <Label htmlFor={metric.key} className="flex items-center space-x-2 cursor-pointer">
                  {metric.icon}
                  <span>{metric.label}</span>
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button
              onClick={runComparison}
              disabled={selectedTemplates.length < 2 || selectedMetrics.length === 0 || loading}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{loading ? 'Comparing...' : 'Compare Templates'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load comparison data</p>
          </CardContent>
        </Card>
      )}

      {comparison && comparison.length > 0 && (
        <div className="space-y-6">
          {viewMode === 'cards' && (
            <div className="space-y-6">
              {comparison.map((comp, index) => {
                const templateAInfo = getTemplateInfo(comp.templateA);
                const templateBInfo = getTemplateInfo(comp.templateB);
                
                return (
                  <Card key={`${comp.templateA}-${comp.templateB}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-green-600">{templateAInfo?.name || `Template ${comp.templateA}`}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="text-blue-600">{templateBInfo?.name || `Template ${comp.templateB}`}</span>
                        </div>
                        <Badge variant="outline">
                          Confidence: {(comp.confidence * 100).toFixed(0)}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <MetricCard
                          title="Adoption Rate"
                          icon={<Users className="h-4 w-4 text-blue-500" />}
                          templateA={comp.metrics.adoptionRate.a}
                          templateB={comp.metrics.adoptionRate.b}
                          winner={comp.metrics.adoptionRate.winner}
                          unit="%"
                        />
                        <MetricCard
                          title="Success Rate"
                          icon={<Target className="h-4 w-4 text-green-500" />}
                          templateA={comp.metrics.successRate.a}
                          templateB={comp.metrics.successRate.b}
                          winner={comp.metrics.successRate.winner}
                          unit="%"
                        />
                        <MetricCard
                          title="User Satisfaction"
                          icon={<Star className="h-4 w-4 text-yellow-500" />}
                          templateA={comp.metrics.userSatisfaction.a}
                          templateB={comp.metrics.userSatisfaction.b}
                          winner={comp.metrics.userSatisfaction.winner}
                          unit="/5"
                        />
                        <MetricCard
                          title="Technical Score"
                          icon={<Zap className="h-4 w-4 text-purple-500" />}
                          templateA={comp.metrics.technicalScore.a}
                          templateB={comp.metrics.technicalScore.b}
                          winner={comp.metrics.technicalScore.winner}
                        />
                      </div>
                      
                      {comp.recommendation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-1">Recommendation</h4>
                          <p className="text-sm text-blue-800">{comp.recommendation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {viewMode === 'chart' && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="comparison" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="adoptionA" fill="#10b981" name="Adoption A" />
                    <Bar dataKey="adoptionB" fill="#3b82f6" name="Adoption B" />
                    <Bar dataKey="successA" fill="#f59e0b" name="Success A" />
                    <Bar dataKey="successB" fill="#ef4444" name="Success B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {viewMode === 'radar' && comparison.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Template A" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Radar name="Template B" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}