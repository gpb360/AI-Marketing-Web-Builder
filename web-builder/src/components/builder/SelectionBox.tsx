'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';

interface SelectionBoxProps {
  componentId: string;
  zoom: number;
}

export function SelectionBox({ componentId }: SelectionBoxProps) {
  const component = useBuilderStore((state) => state.getComponentById(componentId));

  if (!component) return null;

  return (
    <div
      className="absolute border-2 border-blue-500 pointer-events-none"
      style={{
        left: component.position.x - 2,
        top: component.position.y - 2,
        width: component.size.width + 4,
        height: component.size.height + 4,
      }}
    />
  );
}