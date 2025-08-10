import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  ComponentData, 
  CanvasState, 
  DragItem, 
  DroppableZone, 
  AICustomizationContext,
  Template,
  ComponentElement
} from '@/types/builder';

// Export types that other components need
export type { ComponentData, Template };

interface BuilderStore extends CanvasState {
  // Template Management
  currentTemplate: Template | null;
  loadTemplate: (template: Template | string) => void;
  getElementChildren: (elementId: string) => ComponentData[];
  
  // Actions
  addComponent: (component: ComponentData) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentData>) => void;
  updateComponentProps: (componentId: string, props: ComponentData['props']) => void;
  selectComponent: (componentId: string | null) => void;
  setDraggedComponent: (component: DragItem | null) => void;
  updateComponentPosition: (componentId: string, position: { x: number; y: number }) => void;
  updateComponentSize: (componentId: string, size: { width: number; height: number }) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  clearCanvas: () => void;
  duplicateComponent: (componentId: string) => void;
  moveComponent: (componentId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  
  // AI Integration
  aiContext: AICustomizationContext | null;
  setAIContext: (context: AICustomizationContext | null) => void;
  requestAICustomization: (componentId: string, prompt: string) => Promise<void>;
  
  // Workflow Integration
  connectToWorkflow: (componentId: string, workflowId: string) => void;
  disconnectFromWorkflow: (componentId: string) => void;
  
  // Canvas Management
  setCanvasSize: (size: { width: number; height: number }) => void;
  addDroppableZone: (zone: DroppableZone) => void;
  removeDroppableZone: (zoneId: string) => void;
  
  // Utilities
  getComponentById: (componentId: string) => ComponentData | undefined;
  getSelectedComponent: () => ComponentData | undefined;
  canDropComponent: (componentType: string, targetZone?: string) => boolean;
}

