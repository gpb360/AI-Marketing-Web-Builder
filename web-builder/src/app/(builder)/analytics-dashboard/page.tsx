/**
 * Analytics Dashboard Page - Story 3.3 Implementation
 * 
 * Comprehensive workflow performance analytics with drill-down capabilities
 * Features: conversion rates, engagement metrics, time savings, ROI analysis
 */

'use client';

import React from 'react';
import { ComprehensiveAnalyticsDashboard } from '@/components/analytics/ComprehensiveAnalyticsDashboard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <Badge variant="secondary" className="ml-2">Story 3.3</Badge>
              </div>
              <p className="text-gray-600 text-lg">
                Comprehensive workflow performance analytics with ROI tracking and optimization insights
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/sla-dashboard">
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  SLA Dashboard
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Performance Overview</h3>
                <p className="text-sm text-gray-600">Real-time metrics and trends</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">ROI Analysis</h3>
                <p className="text-sm text-gray-600">Business impact assessment</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>
                <p className="text-sm text-gray-600">User journey optimization</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Main Analytics Dashboard */}
        <div className="bg-white rounded-lg shadow-sm">
          <ComprehensiveAnalyticsDashboard 
            detailed={true}
            timeRange="30d"
          />
        </div>

        {/* Additional Context */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Story 3.3: Performance Analytics Dashboard</h4>
              <p className="text-blue-700 text-sm">
                This dashboard provides comprehensive workflow performance analytics including conversion rates, 
                engagement metrics, time savings calculations, and ROI analysis with drill-down capabilities. 
                Data is updated in real-time and includes A/B testing insights and optimization recommendations.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-blue-600">✅ Conversion tracking</span>
                <span className="text-blue-600">✅ ROI calculations</span>
                <span className="text-blue-600">✅ Performance monitoring</span>
                <span className="text-blue-600">✅ Export capabilities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}