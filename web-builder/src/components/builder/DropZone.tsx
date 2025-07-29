'use client';

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  id: string;
  accepts: string[];
  className?: string;
  children?: React.ReactNode;
  onDrop?: (item: any) => void;
}

export function DropZone({ accepts, className, children, onDrop }: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  
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

  // Apply the drop ref
  drop(ref);

  return (
    <div
      ref={ref}
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