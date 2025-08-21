'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ComponentData, DragItem, DragCollectedProps, DropCollectedProps } from '@/types/builder';
import { useBuilderStore } from '@/store/builderStore';
import { SimpleResizeHandles } from './SimpleResizeHandles';
import { EnhancedComponentRenderer } from './EnhancedComponentRenderer';
import { WorkflowConnector } from './WorkflowConnector';
import { ResponsiveComponentWrapper } from './ResponsiveComponentWrapper';
import { cn } from '@/lib/utils';
import { Zap, Settings2, Move } from 'lucide-react';

interface CanvasComponentProps {
  component: ComponentData;
  isSelected: boolean;
  zoom: number;
  isBuilderMode?: boolean;
}

// PERFORMANCE: Memoized EnhancedComponentRenderer to prevent unnecessary re-renders
const MemoizedComponentRenderer = React.memo(EnhancedComponentRenderer, (prevProps, nextProps) => {
  return (
    prevProps.component.id === nextProps.component.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isBuilderMode === nextProps.isBuilderMode &&
    JSON.stringify(prevProps.component.props) === JSON.stringify(nextProps.component.props) &&
    JSON.stringify(prevProps.component.style) === JSON.stringify(nextProps.component.style)
  );
});

// PERFORMANCE: Memoized WorkflowConnector
const MemoizedWorkflowConnector = React.memo(WorkflowConnector, (prevProps, nextProps) => {
  return (
    prevProps.componentId === nextProps.componentId &&
    prevProps.isConnected === nextProps.isConnected &&
    prevProps.workflowId === nextProps.workflowId
  );
});

// PERFORMANCE: Memoized SimpleResizeHandles
const MemoizedResizeHandles = React.memo(SimpleResizeHandles, (prevProps, nextProps) => {
  return (
    prevProps.componentId === nextProps.componentId &&
    prevProps.size.width === nextProps.size.width &&
    prevProps.size.height === nextProps.size.height &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.isContainer === nextProps.isContainer
  );
});

