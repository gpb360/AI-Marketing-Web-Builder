'use client';

import React from 'react';
import { VisualBuilder } from '@/components/builder/VisualBuilder';

export default function CanvasPage() {
  return (
    <div className="h-screen overflow-hidden">
      <VisualBuilder className="w-full h-full" />
    </div>
  );
}