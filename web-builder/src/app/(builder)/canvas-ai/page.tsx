'use client';

import React from 'react';
import { EnhancedCanvas } from '@/components/builder/EnhancedCanvas';
import { BuilderProvider } from '@/components/builder/BuilderProvider';
import { CanvasHeader } from '@/components/builder/CanvasHeader';

export default function CanvasAIPage() {
  return (
    <BuilderProvider>
      <div className="h-screen flex flex-col">
        <CanvasHeader />
        <div className="flex-1 overflow-hidden">
          <EnhancedCanvas className="h-full" />
        </div>
      </div>
    </BuilderProvider>
  );
}