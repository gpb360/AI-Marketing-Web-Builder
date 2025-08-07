'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  isEmpty?: boolean;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

export function SimpleContainer({
  children,
  className,
  style,
  isSelected = false,
  isEmpty = false,
  onDrop,
  onDragOver,
}: SimpleContainerProps) {
  return (
    <div
      className={cn(
        // Base container styles
        "relative min-h-[120px] w-full rounded-lg transition-all duration-200",
        
        // Empty state styling
        isEmpty && [
          "border-2 border-dashed border-gray-300",
          "bg-gray-50/50",
          "flex items-center justify-center"
        ],
        
        // With content styling
        !isEmpty && [
          "border border-gray-200",
          "bg-white"
        ],
        
        // Selection state
        isSelected && "ring-2 ring-blue-500",
        
        // Hover state for empty containers
        isEmpty && "hover:border-blue-300 hover:bg-blue-50/30",
        
        // Custom classes
        className
      )}
      style={style}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {isEmpty ? (
        <div className="text-center p-8">
          <div className="text-gray-400 text-sm font-medium mb-2">
            Container Section
          </div>
          <div className="text-gray-500 text-xs">
            Drop components here to build your layout
          </div>
        </div>
      ) : (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Predefined container variants for common use cases
export const ContainerVariants = {
  // Clean section container
  section: "bg-white border border-gray-200 rounded-lg p-6",
  
  // Hero section container  
  hero: "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-8",
  
  // Feature section container
  feature: "bg-gray-50 border border-gray-200 rounded-lg p-6",
  
  // CTA section container
  cta: "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8",
  
  // Testimonial section container
  testimonial: "bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm",
  
  // Footer section container
  footer: "bg-gray-900 text-white rounded-lg p-8",
} as const;

export type ContainerVariant = keyof typeof ContainerVariants;