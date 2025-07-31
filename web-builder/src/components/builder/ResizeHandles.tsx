'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Move } from 'lucide-react';

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

  const handles: Array<{
    direction: ResizeDirection;
    className: string;
    cursor: string;
    label: string;
  }> = [
    { direction: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1', cursor: 'ns-resize', label: 'n' },
    { direction: 'ne', className: 'top-0 right-0 -translate-y-1 translate-x-1', cursor: 'nesw-resize', label: 'ne' },
    { direction: 'e', className: 'top-1/2 right-0 -translate-y-1/2 translate-x-1', cursor: 'ew-resize', label: 'e' },
    { direction: 'se', className: 'bottom-0 right-0 translate-y-1 translate-x-1', cursor: 'nwse-resize', label: 'se' },
    { direction: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1', cursor: 'ns-resize', label: 's' },
    { direction: 'sw', className: 'bottom-0 left-0 translate-y-1 -translate-x-1', cursor: 'nesw-resize', label: 'sw' },
    { direction: 'w', className: 'top-1/2 left-0 -translate-y-1/2 -translate-x-1', cursor: 'ew-resize', label: 'w' },
    { direction: 'nw', className: 'top-0 left-0 -translate-y-1 -translate-x-1', cursor: 'nwse-resize', label: 'nw' },
  ];

  const zoomScale = 1 / zoom;

  return (
    <>
      {handles.map(({ direction, className, cursor, label }) => (
        <div
          key={direction}
          className={cn(
            "absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-150 hover:scale-125",
            className,
            isResizing && resizeDirection === direction && "bg-blue-600 scale-125"
          )}
          style={{ 
            cursor,
            transform: `scale(${zoomScale}) ${className.includes('translate') ? className.split(' ').find(c => c.includes('translate')) || '' : ''}`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
          }}
          onMouseDown={handleMouseDown(direction)}
        >
          {/* Visual indicator for corners */}
          {(direction === 'se' || direction === 'nw' || direction === 'ne' || direction === 'sw') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          )}
          
          {/* Tooltip for resize direction */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Resize {label}
          </div>
        </div>
      ))}
      
      {/* Resize overlay to prevent text selection */}
      {isResizing && (
        <div 
          className="fixed inset-0 z-50"
          style={{ cursor: handles.find(h => h.direction === resizeDirection)?.cursor }}
        />
      )}
      
      {/* Size indicator during resize */}
      {isResizing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
          {Math.round(currentSize.width)} × {Math.round(currentSize.height)}
        </div>
      )}
    </>
  );
}