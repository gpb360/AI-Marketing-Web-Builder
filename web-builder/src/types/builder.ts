export interface ComponentData {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children?: ComponentData[];
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: Record<string, any>;
  isConnectedToWorkflow?: boolean;
  workflowId?: string;
}

export interface DroppableZone {
  id: string;
  accepts: string[];
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface DragItem {
  type: string;
  id: string;
  componentType: string;
  name: string;
  defaultProps: Record<string, any>;
  category: ComponentCategory;
  preview: {
    thumbnail: string;
    description: string;
  };
}

export interface DropResult {
  dropEffect: string;
  position: {
    x: number;
    y: number;
  };
  targetZone?: string;
}

export type ComponentCategory = 
  | 'layout'
  | 'content'
  | 'forms'
  | 'navigation'
  | 'media'
  | 'interactive'
  | 'ai-powered';

export interface CanvasState {
  components: ComponentData[];
  selectedComponentId: string | null;
  draggedComponent: DragItem | null;
  droppableZones: DroppableZone[];
  canvasSize: {
    width: number;
    height: number;
  };
  zoom: number;
  gridEnabled: boolean;
  snapToGrid: boolean;
}

export interface BuilderConfig {
  maxComponents: number;
  allowNestedComponents: boolean;
  enableAIAssistance: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface AICustomizationContext {
  componentId: string;
  currentProps: Record<string, any>;
  availableActions: string[];
  suggestedModifications: Array<{
    property: string;
    suggestion: string;
    reason: string;
  }>;
}