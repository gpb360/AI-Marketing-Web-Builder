/**
 * Color Scheme Panel Component
 * 
 * AI-powered color selection and customization panel
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Copy,
  Check,
  Lightbulb,
  TrendingUp,
  Wand2
} from 'lucide-react';

import { BrandColors, BusinessAnalysisResult, ColorSchemePanelProps } from '@/types/context-aware-templates';

// Predefined color palettes optimized for different industries
const industryColorPalettes: Record<string, { name: string; colors: BrandColors; description: string }[]> = {
  technology: [
    {
      name: 'Tech Blue',
      colors: {
        primary: '#0066CC',
        secondary: '#004C99',
        accent: '#00A3E0',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      description: 'Professional and trustworthy'
    },
    {
      name: 'Modern Purple',
      colors: {
        primary: '#7C3AED',
        secondary: '#5B21B6',
        accent: '#A855F7',
        text: '#111827',
        background: '#FEFEFE'
      },
      description: 'Innovative and creative'
    },
    {
      name: 'Minimal Gray',
      colors: {
        primary: '#374151',
        secondary: '#1F2937',
        accent: '#6366F1',
        text: '#111827',
        background: '#F9FAFB'
      },
      description: 'Clean and sophisticated'
    }
  ],
  healthcare: [
    {
      name: 'Medical Blue',
      colors: {
        primary: '#0EA5E9',
        secondary: '#0284C7',
        accent: '#38BDF8',
        text: '#1E293B',
        background: '#FFFFFF'
      },
      description: 'Calm and professional'
    },
    {
      name: 'Health Green',
      colors: {
        primary: '#10B981',
        secondary: '#047857',
        accent: '#34D399',
        text: '#064E3B',
        background: '#F0FDF4'
      },
      description: 'Natural and healing'
    }
  ],
  finance: [
    {
      name: 'Corporate Blue',
      colors: {
        primary: '#1E40AF',
        secondary: '#1E3A8A',
        accent: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      description: 'Trustworthy and stable'
    },
    {
      name: 'Gold Accent',
      colors: {
        primary: '#1F2937',
        secondary: '#111827',
        accent: '#F59E0B',
        text: '#1F2937',
        background: '#FFFBEB'
      },
      description: 'Premium and luxurious'
    }
  ],
  default: [
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#0066CC',
        secondary: '#004C99',
        accent: '#00A3E0',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      description: 'Professional and versatile'
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981',
        text: '#064E3B',
        background: '#F0FDF4'
      },
      description: 'Natural and growth-focused'
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '#EA580C',
        secondary: '#C2410C',
        accent: '#FB923C',
        text: '#1C1917',
        background: '#FFFBEB'
      },
      description: 'Energetic and creative'
    }
  ]
};

// AI color generation suggestions
const getAIColorSuggestions = (businessContext: BusinessAnalysisResult): string[] => {
  const suggestions = [];
  
  if (businessContext.brand_personality.tone === 'professional') {
    suggestions.push('Use deep blues for trust and reliability');
  }
  
  if (businessContext.brand_personality.tone === 'creative') {
    suggestions.push('Consider vibrant purples or oranges for creativity');
  }
  
  if (businessContext.target_audience.demographics.includes('corporate')) {
    suggestions.push('Corporate grays with blue accents work well');
  }
  
  if (businessContext.industry_classification.primary === 'healthcare') {
    suggestions.push('Calming blues and greens promote trust in healthcare');
  }
  
  return suggestions;
};

export const ColorSchemePanel: React.FC<ColorSchemePanelProps> = ({
  currentColors,
  businessContext,
  onColorChange,
  onAIGenerate,
  className = ''
}) => {
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<BrandColors>(currentColors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Get industry-specific palettes
  const industry = businessContext.industry_classification.primary;
  const availablePalettes = industryColorPalettes[industry] || industryColorPalettes.default;

  // Generate AI suggestions on mount
  React.useEffect(() => {
    const suggestions = getAIColorSuggestions(businessContext);
    setAiSuggestions(suggestions);
  }, [businessContext]);

  // Handle palette selection
  const handlePaletteSelect = useCallback((palette: { name: string; colors: BrandColors }) => {
    setSelectedPalette(palette.name);
    setCustomColors(palette.colors);
    onColorChange(palette.colors);
  }, [onColorChange]);

  // Handle custom color changes
  const handleCustomColorChange = useCallback((colorKey: keyof BrandColors, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    onColorChange(newColors);
  }, [customColors, onColorChange]);

  // Handle AI color generation
  const handleAIGenerate = useCallback(async () => {
    if (onAIGenerate) {
      setIsGenerating(true);
      
      // Simulate AI generation
      setTimeout(() => {
        // Generate AI-optimized colors based on business context
        const aiColors: BrandColors = {
          primary: businessContext.brand_personality.tone === 'professional' ? '#1E40AF' : '#7C3AED',
          secondary: businessContext.brand_personality.tone === 'professional' ? '#1E3A8A' : '#5B21B6',
          accent: businessContext.industry_classification.primary === 'technology' ? '#00A3E0' : '#F59E0B',
          text: '#1F2937',
          background: '#FFFFFF'
        };
        
        setCustomColors(aiColors);
        onColorChange(aiColors);
        setSelectedPalette('AI Generated');
        setIsGenerating(false);
        
        if (onAIGenerate) {
          onAIGenerate();
        }
      }, 2000);
    }
  }, [businessContext, onColorChange, onAIGenerate]);

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  }, []);

  // Check if current colors match a palette
  const getCurrentPaletteName = () => {
    for (const palette of availablePalettes) {
      if (JSON.stringify(palette.colors) === JSON.stringify(currentColors)) {
        return palette.name;
      }
    }
    return selectedPalette || 'Custom';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Color Scheme</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose colors that reflect your brand personality
          </p>
        </div>
        
        <Button
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              AI Generate
            </>
          )}
        </Button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">AI Color Insights</span>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {suggestion}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Current: {getCurrentPaletteName()}
          </span>
          <div className="flex items-center gap-2">
            {Object.entries(currentColors).map(([key, color]) => (
              <button
                key={key}
                onClick={() => handleCopyColor(color)}
                className="relative group"
                title={`${key}: ${color}`}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600"
                  style={{ backgroundColor: color }}
                />
                {copiedColor === color && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Predefined Palettes */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Recommended for {businessContext.industry_classification.primary}
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {availablePalettes.map((palette) => (
            <Card
              key={palette.name}
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedPalette === palette.name || 
                JSON.stringify(palette.colors) === JSON.stringify(currentColors)
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
              onClick={() => handlePaletteSelect(palette)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Object.values(palette.colors).slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {palette.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {palette.description}
                    </div>
                  </div>
                </div>
                
                {(selectedPalette === palette.name || 
                  JSON.stringify(palette.colors) === JSON.stringify(currentColors)) && (
                  <Badge className="bg-purple-600 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Color Editor */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Custom Colors</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(customColors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => handleCustomColorChange(key as keyof BrandColors, e.target.value)}
                    className="w-12 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => handleCustomColorChange(key as keyof BrandColors, e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
                <Button
                  onClick={() => handleCopyColor(value)}
                  size="sm"
                  variant="outline"
                  className="p-2"
                >
                  {copiedColor === value ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Preview */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preview</h4>
        <div className="space-y-4">
          {/* Header Preview */}
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: customColors.background }}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="text-lg font-semibold"
                style={{ color: customColors.text }}
              >
                Your Business Name
              </div>
              <div className="flex gap-2">
                <div 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Primary Button
                </div>
                <div 
                  className="px-3 py-1 rounded border text-sm"
                  style={{ 
                    color: customColors.secondary,
                    borderColor: customColors.secondary 
                  }}
                >
                  Secondary
                </div>
              </div>
            </div>
            
            <div 
              className="text-2xl font-bold mb-2"
              style={{ color: customColors.primary }}
            >
              Transform Your Business
            </div>
            <div 
              className="text-sm mb-4"
              style={{ color: customColors.text }}
            >
              Professional solutions tailored to your industry needs
            </div>
            <div 
              className="inline-block px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: customColors.accent }}
            >
              Get Started
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ColorSchemePanel;