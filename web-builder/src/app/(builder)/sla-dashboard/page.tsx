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

export default function SLADashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SLA Management Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive SLA monitoring with predictive analytics, threshold optimization, and automated violation remediation
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <SLADashboard workflowId={1} className="p-6" />
        </div>
      </div>
    </div>
  );
}