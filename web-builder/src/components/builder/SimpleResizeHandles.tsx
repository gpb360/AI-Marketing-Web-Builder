'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SimpleResizeHandlesProps {
  componentId: string;
  size: { width: number; height: number };
  onResize: (size: { width: number; height: number }) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  zoom: number;
  isContainer?: boolean;
}

type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 's';

export function SimpleResizeHandles({
  size,
  onResize,
  onResizeStart,
  onResizeEnd,
  zoom,
  isContainer = false,
}: SimpleResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [initialSize, setInitialSize] = useState(size);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [currentSize, setCurrentSize] = useState(size);

  const handleMouseDown = useCallback((direction: ResizeDirection) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialSize(size);
    setCurrentSize(size);
    setInitialMousePos({ x: event.clientX, y: event.clientY });
    onResizeStart();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = (moveEvent.clientX - initialMousePos.x) / zoom;
      const deltaY = (moveEvent.clientY - initialMousePos.y) / zoom;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;

      // Calculate new dimensions based on resize direction
      switch (direction) {
        case 'e':
          newWidth = Math.max(100, initialSize.width + deltaX);
          break;
        case 's':
          newHeight = Math.max(60, initialSize.height + deltaY);
          break;
        case 'se':
          newWidth = Math.max(100, initialSize.width + deltaX);
          newHeight = Math.max(60, initialSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, initialSize.width - deltaX);
          newHeight = Math.max(60, initialSize.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(100, initialSize.width + deltaX);
          newHeight = Math.max(60, initialSize.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(100, initialSize.width - deltaX);
          newHeight = Math.max(60, initialSize.height - deltaY);
          break;
      }

      setCurrentSize({ width: newWidth, height: newHeight });
      onResize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      onResizeEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, zoom, initialMousePos, initialSize, isResizing, onResize, onResizeStart, onResizeEnd]);

  // Define handles based on component type
  const handles: Array<{
    direction: ResizeDirection;
    className: string;
    cursor: string;
  }> = isContainer 
    ? [
        // For containers: corners + right and bottom edges
        { direction: 'se', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
        { direction: 'sw', className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'nesw-resize' },
        { direction: 'ne', className: 'top-0 right-0 translate-x-1/2 -translate-y-1/2', cursor: 'nesw-resize' },
        { direction: 'nw', className: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2', cursor: 'nwse-resize' },
        { direction: 'e', className: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2', cursor: 'ew-resize' },
        { direction: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', cursor: 'ns-resize' },
      ]
    : [
        // For other components: just the essential corner
        { direction: 'se', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
      ];

  const zoomScale = Math.max(0.5, 1 / zoom); // Ensure handles don't get too small

  return (
    <>
      {handles.map(({ direction, className, cursor }) => (
        <div
          key={direction}
          className={cn(
            "absolute w-3 h-3 bg-blue-500 border border-white rounded-full shadow-sm hover:bg-blue-600 hover:scale-110 transition-all duration-150",
            className,
            isResizing && resizeDirection === direction && "bg-blue-600 scale-110"
          )}
          style={{ 
            cursor,
            transform: `${className.split(' ').filter(c => c.includes('translate')).join(' ')} scale(${zoomScale})`,
          }}
          onMouseDown={handleMouseDown(direction)}
        />
      ))}
      
      {/* Resize overlay to prevent text selection during resize */}
      {isResizing && (
        <div 
          className="fixed inset-0 z-50"
          style={{ cursor: handles.find(h => h.direction === resizeDirection)?.cursor }}
        />
      )}
      
      {/* Size indicator during resize */}
      {isResizing && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-sm">
          {Math.round(currentSize.width)} × {Math.round(currentSize.height)}
        </div>
      )}
    </>
  );
}