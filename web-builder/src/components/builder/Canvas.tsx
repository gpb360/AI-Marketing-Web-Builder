'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData, DragItem, DropCollectedProps, DropResult } from '@/types/builder';
import { CanvasComponent } from './CanvasComponent';
import { DropZone } from './DropZone';
import { GridOverlay } from './GridOverlay';
import { SelectionBox } from './SelectionBox';
import { cn } from '@/lib/utils';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    components,
    selectedComponentId,
    canvasSize,
    zoom,
    gridEnabled,
    snapToGrid,
    addComponent,
    selectComponent,
    updateComponentPosition,
    getComponentById,
    setCanvasSize,
  } = useBuilderStore();

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, DropResult, DropCollectedProps>({
    accept: ['component', 'canvas-component'],
    drop: (item: DragItem, monitor): DropResult | undefined => {
      if (!monitor.didDrop()) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const position = {
            x: (offset.x - canvasRect.left) / zoom,
            y: (offset.y - canvasRect.top) / zoom,
          };

          if (snapToGrid) {
            position.x = Math.round(position.x / 20) * 20;
            position.y = Math.round(position.y / 20) * 20;
          }

          // If it's a new component from the palette
          if (item.type === 'component') {
            const newComponent: ComponentData = {
              id: `${item.componentType}-${Date.now()}`,
              type: item.componentType,
              name: item.name,
              props: { ...item.defaultProps },
              position,
              size: { width: 200, height: 100 },
              isConnectedToWorkflow: false,
            };

            addComponent(newComponent);
          }
          // If it's an existing canvas component being moved
          else if (item.type === 'canvas-component') {
            updateComponentPosition(item.id, position);
          }

          setIsDragging(false);
          return { 
            dropEffect: 'move', 
            position,
          };
        }
      }

      setIsDragging(false);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      // Track dragging state based on the monitor
      const dragState = monitor.getItem() !== null;
      if (dragState !== isDragging) {
        setIsDragging(dragState);
      }
    },
  });

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      selectComponent(null);
    }
  }, [selectComponent]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedComponentId) return;

    const selectedComponent = getComponentById(selectedComponentId);
    if (!selectedComponent) return;

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        useBuilderStore.getState().removeComponent(selectedComponentId);
        break;
      case 'ArrowUp':
        event.preventDefault();
        useBuilderStore.getState().moveComponent(selectedComponentId, 'up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        useBuilderStore.getState().moveComponent(selectedComponentId, 'down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        useBuilderStore.getState().moveComponent(selectedComponentId, 'left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        useBuilderStore.getState().moveComponent(selectedComponentId, 'right');
        break;
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          useBuilderStore.getState().duplicateComponent(selectedComponentId);
        }
        break;
    }
  }, [selectedComponentId, getComponentById]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-resize canvas based on content
  useEffect(() => {
    if (components.length === 0) return;

    const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
    const maxY = Math.max(...components.map(c => c.position.y + c.size.height));
    
    const newSize = {
      width: Math.max(canvasSize.width, maxX + 100),
      height: Math.max(canvasSize.height, maxY + 100),
    };

    if (newSize.width !== canvasSize.width || newSize.height !== canvasSize.height) {
      setCanvasSize(newSize);
    }
  }, [components, canvasSize, setCanvasSize]);

  drop(canvasRef);

  return (
    <div className={cn("relative overflow-auto bg-gray-50", className)}>
      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className={cn(
          "relative bg-white border-2 border-dashed transition-colors duration-200",
          isOver && canDrop ? "border-blue-400 bg-blue-50/50" : "border-gray-300",
          isDragging && "border-blue-400"
        )}
        style={{
          width: canvasSize.width * zoom,
          height: canvasSize.height * zoom,
          minWidth: '100%',
          minHeight: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid Overlay */}
        {gridEnabled && <GridOverlay zoom={zoom} />}

        {/* Drop Zones */}
        <DropZone
          id="main-canvas"
          accepts={['*']}
          className="absolute inset-0"
        />

        {/* Canvas Components */}
        {components.map((component) => (
          <CanvasComponent
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            zoom={zoom}
          />
        ))}

        {/* Selection Box */}
        {selectedComponentId && (
          <SelectionBox
            componentId={selectedComponentId}
            zoom={zoom}
          />
        )}

        {/* Drop Indicator */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
              Drop component here
            </div>
          </div>
        )}
      </div>

      {/* Canvas Info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 border">
        {components.length} components • {Math.round(zoom * 100)}% zoom
      </div>
    </div>
  );
}