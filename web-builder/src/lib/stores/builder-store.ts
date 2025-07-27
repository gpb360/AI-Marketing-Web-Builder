import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateComponentId } from '@/lib/utils/hydration';

export interface SmartComponent {
  id: string;
  type: ComponentType;
  style: ComponentStyle;
  content: ComponentContent;
  workflows: WorkflowConnection[];
  analytics: ComponentAnalytics;
  aiCustomizations: AICustomization[];
  position: { x: number; y: number };
  responsive: ResponsiveConfig;
  selected?: boolean;
}

export interface WorkflowConnection {
  id: string;
  componentId: string;
  trigger: TriggerType;
  actions: WorkflowAction[];
  aiSuggested: boolean;
  active: boolean;
}

export type ComponentType = 
  | 'hero'
  | 'form'
  | 'text'
  | 'image'
  | 'button'
  | 'pricing'
  | 'testimonial'
  | 'feature-grid'
  | 'contact-form'
  | 'newsletter-signup';

export type TriggerType = 
  | 'form-submit'
  | 'button-click'
  | 'page-view'
  | 'scroll-position'
  | 'time-delay'
  | 'exit-intent';

export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  width?: string;
  height?: string;
}

export interface ComponentContent {
  text?: string;
  heading?: string;
  subheading?: string;
  buttonText?: string;
  imageUrl?: string;
  imageAlt?: string;
  formFields?: FormField[];
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface WorkflowAction {
  id: string;
  type: 'email' | 'crm' | 'webhook' | 'notification' | 'redirect';
  config: Record<string, unknown>;
}

export interface ComponentAnalytics {
  views: number;
  interactions: number;
  conversions: number;
  lastUpdated: Date;
}

export interface AICustomization {
  id: string;
  prompt: string;
  changes: Partial<SmartComponent>;
  timestamp: Date;
  applied: boolean;
}

export interface ResponsiveConfig {
  mobile: Partial<ComponentStyle>;
  tablet: Partial<ComponentStyle>;
  desktop: Partial<ComponentStyle>;
}

export interface BuilderState {
  // Canvas state
  components: SmartComponent[];
  selectedComponentId: string | null;
  canvasMode: 'edit' | 'preview';
  
  // Template state
  currentTemplate: string | null;
  
  // Workflow state
  workflowConnections: WorkflowConnection[];
  
  // UI state
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  
  // History for undo/redo
  history: SmartComponent[][];
  historyIndex: number;
}

export interface BuilderActions {
  // Component actions
  addComponent: (component: Omit<SmartComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<SmartComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (id: string, position: { x: number; y: number }) => void;
  
  // Canvas actions
  setCanvasMode: (mode: 'edit' | 'preview') => void;
  
  // Template actions
  loadTemplate: (templateId: string) => void;
  
  // Workflow actions
  addWorkflowConnection: (connection: WorkflowConnection) => void;
  updateWorkflowConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  deleteWorkflowConnection: (id: string) => void;
  
  // UI actions
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export type BuilderStore = BuilderState & BuilderActions;

const initialState: BuilderState = {
  components: [],
  selectedComponentId: null,
  canvasMode: 'edit',
  currentTemplate: null,
  workflowConnections: [],
  sidebarOpen: true,
  propertiesPanelOpen: true,
  history: [[]],
  historyIndex: 0,
};

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Component actions
      addComponent: (component) => {
        const newComponent: SmartComponent = {
          ...component,
          id: generateComponentId(component.type),
        };
        
        set((state) => ({
          components: [...state.components, newComponent],
          selectedComponentId: newComponent.id,
        }));
        
        get().saveToHistory();
      },
      
      updateComponent: (id, updates) => {
        set((state) => ({
          components: state.components.map((comp) =>
            comp.id === id ? { ...comp, ...updates } : comp
          ),
        }));
        
        get().saveToHistory();
      },
      
      deleteComponent: (id) => {
        set((state) => ({
          components: state.components.filter((comp) => comp.id !== id),
          selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        }));
        
        get().saveToHistory();
      },
      
      selectComponent: (id) => {
        set({ selectedComponentId: id });
      },
      
      moveComponent: (id, position) => {
        set((state) => ({
          components: state.components.map((comp) =>
            comp.id === id ? { ...comp, position } : comp
          ),
        }));
      },
      
      // Canvas actions
      setCanvasMode: (mode) => {
        set({ canvasMode: mode });
      },
      
      // Template actions
      loadTemplate: (templateId) => {
        // TODO: Load actual template data
        set({ currentTemplate: templateId });
      },
      
      // Workflow actions
      addWorkflowConnection: (connection) => {
        set((state) => ({
          workflowConnections: [...state.workflowConnections, connection],
        }));
      },
      
      updateWorkflowConnection: (id, updates) => {
        set((state) => ({
          workflowConnections: state.workflowConnections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
        }));
      },
      
      deleteWorkflowConnection: (id) => {
        set((state) => ({
          workflowConnections: state.workflowConnections.filter((conn) => conn.id !== id),
        }));
      },
      
      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      togglePropertiesPanel: () => {
        set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen }));
      },
      
      // History actions
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            components: history[newIndex],
            historyIndex: newIndex,
          });
        }
      },
      
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            components: history[newIndex],
            historyIndex: newIndex,
          });
        }
      },
      
      saveToHistory: () => {
        const { components, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...components]);
        
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        }
      },
    }),
    {
      name: 'builder-store',
    }
  )
);