export const useBuilderStore = create<BuilderStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    components: [],
    selectedComponentId: null,
    draggedComponent: null,
    droppableZones: [],
    canvasSize: { width: 1200, height: 800 },
    zoom: 1,
    gridEnabled: true,
    snapToGrid: true,
    aiContext: null,
    currentTemplate: null,

    // Component management
    addComponent: (component: ComponentData) => {
      set((state) => ({
        components: [...state.components, component],
        selectedComponentId: component.id,
      }));
    },

    removeComponent: (componentId: string) => {
      set((state) => ({
        components: state.components.filter((c) => c.id !== componentId),
        selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
      }));
    },

    updateComponent: (componentId: string, updates: Partial<ComponentData>) => {
      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId ? { ...c, ...updates } : c
        ),
      }));
    },

    updateComponentProps: (componentId: string, props: ComponentData['props']) => {
      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
        ),
      }));
    },

    selectComponent: (componentId: string | null) => {
      set({ selectedComponentId: componentId });
    },

    setDraggedComponent: (component: DragItem | null) => {
      set({ draggedComponent: component });
    },

    updateComponentPosition: (componentId: string, position: { x: number; y: number }) => {
      const { snapToGrid } = get();
      const snappedPosition = snapToGrid
        ? {
            x: Math.round(position.x / 20) * 20,
            y: Math.round(position.y / 20) * 20,
          }
        : position;

      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId ? { ...c, position: snappedPosition } : c
        ),
      }));
    },

    updateComponentSize: (componentId: string, size: { width: number; height: number }) => {
      const { snapToGrid } = get();
      const snappedSize = snapToGrid
        ? {
            width: Math.max(40, Math.round(size.width / 20) * 20),
            height: Math.max(40, Math.round(size.height / 20) * 20),
          }
        : size;

      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId ? { ...c, size: snappedSize } : c
        ),
      }));
    },

    setZoom: (zoom: number) => {
      set({ zoom: Math.max(0.25, Math.min(3, zoom)) });
    },

    toggleGrid: () => {
      set((state) => ({ gridEnabled: !state.gridEnabled }));
    },

    toggleSnapToGrid: () => {
      set((state) => ({ snapToGrid: !state.snapToGrid }));
    },

    clearCanvas: () => {
      set({
        components: [],
        selectedComponentId: null,
        draggedComponent: null,
      });
    },

    duplicateComponent: (componentId: string) => {
      const component = get().getComponentById(componentId);
      if (component) {
        const newComponent: ComponentData = {
          ...component,
          id: `${component.id}-copy-${Date.now()}`,
          position: {
            x: component.position.x + 20,
            y: component.position.y + 20,
          },
        };
        get().addComponent(newComponent);
      }
    },

    moveComponent: (componentId: string, direction: 'up' | 'down' | 'left' | 'right') => {
      const component = get().getComponentById(componentId);
      if (component) {
        const step = get().snapToGrid ? 20 : 1;
        const newPosition = { ...component.position };

        switch (direction) {
          case 'up':
            newPosition.y = Math.max(0, newPosition.y - step);
            break;
          case 'down':
            newPosition.y += step;
            break;
          case 'left':
            newPosition.x = Math.max(0, newPosition.x - step);
            break;
          case 'right':
            newPosition.x += step;
            break;
        }

        get().updateComponentPosition(componentId, newPosition);
      }
    },

    // AI Integration
    setAIContext: (context: AICustomizationContext | null) => {
      set({ aiContext: context });
    },

    requestAICustomization: async (componentId: string, _prompt: string) => {
      const component = get().getComponentById(componentId);
      if (!component) return;

      // Set loading context
      set({
        aiContext: {
          componentId,
          currentProps: component.props,
          availableActions: ['modify', 'style', 'enhance', 'connect'],
          suggestedModifications: [],
        },
      });

      // Simulate AI processing (replace with actual API call)
      setTimeout(() => {
        set({
          aiContext: {
            componentId,
            currentProps: component.props,
            availableActions: ['modify', 'style', 'enhance', 'connect'],
            suggestedModifications: [
              {
                property: 'style',
                suggestion: 'Add rounded corners and shadow',
                reason: 'Improves visual appeal and modern design',
              },
              {
                property: 'animation',
                suggestion: 'Add hover effect',
                reason: 'Enhances user interaction feedback',
              },
            ],
          },
        });
      }, 1000);
    },

    // Workflow Integration
    connectToWorkflow: (componentId: string, workflowId: string) => {
      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId
            ? { ...c, isConnectedToWorkflow: true, workflowId }
            : c
        ),
      }));
    },

    disconnectFromWorkflow: (componentId: string) => {
      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId
            ? { ...c, isConnectedToWorkflow: false, workflowId: undefined }
            : c
        ),
      }));
    },

    // Canvas Management
    setCanvasSize: (size: { width: number; height: number }) => {
      set({ canvasSize: size });
    },

    addDroppableZone: (zone: DroppableZone) => {
      set((state) => ({
        droppableZones: [...state.droppableZones, zone],
      }));
    },

    removeDroppableZone: (zoneId: string) => {
      set((state) => ({
        droppableZones: state.droppableZones.filter((z) => z.id !== zoneId),
      }));
    },

    // Utilities
    getComponentById: (componentId: string) => {
      return get().components.find((c) => c.id === componentId);
    },

    getSelectedComponent: () => {
      const { selectedComponentId } = get();
      return selectedComponentId ? get().getComponentById(selectedComponentId) : undefined;
    },

    canDropComponent: (componentType: string, targetZone?: string) => {
      if (!targetZone) return true;
      
      const zone = get().droppableZones.find((z) => z.id === targetZone);
      return zone ? zone.accepts.includes(componentType) || zone.accepts.includes('*') : true;
    },

    // Template Management
    loadTemplate: (template: Template | string) => {
      let templateToLoad: Template;
      
      if (typeof template === 'string') {
        // TODO: Fetch template by ID from API or template library
        console.error('Template loading by ID not yet implemented');
        return;
      } else {
        templateToLoad = template;
      }
      
      // Helper function to calculate layout position based on order
      const calculatePosition = (element: any, index: number): { x: number; y: number } => {
        // If element has explicit position info, use it
        if (element.position) {
          return element.position;
        }
        
        // Calculate position based on component order and type
        const baseY = index * 120; // Stack components vertically with 120px spacing
        const baseX = 20; // Left margin
        
        // Adjust positioning based on component type
        switch (element.type) {
          case 'navigation':
            return { x: 0, y: 0 }; // Navigation always at top
          case 'hero':
            return { x: 0, y: element.order === 1 ? 80 : baseY }; // Hero after nav
          case 'container':
            return { x: baseX, y: baseY };
          case 'text':
          case 'button':
            // For nested elements, use relative positioning if parentId exists
            if (element.parentId) {
              return { x: 20, y: 20 }; // Relative to parent
            }
            return { x: baseX, y: baseY };
          default:
            return { x: baseX, y: baseY };
        }
      };
      
      // Helper function to calculate component size based on type
      const calculateSize = (element: any): { width: number; height: number } => {
        if (element.size) {
          return element.size;
        }
        
        // Default sizes based on component type
        switch (element.type) {
          case 'navigation':
            return { width: 1200, height: 80 };
          case 'hero':
            return { width: 1200, height: 600 };
          case 'container':
            return { width: 1200, height: 400 };
          case 'card':
            return { width: 350, height: 200 };
          case 'text':
            return { width: 400, height: 60 };
          case 'button':
            return { width: 160, height: 48 };
          case 'form':
            return { width: 400, height: 300 };
          default:
            return { width: 300, height: 100 };
        }
      };
      
      // Helper function to transform template element to ComponentData
      const transformElement = (element: any, index: number): ComponentData => {
        // Create unique ID for this instance
        const uniqueId = `${element.id}-${Date.now()}-${index}`;
        
        return {
          id: uniqueId,
          type: element.type,
          name: element.name,
          props: {
            // Merge element props with content and styles
            ...element.props,
            content: element.content,
            styles: element.styles,
          },
          position: calculatePosition(element, index),
          size: calculateSize(element),
          style: element.styles, // Keep original styles for CSS
          children: [], // Initialize as empty, will be populated for nested components
          parentId: element.parentId,
          order: element.order,
        };
      };
      
      // Transform template elements to ComponentData format
      const transformedComponents: ComponentData[] = [];
      
      // Get elements array (handle both 'elements' and 'components' properties)
      const templateElements = (templateToLoad as any).elements || templateToLoad.components || [];
      
      if (templateElements.length === 0) {
        console.warn('Template has no elements to load');
        set({
          currentTemplate: templateToLoad,
          components: [],
          selectedComponentId: null,
        });
        return;
      }
      
      // First pass: Create all components
      const componentMap = new Map<string, ComponentData>();
      
      templateElements.forEach((element: any, index: number) => {
        const component = transformElement(element, index);
        componentMap.set(element.id, component); // Map using original ID for relationships
        transformedComponents.push(component);
      });
      
      // Second pass: Handle parent-child relationships
      templateElements.forEach((element: any) => {
        if (element.children && Array.isArray(element.children)) {
          const parentComponent = componentMap.get(element.id);
          if (parentComponent) {
            // Build children array with proper ComponentData references
            const childComponents: ComponentData[] = [];
            
            element.children.forEach((childRef: any) => {
              const childId = typeof childRef === 'string' ? childRef : childRef.id;
              const childComponent = componentMap.get(childId);
              if (childComponent) {
                childComponents.push(childComponent);
              }
            });
            
            // Update parent component with children
            parentComponent.children = childComponents;
          }
        }
      });
      
      // Sort components by order for proper layering
      transformedComponents.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
      
      console.log(`Loading template: ${templateToLoad.name} with ${transformedComponents.length} components`);
      
      // Update store state
      set({
        currentTemplate: templateToLoad,
        components: transformedComponents,
        selectedComponentId: null, // Clear selection when loading template
      });
    },

    getElementChildren: (elementId: string) => {
      const element = get().components.find((c) => c.id === elementId);
      if (!element || !element.children) return [];
      
      // Return direct children array (already ComponentData[])
      return element.children;
    },
  }))
);