'use client';

import React from 'react';

interface GridOverlayProps {
  zoom: number;
  gridSize?: number;
}

export function GridOverlay({ zoom, gridSize = 20 }: GridOverlayProps) {
  const scaledGridSize = gridSize * zoom;

  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e5e7eb 1px, transparent 1px),
          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
        `,
        backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
      }}
    />
  );
}