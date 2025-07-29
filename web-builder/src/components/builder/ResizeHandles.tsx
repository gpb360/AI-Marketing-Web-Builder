'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandlesProps {
  componentId: string;
  size: { width: number; height: number };
  onResize: (size: { width: number; height: number }) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  zoom: number;
}

type ResizeDirection = 
  | 'n' | 'ne' | 'e' | 'se' 
  | 's' | 'sw' | 'w' | 'nw';

export function ResizeHandles({
  size,
  onResize,
  onResizeStart,
  onResizeEnd,
  zoom,
}: ResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [initialSize, setInitialSize] = useState(size);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((direction: ResizeDirection) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialSize(size);
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
          newWidth = Math.max(40, initialSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(40, initialSize.width - deltaX);
          break;
        case 's':
          newHeight = Math.max(40, initialSize.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(40, initialSize.height - deltaY);
          break;
        case 'se':
          newWidth = Math.max(40, initialSize.width + deltaX);
          newHeight = Math.max(40, initialSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(40, initialSize.width - deltaX);
          newHeight = Math.max(40, initialSize.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(40, initialSize.width + deltaX);
          newHeight = Math.max(40, initialSize.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(40, initialSize.width - deltaX);
          newHeight = Math.max(40, initialSize.height - deltaY);
          break;
      }

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

  const handles: Array<{
    direction: ResizeDirection;
    className: string;
    cursor: string;
  }> = [
    { direction: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1', cursor: 'ns-resize' },
    { direction: 'ne', className: 'top-0 right-0 -translate-y-1 translate-x-1', cursor: 'nesw-resize' },
    { direction: 'e', className: 'top-1/2 right-0 -translate-y-1/2 translate-x-1', cursor: 'ew-resize' },
    { direction: 'se', className: 'bottom-0 right-0 translate-y-1 translate-x-1', cursor: 'nwse-resize' },
    { direction: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1', cursor: 'ns-resize' },
    { direction: 'sw', className: 'bottom-0 left-0 translate-y-1 -translate-x-1', cursor: 'nesw-resize' },
    { direction: 'w', className: 'top-1/2 left-0 -translate-y-1/2 -translate-x-1', cursor: 'ew-resize' },
    { direction: 'nw', className: 'top-0 left-0 -translate-y-1 -translate-x-1', cursor: 'nwse-resize' },
  ];

  return (
    <>
      {handles.map(({ direction, className, cursor }) => (
        <div
          key={direction}
          className={cn(
            "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-sm hover:bg-blue-600 transition-colors duration-150",
            className,
            isResizing && resizeDirection === direction && "bg-blue-600"
          )}
          style={{ 
            cursor,
            transform: `scale(${1 / zoom}) ${className.includes('translate') ? className.split(' ').find(c => c.includes('translate')) || '' : ''}`,
          }}
          onMouseDown={handleMouseDown(direction)}
        />
      ))}
      
      {/* Resize overlay to prevent text selection */}
      {isResizing && (
        <div 
          className="fixed inset-0 z-50"
          style={{ cursor: handles.find(h => h.direction === resizeDirection)?.cursor }}
        />
      )}
    </>
  );
}