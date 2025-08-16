'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { AICustomizationPanel } from './AICustomizationPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { cn } from '@/lib/utils';

interface VisualBuilderProps {
  className?: string;
}

export function VisualBuilder({ className }: VisualBuilderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("h-screen bg-gray-800 flex flex-col", className)}>
        {/* Toolbar */}
        <BuilderToolbar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Palette */}
          <ComponentPalette />

          {/* Canvas Area */}
          <Canvas className="flex-1" />

          {/* AI Customization Panel */}
          <AICustomizationPanel />
        </div>
      </div>
    </DndProvider>
  );
}