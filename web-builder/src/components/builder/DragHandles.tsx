'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Move } from 'lucide-react';

interface DragHandlesProps {
  isSelected: boolean;
  zoom: number;
}

export function DragHandles({ isSelected, zoom }: DragHandlesProps) {
  if (!isSelected) return null;

  const zoomScale = 1 / zoom;

  return (
    <>
      {/* Top drag handle */}
      <div
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-1 rounded shadow-lg cursor-move hover:bg-blue-600 transition-colors",
          "flex items-center gap-1 px-2 py-1"
        )}
        style={{
          transform: `translateX(-50%) scale(${zoomScale})`,
          transformOrigin: 'center bottom',
        }}
      >
        <Move className="w-3 h-3" />
        <span className="text-xs font-medium">Drag</span>
      </div>

      {/* Left drag handle */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded shadow-lg cursor-move hover:bg-blue-600 transition-colors",
          "flex items-center gap-1 px-2 py-1"
        )}
        style={{
          transform: `translateX(-100%) translateY(-50%) scale(${zoomScale}) translateX(-8px)`,
          transformOrigin: 'right center',
        }}
      >
        <Move className="w-3 h-3" />
      </div>

      {/* Right drag handle */}
      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded shadow-lg cursor-move hover:bg-blue-600 transition-colors",
          "flex items-center gap-1 px-2 py-1"
        )}
        style={{
          transform: `translateX(100%) translateY(-50%) scale(${zoomScale}) translateX(8px)`,
          transformOrigin: 'left center',
        }}
      >
        <Move className="w-3 h-3" />
      </div>
    </>
  );
}