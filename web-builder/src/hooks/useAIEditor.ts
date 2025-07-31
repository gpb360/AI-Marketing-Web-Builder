import { useState, useCallback, useRef } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';

export interface AIEdit {
  id: string;
  prompt: string;
  originalCode: string;
  modifiedCode: string;
  timestamp: Date;
  applied: boolean;
  description: string;
  componentId: string;
}

export interface AIEditorState {
  isOpen: boolean;
  currentCode: string;
  originalCode: string;
  aiEdits: AIEdit[];
  currentEditIndex: number;
  isProcessing: boolean;
  aiSuggestions: string[];
}

interface UseAIEditorReturn {
  state: AIEditorState;
  openEditor: (component: ComponentData, initialCode?: string) => void;
  closeEditor: () => void;
  applyAIEdit: (edit: AIEdit) => Promise<void>;
  undoLastEdit: () => void;
  redoLastEdit: () => void;
  resetToOriginal: () => void;
  generateCodeFromComponent: (component: ComponentData) => string;
  processAIPrompt: (prompt: string) => Promise<AIEdit>;
}

export function useAIEditor(): UseAIEditorReturn {
  const [state, setState] = useState<AIEditorState>({
    isOpen: false,
    currentCode: '',
    originalCode: '',
    aiEdits: [],
    currentEditIndex: -1,
    isProcessing: false,
    aiSuggestions: []
  });

  const componentRef = useRef<ComponentData | null>(null);
  const { updateComponent } = useBuilderStore();

  const generateCodeFromComponent = useCallback((component: ComponentData): string => {
    const { type, props, content } = component;
    
    // Generate React component code based on type
    switch (type) {
      case 'button':
        return `<button
  className="${props.className || ''}"
  style={${JSON.stringify(props.style || {})}}
  ${props.onClick ? 'onClick={handleClick}' : ''}
>
  ${content || props.text || 'Button'}
</button>`;

      case 'text':
        return `<p
  className="${props.className || ''}"
  style={${JSON.stringify(props.style || {})}}
>
  ${content || props.text || 'Text content'}
</p>`;

      case 'container':
        return `<div
  className="${props.className || ''}"
  style={${JSON.stringify(props.style || {})}}
>
  ${content || ''}
</div>`;

      case 'form':
        return `<form
  className="${props.className || ''}"
  style={${JSON.stringify(props.style || {})}}
  onSubmit={handleSubmit}
>
  ${content || ''}
</form>`;

      default:
        return `<div
  className="${props.className || ''}"
  style={${JSON.stringify(props.style || {})}}
>
  ${content || 'Component'}
</div>`;
    }
  }, []);

  const processAIPrompt = useCallback(async (prompt: string): Promise<AIEdit> => {
    if (!componentRef.current) {
      throw new Error('No component selected');
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Simulate AI processing - replace with actual API call
      const modifiedCode = await simulateAIEditing(state.currentCode, prompt);
      
      const newEdit: AIEdit = {
        id: `ai-${Date.now()}`,
        prompt,
        originalCode: state.currentCode,
        modifiedCode,
        timestamp: new Date(),
        applied: false,
        description: `AI: ${prompt.substring(0, 50)}...`,
        componentId: componentRef.current.id
      };

      setState(prev => ({
        ...prev,
        aiEdits: [...prev.aiEdits, newEdit],
        currentEditIndex: prev.aiEdits.length,
        currentCode: modifiedCode,
        isProcessing: false
      }));

      return newEdit;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [state.currentCode]);

  const simulateAIEditing = async (code: string, prompt: string): Promise<string> => {
    // Simulate AI response based on prompt and code
    return new Promise((resolve) => {
      setTimeout(() => {
        let modifiedCode = code;
        const promptLower = prompt.toLowerCase();

        // Smart replacements based on prompt keywords
        if (promptLower.includes('button') && promptLower.includes('blue')) {
          modifiedCode = modifiedCode.replace(
            /bg-(red|green|yellow|purple|pink|indigo|gray)-\d+/g,
            'bg-blue-500'
          );
        }

        if (promptLower.includes('larger') || promptLower.includes('bigger')) {
          modifiedCode = modifiedCode.replace(
            /className="([^"]*)px-4 py-2([^"]*)"/g,
            'className="$1px-6 py-3$2"'
          );
        }

        if (promptLower.includes('animation') || promptLower.includes('hover')) {
          modifiedCode = modifiedCode.replace(
            /className="([^"]*)"/g,
            'className="$1 hover:scale-105 transition-transform duration-200"'
          );
        }

        if (promptLower.includes('modern') || promptLower.includes('professional')) {
          modifiedCode = modifiedCode.replace(
            /style={{([^}]*)}}/g,
            'style={{ borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", $1 }}'
          );
        }

        resolve(modifiedCode);
      }, 1000);
    });
  };

  const openEditor = useCallback((component: ComponentData, initialCode?: string) => {
    componentRef.current = component;
    const code = initialCode || generateCodeFromComponent(component);
    
    setState({
      isOpen: true,
      currentCode: code,
      originalCode: code,
      aiEdits: [],
      currentEditIndex: -1,
      isProcessing: false,
      aiSuggestions: [
        'Make this component more prominent',
        'Add hover animations and transitions',
        'Improve spacing and visual hierarchy',
        'Apply modern design patterns',
        'Optimize for mobile responsiveness'
      ]
    });
  }, [generateCodeFromComponent]);

  const closeEditor = useCallback(() => {
    setState({
      ...state,
      isOpen: false
    });
  }, [state]);

  const applyAIEdit = useCallback(async (edit: AIEdit) => {
    if (!componentRef.current) return;

    // Update the component with the AI-generated changes
    const updatedProps = parseCodeToProps(edit.modifiedCode);
    
    updateComponent(componentRef.current.id, {
      props: { ...componentRef.current.props, ...updatedProps }
    });

    setState(prev => ({
      ...prev,
      aiEdits: prev.aiEdits.map(e => 
        e.id === edit.id ? { ...e, applied: true } : e
      )
    }));
  }, [updateComponent]);

  const parseCodeToProps = (code: string): any => {
    // Simple parser to extract props from React component code
    // This is a basic implementation - in production, use a proper AST parser
    const props: any = {};
    
    // Extract className
    const classNameMatch = code.match(/className="([^"]*)"/);
    if (classNameMatch) {
      props.className = classNameMatch[1];
    }
    
    // Extract style object
    const styleMatch = code.match(/style={({[^}]*})}/);
    if (styleMatch) {
      try {
        props.style = JSON.parse(styleMatch[1].replace(/'/g, '"'));
      } catch (e) {
        props.style = {};
      }
    }
    
    // Extract content
    const contentMatch = code.match(/>\s*([^<>]*)\s*</);
    if (contentMatch && contentMatch[1].trim()) {
      props.content = contentMatch[1].trim();
    }
    
    return props;
  };

  const undoLastEdit = useCallback(() => {
    const { currentEditIndex, aiEdits } = state;
    if (currentEditIndex > 0) {
      const previousEdit = aiEdits[currentEditIndex - 1];
      setState(prev => ({
        ...prev,
        currentCode: previousEdit.originalCode,
        currentEditIndex: currentEditIndex - 1
      }));
    } else if (currentEditIndex === 0) {
      setState(prev => ({
        ...prev,
        currentCode: prev.originalCode,
        currentEditIndex: -1
      }));
    }
  }, [state]);

  const redoLastEdit = useCallback(() => {
    const { currentEditIndex, aiEdits } = state;
    if (currentEditIndex < aiEdits.length - 1) {
      const nextEdit = aiEdits[currentEditIndex + 1];
      setState(prev => ({
        ...prev,
        currentCode: nextEdit.modifiedCode,
        currentEditIndex: currentEditIndex + 1
      }));
    }
  }, [state]);

  const resetToOriginal = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentCode: prev.originalCode,
      aiEdits: [],
      currentEditIndex: -1
    }));
  }, []);

  return {
    state,
    openEditor,
    closeEditor,
    applyAIEdit,
    undoLastEdit,
    redoLastEdit,
    resetToOriginal,
    generateCodeFromComponent,
    processAIPrompt
  };
}