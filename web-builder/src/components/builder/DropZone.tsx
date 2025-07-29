'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  id: string;
  accepts: string[];
  className?: string;
  children?: React.ReactNode;
  onDrop?: (item: any) => void;
}

export function DropZone({ id, accepts, className, children, onDrop }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: accepts.includes('*') ? ['component', 'canvas-component'] : accepts,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onDrop?.(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={cn(
        "transition-colors duration-200",
        isOver && canDrop && "bg-blue-100/50 border-blue-300",
        className
      )}
    >
      {children}
    </div>
  );
}