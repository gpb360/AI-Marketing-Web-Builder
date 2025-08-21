'use client';

import React from 'react';
import { Canvas } from './Canvas';
import { ResponsiveControls } from './ResponsiveControls';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';

interface ResponsiveCanvasProps {
  className?: string;
  onComponentSelect?: (componentId: string | null) => void;
  showControls?: boolean;
}

export function ResponsiveCanvas({ 
  className, 
  onComponentSelect, 
  showControls = true 
}: ResponsiveCanvasProps) {
  const {
    viewport,
    responsiveSettings,
    setViewport,
    setResponsiveSettings,
  } = useBuilderStore();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Responsive Controls */}
      {showControls && (
        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
          <ResponsiveControls
            viewport={viewport}
            settings={responsiveSettings}
            onViewportChange={setViewport}
            onSettingsChange={setResponsiveSettings}
          />
        </div>
      )}

      {/* Canvas Container */}
      <div className={cn(
        "flex-1 overflow-auto",
        viewport.currentBreakpoint !== 'desktop' ? "bg-gray-100" : "bg-gray-50"
      )}>
        <Canvas
          className="w-full h-full"
          onComponentSelect={onComponentSelect}
        />
      </div>

      {/* Mobile Preview Indicators */}
      {viewport.currentBreakpoint === 'mobile' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Mobile Preview Mode
          {responsiveSettings.simulateTouch && (
            <span className="text-blue-300">• Touch Simulation</span>
          )}
        </div>
      )}
    </div>
  );
}