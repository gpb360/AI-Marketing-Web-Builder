'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilderStore } from '@/store/builderStore';
import { useAIEditor } from '@/hooks/useAIEditor';
import ComponentEditorWithAI from './ComponentEditorWithAI'; // CONSOLIDATED: Using unified editor
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
    setSelectedComponent(component || null);
    
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

      // CONSOLIDATED: Enhanced with new component types
      case 'hero':
        return `<section${classNameProp}${styleProp} ${baseProps}>
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-4xl md:text-6xl font-bold mb-6">
      ${content || props?.title || 'Hero Title'}
    </h1>
    <p className="text-xl md:text-2xl mb-8 opacity-90">
      ${props?.subtitle || 'Your compelling hero subtitle goes here'}
    </p>
    <div className="space-x-4">
      <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        ${props?.primaryButtonText || 'Get Started'}
      </button>
      <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm">
        ${props?.secondaryButtonText || 'Learn More'}
      </button>
    </div>
  </div>
</section>`;

      case 'card':
        return `<div${classNameProp}${styleProp} ${baseProps}>
  <h3 className="text-lg font-semibold mb-2">${props?.title || 'Card Title'}</h3>
  <p className="text-gray-600 mb-4">
    ${content || props?.description || 'Card description goes here.'}
  </p>
  <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
    ${props?.buttonText || 'Action'}
  </button>
</div>`;

      case 'form':
        return `<form${classNameProp}${styleProp} ${baseProps}>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ${props?.nameLabel || 'Name'}
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="${props?.namePlaceholder || 'Enter your name'}"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ${props?.emailLabel || 'Email'}
      </label>
      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="${props?.emailPlaceholder || 'Enter your email'}"
      />
    </div>
    <button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg"
    >
      ${props?.submitText || 'Submit'}
    </button>
  </div>
</form>`;

      case 'navigation':
      case 'navbar':
        return `<nav${classNameProp}${styleProp} ${baseProps}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="font-bold text-xl text-gray-900">
        ${props?.logo || 'Logo'}
      </div>
      <div className="hidden md:flex space-x-8">
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Home</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Services</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
      </div>
      <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
        ${props?.ctaText || 'Get Started'}
      </button>
    </div>
  </div>
</nav>`;

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
        // CONSOLIDATED: Using the unified ComponentEditorWithAI with AI enabled
        return (
          <ComponentEditorWithAI
            initialCode={generateComponentCode(selectedComponent)}
            componentType="react"
            componentId={selectedComponent.id}
            onCodeChange={(newCode) => {
              // Handle code changes - could update the component
              console.log('Code updated:', newCode);
            }}
            className="flex-1"
            enableAI={true}
            showAIPanel={false}
            enableAdvancedFeatures={true}
          />
        );

      case 'ai':
        // CONSOLIDATED: Using the unified ComponentEditorWithAI with AI panel open
        return (
          <div className="flex-1 flex">
            <div className="flex-1">
              <ComponentEditorWithAI
                initialCode={generateComponentCode(selectedComponent)}
                componentType="react"
                componentId={selectedComponent.id}
                onCodeChange={(newCode) => {
                  console.log('AI Code updated:', newCode);
                }}
                className="h-full"
                enableAI={true}
                showAIPanel={true}
                enableAdvancedFeatures={true}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg overflow-hidden", className)}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-800">Component Editor</h3>
          
          {/* Enhanced Mode Selector */}
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
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <Sparkles className="w-3 h-3" />
              AI Enhanced
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

      {/* Enhanced Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Mode: {editorMode.charAt(0).toUpperCase() + editorMode.slice(1)}</span>
          {selectedComponent && (
            <span>Editing: {selectedComponent.name}</span>
          )}
          {editorMode === 'ai' && (
            <span className="text-purple-600">AI Enhanced Editing</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="hover:text-gray-700" title="Color Palette">
            <Palette className="w-3 h-3" />
          </button>
          <button className="hover:text-gray-700" title="Quick Actions">
            <Zap className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}