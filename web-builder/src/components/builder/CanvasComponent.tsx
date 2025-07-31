'use client';

import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ComponentData, DragItem, DragCollectedProps, DropCollectedProps } from '@/types/builder';
import { useBuilderStore } from '@/store/builderStore';
import { ResizeHandles } from './ResizeHandles';
import { EnhancedComponentRenderer } from './EnhancedComponentRenderer';
import { DragHandles } from './DragHandles';
import { WorkflowConnector } from './WorkflowConnector';
import { cn } from '@/lib/utils';
import { Zap, Settings2 } from 'lucide-react';

interface CanvasComponentProps {
  component: ComponentData;
  isSelected: boolean;
  zoom: number;
}

export function CanvasComponent({ component, isSelected, zoom }: CanvasComponentProps) {
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

  // Create drag item that matches DragItem interface
  const dragItem: DragItem = {
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
  };

  const [{ opacity }, drag, preview] = useDrag<DragItem, unknown, DragCollectedProps>({
    type: 'canvas-component',
    item: dragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    end: () => {
      setIsDragging(false);
    },
  });

  const [, drop] = useDrop<DragItem, unknown, DropCollectedProps>({
    accept: ['component', 'canvas-component'],
    hover: (draggedItem) => {
      if (draggedItem.id === component.id) return;
      
      // Allow dropping on containers
      if (component.type === 'container' || component.type === 'section') {
        // Handle nested component logic here if needed
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Use empty image for drag preview to avoid default browser drag image
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isDragging && !isResizing) {
      selectComponent(component.id);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Open component editor or AI customization
    setAIContext({
      componentId: component.id,
      currentProps: component.props,
      availableActions: ['modify', 'style', 'enhance', 'connect'],
      suggestedModifications: [],
    });
  };

  const handleWorkflowConnect = (workflowId: string) => {
    connectToWorkflow(component.id, workflowId);
  };

  const handleWorkflowDisconnect = () => {
    disconnectFromWorkflow(component.id);
  };

  const handleResize = (newSize: { width: number; height: number }) => {
    updateComponentSize(component.id, newSize);
  };

  const handlePropsUpdate = (newProps: Partial<ComponentData['props']>) => {
    updateComponentProps(component.id, {
      ...component.props,
      ...newProps,
    });
  };

  const combinedRef = (node: HTMLDivElement | null) => {
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
  };

  // Enhanced resize handles with better visual feedback
  const enhancedResizeHandles = isSelected && !isDragging && (
    <>
      {/* Corner resize handles with better visibility */}
      <ResizeHandles
        componentId={component.id}
        size={component.size}
        onResize={handleResize}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
        zoom={zoom}
      />
      
      {/* Additional visual feedback for resizable */}
      <div className={cn(
        "absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none opacity-0 transition-opacity duration-200",
        isSelected && "opacity-50"
      )} />
    </>
  );

  return (
    <div
      ref={combinedRef}
      className={cn(
        "absolute cursor-move transition-all duration-200 group",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        isDragging && "z-50 opacity-75",
        component.isConnectedToWorkflow && "ring-2 ring-green-500"
      )}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        opacity,
        zIndex: isSelected ? 10 : 1,
        ...component.style,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Component Content */}
      <div className="w-full h-full relative">
        <EnhancedComponentRenderer
          component={component}
          isSelected={isSelected}
          isBuilderMode={isBuilderMode}
          onUpdateProps={handlePropsUpdate}
        />

        {/* Workflow Connection Indicator */}
        {component.isConnectedToWorkflow && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg animate-pulse">
            <Zap className="w-3 h-3" />
          </div>
        )}

        {/* Settings Button */}
        {isSelected && (
          <button
            className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 shadow-lg hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            title="Component Settings"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        )}

        {/* Workflow Connector Button */}
        {isSelected && (
          <WorkflowConnector
            componentId={component.id}
            isConnected={component.isConnectedToWorkflow || false}
            workflowId={component.workflowId}
            onConnect={handleWorkflowConnect}
            onDisconnect={handleWorkflowDisconnect}
          />
        )}
      </div>

      {/* Enhanced Resize Handles */}
      {enhancedResizeHandles}

      {/* Drag Handles */}
      <DragHandles isSelected={isSelected} zoom={zoom} />

      {/* Component Label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t-md shadow-lg">
          {component.name}
        </div>
      )}
    </div>
  );
}

// Helper to determine if we should use enhanced renderer
export function ComponentRenderer({ 
  component, 
  isSelected, 
  isBuilderMode 
}: {
  component: ComponentData;
  isSelected: boolean;
  isBuilderMode: boolean;
}) {
  const { updateComponentProps } = useBuilderStore();

  const handlePropsUpdate = (newProps: Partial<ComponentData['props']>) => {
    updateComponentProps(component.id, {
      ...component.props,
      ...newProps,
    });
  };

  return (
    <EnhancedComponentRenderer
      component={component}
      isSelected={isSelected}
      isBuilderMode={isBuilderMode}
      onUpdateProps={handlePropsUpdate}
    />
  );
}