/**
 * SLA Dashboard Page
 * 
 * Complete SLA management dashboard for Stories 3.3-3.6
 * Features: Predictive SLA monitoring, threshold optimization, and violation remediation workflows
 */

'use client';

import React from 'react';
import { SLADashboard } from '@/components/builder/SLADashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SLADashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">SLA Management Dashboard</h1>
                <Badge variant="outline" className="ml-2">Real-time</Badge>
              </div>
              <p className="text-gray-600">
                Comprehensive SLA monitoring with predictive analytics, threshold optimization, and automated violation remediation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/analytics-dashboard">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <SLADashboard workflowId={1} className="p-6" />
        </div>
      </div>
    </div>
  );
}