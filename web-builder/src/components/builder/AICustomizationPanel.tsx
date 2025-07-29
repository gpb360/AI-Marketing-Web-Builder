'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface AICustomizationPanelProps {
  className?: string;
}

export function AICustomizationPanel({ className }: AICustomizationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    aiContext,
    setAIContext,
    requestAICustomization,
    updateComponent,
    getSelectedComponent,
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || !selectedComponent) return;

    setIsProcessing(true);
    try {
      await requestAICustomization(selectedComponent.id, prompt);
      setPrompt('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    if (!selectedComponent) return;

    // Apply the suggestion to the component
    const updates = { props: { ...selectedComponent.props } };
    
    switch (suggestion.property) {
      case 'style':
        updates.props.style = {
          ...updates.props.style,
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'animation':
        updates.props.animation = 'hover:scale-105 transition-transform duration-200';
        break;
      default:
        updates.props[suggestion.property] = suggestion.suggestion;
    }

    updateComponent(selectedComponent.id, updates);
  };

  const handleClose = () => {
    setAIContext(null);
  };

  if (!aiContext || !selectedComponent) {
    return (
      <div className={cn("w-80 bg-white border-l border-gray-200 p-6", className)}>
        <div className="text-center text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI Assistant
          </h3>
          <p className="text-sm mb-4">
            Select a component and double-click it to start customizing with AI
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Try these prompts:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• "Make this button more prominent"</li>
              <li>• "Change the color scheme to green"</li>
              <li>• "Add a subtle animation effect"</li>
              <li>• "Make this look more professional"</li>
            </ul>
          </div>
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
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Customization
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
        </div>
      </div>

      {/* AI Prompt Input */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you want to change:
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make this button larger and change the color to blue..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPrompt("Make this component look more modern and professional")}
            className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-xs">Modernize</span>
          </button>
          <button
            onClick={() => setPrompt("Change the color scheme to match my brand")}
            className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Palette className="w-4 h-4 text-blue-500" />
            <span className="text-xs">Brand Colors</span>
          </button>
          <button
            onClick={() => setPrompt("Add subtle animations and hover effects")}
            className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs">Animate</span>
          </button>
          <button
            onClick={() => setPrompt("Optimize for mobile devices")}
            className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Settings className="w-4 h-4 text-green-500" />
            <span className="text-xs">Mobile</span>
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiContext.suggestedModifications.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
            AI Suggestions
          </h4>
          <div className="space-y-3">
            {aiContext.suggestedModifications.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-medium text-purple-900">
                    {suggestion.suggestion}
                  </h5>
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-purple-700 mb-2">
                  {suggestion.reason}
                </p>
                <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block">
                  {suggestion.property}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Properties */}
      <div className="border-t border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Current Properties
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(selectedComponent.props).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-900 font-mono truncate ml-2">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}