/**
 * Typography Panel Component
 * 
 * AI-powered typography selection and customization panel
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Wand2, 
  RefreshCw, 
  Lightbulb,
  TrendingUp,
  Eye,
  Target,
  CheckCircle2
} from 'lucide-react';

import { 
  Typography, 
  BusinessAnalysisResult, 
  TypographyPanelProps 
} from '@/types/context-aware-templates';

// Font combinations optimized for different industries and brand personalities
const fontCombinations = [
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    description: 'Clean and professional',
    industries: ['technology', 'finance', 'consulting'],
    personality: ['professional', 'modern'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    description: 'Classic and refined',
    industries: ['legal', 'real-estate', 'luxury'],
    personality: ['elegant', 'traditional'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  },
  {
    id: 'creative-mix',
    name: 'Creative Mix',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    description: 'Bold and friendly',
    industries: ['creative', 'marketing', 'entertainment'],
    personality: ['creative', 'friendly'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  },
  {
    id: 'tech-mono',
    name: 'Tech Mono',
    headingFont: 'JetBrains Mono',
    bodyFont: 'Roboto',
    description: 'Technical and precise',
    industries: ['technology', 'software'],
    personality: ['technical', 'precise'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  },
  {
    id: 'warm-humanist',
    name: 'Warm Humanist',
    headingFont: 'Nunito',
    bodyFont: 'Nunito',
    description: 'Approachable and friendly',
    industries: ['healthcare', 'education', 'nonprofit'],
    personality: ['friendly', 'approachable'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  },
  {
    id: 'minimal-geometric',
    name: 'Minimal Geometric',
    headingFont: 'Poppins',
    bodyFont: 'Poppins',
    description: 'Geometric and modern',
    industries: ['design', 'architecture', 'technology'],
    personality: ['minimal', 'modern'],
    preview: {
      heading: 'The quick brown fox jumps',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  }
];

// AI typography recommendations based on business context
const getAITypographyRecommendations = (businessContext: BusinessAnalysisResult): string[] => {
  const recommendations = [];
  const industry = businessContext.industry_classification.primary;
  const personality = businessContext.brand_personality.tone;
  
  if (personality === 'professional') {
    recommendations.push('Sans-serif fonts convey professionalism and clarity');
  }
  
  if (personality === 'creative') {
    recommendations.push('Mix serif headings with sans-serif body for creative appeal');
  }
  
  if (industry === 'healthcare') {
    recommendations.push('Readable fonts build trust in healthcare communications');
  }
  
  if (industry === 'technology') {
    recommendations.push('Modern geometric fonts align with tech innovation');
  }
  
  if (businessContext.target_audience.demographics.includes('corporate')) {
    recommendations.push('Corporate audiences prefer conservative, readable typefaces');
  }
  
  return recommendations;
};

// Font size scale presets
const fontScalePresets = [
  { name: 'Compact', scale: 0.875, description: 'Dense, information-rich' },
  { name: 'Standard', scale: 1.0, description: 'Balanced readability' },
  { name: 'Comfortable', scale: 1.125, description: 'Easy reading experience' },
  { name: 'Large', scale: 1.25, description: 'Accessibility focused' }
];

export const TypographyPanel: React.FC<TypographyPanelProps> = ({
  currentTypography,
  businessContext,
  onTypographyChange,
  onAIGenerate,
  className = ''
}) => {
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null);
  const [customTypography, setCustomTypography] = useState<Typography>(currentTypography);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState({
    heading: 'Transform Your Business',
    subheading: 'Professional Solutions That Drive Results',
    body: 'Our innovative approach combines industry expertise with cutting-edge technology to deliver exceptional outcomes for your business.'
  });

  // Get recommended font combinations based on business context
  const recommendedCombinations = React.useMemo(() => {
    const industry = businessContext.industry_classification.primary;
    const personality = businessContext.brand_personality.tone;
    
    return fontCombinations.filter(combo => 
      combo.industries.includes(industry) || 
      combo.personality.includes(personality)
    );
  }, [businessContext]);

  // Generate AI recommendations on mount
  useEffect(() => {
    const recommendations = getAITypographyRecommendations(businessContext);
    setAiRecommendations(recommendations);
  }, [businessContext]);

  // Update preview text based on business context
  useEffect(() => {
    const industry = businessContext.industry_classification.primary;
    const businessType = businessContext.business_type;
    
    setPreviewText({
      heading: `Transform Your ${industry.charAt(0).toUpperCase() + industry.slice(1)} Business`,
      subheading: `Professional ${industry} solutions for ${businessType === 'b2b' ? 'enterprises' : 'modern businesses'}`,
      body: `Our innovative approach combines ${industry} expertise with cutting-edge technology to deliver exceptional outcomes for your business.`
    });
  }, [businessContext]);

  // Handle font combination selection
  const handleCombinationSelect = useCallback((combination: typeof fontCombinations[0]) => {
    const newTypography: Typography = {
      heading_font: combination.headingFont,
      body_font: combination.bodyFont,
      font_size_scale: customTypography.font_size_scale
    };
    
    setSelectedCombination(combination.id);
    setCustomTypography(newTypography);
    onTypographyChange(newTypography);
  }, [customTypography.font_size_scale, onTypographyChange]);

  // Handle font size scale change
  const handleFontScaleChange = useCallback((scale: number) => {
    const newTypography = { ...customTypography, font_size_scale: scale };
    setCustomTypography(newTypography);
    onTypographyChange(newTypography);
  }, [customTypography, onTypographyChange]);

  // Handle AI typography generation
  const handleAIGenerate = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const industry = businessContext.industry_classification.primary;
      const personality = businessContext.brand_personality.tone;
      
      // AI logic to select best font combination
      let bestCombination = fontCombinations[0];
      
      if (personality === 'professional' && industry === 'finance') {
        bestCombination = fontCombinations.find(c => c.id === 'modern-sans') || fontCombinations[0];
      } else if (personality === 'creative') {
        bestCombination = fontCombinations.find(c => c.id === 'creative-mix') || fontCombinations[0];
      } else if (industry === 'technology') {
        bestCombination = fontCombinations.find(c => c.id === 'tech-mono') || fontCombinations[0];
      } else if (industry === 'healthcare') {
        bestCombination = fontCombinations.find(c => c.id === 'warm-humanist') || fontCombinations[0];
      }
      
      handleCombinationSelect(bestCombination);
      setIsGenerating(false);
      
      if (onAIGenerate) {
        onAIGenerate();
      }
    }, 2000);
  }, [businessContext, handleCombinationSelect, onAIGenerate]);

  // Check if current typography matches a combination
  const getCurrentCombinationName = () => {
    for (const combo of fontCombinations) {
      if (combo.headingFont === currentTypography.heading_font && 
          combo.bodyFont === currentTypography.body_font) {
        return combo.name;
      }
    }
    return selectedCombination ? 
      fontCombinations.find(c => c.id === selectedCombination)?.name || 'Custom' : 
      'Custom';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Typography</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select fonts that enhance readability and brand personality
          </p>
        </div>
        
        <Button
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              AI Optimize
            </>
          )}
        </Button>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-indigo-900 dark:text-indigo-100 text-sm">Typography Insights</span>
          </div>
          <div className="space-y-2">
            {aiRecommendations.map((recommendation, index) => (
              <div key={index} className="text-sm text-indigo-800 dark:text-indigo-200 flex items-start gap-2">
                <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {recommendation}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Current: {getCurrentCombinationName()}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Scale: {customTypography.font_size_scale}x</span>
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div 
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            style={{ 
              fontFamily: customTypography.heading_font,
              fontSize: `${2 * customTypography.font_size_scale}rem`
            }}
          >
            {previewText.heading}
          </div>
          <div 
            className="text-lg text-gray-600 dark:text-gray-400 mb-4"
            style={{ 
              fontFamily: customTypography.heading_font,
              fontSize: `${1.25 * customTypography.font_size_scale}rem`
            }}
          >
            {previewText.subheading}
          </div>
          <div 
            className="text-gray-700 dark:text-gray-300"
            style={{ 
              fontFamily: customTypography.body_font,
              fontSize: `${1 * customTypography.font_size_scale}rem`,
              lineHeight: '1.6'
            }}
          >
            {previewText.body}
          </div>
        </div>
      </Card>

      {/* Recommended Combinations */}
      {recommendedCombinations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Recommended for {businessContext.industry_classification.primary}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {recommendedCombinations.map((combination) => (
              <Card
                key={combination.id}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedCombination === combination.id ||
                  (combination.headingFont === currentTypography.heading_font && 
                   combination.bodyFont === currentTypography.body_font)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
                onClick={() => handleCombinationSelect(combination)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {combination.name}
                      {(selectedCombination === combination.id ||
                        (combination.headingFont === currentTypography.heading_font && 
                         combination.bodyFont === currentTypography.body_font)) && (
                        <Badge className="bg-indigo-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {combination.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {combination.headingFont} • {combination.bodyFont}
                    </div>
                  </div>
                </div>
                
                {/* Font Preview */}
                <div className="space-y-2">
                  <div 
                    className="text-xl font-bold text-gray-900 dark:text-gray-100"
                    style={{ fontFamily: combination.headingFont }}
                  >
                    {combination.preview.heading}
                  </div>
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400"
                    style={{ fontFamily: combination.bodyFont }}
                  >
                    {combination.preview.body}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Font Combinations */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">All Font Combinations</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {fontCombinations.filter(combo => 
            !recommendedCombinations.some(rec => rec.id === combo.id)
          ).map((combination) => (
            <Card
              key={combination.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedCombination === combination.id ||
                (combination.headingFont === currentTypography.heading_font && 
                 combination.bodyFont === currentTypography.body_font)
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
              onClick={() => handleCombinationSelect(combination)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {combination.name}
                    {(selectedCombination === combination.id ||
                      (combination.headingFont === currentTypography.heading_font && 
                       combination.bodyFont === currentTypography.body_font)) && (
                      <Badge className="bg-indigo-600 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {combination.description}
                  </div>
                </div>
              </div>
              
              {/* Font Preview */}
              <div className="space-y-2">
                <div 
                  className="text-lg font-bold text-gray-900 dark:text-gray-100"
                  style={{ fontFamily: combination.headingFont }}
                >
                  Heading Sample
                </div>
                <div 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  style={{ fontFamily: combination.bodyFont }}
                >
                  Body text sample for readability testing
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Font Size Scale */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Font Size Scale</h4>
        
        {/* Scale Presets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {fontScalePresets.map((preset) => (
            <Button
              key={preset.name}
              onClick={() => handleFontScaleChange(preset.scale)}
              variant={Math.abs(customTypography.font_size_scale - preset.scale) < 0.01 ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col h-auto py-3"
            >
              <span className="font-medium">{preset.name}</span>
              <span className="text-xs opacity-70">{preset.scale}x</span>
            </Button>
          ))}
        </div>
        
        {/* Custom Scale Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Scale</Label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {customTypography.font_size_scale}x
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Small</span>
            <Slider
              value={[customTypography.font_size_scale]}
              onValueChange={([value]) => handleFontScaleChange(value)}
              min={0.75}
              max={1.5}
              step={0.025}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">Large</span>
          </div>
          
          {/* Scale Impact */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Accessibility: {customTypography.font_size_scale >= 1.125 ? 'Good' : 'Consider larger sizes'}</div>
            <div>Reading comfort: {customTypography.font_size_scale >= 1.0 ? 'Optimal' : 'May be difficult to read'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TypographyPanel;