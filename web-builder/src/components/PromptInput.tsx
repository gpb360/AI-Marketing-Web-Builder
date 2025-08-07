'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Bot, CheckCircle, AlertTriangle } from 'lucide-react';
import { PromptProcessor } from '@/lib/ai/prompt-processor';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File | null) => void;
  uploadedImage?: File | null;
  className?: string;
  showAnalysis?: boolean;
  onAnalysisUpdate?: (analysis: any) => void;
}

export function PromptInput({ 
  value, 
  onChange, 
  placeholder = "Describe your component...",
  onImageUpload,
  uploadedImage,
  className = '',
  showAnalysis = false,
  onAnalysisUpdate
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [promptProcessor] = useState(() => new PromptProcessor());
  const [analysis, setAnalysis] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [suggestedTemplates, setSuggestedTemplates] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea and analyze prompt
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    
    // Analyze prompt for intelligence
    if (value.trim().length > 5) {
      const promptAnalysis = promptProcessor.analyzePrompt(value);
      const promptValidation = promptProcessor.validatePrompt(value);
      const templates = promptProcessor.getSuggestedTemplates(value);
      
      setAnalysis(promptAnalysis);
      setValidation(promptValidation);
      setSuggestedTemplates(templates.slice(0, 3));
      
      if (onAnalysisUpdate) {
        onAnalysisUpdate(promptAnalysis);
      }
    } else {
      setAnalysis(null);
      setValidation(null);
      setSuggestedTemplates([]);
    }
  }, [value, onAnalysisUpdate, promptProcessor]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile && onImageUpload) {
      onImageUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const removeImage = () => {
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  const characterCount = value.length;
  const maxCharacters = 1000;
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Input Area */}
      <div
        className={`
          relative border-2 rounded-xl transition-all duration-200
          ${isFocused 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
          }
          ${isDragging ? 'border-blue-500 bg-blue-50' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full p-4 bg-transparent border-none outline-none resize-none min-h-[120px] text-gray-800 placeholder-gray-500 ${
            validation && !validation.isValid ? 'text-red-600' : ''
          }`}
          maxLength={maxCharacters}
        />

        {/* Upload Button */}
        {onImageUpload && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isFocused || isDragging
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
              `}
              title="Upload reference image"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Uploaded Image Preview */}
      {uploadedImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="relative bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {uploadedImage.name}
            </p>
            <p className="text-xs text-gray-500">
              {(uploadedImage.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeImage}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Validation and Analysis */}
      {validation && !validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
            <AlertTriangle className="w-4 h-4" />
            Prompt Issues
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error: string, index: number) => (
              <li key={index} className="flex items-start gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {validation && validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-1">
            <AlertTriangle className="w-4 h-4" />
            Suggestions for Better Results
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validation.warnings.map((warning: string, index: number) => (
              <li key={index} className="flex items-start gap-1">
                <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* AI Analysis Display */}
      {showAnalysis && analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-2">
            <Bot className="w-4 h-4" />
            AI Analysis ({Math.round(analysis.confidence * 100)}% confidence)
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-blue-600 font-medium">Intent:</span>
              <p className="text-blue-800 capitalize">{analysis.intent}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Entities:</span>
              <p className="text-blue-800">
                {Object.values(analysis.entities).flat().length} detected
              </p>
            </div>
          </div>
          
          {analysis.suggestions.length > 0 && (
            <div className="mt-2">
              <span className="text-blue-600 font-medium text-xs">Improvements:</span>
              <ul className="mt-1 space-y-1">
                {analysis.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                  <li key={index} className="text-xs text-blue-700 flex items-start gap-1">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Smart Templates */}
      {suggestedTemplates.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-purple-800 text-sm font-medium mb-2">
            <Bot className="w-4 h-4" />
            Suggested Templates
          </div>
          
          <div className="space-y-2">
            {suggestedTemplates.map((template: any, index: number) => (
              <button
                key={index}
                onClick={() => onChange(template.examples[0])}
                className="w-full text-left p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-purple-900">{template.name}</div>
                <div className="text-xs text-purple-700 mt-1">{template.template}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Character Count and Tips */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {isDragging && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-blue-600 font-medium"
            >
              Drop image here to add as reference
            </motion.span>
          )}
          {!isDragging && !analysis && (
            <span className="text-gray-500">
              Try: &quot;Create a responsive pricing card with hover effects and gradient background&quot;
            </span>
          )}
          {analysis && (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Prompt analyzed - ready for generation
            </span>
          )}
        </div>
        
        <span className={`
          font-medium transition-colors
          ${isOverLimit 
            ? 'text-red-500' 
            : isNearLimit 
            ? 'text-yellow-500' 
            : 'text-gray-400'
          }
        `}>
          {characterCount}/{maxCharacters}
        </span>
      </div>

      {/* Enhanced Quick Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Quick Start Ideas</h4>
          <span className="text-xs text-gray-500">{quickSuggestions.length} suggestions</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onChange(suggestion)}
              className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-all duration-200 group"
            >
              <div className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Prompt Variations */}
        {analysis && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt Variations</h4>
            <div className="space-y-2">
              {promptProcessor.generatePromptVariations(value).map((variation: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onChange(variation)}
                  className="w-full text-left p-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-lg text-sm text-gray-700 transition-all duration-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{variation}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const quickSuggestions = [
  "Responsive navigation menu with dropdown",
  "Pricing card with features and CTA button",
  "Dashboard widget with chart and metrics",
  "Contact form with validation",
  "Hero section with background image",
  "Product showcase with image gallery"
];