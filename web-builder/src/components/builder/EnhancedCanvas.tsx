'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Canvas } from './Canvas';
import { IntegratedEditor } from '../IntegratedEditor';
import { ComponentData } from '@/types/builder';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Code, 
  Sparkles, 
  X, 
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AICustomizationPanel } from '../builder/AICustomizationPanel';
import { useAIEditor } from '@/hooks/useAIEditor';

interface EnhancedCanvasProps {
  className?: string;
}

// PERFORMANCE: Memoized component to prevent unnecessary re-renders
const MemoizedCanvas = React.memo(Canvas, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className;
});

// PERFORMANCE: Memoized AI Panel to prevent re-renders when not visible
const MemoizedAIPanel = React.memo(AICustomizationPanel, (prevProps, nextProps) => {
  return (
    prevProps.className === nextProps.className &&
    prevProps.onOpenEditor === nextProps.onOpenEditor
  );
});

export const EnhancedCanvas = React.memo(function EnhancedCanvas({ className }: EnhancedCanvasProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'ai'>('visual');
  const [showAI, setShowAI] = useState(false);
  
  const {
    selectedComponentId,
    getSelectedComponent,
  } = useBuilderStore();

  // PERFORMANCE: Memoize selected component to avoid recalculation
  const selectedComponent = useMemo(() => getSelectedComponent(), [selectedComponentId, getSelectedComponent]);

  // PERFORMANCE: Memoized callbacks to prevent child re-renders
  const handleDoubleClick = useCallback((component: ComponentData) => {
    setShowEditor(true);
    setEditorMode('visual');
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  const handleToggleAI = useCallback(() => {
    setShowAI(prev => !prev);
  }, []);

  // PERFORMANCE: Memoized editor handlers
  const handleOpenCodeEditor = useCallback(() => {
    setShowEditor(true);
    setEditorMode('code');
  }, []);

  const handleOpenVisualEditor = useCallback(() => {
    setShowEditor(true);
    setEditorMode('visual');
  }, []);

  // PERFORMANCE: Memoized AI panel props to prevent unnecessary re-renders
  const aiPanelProps = useMemo(() => ({
    className: "h-full",
    onOpenEditor: handleOpenCodeEditor
  }), [handleOpenCodeEditor]);

  // PERFORMANCE: Memoized floating controls to prevent re-renders
  const floatingControls = useMemo(() => (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex gap-2">
        <button
          onClick={handleToggleAI}
          className={cn(
            "p-3 rounded-lg shadow-lg transition-all",
            showAI 
              ? "bg-purple-500 text-white" 
              : "bg-white text-gray-700 hover:bg-purple-50"
          )}
          title="Toggle AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleOpenCodeEditor}
          className="p-3 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-all"
          title="Open Code Editor"
        >
          <Code className="w-5 h-5" />
        </button>
      </div>
    </div>
  ), [showAI, handleToggleAI, handleOpenCodeEditor]);

  // PERFORMANCE: Memoized contextual controls
  const contextualControls = useMemo(() => {
    if (!selectedComponent) return null;

    return (
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Editing: {selectedComponent.name}
          </span>
          
          <div className="flex gap-1">
            <button
              onClick={handleOpenVisualEditor}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Visual Editor"
            >
              <Layers className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleOpenCodeEditor}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded"
              title="Code Editor"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedComponent, handleOpenVisualEditor, handleOpenCodeEditor]);

  return (
    <div className={cn("relative h-full", className)}>
      {/* Canvas Area */}
      <div className="h-full relative">
        <MemoizedCanvas className="h-full" />

        {/* Floating AI Toggle */}
        {floatingControls}

        {/* AI Panel Overlay - PERFORMANCE: Only render when visible */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="absolute top-0 right-0 h-full z-20"
            >
              <div className="bg-white border-l border-gray-200 h-full shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    AI Assistant
                  </h4>
                  <button
                    onClick={handleToggleAI}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-full overflow-hidden">
                  <MemoizedAIPanel {...aiPanelProps} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Editor Modal - PERFORMANCE: Only render when visible */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
            >
              <IntegratedEditor 
                className="h-full"
                onClose={handleCloseEditor}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Controls */}
      {contextualControls}
    </div>
  );
});

// Helper component for integrating AI editing into existing components
export const AIEditorIntegration = React.memo(function AIEditorIntegration({ 
  component,
  onEdit,
  className 
}: {
  component: ComponentData;
  onEdit: (updatedComponent: ComponentData) => void;
  className?: string;
}) {
  const [showEditor, setShowEditor] = useState(false);
  const { processAIPrompt } = useAIEditor();

  // PERFORMANCE: Memoized handlers
  const handleShowEditor = useCallback(() => setShowEditor(true), []);
  const handleHideEditor = useCallback(() => setShowEditor(false), []);

  return (
    <div className={cn("relative", className)}>
      {/* Component preview */}
      <div onDoubleClick={handleShowEditor}>
        {/* Render component here */}
      </div>

      {/* AI Edit Button */}
      <button
        onClick={handleShowEditor}
        className="absolute top-2 right-2 p-2 bg-purple-500 text-white rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-white rounded-lg shadow-xl z-10"
          >
            <IntegratedEditor 
              className="h-full"
              onClose={handleHideEditor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default EnhancedCanvas;