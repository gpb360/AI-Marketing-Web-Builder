'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { VisualBuilder } from '@/components/builder/VisualBuilder';
import { useBuilderStore } from '@/store/builderStore';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function CanvasPage() {
  const searchParams = useSearchParams();
  const { currentTemplate, loadTemplate } = useBuilderStore();
  const templateId = searchParams.get('template');

  useEffect(() => {
    // If template ID is provided but no template is loaded, 
    // it might indicate a direct URL access or refresh
    if (templateId && !currentTemplate) {
      console.log('Template ID provided but no template loaded:', templateId);
      // In a real implementation, you might want to fetch the template by ID
      // For now, we'll redirect back to templates if no template is loaded
    }
  }, [templateId, currentTemplate]);

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen overflow-hidden">
        <VisualBuilder className="w-full h-full" />
      </div>
    </AuthGuard>
  );
}