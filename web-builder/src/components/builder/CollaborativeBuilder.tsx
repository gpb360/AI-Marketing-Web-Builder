/**
 * CollaborativeBuilder Component
 * Enhanced builder with real-time collaboration features
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { CollaborationProvider } from '../collaboration/CollaborationProvider';
import { Canvas } from './Canvas';
import { ComponentPalette } from './ComponentPalette';
import { BuilderToolbar } from './BuilderToolbar';
import { ComponentEditor } from '../ComponentEditor';

interface CollaborativeBuilderProps {
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  authToken: string;
  className?: string;
}

export const CollaborativeBuilder: React.FC<CollaborativeBuilderProps> = ({
  projectId,
  userId,
  userName,
  userEmail,
  authToken,
  className = '',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isComponentEditorOpen, setIsComponentEditorOpen] = useState(false);
  
  const { 
    selectedComponentId, 
    getSelectedComponent,
    selectComponent,
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();

  // Handle component selection
  const handleComponentSelect = (componentId: string | null) => {
    selectComponent(componentId);
    setIsComponentEditorOpen(!!componentId);
  };

  // Handle component editor close
  const handleComponentEditorClose = () => {
    setIsComponentEditorOpen(false);
    selectComponent(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to deselect
      if (event.key === 'Escape') {
        handleComponentSelect(null);
      }
      
      // Delete selected component
      if (event.key === 'Delete' && selectedComponentId) {
        // TODO: Check if component is locked before deleting
        // This would be handled by the collaboration system
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId]);

  return (
    <CollaborationProvider
      projectId={projectId}
      userId={userId}
      userName={userName}
      userEmail={userEmail}
      authToken={authToken}
      canvasRef={canvasRef}
      className={`h-screen flex flex-col ${className}`}
    >
      {/* Builder Toolbar */}
      <BuilderToolbar className="border-b border-gray-200" />
      
      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <ComponentPalette />
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas 
            ref={canvasRef}
            onComponentSelect={handleComponentSelect}
            className="w-full h-full"
          />
        </div>
        
        {/* Component Editor Panel */}
        {isComponentEditorOpen && selectedComponent && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <ComponentEditor
              component={selectedComponent}
              onClose={handleComponentEditorClose}
              onUpdate={(updates) => {
                // Updates will be synchronized automatically
                // through the collaboration system
              }}
            />
          </div>
        )}
      </div>
    </CollaborationProvider>
  );
};

// Enhanced Canvas with collaboration features
const EnhancedCanvas = React.forwardRef<HTMLDivElement, {
  onComponentSelect: (componentId: string | null) => void;
  className?: string;
}>(({ onComponentSelect, className }, ref) => {
  const { 
    components, 
    selectedComponentId,
    zoom,
    gridEnabled,
    updateComponentPosition,
    updateComponentSize,
  } = useBuilderStore();

  // Handle component interactions with collaboration awareness
  const handleComponentClick = (componentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // TODO: Check if component is locked by another user
    // If locked, show tooltip or prevent selection
    
    onComponentSelect(componentId);
  };

  const handleCanvasClick = () => {
    onComponentSelect(null);
  };

  // Emit drag start events for collaboration locking
  const handleDragStart = (componentId: string) => {
    // Emit custom event for collaboration system
    const event = new CustomEvent('component-drag-start', {
      detail: { componentId }
    });
    document.dispatchEvent(event);
  };

  const handleResizeStart = (componentId: string) => {
    // Emit custom event for collaboration system  
    const event = new CustomEvent('component-resize-start', {
      detail: { componentId }
    });
    document.dispatchEvent(event);
  };

  return (
    <div
      ref={ref}
      className={`relative bg-white ${className}`}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: gridEnabled ? 
          `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` : 
          undefined,
        backgroundSize: gridEnabled ? 
          `${20 * zoom}px ${20 * zoom}px` : 
          undefined,
      }}
    >
      {/* Canvas Components */}
      {components.map((component) => (
        <div
          key={component.id}
          className={`absolute cursor-pointer transition-all duration-150 ${
            selectedComponentId === component.id 
              ? 'ring-2 ring-blue-500 ring-opacity-50' 
              : 'hover:ring-1 hover:ring-gray-300'
          }`}
          style={{
            left: component.position.x * zoom,
            top: component.position.y * zoom,
            width: component.size.width * zoom,
            height: component.size.height * zoom,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onClick={(e) => handleComponentClick(component.id, e)}
        >
          {/* Component Content */}
          <div className="w-full h-full border border-gray-200 bg-white rounded shadow-sm">
            {/* Render component based on type */}
            {component.type === 'text' && (
              <div className="p-4 text-sm">
                {component.props.content || 'Text Component'}
              </div>
            )}
            {component.type === 'button' && (
              <button className="w-full h-full bg-blue-500 text-white rounded hover:bg-blue-600">
                {component.props.content || 'Button'}
              </button>
            )}
            {component.type === 'image' && (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                {component.props.imageUrl ? (
                  <img 
                    src={component.props.imageUrl} 
                    alt={component.props.imageAlt || 'Image'} 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  'Image'
                )}
              </div>
            )}
            {/* Add more component types as needed */}
          </div>
          
          {/* Component drag handles */}
          {selectedComponentId === component.id && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Resize handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-nw-resize"
                onMouseDown={() => handleResizeStart(component.id)} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-ne-resize"
                onMouseDown={() => handleResizeStart(component.id)} />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-sw-resize"
                onMouseDown={() => handleResizeStart(component.id)} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-se-resize"
                onMouseDown={() => handleResizeStart(component.id)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

EnhancedCanvas.displayName = 'EnhancedCanvas';

// Export components for use in other parts of the application
export { EnhancedCanvas };

// Example usage component
export const CollaborativeBuilderExample: React.FC = () => {
  // These would typically come from authentication context
  const mockProps = {
    projectId: 'project-123',
    userId: 'user-456',  
    userName: 'John Doe',
    userEmail: 'john@example.com',
    authToken: 'mock-jwt-token',
  };

  return (
    <div className="w-full h-screen">
      <CollaborativeBuilder {...mockProps} />
    </div>
  );
};