'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EnhancedCanvas } from '@/components/builder/EnhancedCanvas';
import { BuilderToolbar } from '@/components/builder/BuilderToolbar';

export default function CanvasAIPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        <BuilderToolbar />
        <div className="flex-1 overflow-hidden">
          <EnhancedCanvas className="h-full" />
        </div>
      </div>
    </DndProvider>
  );
}