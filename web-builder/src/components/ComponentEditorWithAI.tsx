'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Minimize2,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Wand2,
  Palette,
  Zap,
  Lightbulb,
  CheckCircle,
  X,
  Bot,
  User,
  Copy,
  History,
  Undo,
  Redo,
  Send
} from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';

// CONSOLIDATED: Combined ComponentEditor and ComponentEditorWithAI interfaces
interface ComponentEditorWithAIProps {
  initialCode: string;
  componentType: 'react' | 'html' | 'vue';
  onCodeChange?: (code: string) => void;
  componentId?: string;
  className?: string;
  // Enhanced props for AI functionality
  enableAI?: boolean;
  showAIPanel?: boolean;
  enableAdvancedFeatures?: boolean;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';
type PreviewMode = 'live' | 'manual';
type AIAssistMode = 'sidebar' | 'inline' | 'floating';

interface AIEdit {
  id: string;
  prompt: string;
  originalCode: string;
  modifiedCode: string;
  timestamp: Date;
  applied: boolean;
  description: string;
}

// CONSOLIDATED: Enhanced component editor with optional AI features
export function ComponentEditorWithAI({ 
  initialCode, 
  componentType, 
  onCodeChange,
  componentId,
  className = '',
  enableAI = true,
  showAIPanel: initialShowAIPanel = false,
  enableAdvancedFeatures = true
}: ComponentEditorWithAIProps) {
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('live');
  const [showGrid, setShowGrid] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  
  // AI-specific state
  const [aiAssistMode, setAiAssistMode] = useState<AIAssistMode>('sidebar');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiEdits, setAiEdits] = useState<AIEdit[]>([]);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);
  const [showAiPanel, setShowAiPanel] = useState(enableAI && initialShowAIPanel);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const editorRef = useRef<any>(null);
  const selectedComponent = componentId ? useBuilderStore().getComponentById(componentId) : null;

  // Update preview code based on mode
  useEffect(() => {
    if (previewMode === 'live') {
      const debounce = setTimeout(() => {
        setPreviewCode(code);
      }, 500); // 500ms debounce for live updates
      
      return () => clearTimeout(debounce);
    }
    return undefined;
  }, [code, previewMode]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  }, [onCodeChange]);

  const handleManualUpdate = () => {
    setPreviewCode(code);
  };

  const resetCode = () => {
    setCode(initialCode);
    setPreviewCode(initialCode);
    if (enableAI) {
      setAiEdits([]);
      setCurrentEditIndex(-1);
    }
  };

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: '100%' };
    }
  };

  const getLanguage = () => {
    switch (componentType) {
      case 'react':
        return 'typescript';
      case 'html':
        return 'html';
      case 'vue':
        return 'javascript';
      default:
        return 'typescript';
    }
  };

  // CONSOLIDATED: AI Integration Functions (only active when enableAI is true)
  const handleAiPrompt = async () => {
    if (!enableAI || !aiPrompt.trim()) return;

    setIsAiProcessing(true);
    const originalCode = code;
    
    try {
      // Simulate AI processing - replace with actual API call
      const modifiedCode = await simulateAIEdit(originalCode, aiPrompt);
      
      const newEdit: AIEdit = {
        id: `ai-edit-${Date.now()}`,
        prompt: aiPrompt,
        originalCode,
        modifiedCode,
        timestamp: new Date(),
        applied: false,
        description: `AI: ${aiPrompt.substring(0, 50)}...`
      };

      setAiEdits(prev => [...prev, newEdit]);
      setCurrentEditIndex(aiEdits.length);
      setCode(modifiedCode);
      setAiPrompt('');
      setPreviewCode(modifiedCode);
    } catch (error) {
      console.error('AI edit failed:', error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const simulateAIEdit = async (originalCode: string, prompt: string): Promise<string> => {
    // Enhanced simulation based on prompt keywords
    return new Promise((resolve) => {
      setTimeout(() => {
        let modifiedCode = originalCode;
        
        // Simple simulation based on keywords
        if (prompt.toLowerCase().includes('button')) {
          if (prompt.toLowerCase().includes('color') && prompt.toLowerCase().includes('blue')) {
            modifiedCode = modifiedCode.replace(
              /bg-(red|green|yellow|purple|pink|indigo|gray)-\d+/g,
              'bg-blue-500'
            );
          }
          if (prompt.toLowerCase().includes('larger')) {
            modifiedCode = modifiedCode.replace(
              /className="([^"]*)px-4 py-2([^"]*)"/g,
              'className="$1px-6 py-3$2"'
            );
          }
        }
        
        if (prompt.toLowerCase().includes('animation')) {
          modifiedCode = modifiedCode.replace(
            /className="([^"]*)"/g,
            'className="$1 hover:scale-105 transition-transform duration-200"'
          );
        }
        
        if (prompt.toLowerCase().includes('spacing')) {
          modifiedCode = modifiedCode.replace(
            /className="([^"]*)p-2([^"]*)"/g,
            'className="$1p-4$2"'
          );
        }
        
        if (prompt.toLowerCase().includes('gradient')) {
          modifiedCode = modifiedCode.replace(
            /bg-\w+-\d+/g,
            'bg-gradient-to-r from-blue-500 to-purple-600'
          );
        }
        
        resolve(modifiedCode);
      }, 1500);
    });
  };

  const applyAiEdit = (editIndex: number) => {
    if (!enableAI || editIndex < 0 || editIndex >= aiEdits.length) return;
    
    const edit = aiEdits[editIndex];
    setCode(edit.modifiedCode);
    setPreviewCode(edit.modifiedCode);
    
    setAiEdits(prev => 
      prev.map((e, idx) => idx === editIndex ? { ...e, applied: true } : e)
    );
    setCurrentEditIndex(editIndex);
  };

  const undoAiEdit = () => {
    if (!enableAI) return;
    
    if (currentEditIndex > -1 && aiEdits.length > 0) {
      const previousEdit = aiEdits[currentEditIndex - 1];
      if (previousEdit) {
        setCode(previousEdit.originalCode);
        setPreviewCode(previousEdit.originalCode);
        setCurrentEditIndex(currentEditIndex - 1);
      }
    } else if (currentEditIndex === -1 && aiEdits.length > 0) {
      // Go back to original
      setCode(initialCode);
      setPreviewCode(initialCode);
      setCurrentEditIndex(-2); // Mark as original state
    }
  };

  const redoAiEdit = () => {
    if (!enableAI) return;
    
    if (currentEditIndex < aiEdits.length - 1) {
      const nextEdit = aiEdits[currentEditIndex + 1];
      setCode(nextEdit.modifiedCode);
      setPreviewCode(nextEdit.modifiedCode);
      setCurrentEditIndex(currentEditIndex + 1);
    }
  };

  const getQuickSuggestions = () => {
    return [
      "Make the button larger and blue",
      "Add hover animations",
      "Improve spacing and padding",
      "Change to modern gradient style",
      "Optimize for mobile responsiveness",
      "Add shadow effects",
      "Improve typography",
      "Make it more accessible"
    ];
  };

  const dimensions = getViewportDimensions();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-800">
            {enableAI ? 'AI Component Editor' : 'Component Editor'}
          </h3>
          
          {/* Preview Mode Toggle */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setPreviewMode('live')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${previewMode === 'live'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <Play className="w-3 h-3" />
              Live
            </button>
            <button
              onClick={() => setPreviewMode('manual')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${previewMode === 'manual'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <Pause className="w-3 h-3" />
              Manual
            </button>
          </div>

          {/* Manual Update Button */}
          {previewMode === 'manual' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleManualUpdate}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Update Preview
            </motion.button>
          )}

          {/* AI Toggle - Only show if AI is enabled */}
          {enableAI && (
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${showAiPanel
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Bot className="w-3 h-3" />
              AI Assistant
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo - Enhanced for AI */}
          {enableAI && enableAdvancedFeatures && (
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={undoAiEdit}
                disabled={currentEditIndex < -1}
                className="p-2 rounded-md text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo AI Edit"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redoAiEdit}
                disabled={currentEditIndex >= aiEdits.length - 1}
                className="p-2 rounded-md text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo AI Edit"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Viewport Size Controls */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewportSize('mobile')}
              className={`
                p-2 rounded-md transition-all
                ${viewportSize === 'mobile'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('tablet')}
              className={`
                p-2 rounded-md transition-all
                ${viewportSize === 'tablet'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('desktop')}
              className={`
                p-2 rounded-md transition-all
                ${viewportSize === 'desktop'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Controls */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`
              p-2 rounded-lg transition-all
              ${showGrid
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }
            `}
            title="Toggle grid overlay"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            title="Toggle preview"
          >
            {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={resetCode}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            title="Reset to original"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className={`
        flex ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-[600px]'}
        ${!isPreviewVisible ? 'single-pane' : ''}
      `}>
        {/* Code Editor + AI Panel */}
        <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex`}>
          {/* AI Sidebar - Only show if AI is enabled */}
          <AnimatePresence>
            {enableAI && showAiPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-50 border-r border-gray-200 flex flex-col"
              >
                {/* AI Panel Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      AI Assistant
                    </h4>
                    <button
                      onClick={() => setShowAiPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Prompt Input */}
                <div className="p-4 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe changes:
                  </label>
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Make this button larger and blue..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                    />
                    <button
                      onClick={handleAiPrompt}
                      disabled={!aiPrompt.trim() || isAiProcessing}
                      className={cn(
                        "absolute bottom-2 right-2 p-2 rounded-lg transition-colors duration-200",
                        aiPrompt.trim() && !isAiProcessing
                          ? "bg-purple-500 text-white hover:bg-purple-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {isAiProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h5>
                  <div className="space-y-2">
                    {getQuickSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setAiPrompt(suggestion)}
                        className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit History */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Edit History</h5>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 mb-2">Original</div>
                    {aiEdits.map((edit, index) => (
                      <div
                        key={edit.id}
                        className={cn(
                          "p-2 border rounded-lg text-xs cursor-pointer transition-all",
                          currentEditIndex === index
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                        onClick={() => applyAiEdit(index)}
                      >
                        <div className="font-medium text-gray-800">{edit.description}</div>
                        <div className="text-gray-500">
                          {edit.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Editor */}
          <div className="flex-1">
            <Editor
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              language={getLanguage()}
              theme={editorTheme === 'dark' ? 'vs-dark' : 'vs'}
              options={{
                minimap: { enabled: isFullscreen },
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                fontSize: 14,
                lineNumbers: 'on',
                folding: true,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                bracketPairColorization: { enabled: true }
              }}
            />
          </div>
        </div>

        {/* Live Preview */}
        <AnimatePresence>
          {isPreviewVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2 bg-gray-50 relative overflow-auto"
            >
              {/* Preview Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {viewportSize.charAt(0).toUpperCase() + viewportSize.slice(1)} Preview
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {dimensions.width} × {dimensions.height === '100%' ? 'auto' : dimensions.height}
                    </span>
                    
                    {previewMode === 'live' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Live</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 min-h-full">
                <div 
                  className={`
                    mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden
                    ${showGrid ? 'preview-grid' : ''}
                    ${viewportSize !== 'desktop' ? 'transition-all duration-300' : ''}
                  `}
                  style={{
                    width: dimensions.width,
                    height: dimensions.height === '100%' ? 'auto' : dimensions.height,
                    minHeight: viewportSize === 'desktop' ? '400px' : dimensions.height
                  }}
                >
                  <LivePreview 
                    code={previewCode}
                    componentType={componentType}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {getLanguage()}</span>
          {enableAI && aiEdits.length > 0 && (
            <span className="text-purple-600">
              {aiEdits.filter(e => e.applied).length}/{aiEdits.length} AI edits applied
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditorTheme(editorTheme === 'light' ? 'dark' : 'light')}
            className="hover:text-gray-700 transition-colors"
          >
            Theme: {editorTheme}
          </button>
          
          <div className="flex items-center gap-2">
            <span>Auto-save</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Grid Overlay Styles */}
      <style jsx>{`
        .preview-grid {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

// Enhanced Live Preview Component
function LivePreview({ 
  code, 
  componentType 
}: { 
  code: string; 
  componentType: string; 
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error when code changes
    setError(null);
  }, [code]);

  if (componentType === 'html') {
    return (
      <div className="w-full h-full">
        <iframe
          srcDoc={code}
          className="w-full h-full border-none"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
          onError={() => setError('Failed to render HTML')}
        />
      </div>
    );
  }

  // For React and Vue, show enhanced mock preview
  return (
    <div className="p-6 h-full">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <span className="font-semibold">Preview Error</span>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : (
        <EnhancedMockPreview 
          code={code} 
          componentType={componentType}
        />
      )}
    </div>
  );
}

// Enhanced Mock Preview with better component simulation
function EnhancedMockPreview({ 
  code, 
  componentType
}: { 
  code: string; 
  componentType: string;
}) {
  const [isInteractive, setIsInteractive] = useState(true);
  const [hoverElement, setHoverElement] = useState<string | null>(null);

  // Extract component characteristics from code
  const hasButtons = code.toLowerCase().includes('button');
  const hasForm = code.toLowerCase().includes('form') || code.toLowerCase().includes('input');
  const hasAnimation = code.toLowerCase().includes('animation') || code.toLowerCase().includes('transition');
  const hasImage = code.toLowerCase().includes('img') || code.toLowerCase().includes('image');
  const hasCard = code.toLowerCase().includes('card');
  const hasModal = code.toLowerCase().includes('modal');
  const hasGradient = code.toLowerCase().includes('gradient');

  return (
    <div className="space-y-4">
      {/* Interactive Preview Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold
            ${componentType === 'react' ? 'bg-blue-500' : ''}
            ${componentType === 'vue' ? 'bg-green-500' : ''}
            ${componentType === 'html' ? 'bg-orange-500' : ''}
          `}>
            {componentType === 'react' ? '⚛️' : componentType === 'vue' ? '💚' : '🌐'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Live Preview</h4>
            <p className="text-sm text-gray-500">Interactive {componentType} component</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInteractive(!isInteractive)}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-all
              ${isInteractive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            {isInteractive ? 'Interactive' : 'Static'}
          </button>
        </div>
      </div>

      {/* Enhanced Mock Component Rendering */}
      <div className="space-y-4">
        {hasModal && (
          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-8 relative">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Modal Component</h3>
              <p className="text-gray-600 mb-4">This is a preview of your modal component with backdrop and animations.</p>
              <div className="flex gap-3">
                <button className={`px-6 py-3 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${hasGradient ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  Confirm
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {hasCard && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {hasImage && (
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${hasGradient ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-blue-500'}`}>
                  <span className="text-white text-2xl">🖼️</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Card Component</h3>
                <p className="text-gray-600 mb-4">
                  Your component includes card-style layout with proper spacing and typography.
                </p>
                {hasButtons && (
                  <button 
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${hasGradient ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                    onMouseEnter={() => setHoverElement('button')}
                    onMouseLeave={() => setHoverElement(null)}
                  >
                    Action Button {hoverElement === 'button' && '(Hover detected!)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {hasForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Component</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input Field</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Interactive input field"
                  disabled={!isInteractive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Option</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isInteractive}
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <button 
                className={`w-full px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${hasGradient ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={!isInteractive}
              >
                Submit Form
              </button>
            </div>
          </div>
        )}

        {hasButtons && !hasForm && !hasCard && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Button Component</h3>
            <div className="flex gap-3 flex-wrap">
              <button className={`px-8 py-4 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${hasGradient ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
                Primary Button
              </button>
              <button className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-300">
                Secondary Button
              </button>
              <button className="px-8 py-4 border-2 border-blue-500 text-blue-500 rounded-xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                Outline Button
              </button>
            </div>
          </div>
        )}

        {/* Animation Preview */}
        {hasAnimation && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Animation Features</h4>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${hasGradient ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-purple-500'}`}
              >
                <span className="text-white">✨</span>
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">
                  Your component includes smooth animations and transitions
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hover effects, state changes, and micro-interactions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Code Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-3">Component Analysis</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasButtons ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasButtons ? 'text-green-700' : 'text-gray-500'}>Interactive Elements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasForm ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasForm ? 'text-green-700' : 'text-gray-500'}>Form Components</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasAnimation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasAnimation ? 'text-green-700' : 'text-gray-500'}>Animations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasGradient ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasGradient ? 'text-green-700' : 'text-gray-500'}>Gradients</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasImage ? 'text-green-700' : 'text-gray-500'}>Images/Media</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasCard ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasCard ? 'text-green-700' : 'text-gray-500'}>Card Layout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-700">Responsive Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-700">Modern Styling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CONSOLIDATED: Export both the enhanced version and a simplified version for backward compatibility
export const ComponentEditor = (props: Omit<ComponentEditorWithAIProps, 'enableAI' | 'showAIPanel' | 'enableAdvancedFeatures'>) => 
  ComponentEditorWithAI({ 
    ...props, 
    enableAI: false, 
    showAIPanel: false, 
    enableAdvancedFeatures: false 
  });

export default ComponentEditorWithAI;