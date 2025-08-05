// AI Editing System - Main exports
export { ComponentEditorWithAI } from '../ComponentEditorWithAI';
export { IntegratedEditor } from '../IntegratedEditor';
export { EnhancedCanvas } from '../builder/EnhancedCanvas';
export { AICustomizationPanel } from '../builder/AICustomizationPanel';

// Hooks
export { useAIEditor } from '@/hooks/useAIEditor';

// Types
export type { AIEdit, AIEditorState } from '@/hooks/useAIEditor';
export type { AIEditHistory } from '../builder/AICustomizationPanel';

// Integration utilities
export { AIEditorIntegration } from '../builder/EnhancedCanvas';