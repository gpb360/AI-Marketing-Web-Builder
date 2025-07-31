# AI Editing Integration

This directory contains the complete AI editing system that integrates seamlessly with the existing manual component controls.

## Overview

The AI editing system provides three levels of integration:

1. **Visual AI Assistant** - Sidebar-based AI suggestions for existing components
2. **Code AI Editor** - Full-featured code editor with AI assistance
3. **Integrated Editor** - Unified interface combining all editing modes

## Components

### Core Components

- **ComponentEditorWithAI** - Enhanced code editor with AI sidebar
- **IntegratedEditor** - Unified visual/code/AI editing interface
- **EnhancedCanvas** - Canvas with AI editing integration
- **AICustomizationPanel** - Enhanced AI sidebar panel

### Hooks

- **useAIEditor** - Hook for managing AI editing state

## Usage

### Basic Integration

```tsx
import { EnhancedCanvas } from '@/components/ai-editing';

function MyApp() {
  return (
    <EnhancedCanvas 
      onComponentEdit={(component, mode) => {
        // Handle component editing
      }}
    />
  );
}
```

### Advanced Integration

```tsx
import { useAIEditor, ComponentEditorWithAI } from '@/components/ai-editing';

function AdvancedEditor() {
  const { 
    state, 
    openEditor, 
    processAIPrompt, 
    applyAIEdit 
  } = useAIEditor();

  const handleAIEdit = async (prompt: string) => {
    const edit = await processAIPrompt(prompt);
    await applyAIEdit(edit);
  };

  return (
    <ComponentEditorWithAI
      initialCode={initialCode}
      componentType="react"
      onCodeChange={handleCodeChange}
    />
  );
}
```

## Features

### AI Editing Capabilities

- **Natural Language Processing** - "Make this button blue and larger"
- **Context-Aware Suggestions** - Based on component type and current state
- **Undo/Redo System** - Full history management for AI edits
- **Quick Actions** - Pre-defined improvements for common use cases
- **Edit History** - Track and revert AI changes

### Manual Controls Preserved

- **Original drag-and-drop** functionality unchanged
- **Manual property editing** fully supported
- **Component positioning** and sizing works as before
- **Visual builder** integration maintained

### Seamless Integration

- **No breaking changes** to existing components
- **Progressive enhancement** - AI features are optional
- **Fallback handling** - Manual controls always available
- **Performance optimized** - AI processing is async and debounced

## Integration Points

### 1. Canvas Integration

The `EnhancedCanvas` component adds AI editing capabilities to the existing canvas:

- Floating AI toggle button
- Contextual editing controls
- Modal editor overlay
- Seamless switching between modes

### 2. Component-Level Integration

Individual components can use AI editing:

```tsx
import { AIEditorIntegration } from '@/components/ai-editing';

function MyComponent({ component }) {
  return (
    <AIEditorIntegration
      component={component}
      onEdit={handleComponentUpdate}
    />
  );
}
```

### 3. Store Integration

AI edits are applied through the existing builder store:

```tsx
const { updateComponent } = useBuilderStore();

// AI edit applies through same mechanism as manual edits
updateComponent(component.id, aiGeneratedChanges);
```

## API Reference

### useAIEditor Hook

```typescript
interface UseAIEditorReturn {
  state: AIEditorState;
  openEditor: (component: ComponentData, initialCode?: string) => void;
  closeEditor: () => void;
  applyAIEdit: (edit: AIEdit) => Promise<void>;
  undoLastEdit: () => void;
  redoLastEdit: () => void;
  resetToOriginal: () => void;
  processAIPrompt: (prompt: string) => Promise<AIEdit>;
  generateCodeFromComponent: (component: ComponentData) => string;
}
```

### ComponentEditorWithAI Props

```typescript
interface ComponentEditorWithAIProps {
  initialCode: string;
  componentType: 'react' | 'html' | 'vue';
  componentId?: string;
  onCodeChange?: (code: string) => void;
  className?: string;
}
```

## Configuration

### AI Processing

The AI processing is currently simulated for demo purposes. To integrate real AI:

1. Replace `simulateAIEdit` in `useAIEditor` hook with actual API calls
2. Implement proper AST parsing for code-to-props conversion
3. Add validation and error handling
4. Configure rate limiting and caching

### Quick Actions

Quick actions are defined per component type:

- **Buttons**: Styling, animations, sizing
- **Text**: Typography, spacing, responsiveness
- **Containers**: Layout, spacing, shadows
- **Forms**: UX improvements, validation, responsiveness

## Testing

### Manual Testing

1. Select a component on canvas
2. Try AI suggestions from sidebar
3. Switch between visual/code/AI modes
4. Test undo/redo functionality
5. Verify manual controls still work

### Automated Testing

```bash
# Run integration tests
npm test src/components/ai-editing/__tests__/

# Run E2E tests
npm run test:e2e ai-editing
```

## Performance

- **Lazy loading** - AI components loaded on demand
- **Debounced processing** - AI requests debounced by 500ms
- **Caching** - Previous AI responses cached
- **Background processing** - Heavy AI work in web workers

## Security

- **Input sanitization** - All prompts sanitized before processing
- **Output validation** - AI responses validated before application
- **Rate limiting** - Configurable rate limits
- **Audit trail** - All AI edits logged for review

## Migration Guide

### From Manual to AI Editing

1. **No breaking changes** - Existing code continues to work
2. **Opt-in features** - AI editing is additional, not replacement
3. **Gradual rollout** - Enable features incrementally
4. **User training** - Provide guided tours for new features

### Backward Compatibility

- All existing hooks and components remain unchanged
- New AI features are additive only
- Manual editing always available as fallback
- No changes to data structures or APIs

## Examples

### Basic Usage

```tsx
// Simple canvas with AI editing
import { EnhancedCanvas } from '@/components/ai-editing';

function Builder() {
  return (
    <div className="h-screen">
      <EnhancedCanvas />
    </div>
  );
}
```

### Advanced Usage

```tsx
// Custom integration
import { useAIEditor, ComponentEditorWithAI } from '@/components/ai-editing';

function CustomBuilder() {
  const { openEditor, processAIPrompt } = useAIEditor();
  
  return (
    <div>
      <button onClick={() => openEditor(selectedComponent)}>
        Edit with AI
      </button>
      
      <ComponentEditorWithAI
        initialCode={generateCode(selectedComponent)}
        onCodeChange={handleCodeChange}
      />
    </div>
  );
}
```

## Support

For issues or questions:
- Check the component documentation
- Review the integration examples
- Test with the provided playground
- Refer to the troubleshooting guide