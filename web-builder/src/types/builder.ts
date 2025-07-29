import { CSSProperties } from 'react';

// Unified ComponentData interface - THE SINGLE SOURCE OF TRUTH
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
  style?: CSSProperties;
  isConnectedToWorkflow?: boolean;
  workflowId?: string | undefined; // Explicitly allow undefined
  // Added for compatibility with existing code
  content?: string;
  parentId?: string | null;
  order?: number;
}

// React DnD Types - Properly typed for v16
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

export interface DragCollectedProps {
  isDragging: boolean;
  opacity?: number;
}

export interface DropCollectedProps {
  isOver: boolean;
  canDrop: boolean;
}

export interface DropResult {
  dropEffect: string;
  position: {
    x: number;
    y: number;
  };
  targetZone?: string;
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

export type ComponentCategory = 
  | 'layout'
  | 'content'
  | 'forms'
  | 'navigation'
  | 'media'
  | 'interactive'
  | 'ai-powered';

// Canvas State - Unified interface
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

// Builder Configuration
export interface BuilderConfig {
  maxComponents: number;
  allowNestedComponents: boolean;
  enableAIAssistance: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

// AI Context
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

// Template Interface - Compatible with existing template system
export interface Template {
  id: string;
  name: string;
  category: 'landing' | 'ecommerce' | 'blog' | 'portfolio' | 'corporate' | 'startup';
  description: string;
  thumbnail: string;
  components: ComponentData[]; // Use ComponentData instead of elements
  createdAt: Date;
  updatedAt: Date;
}

// Legacy compatibility - Map ComponentElement to ComponentData
export interface ComponentElement extends Omit<ComponentData, 'children'> {
  // These are mapped from ComponentData for backward compatibility
  styles: CSSProperties;
  children?: ComponentData[]; // Use ComponentData[] to match parent interface
}

// Workflow Types
export interface WorkflowConnection {
  id: string;
  componentId: string;
  trigger: TriggerType;
  actions: WorkflowAction[];
  aiSuggested: boolean;
  active: boolean;
}

export type TriggerType = 
  | 'form-submit'
  | 'button-click'
  | 'page-view'
  | 'scroll-position'
  | 'time-delay'
  | 'exit-intent';

export interface WorkflowAction {
  id: string;
  type: 'email' | 'crm' | 'webhook' | 'notification' | 'redirect';
  config: Record<string, unknown>;
}

// Analytics
export interface ComponentAnalytics {
  views: number;
  interactions: number;
  conversions: number;
  lastUpdated: Date;
}

// AI Customization
export interface AICustomization {
  id: string;
  prompt: string;
  changes: Partial<ComponentData>;
  timestamp: Date;
  applied: boolean;
}

// Responsive Configuration
export interface ResponsiveConfig {
  mobile: Partial<CSSProperties>;
  tablet: Partial<CSSProperties>;
  desktop: Partial<CSSProperties>;
}

// Form Fields
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

// Component Content Structure
export interface ComponentContent {
  text?: string;
  heading?: string;
  subheading?: string;
  buttonText?: string;
  imageUrl?: string;
  imageAlt?: string;
  formFields?: FormField[];
}

// Utility type for drag source specification
export interface DragSourceSpec {
  type: string;
  item: DragItem;
  collect: (monitor: any) => DragCollectedProps;
  begin?: () => void;
  end?: () => void;
}

// Utility type for drop target specification
export interface DropTargetSpec {
  accept: string | string[];
  drop?: (item: DragItem, monitor: any) => DropResult | undefined;
  hover?: (item: DragItem, monitor: any) => void;
  collect: (monitor: any) => DropCollectedProps;
}