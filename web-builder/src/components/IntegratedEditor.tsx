'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/store/builderStore';
import { useAIEditor } from '@/hooks/useAIEditor';
import { ComponentEditorWithAI } from './ComponentEditorWithAI';
import { AICustomizationPanel } from './builder/AICustomizationPanel';
import { 
  Code, 
  Sparkles, 
  Settings, 
  X, 
  RotateCcw,
  Eye,
  EyeOff,
  Bot,
  User,
  Layers,
  Palette,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentData } from '@/types/builder';

interface IntegratedEditorProps {
  className?: string;
  onClose?: () => void;
}

export function IntegratedEditor({ className, onClose }: IntegratedEditorProps) {
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'ai'>('visual');
  const [showPreview, setShowPreview] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  
  const {
    selectedComponentId,
    getSelectedComponent,
  } = useBuilderStore();

  const {
    state: aiState,
    openEditor,
    closeEditor: closeAIEditor,
    applyAIEdit,
    undoLastEdit,
    redoLastEdit,
    resetToOriginal,
    processAIPrompt
  } = useAIEditor();

  useEffect(() => {
    const component = getSelectedComponent();
    setSelectedComponent(component);
    
    if (component && editorMode === 'code') {
      // Auto-open AI editor when switching to code mode
      openEditor(component);
    }
  }, [selectedComponentId, getSelectedComponent, editorMode, openEditor]);

  const handleModeChange = (mode: 'visual' | 'code' | 'ai') => {
    setEditorMode(mode);
    
    if (mode === 'code' && selectedComponent) {
      openEditor(selectedComponent);
    } else if (mode !== 'code') {
      closeAIEditor();
    }
  };

  const generateComponentCode = (component: ComponentData): string => {
    const { type, props, content } = component;
    
    // Generate appropriate code based on component type
    const baseProps = Object.entries(props || {})
      .filter(([key]) => !['style', 'className', 'content'].includes(key))
      .map(([key, value]) => `${key}={${typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}}`)
      .join(' ');

    const styleProp = props?.style ? ` style={${JSON.stringify(props.style)}}` : '';
    const classNameProp = props?.className ? ` className="${props.className}"` : '';
    
    switch (type) {
      case 'button':
        return `<button${classNameProp}${styleProp} ${baseProps}>
  ${content || props?.text || 'Click me'}
</button>`;

      case 'text':
        return `<p${classNameProp}${styleProp} ${baseProps}>
  ${content || props?.text || 'Text content'}
</p>`;

      case 'input':
        return `<input${classNameProp}${styleProp} ${baseProps} />`;

      case 'container':
        return `<div${classNameProp}${styleProp} ${baseProps}>
  ${content || ''}
</div>`;

      case 'image':
        return `<img src="${props?.src || ''}" alt="${props?.alt || ''}"${classNameProp}${styleProp} ${baseProps} />`;

      default:
        return `<div${classNameProp}${styleProp} ${baseProps}>
  ${content || 'Component'}
</div>`;
    }
  };

  const renderEditor = () => {
    if (!selectedComponent) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Selected</h3>
            <p className="text-sm text-gray-500">
              Click on any component to start editing
            </p>
          </div>
        </div>
      );
    }

    switch (editorMode) {
      case 'visual':
        return (
          <div className="flex-1 flex">
            <div className="flex-1 bg-white">
              <AICustomizationPanel 
                onOpenEditor={() => handleModeChange('code')}
              />
            </div>
          </div>
        );

      case 'code':
        return (
          <ComponentEditorWithAI
            initialCode={generateComponentCode(selectedComponent)}
            componentType="react"
            componentId={selectedComponent.id}
            onCodeChange={(newCode) => {
              // Handle code changes
              console.log('Code updated:', newCode);
            }}
            className="flex-1"
          />
        );

      case 'ai':
        return (
          <div className="flex-1 flex">
            <div className="flex-1">
              <AICustomizationPanel 
                onOpenEditor={() => handleModeChange('code')}
              />
            </div>
            <div className="w-96 border-l border-gray-200">
              <div className="p-4 bg-purple-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-purple-900 flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </h4>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Quick Improvements</label>
                    <div className="space-y-2">
                      <button className="w-full p-2 text-left text-sm bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                        ✨ Make it modern and professional
                      </button>
                      <button className="w-full p-2 text-left text-sm bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                        🎨 Apply brand colors
                      </button>
                      <button className="w-full p-2 text-left text-sm bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100">
                        ⚡ Add animations
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-800">Component Editor</h3>
          
          {/* Mode Selector */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => handleModeChange('visual')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                editorMode === 'visual'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <Eye className="w-3 h-3" />
              Visual
            </button>
            <button
              onClick={() => handleModeChange('code')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                editorMode === 'code'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <Code className="w-3 h-3" />
              Code
            </button>
            <button
              onClick={() => handleModeChange('ai')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                editorMode === 'ai'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <Sparkles className="w-3 h-3" />
              AI
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => {
              resetToOriginal();
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            title="Reset to original"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
              title="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={editorMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderEditor()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Mode: {editorMode.charAt(0).toUpperCase() + editorMode.slice(1)}</span>
          {selectedComponent && (
            <span>Editing: {selectedComponent.name}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="hover:text-gray-700">
            <Palette className="w-3 h-3" />
          </button>
          <button className="hover:text-gray-700">
            <Zap className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}