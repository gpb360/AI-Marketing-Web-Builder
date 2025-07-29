'use client';

import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ComponentData, DragItem, DragCollectedProps, DropCollectedProps } from '@/types/builder';
import { useBuilderStore } from '@/store/builderStore';
import { ResizeHandles } from './ResizeHandles';
import { ComponentRenderer } from './ComponentRenderer';
import { WorkflowConnector } from './WorkflowConnector';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface CanvasComponentProps {
  component: ComponentData;
  isSelected: boolean;
  zoom: number;
}

export function CanvasComponent({ component, isSelected, zoom }: CanvasComponentProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const {
    selectComponent,
    updateComponentSize,
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

  return (
    <div
      ref={combinedRef}
      className={cn(
        "absolute cursor-move transition-all duration-200",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        isDragging && "z-50",
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
        <ComponentRenderer
          component={component}
          isSelected={isSelected}
          isBuilderMode={true}
        />

        {/* Workflow Connection Indicator */}
        {component.isConnectedToWorkflow && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
            <Zap className="w-3 h-3" />
          </div>
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

      {/* Resize Handles */}
      {isSelected && !isDragging && (
        <ResizeHandles
          componentId={component.id}
          size={component.size}
          onResize={handleResize}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
          zoom={zoom}
        />
      )}

      {/* Component Label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t-md">
          {component.name}
        </div>
      )}
    </div>
  );
}