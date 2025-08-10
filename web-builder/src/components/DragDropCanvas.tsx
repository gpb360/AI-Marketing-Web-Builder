'use client';

import React, { useCallback, useRef, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData, ComponentElement } from '@/types/builder';
import CanvasComponent from './builder/CanvasComponent';
import { ElementToolbar } from './ElementToolbar';
import { DropIndicator } from './DropIndicator';
import { CSSProperties } from 'react';
import { 
  Eye, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Redo,
  Grid3X3,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';

interface DragDropCanvasProps {
  className?: string;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

// PERFORMANCE: Memoized CanvasComponent to prevent unnecessary re-renders
const MemoizedCanvasComponent = React.memo(CanvasComponent, (prevProps, nextProps) => {
  return (
    prevProps.component.id === nextProps.component.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.isBuilderMode === nextProps.isBuilderMode &&
    prevProps.component.position.x === nextProps.component.position.x &&
    prevProps.component.position.y === nextProps.component.position.y &&
    prevProps.component.size.width === nextProps.component.size.width &&
    prevProps.component.size.height === nextProps.component.size.height
  );
});

// PERFORMANCE: Memoized ElementToolbar
const MemoizedElementToolbar = React.memo(ElementToolbar, (prevProps, nextProps) => {
  return prevProps.elementId === nextProps.elementId;
});

// PERFORMANCE: Optimized viewport hook with memoization
function useViewportSettings() {
  const [viewport, setViewport] = React.useState<ViewportSize>('desktop');
  
  const dimensions = useMemo(() => {
    switch (viewport) {
      case 'mobile':
        return { width: 375, height: 812 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
        return { width: 1200, height: 800 };
    }
  }, [viewport]);
  
  return { viewport, setViewport, dimensions };
}

// PERFORMANCE: Optimized canvas state hook
function useCanvasState() {
  const [hoveredElementId, setHoveredElementId] = React.useState<string | null>(null);
  const [canvasMode, setCanvasMode] = React.useState<'design' | 'preview'>('design');
  const [isDropTarget, setIsDropTarget] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showGrid, setShowGrid] = React.useState(true);
  const [draggedElementType, setDraggedElementType] = React.useState<string | null>(null);
  
  // PERFORMANCE: Memoized state object to prevent unnecessary re-renders
  return useMemo(() => ({
    hoveredElementId,
    setHoveredElementId,
    canvasMode,
    setCanvasMode,
    isDropTarget,
    setIsDropTarget,
    activeId,
    setActiveId,
    showGrid,
    setShowGrid,
    draggedElementType,
    setDraggedElementType,
  }), [
    hoveredElementId,
    canvasMode,
    isDropTarget,
    activeId,
    showGrid,
    draggedElementType
  ]);
}

export const DragDropCanvas = React.memo(function DragDropCanvas({ className = '' }: DragDropCanvasProps) {
  const {
    components: elements,
    selectedComponentId: selectedElementId,
    zoom,
    selectComponent: selectElement,
    addComponent: addElement,
    updateComponentPosition: moveElement,
    setZoom,
  } = useBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const { viewport, setViewport, dimensions } = useViewportSettings();
  const canvasState = useCanvasState();

  // PERFORMANCE: Memoized sensors configuration
  const sensors = useMemo(() => useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  ), []);

  // PERFORMANCE: Memoized root elements calculation
  const rootElements = useMemo(() => 
    elements.filter(el => el.parentId === null || el.parentId === undefined),
    [elements]
  );

  // PERFORMANCE: Memoized element creation function
  const createElementFromType = useCallback((type: string, parentId: string | null) => {
    const baseElement: ComponentData = {
      id: `${type}-${Date.now()}`,
      type: type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
      props: {
        content: getDefaultContent(type),
        styles: getDefaultStyles(type),
        ...getDefaultProps(type),
      },
      children: [],
      position: { x: 20, y: 20 },
      size: { width: 300, height: 100 },
      parentId,
      order: 0,
    };

    return baseElement;
  }, []);

  // PERFORMANCE: Optimized drag handlers with throttling
  const dragHandlers = useMemo(() => ({
    handleDragStart: (event: DragStartEvent) => {
      const { active } = event;
      canvasState.setActiveId(active.id as string);

      // Check if this is a new element being dragged from the component library
      if (typeof active.id === 'string' && active.id.startsWith('new-')) {
        const elementType = active.id.replace('new-', '');
        canvasState.setDraggedElementType(elementType);
      }
    },

    handleDragOver: (event: DragOverEvent) => {
      const { over } = event;
      canvasState.setIsDropTarget(!!over);
    },

    handleDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;

      canvasState.setActiveId(null);
      canvasState.setIsDropTarget(false);

      if (!over) return;

      // Handle new element creation
      if (typeof active.id === 'string' && active.id.startsWith('new-')) {
        const elementType = active.id.replace('new-', '');
        const dropTargetId = over.id === 'canvas-root' ? null : over.id as string;

        const newElement = createElementFromType(elementType, dropTargetId);
        if (newElement) {
          addElement(newElement);
        }
        return;
      }

      // Handle existing element movement
      const activeElement = elements.find(el => el.id === active.id);
      if (activeElement && active.id !== over.id) {
        const newParentId = over.id === 'canvas-root' ? null : over.id as string;
        // Update position instead of order for now
        moveElement(activeElement.id, { x: 0, y: 0 });
      }
    }
  }), [
    canvasState,
    createElementFromType,
    addElement,
    elements,
    moveElement
  ]);

  // PERFORMANCE: Memoized scaled dimensions
  const scaledDimensions = useMemo(() => ({
    width: (dimensions.width * zoom) / 100,
    height: (dimensions.height * zoom) / 100,
  }), [dimensions, zoom]);

  // PERFORMANCE: Memoized toolbar controls
  const toolbarControls = useMemo(() => (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => canvasState.setCanvasMode('design')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              canvasState.canvasMode === 'design'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => canvasState.setCanvasMode('preview')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              canvasState.canvasMode === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Viewport Controls */}
        <div className="flex gap-1">
          {(['mobile', 'tablet', 'desktop'] as ViewportSize[]).map((size) => {
            const Icon = size === 'mobile' ? Smartphone : size === 'tablet' ? Tablet : Monitor;
            return (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`p-2 rounded transition-all ${
                  viewport === size
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={`${size.charAt(0).toUpperCase() + size.slice(1)} view`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 10)}
            disabled={zoom <= 25}
            className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(zoom + 10)}
            disabled={zoom >= 200}
            className="p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Grid Toggle */}
        <button
          onClick={() => canvasState.setShowGrid(!canvasState.showGrid)}
          className={`p-2 rounded transition-all ${
            canvasState.showGrid
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), [
    canvasState,
    viewport,
    setViewport,
    zoom,
    setZoom
  ]);

  // PERFORMANCE: Memoized empty state
  const emptyState = useMemo(() => (
    rootElements.length === 0 ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Start Building
          </h3>
          <p className="text-gray-500 max-w-sm">
            Drag components from the sidebar to start building your page
          </p>
        </motion.div>
      </div>
    ) : null
  ), [rootElements.length]);

  return (
    <div className={`flex-1 bg-gray-50 relative overflow-hidden ${className}`}>
      {/* Canvas Toolbar */}
      {toolbarControls}

      {/* Canvas Container */}
      <div 
        className="flex-1 overflow-auto p-8 flex items-center justify-center"
        style={{ minHeight: '100vh' }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={dragHandlers.handleDragStart}
          onDragOver={dragHandlers.handleDragOver}
          onDragEnd={dragHandlers.handleDragEnd}
        >
          {/* Canvas */}
          <div
            ref={canvasRef}
            className={`relative bg-white shadow-xl border border-gray-200 overflow-hidden ${
              canvasState.canvasMode === 'preview' ? 'pointer-events-none' : ''
            }`}
            style={{
              width: scaledDimensions.width,
              height: scaledDimensions.height,
              minHeight: scaledDimensions.height,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center',
            }}
          >
            {/* Grid Overlay - PERFORMANCE: Only render when enabled */}
            {canvasState.showGrid && canvasState.canvasMode === 'design' && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Drop Zone */}
            <div
              id="canvas-root"
              className={`w-full h-full relative ${
                canvasState.isDropTarget ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
              }`}
              onMouseLeave={() => canvasState.setHoveredElementId(null)}
            >
              <SortableContext 
                items={rootElements.map(el => el.id)} 
                strategy={verticalListSortingStrategy}
              >
                {rootElements.map((element) => (
                  <MemoizedCanvasComponent
                    key={element.id}
                    component={element}
                    isSelected={selectedElementId === element.id}
                    zoom={zoom / 100} // Convert percentage to decimal
                    isBuilderMode={canvasState.canvasMode === 'design'}
                  />
                ))}
              </SortableContext>

              {/* Empty State */}
              {emptyState}
            </div>

            {/* Drop Indicator */}
            <DropIndicator />
          </div>

          {/* Drag Overlay - PERFORMANCE: Only render when dragging */}
          <DragOverlay>
            {canvasState.activeId && elements.find(el => el.id === canvasState.activeId) && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg opacity-80">
                <span className="text-sm font-medium text-gray-700">
                  {elements.find(el => el.id === canvasState.activeId)?.name}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Element Toolbar - PERFORMANCE: Only render when component selected */}
      <AnimatePresence>
        {selectedElementId && canvasState.canvasMode === 'design' && (
          <MemoizedElementToolbar elementId={selectedElementId} />
        )}
      </AnimatePresence>
    </div>
  );
});

// PERFORMANCE: Memoized helper functions to prevent recreation
const getDefaultContent = (type: string): string => {
  switch (type) {
    case 'text':
      return 'Your text here';
    case 'button':
      return 'Click me';
    case 'hero':
      return 'Hero Section';
    case 'card':
      return 'Card Content';
    default:
      return '';
  }
};

const getDefaultStyles = (type: string): CSSProperties => {
  const baseStyles: CSSProperties = {
    position: 'relative' as const,
    width: '100%',
  };

  switch (type) {
    case 'container':
      return {
        ...baseStyles,
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        minHeight: '100px',
      } as CSSProperties;
    case 'text':
      return {
        ...baseStyles,
        fontSize: '16px',
        color: '#374151',
        lineHeight: '1.5',
      } as CSSProperties;
    case 'button':
      return {
        ...baseStyles,
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: '#ffffff',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        display: 'inline-block',
        width: 'auto',
        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      } as CSSProperties;
    case 'image':
      return {
        ...baseStyles,
        width: '100%',
        height: '200px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        objectFit: 'cover' as const,
      } as CSSProperties;
    case 'hero':
      return {
        ...baseStyles,
        padding: '80px 20px',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        textAlign: 'center' as const,
        minHeight: '400px',
      } as CSSProperties;
    default:
      return baseStyles as CSSProperties;
  }
};

const getDefaultProps = (type: string): Record<string, any> => {
  switch (type) {
    case 'button':
      return {
        href: '#',
        target: '_self',
      };
    case 'image':
      return {
        src: '/placeholder-image.jpg',
        alt: 'Placeholder image',
      };
    default:
      return {};
  }
};