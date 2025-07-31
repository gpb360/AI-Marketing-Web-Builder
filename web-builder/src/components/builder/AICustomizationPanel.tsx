'use client';

import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Send,
  Wand2,
  Palette,
  Settings,
  Zap,
  X,
  Lightbulb,
  CheckCircle,
  Code,
  History,
  Copy,
  RotateCcw,
  Bot,
  User,
  Check,
  ChevronRight,
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react';

interface AICustomizationPanelProps {
  className?: string;
  onOpenEditor?: () => void;
}

interface AIEditHistory {
  id: string;
  prompt: string;
  changes: any;
  timestamp: Date;
  applied: boolean;
  description: string;
}

export function AICustomizationPanel({ className, onOpenEditor }: AICustomizationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editHistory, setEditHistory] = useState<AIEditHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [contextAnalysis, setContextAnalysis] = useState<any>(null);
  
  const {
    aiContext,
    setAIContext,
    requestAICustomization,
    updateComponent,
    getSelectedComponent,
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();

  useEffect(() => {
    if (selectedComponent) {
      // Analyze component context for better AI suggestions
      analyzeComponentContext(selectedComponent);
    }
  }, [selectedComponent]);

  const analyzeComponentContext = (component: any) => {
    const analysis = {
      type: component.type,
      hasStyle: !!component.props.style,
      hasAnimation: !!(component.props.className?.includes('animate') || component.props.animation),
      hasForm: component.type === 'form' || component.type === 'input',
      hasButton: component.type === 'button',
      hasText: component.type === 'text' || component.props.content,
      isContainer: component.type === 'container' || component.type === 'div',
      complexity: 'medium',
      recommendations: []
    };

    // Generate contextual recommendations
    const recommendations = [];
    
    if (analysis.hasButton) {
      recommendations.push('button-enhancement');
    }
    if (analysis.hasText) {
      recommendations.push('text-optimization');
    }
    if (analysis.hasForm) {
      recommendations.push('form-ux');
    }
    if (!analysis.hasAnimation) {
      recommendations.push('add-animation');
    }
    if (analysis.isContainer) {
      recommendations.push('layout-optimization');
    }

    setContextAnalysis({ ...analysis, recommendations });
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || !selectedComponent) return;

    setIsProcessing(true);
    try {
      // Enhanced AI processing with component context
      const response = await processAIRequest(selectedComponent, prompt);
      
      // Add to history
      const newEdit: AIEditHistory = {
        id: `ai-${Date.now()}`,
        prompt,
        changes: response.changes,
        timestamp: new Date(),
        applied: false,
        description: response.description
      };
      
      setEditHistory(prev => [newEdit, ...prev]);
      
      // Apply changes
      updateComponent(selectedComponent.id, response.changes);
      setPrompt('');
    } catch (error) {
      console.error('AI customization failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAIRequest = async (component: any, userPrompt: string) => {
    // Simulate AI processing - replace with actual API
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const changes = generateAIChanges(component, userPrompt);
        resolve({
          changes,
          description: `Applied: ${userPrompt.substring(0, 30)}...`
        });
      }, 1200);
    });
  };

  const generateAIChanges = (component: any, prompt: string) => {
    const changes: any = { props: { ...component.props } };
    
    const promptLower = prompt.toLowerCase();
    
    // Smart AI responses based on component type and prompt
    if (promptLower.includes('color') && promptLower.includes('blue')) {
      changes.props.style = {
        ...changes.props.style,
        backgroundColor: '#3B82F6',
        color: '#FFFFFF'
      };
    }
    
    if (promptLower.includes('modern') || promptLower.includes('professional')) {
      changes.props.style = {
        ...changes.props.style,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '16px'
      };
    }
    
    if (promptLower.includes('animation') || promptLower.includes('hover')) {
      changes.props.className = `${changes.props.className || ''} hover:scale-105 transition-transform duration-200`.trim();
    }
    
    if (promptLower.includes('larger') || promptLower.includes('bigger')) {
      changes.props.style = {
        ...changes.props.style,
        padding: '20px',
        fontSize: '18px'
      };
    }
    
    if (promptLower.includes('mobile') || promptLower.includes('responsive')) {
      changes.props.responsive = true;
    }
    
    return changes;
  };

  const applyEdit = (edit: AIEditHistory) => {
    if (!selectedComponent) return;
    
    updateComponent(selectedComponent.id, edit.changes);
    
    setEditHistory(prev => 
      prev.map(e => e.id === edit.id ? { ...e, applied: true } : e)
    );
  };

  const revertEdit = (edit: AIEditHistory) => {
    // Find the previous state
    const currentIndex = editHistory.findIndex(e => e.id === edit.id);
    if (currentIndex > 0) {
      const previousEdit = editHistory[currentIndex - 1];
      updateComponent(selectedComponent!.id, previousEdit.changes);
    } else {
      // Revert to original
      updateComponent(selectedComponent!.id, { props: {} });
    }
    
    setEditHistory(prev => 
      prev.map(e => e.id === edit.id ? { ...e, applied: false } : e)
    );
  };

  const handleClose = () => {
    setAIContext(null);
  };

  const getQuickActions = () => {
    if (!contextAnalysis) return [];
    
    const actions = [
      {
        id: 'modernize',
        title: 'Modern Look',
        icon: Wand2,
        prompt: 'Make this component look modern and professional with proper spacing and shadows',
        color: 'purple'
      },
      {
        id: 'colors',
        title: 'Brand Colors',
        icon: Palette,
        prompt: 'Apply my brand colors to this component',
        color: 'blue'
      },
      {
        id: 'animate',
        title: 'Add Animation',
        icon: Zap,
        prompt: 'Add subtle hover animations and transitions',
        color: 'yellow'
      },
      {
        id: 'mobile',
        title: 'Mobile Optimize',
        icon: Settings,
        prompt: 'Optimize this component for mobile devices',
        color: 'green'
      }
    ];
    
    return actions.filter(action => 
      contextAnalysis.recommendations.includes(`${action.id}-enhancement`) ||
      contextAnalysis.recommendations.includes(action.id)
    );
  };

  const getContextualSuggestions = () => {
    if (!contextAnalysis || !selectedComponent) return [];
    
    const suggestions = [];
    
    if (selectedComponent.type === 'button') {
      suggestions.push(
        'Make this button more prominent',
        'Add hover effects and transitions',
        'Change button color to match brand'
      );
    }
    
    if (selectedComponent.type === 'text') {
      suggestions.push(
        'Improve readability with better typography',
        'Add responsive font sizes',
        'Adjust line spacing for better UX'
      );
    }
    
    if (selectedComponent.type === 'container') {
      suggestions.push(
        'Add modern spacing and padding',
        'Include subtle shadows for depth',
        'Improve responsive layout'
      );
    }
    
    if (selectedComponent.type === 'form') {
      suggestions.push(
        'Optimize form field spacing',
        'Add input validation styling',
        'Improve mobile form UX'
      );
    }
    
    return suggestions.slice(0, 3);
  };

  if (!selectedComponent) {
    return (
      <div className={cn("w-80 bg-white border-l border-gray-200 p-6", className)}>
        <div className="text-center text-gray-500">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI Assistant
          </h3>
          <p className="text-sm mb-4">
            Select a component to start customizing with AI
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              🎯 How to use:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click any component on the canvas</li>
              <li>• Use natural language prompts</li>
              <li>• Apply AI suggestions instantly</li>
              <li>• Undo/redo changes easily</li>
            </ul>
          </div>
          
          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Open Advanced Editor
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-80 bg-white border-l border-gray-200 flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Assistant
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Customizing: <span className="font-medium">{selectedComponent.name}</span>
          <span className="text-xs text-gray-500 ml-2">({selectedComponent.type})</span>
        </div>
      </div>

      {/* Context Analysis */}
      {contextAnalysis && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-700 font-medium">AI Analysis</span>
            <span className="text-blue-600">{contextAnalysis.recommendations.length} suggestions</span>
          </div>
        </div>
      )}

      {/* AI Prompt Input */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you want:
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make this button larger with blue color..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            rows={3}
          />
          <button
            onClick={handleSubmitPrompt}
            disabled={!prompt.trim() || isProcessing}
            className={cn(
              "absolute bottom-2 right-2 p-2 rounded-lg transition-colors duration-200",
              prompt.trim() && !isProcessing
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showSuggestions ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showSuggestions && (
          <div className="space-y-2">
            {getContextualSuggestions().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="w-full text-left p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Smart Actions */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Smart Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {getQuickActions().map((action) => (
            <button
              key={action.id}
              onClick={() => setPrompt(action.prompt)}
              className={cn(
                "flex items-center space-x-2 p-2 border rounded-lg transition-colors duration-200 text-xs",
                `border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100`
              )}
            >
              <action.icon className={cn("w-3 h-3", `text-${action.color}-500`)} />
              <span className={cn(`text-${action.color}-700`)}>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <History className="w-4 h-4 mr-2" />
              Edit History
            </h4>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {showHistory && (
          <div className="p-4 space-y-2">
            {editHistory.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                No AI edits yet. Start customizing!
              </p>
            ) : (
              editHistory.map((edit) => (
                <div
                  key={edit.id}
                  className={cn(
                    "p-3 border rounded-lg text-xs",
                    edit.applied 
                      ? "border-green-200 bg-green-50" 
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{edit.description}</div>
                      <div className="text-gray-500">
                        {edit.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {edit.applied ? (
                        <button
                          onClick={() => revertEdit(edit)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Revert"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => applyEdit(edit)}
                          className="text-green-600 hover:text-green-800"
                          title="Apply"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Current Properties */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Properties
          </h4>
          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <Code className="w-3 h-3" />
              Advanced
            </button>
          )}
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {Object.entries(selectedComponent.props || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-900 font-mono truncate ml-2 max-w-[100px]">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}