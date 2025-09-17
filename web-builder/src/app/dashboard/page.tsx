'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <UserDashboard />
    </AuthGuard>
  );
}