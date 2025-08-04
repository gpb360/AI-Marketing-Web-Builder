'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData, DragItem, DropCollectedProps, DropResult } from '@/types/builder';
import CanvasComponent from './CanvasComponent';
import { DropZone } from './DropZone';
import { GridOverlay } from './GridOverlay';
import { SelectionBox } from './SelectionBox';
import { cn } from '@/lib/utils';

interface CanvasProps {
  className?: string;
}

// PERFORMANCE: Memoized CanvasComponent to prevent unnecessary re-renders
const MemoizedCanvasComponent = React.memo(CanvasComponent, (prevProps, nextProps) => {
  return (
    prevProps.component.id === nextProps.component.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.component.position.x === nextProps.component.position.x &&
    prevProps.component.position.y === nextProps.component.position.y &&
    prevProps.component.size.width === nextProps.component.size.width &&
    prevProps.component.size.height === nextProps.component.size.height &&
    JSON.stringify(prevProps.component.props) === JSON.stringify(nextProps.component.props)
  );
});

// PERFORMANCE: Memoized SelectionBox to prevent re-renders
const MemoizedSelectionBox = React.memo(SelectionBox, (prevProps, nextProps) => {
  return (
    prevProps.componentId === nextProps.componentId &&
    prevProps.zoom === nextProps.zoom
  );
});

// PERFORMANCE: Virtual viewport for large component counts
function useVirtualCanvas(components: ComponentData[], canvasSize: { width: number; height: number }) {
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  
  // PERFORMANCE: Only render components within or near the viewport
  const visibleComponents = useMemo(() => {
    if (components.length <= 20) {
      // For small component counts, render all
      return components;
    }
    
    const buffer = 200; // Render components slightly outside viewport
    return components.filter(component => {
      const compRight = component.position.x + component.size.width;
      const compBottom = component.position.y + component.size.height;
      
      return (
        component.position.x < viewport.x + viewport.width + buffer &&
        compRight > viewport.x - buffer &&
        component.position.y < viewport.y + viewport.height + buffer &&
        compBottom > viewport.y - buffer
      );
    });
  }, [components, viewport]);
  
  return { visibleComponents, setViewport };
}

// PERFORMANCE: Throttled canvas size calculation
function useThrottledCanvasResize(components: ComponentData[], canvasSize: { width: number; height: number }, setCanvasSize: (size: { width: number; height: number }) => void) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (components.length === 0) return;

    // PERFORMANCE: Throttle canvas resize calculations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
      const maxY = Math.max(...components.map(c => c.position.y + c.size.height));
      
      const newSize = {
        width: Math.max(canvasSize.width, maxX + 100),
        height: Math.max(canvasSize.height, maxY + 100),
      };

      if (newSize.width !== canvasSize.width || newSize.height !== canvasSize.height) {
        setCanvasSize(newSize);
      }
    }, 100); // Throttle to 100ms
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [components, canvasSize, setCanvasSize]);
}

export const Canvas = React.memo(function Canvas({ className }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  
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

  // PERFORMANCE: Virtual canvas for large component counts
  const { visibleComponents } = useVirtualCanvas(components, canvasSize);
  
  // PERFORMANCE: Throttled canvas resize
  useThrottledCanvasResize(components, canvasSize, setCanvasSize);

  // PERFORMANCE: Memoized drag handlers to prevent recreation
  const handleDrop = useCallback((item: DragItem, monitor: any): DropResult | undefined => {
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
        setDragPosition(null);
        
        return { 
          dropEffect: 'move', 
          position,
        };
      }
    }

    setIsDragging(false);
    setDragPosition(null);
    return undefined;
  }, [zoom, snapToGrid, addComponent, updateComponentPosition]);

  // PERFORMANCE: Optimized hover handler with throttling
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const handleHover = useCallback((item: DragItem, monitor: any) => {
    // Clear previous timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Throttle hover updates to improve performance
    hoverTimeoutRef.current = setTimeout(() => {
      const dragState = monitor.getItem() !== null;
      if (dragState !== isDragging) {
        setIsDragging(dragState);
      }

      // Update drag position for preview
      if (dragState) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const position = {
            x: (offset.x - canvasRect.left) / zoom,
            y: (offset.y - canvasRect.top) / zoom,
          };
          setDragPosition(position);
        }
      }
    }, 16); // Throttle to ~60fps
  }, [isDragging, zoom]);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, DropResult, DropCollectedProps>({
    accept: ['component', 'canvas-component'],
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: handleHover,
  });

  // PERFORMANCE: Memoized click handler
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      selectComponent(null);
    }
  }, [selectComponent]);

  // PERFORMANCE: Optimized keyboard handler with memoization
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedComponentId) return;

    const selectedComponent = getComponentById(selectedComponentId);
    if (!selectedComponent) return;

    // Prevent default for handled keys
    const handledKeys = ['Delete', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (handledKeys.includes(event.key) || (event.key === 'd' && (event.ctrlKey || event.metaKey))) {
      event.preventDefault();
    }

    const store = useBuilderStore.getState();
    
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        store.removeComponent(selectedComponentId);
        break;
      case 'ArrowUp':
        store.moveComponent(selectedComponentId, 'up');
        break;
      case 'ArrowDown':
        store.moveComponent(selectedComponentId, 'down');
        break;
      case 'ArrowLeft':
        store.moveComponent(selectedComponentId, 'left');
        break;
      case 'ArrowRight':
        store.moveComponent(selectedComponentId, 'right');
        break;
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          store.duplicateComponent(selectedComponentId);
        }
        break;
    }
  }, [selectedComponentId, getComponentById]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // PERFORMANCE: Cleanup hover timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  drop(canvasRef);

  // PERFORMANCE: Memoized canvas stats
  const canvasStats = useMemo(() => ({
    total: components.length,
    visible: visibleComponents.length,
    zoom: Math.round(zoom * 100)
  }), [components.length, visibleComponents.length, zoom]);

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
        {/* Grid Overlay - PERFORMANCE: Only render when enabled */}
        {gridEnabled && <GridOverlay zoom={zoom} />}

        {/* Drop Zones */}
        <DropZone
          id="main-canvas"
          accepts={['*']}
          className="absolute inset-0"
        />

        {/* Canvas Components - PERFORMANCE: Only render visible components */}
        {visibleComponents.map((component) => (
          <MemoizedCanvasComponent
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            zoom={zoom}
          />
        ))}

        {/* Selection Box - PERFORMANCE: Only render when component selected */}
        {selectedComponentId && (
          <MemoizedSelectionBox
            componentId={selectedComponentId}
            zoom={zoom}
          />
        )}

        {/* Drag Preview - PERFORMANCE: Only render during drag */}
        {isDragging && dragPosition && (
          <div 
            className="absolute pointer-events-none bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-lg"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
              width: 200,
              height: 100,
              zIndex: 1000,
            }}
          />
        )}

        {/* Drop Indicator - PERFORMANCE: Only render when hovering */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
              Drop component here
            </div>
          </div>
        )}
      </div>

      {/* Canvas Info - PERFORMANCE: Memoized stats */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-600 border">
        {canvasStats.visible}/{canvasStats.total} components • {canvasStats.zoom}% zoom
        {canvasStats.visible < canvasStats.total && (
          <div className="text-xs text-blue-600 mt-1">
            Virtualized view active
          </div>
        )}
      </div>
    </div>
  );
});

export { Canvas };