'use client';

import React from 'react';
import { Canvas } from './Canvas';
import { ComponentPalette } from './ComponentPalette';
import { useBuilderStore } from '@/store/builderStore';

export function BuilderDemo() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Component Palette */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Components</h2>
          <ComponentPalette />
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1">
        <Canvas />
      </div>
    </div>
  );
}