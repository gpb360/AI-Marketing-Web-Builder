import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ComponentData, CanvasState, DragItem, DroppableZone, AICustomizationContext } from '@/types/builder';

interface BuilderStore extends CanvasState {
  // Actions
  addComponent: (component: ComponentData) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentData>) => void;
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

    requestAICustomization: async (componentId: string, prompt: string) => {
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
  }))
);

// Auto-save functionality
useBuilderStore.subscribe(
  (state) => ({
    components: state.components,
    canvasSize: state.canvasSize,
  }),
  (current, previous) => {
    if (current.components !== previous.components) {
      // Debounced auto-save (implement with localStorage or API)
      localStorage.setItem('builder-auto-save', JSON.stringify({
        components: current.components,
        canvasSize: current.canvasSize,
        timestamp: Date.now(),
      }));
    }
  }
);