export const CanvasComponent = React.memo(function CanvasComponent({ 
  component, 
  isSelected, 
  zoom, 
  isBuilderMode = true 
}: CanvasComponentProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    selectComponent,
    updateComponentSize,
    updateComponentProps,
    connectToWorkflow,
    disconnectFromWorkflow,
    setAIContext,
  } = useBuilderStore();

  // PERFORMANCE: Memoize drag item to prevent recreation
  const dragItem = useMemo((): DragItem => ({
    type: 'canvas-component',
    id: component.id,
    componentType: component.type,
    name: component.name,
    defaultProps: component.props,
    category: 'layout', // Default category for existing components
    preview: {
      thumbnail: '',
      description: component.name,
    },
  }), [component.id, component.type, component.name, component.props]);

  // PERFORMANCE: Memoized drag configuration
  const dragConfig = useMemo(() => ({
    type: 'canvas-component',
    item: dragItem,
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    end: () => setIsDragging(false),
  }), [dragItem]);

  const [{ opacity }, drag, preview] = useDrag<DragItem, unknown, DragCollectedProps>(dragConfig);

  // PERFORMANCE: Memoized drop configuration
  const dropConfig = useMemo(() => ({
    accept: ['component', 'canvas-component'],
    hover: (draggedItem: DragItem) => {
      if (draggedItem.id === component.id) return;
      
      // Allow dropping on containers
      if (component.type === 'container' || component.type === 'section') {
        // Handle nested component logic here if needed
      }
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [component.id, component.type]);

  const [, drop] = useDrop<DragItem, unknown, DropCollectedProps>(dropConfig);

  // Use empty image for drag preview to avoid default browser drag image
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // PERFORMANCE: Memoized event handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isDragging && !isResizing) {
      selectComponent(component.id);
    }
  }, [isDragging, isResizing, selectComponent, component.id]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    // Open component editor or AI customization
    setAIContext({
      componentId: component.id,
      currentProps: component.props,
      availableActions: ['modify', 'style', 'enhance', 'connect'],
      suggestedModifications: [],
    });
  }, [setAIContext, component.id, component.props]);

  const handleWorkflowConnect = useCallback((workflowId: string) => {
    connectToWorkflow(component.id, workflowId);
  }, [connectToWorkflow, component.id]);

  const handleWorkflowDisconnect = useCallback(() => {
    disconnectFromWorkflow(component.id);
  }, [disconnectFromWorkflow, component.id]);

  const handleResize = useCallback((newSize: { width: number; height: number }) => {
    updateComponentSize(component.id, newSize);
  }, [updateComponentSize, component.id]);

  const handlePropsUpdate = useCallback((newProps: Partial<ComponentData['props']>) => {
    updateComponentProps(component.id, {
      ...component.props,
      ...newProps,
    });
  }, [updateComponentProps, component.id, component.props]);

  const handleToggleSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(prev => !prev);
  }, []);

  const handleResizeStart = useCallback(() => setIsResizing(true), []);
  const handleResizeEnd = useCallback(() => setIsResizing(false), []);

  // PERFORMANCE: Memoized ref callback to prevent unnecessary re-renders
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    if (componentRef.current !== node) {
      // Only update if the node has actually changed
      Object.defineProperty(componentRef, 'current', {
        value: node,
        writable: true,
        configurable: true
      });
    }
    drag(node);
    drop(node);
  }, [drag, drop]);

  // PERFORMANCE: Memoize component style to prevent recalculation
  const componentStyle = useMemo(() => ({
    left: component.position.x,
    top: component.position.y,
    width: component.size.width,
    height: component.size.height,
    opacity,
    zIndex: isSelected ? 10 : 1,
    ...component.style,
  }), [
    component.position.x,
    component.position.y,
    component.size.width,
    component.size.height,
    opacity,
    isSelected,
    component.style
  ]);

  // PERFORMANCE: Memoize CSS classes
  const componentClasses = useMemo(() => cn(
    "absolute transition-all duration-200 group",
    // Clean selection indicator
    isSelected && "ring-2 ring-blue-500",
    // Dragging state
    isDragging && "z-50 opacity-75 cursor-grabbing",
    // Connected state with subtle indicator
    component.isConnectedToWorkflow && "ring-2 ring-emerald-400 ring-offset-1",
    // Hover state for better UX
    !isSelected && !isDragging && "hover:ring-1 hover:ring-blue-300 cursor-pointer"
  ), [isSelected, isDragging, component.isConnectedToWorkflow]);

  // PERFORMANCE: Memoize resize handles to prevent recreation
  const resizeHandles = useMemo(() => {
    if (!isSelected || isDragging) return null;

    return (
      <MemoizedResizeHandles
        componentId={component.id}
        size={component.size}
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        zoom={zoom}
        isContainer={component.type === 'container' || component.type === 'section'}
      />
    );
  }, [
    isSelected,
    isDragging,
    component.id,
    component.size,
    component.type,
    handleResize,
    handleResizeStart,
    handleResizeEnd,
    zoom
  ]);

  // PERFORMANCE: Memoize selection UI elements
  const selectionUI = useMemo(() => {
    if (!isSelected) return null;

    return (
      <>
        {/* Component Label */}
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm">
          {component.name}
        </div>

        {/* Move Handle - Clean and simple */}
        <div 
          className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full p-1.5 shadow-sm hover:bg-blue-600 transition-colors cursor-move"
          title="Drag to move"
        >
          <Move className="w-3 h-3" />
        </div>

        {/* Settings Button - Only for advanced users */}
        <button
          className="absolute -top-3 -right-3 bg-gray-600 text-white rounded-full p-1.5 shadow-sm hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          onClick={handleToggleSettings}
          title="Component Settings"
        >
          <Settings2 className="w-3 h-3" />
        </button>
      </>
    );
  }, [isSelected, component.name, handleToggleSettings]);

  // PERFORMANCE: Memoize workflow UI elements
  const workflowUI = useMemo(() => {
    const isInteractiveComponent = ['form', 'button', 'contact'].includes(component.type);
    if (!isSelected || !isInteractiveComponent) return null;

    return (
      <>
        {/* Connection Indicator */}
        {component.isConnectedToWorkflow && (
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
            <Zap className="w-3 h-3" />
          </div>
        )}
        
        {/* Workflow Connector - Only for interactive components */}
        <MemoizedWorkflowConnector
          componentId={component.id}
          isConnected={component.isConnectedToWorkflow || false}
          workflowId={component.workflowId}
          onConnect={handleWorkflowConnect}
          onDisconnect={handleWorkflowDisconnect}
        />
      </>
    );
  }, [
    isSelected,
    component.type,
    component.id,
    component.isConnectedToWorkflow,
    component.workflowId,
    handleWorkflowConnect,
    handleWorkflowDisconnect
  ]);

  return (
    <div
      ref={combinedRef}
      className={componentClasses}
      style={componentStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Component Content */}
      <div className="w-full h-full relative">
        <ResponsiveComponentWrapper component={component}>
          <MemoizedComponentRenderer
            component={component}
            isSelected={isSelected}
            isBuilderMode={isBuilderMode}
            onUpdateProps={handlePropsUpdate}
          />
        </ResponsiveComponentWrapper>

        {/* Selection UI */}
        {selectionUI}

        {/* Workflow UI */}
        {workflowUI}
      </div>

      {/* Resize Handles */}
      {resizeHandles}
    </div>
  );
});

// Helper to determine if we should use enhanced renderer
export const ComponentRenderer = React.memo(function ComponentRenderer({ 
  component, 
  isSelected, 
  isBuilderMode 
}: {
  component: ComponentData;
  isSelected: boolean;
  isBuilderMode: boolean;
}) {
  const { updateComponentProps } = useBuilderStore();

  const handlePropsUpdate = useCallback((newProps: Partial<ComponentData['props']>) => {
    updateComponentProps(component.id, {
      ...component.props,
      ...newProps,
    });
  }, [updateComponentProps, component.id, component.props]);

  return (
    <MemoizedComponentRenderer
      component={component}
      isSelected={isSelected}
      isBuilderMode={isBuilderMode}
      onUpdateProps={handlePropsUpdate}
    />
  );
});

export default CanvasComponent;