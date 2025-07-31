'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  MousePointer,
  Award
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { templateApi } from '@/lib/api/services/templates';

interface OptimizationInsight {
  id: string;
  type: 'conversion' | 'engagement' | 'performance' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: string;
  effort: string;
  actionItems: string[];
}

interface PerformanceMetrics {
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageViews: number;
  trends: {
    conversion: number;
    bounce: number;
    duration: number;
  };
}

interface ABTestVariant {
  id: string;
  name: string;
  conversionRate: number;
  views: number;
  isWinner: boolean;
  isControl: boolean;
}

export function TemplateOptimizationPanel() {
  const { currentTemplate } = useBuilderStore();
  const [insights, setInsights] = useState<OptimizationInsight[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [abTests, setAbTests] = useState<ABTestVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'metrics' | 'ab-tests' | 'suggestions'>('insights');

  useEffect(() => {
    if (currentTemplate?.id) {
      loadOptimizationData();
    }
  }, [currentTemplate?.id]);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      const [insightsData, metricsData, abTestsData] = await Promise.all([
        templateApi.getOptimizationInsights(currentTemplate!.id),
        templateApi.getPerformanceMetrics(currentTemplate!.id),
        templateApi.getABTests(currentTemplate!.id)
      ]);

      setInsights(insightsData.insights || []);
      setMetrics(metricsData.metrics);
      setAbTests(abTestsData.tests?.[0]?.variants || []);
    } catch (error) {
      console.error('Failed to load optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversion': return Target;
      case 'engagement': return Users;
      case 'performance': return Activity;
      case 'content': return Lightbulb;
      default: return AlertCircle;
    }
  };

  const mockMetricsData = [
    { date: 'Mon', views: 120, conversions: 18, rate: 15 },
    { date: 'Tue', views: 150, conversions: 25, rate: 16.7 },
    { date: 'Wed', views: 180, conversions: 30, rate: 16.7 },
    { date: 'Thu', views: 200, conversions: 35, rate: 17.5 },
    { date: 'Fri', views: 220, conversions: 40, rate: 18.2 },
    { date: 'Sat', views: 190, conversions: 32, rate: 16.8 },
    { date: 'Sun', views: 160, conversions: 28, rate: 17.5 },
  ];

  const renderInsights = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Optimization Insights</h3>
        <button
          onClick={() => loadOptimizationData()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <AnimatePresence>
        {insights.map((insight) => {
          const Icon = getTypeIcon(insight.type);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <span className="text-xs uppercase font-semibold">
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      Impact: {insight.estimatedImpact}
                    </span>
                    <span className="text-gray-500">
                      Effort: {insight.effort}
                    </span>
                  </div>
                  {insight.actionItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Action items:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {insight.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {insights.length === 0 && !loading && (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No optimization insights available yet.</p>
        </div>
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Conversion Rate</h4>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics?.conversionRate || 15.2}%
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            metrics?.trends.conversion > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {metrics?.trends.conversion > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(metrics?.trends.conversion || 5.2)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Bounce Rate</h4>
            <MousePointer className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics?.bounceRate || 42.3}%
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            metrics?.trends.bounce < 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {metrics?.trends.bounce < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {Math.abs(metrics?.trends.bounce || -2.1)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Avg. Session</h4>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics?.avgSessionDuration || 2.3}m
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            metrics?.trends.duration > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {metrics?.trends.duration > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(metrics?.trends.duration || 8.5)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Page Views</h4>
            <Eye className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics?.pageViews || 1.2}k
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            12.5%
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Performance Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockMetricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderABTests = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">A/B Tests</h3>
        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          Create Test
        </button>
      </div>

      {abTests.length > 0 ? (
        <div className="space-y-3">
          {abTests.map((test) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{test.name}</h4>
                  <p className="text-sm text-gray-600">{test.views} views, {test.conversions} conversions</p>
                </div>
                {test.isWinner && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Winner</span>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    test.isControl ? 'bg-gray-400' : 
                    test.isWinner ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(test.conversionRate / Math.max(...abTests.map(t => t.conversionRate))) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-900">{test.conversionRate.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">{test.isControl ? 'Control' : 'Variant'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No A/B tests running</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Start your first test
          </button>
        </div>
      )}
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Content Suggestions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Generate More
        </button>
      </div>

      <div className="space-y-3">
        {[
          {
            type: 'Headline',
            suggestion: 'Transform your business with our proven solution',
            impact: '+23% conversion',
            category: 'copy'
          },
          {
            type: 'CTA Button',
            suggestion: 'Start Free Trial →',
            impact: '+15% clicks',
            category: 'design'
          },
          {
            type: 'Social Proof',
            suggestion: 'Join 10,000+ satisfied customers',
            impact: '+18% trust',
            category: 'content'
          },
          {
            type: 'Color Scheme',
            suggestion: 'Use contrasting colors for CTAs',
            impact: '+12% visibility',
            category: 'design'
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-blue-600 uppercase">{item.type}</span>
                <p className="text-sm text-gray-900 mt-1">{item.suggestion}</p>
                <div className="mt-2">
                  <span className="text-xs text-green-600 font-medium">{item.impact}</span>
                </div>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700">Apply</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Template Optimization</h2>
        <p className="text-sm text-gray-600 mt-1">AI-powered insights and A/B testing</p>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'insights', label: 'Insights' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'ab-tests', label: 'A/B Tests' },
            { id: 'suggestions', label: 'Suggestions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'insights' && renderInsights()}
              {activeTab === 'metrics' && renderMetrics()}
              {activeTab === 'ab-tests' && renderABTests()}
              {activeTab === 'suggestions' && renderSuggestions()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}