/**
 * Template Personalization Component
 * 
 * Provides personalization controls and options for templates
 * Part of Story 3.7: Context-Aware Template Recommendations
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  Eye, 
  Download, 
  RefreshCw,
  Wand2,
  Save,
  Undo,
  Redo,
  Settings,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

import {
  TemplatePersonalizationProps,
  PersonalizationSettings,
  PersonalizedTemplate,
  PersonalizationChange,
  BusinessAnalysisResult
} from '@/types/context-aware-templates';
import { Template } from '@/types/builder';

// Color palette options
const colorPalettes = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#0066CC',
      secondary: '#004C99',
      accent: '#00A3E0',
      text: '#1F2937',
      background: '#FFFFFF'
    }
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#A855F7',
      text: '#111827',
      background: '#FEFEFE'
    }
  },
  {
    id: 'creative-orange',
    name: 'Creative Orange',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      text: '#1C1917',
      background: '#FFFBEB'
    }
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    colors: {
      primary: '#10B981',
      secondary: '#047857',
      accent: '#34D399',
      text: '#064E3B',
      background: '#F0FDF4'
    }
  }
];

// Font combinations
const fontCombinations = [
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    description: 'Clean and professional'
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    description: 'Classic and refined'
  },
  {
    id: 'creative-mix',
    name: 'Creative Mix',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    description: 'Bold and friendly'
  },
  {
    id: 'tech-mono',
    name: 'Tech Mono',
    headingFont: 'JetBrains Mono',
    bodyFont: 'Roboto',
    description: 'Technical and precise'
  }
];

// Mock AI personalization function
const generatePersonalization = async (
  template: Template,
  businessContext: BusinessAnalysisResult,
  settings: PersonalizationSettings
): Promise<PersonalizedTemplate> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock personalized changes
  const changes: PersonalizationChange[] = [
    {
      property: 'hero.headline',
      original_value: 'Transform Your Business',
      new_value: `Transform Your ${businessContext.industry_classification.primary} Business`,
      reason: 'Customized for industry relevance',
      type: 'content',
      impact_score: 9
    },
    {
      property: 'hero.subheadline',
      original_value: 'Generic tagline',
      new_value: `Perfect for ${businessContext.target_audience.demographics.join(', ')} looking for ${businessContext.brand_personality.traits[0]} solutions`,
      reason: 'Tailored to target audience and brand personality',
      type: 'content',
      impact_score: 8
    },
    {
      property: 'cta.primary',
      original_value: 'Get Started',
      new_value: businessContext.business_type === 'b2b' ? 'Schedule Demo' : 'Shop Now',
      reason: 'Optimized for business model',
      type: 'content',
      impact_score: 7
    },
    {
      property: 'color.primary',
      original_value: '#0066CC',
      new_value: settings.brand_colors.primary,
      reason: 'Applied brand colors',
      type: 'style',
      impact_score: 6
    }
  ];

  return {
    original_template_id: template.id,
    personalized_components: template.components.map(component => ({
      component_id: component.id,
      original_props: component.props || {},
      personalized_props: {
        ...component.props,
        // Apply personalization based on settings
        ...(component.type === 'hero' && {
          headline: `Transform Your ${businessContext.industry_classification.primary} Business`,
          subheadline: `Perfect for ${businessContext.target_audience.demographics.join(', ')}`
        })
      },
      changes: changes.filter(change => change.property.startsWith(component.type)),
      ai_confidence: 0.85
    })),
    applied_settings: settings,
    personalization_score: 0.78,
    estimated_setup_time: 15
  };
};

export const TemplatePersonalization: React.FC<TemplatePersonalizationProps> = ({
  template,
  businessContext,
  onPersonalizationComplete,
  initialSettings,
  enablePreview = true,
  className = ''
}) => {
  // State
  const [settings, setSettings] = useState<PersonalizationSettings>(
    initialSettings || {
      brand_colors: colorPalettes[0].colors,
      typography: {
        heading_font: fontCombinations[0].headingFont,
        body_font: fontCombinations[0].bodyFont,
        font_size_scale: 1.0
      },
      content_preferences: {
        tone: businessContext.brand_personality.tone,
        content_length: 'detailed',
        use_industry_terms: true,
        include_social_proof: true
      },
      layout_preferences: {
        component_spacing: 'normal',
        section_order: ['hero', 'features', 'testimonials', 'pricing', 'cta'],
        sidebar_position: 'none'
      },
      interactive_elements: {
        animations: true,
        hover_effects: true,
        scroll_animations: true
      }
    }
  );

  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [personalizationProgress, setPersonalizationProgress] = useState(0);
  const [personalizedTemplate, setPersonalizedTemplate] = useState<PersonalizedTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle settings changes
  const updateSettings = useCallback((
    section: keyof PersonalizationSettings,
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Apply AI personalization
  const applyPersonalization = useCallback(async () => {
    setIsPersonalizing(true);
    setPersonalizationProgress(0);

    try {
      // Simulate progress
      const progressSteps = [
        { message: 'Analyzing template structure...', progress: 20 },
        { message: 'Generating content variations...', progress: 40 },
        { message: 'Applying brand customizations...', progress: 60 },
        { message: 'Optimizing layout and colors...', progress: 80 },
        { message: 'Finalizing personalization...', progress: 100 }
      ];

      for (const step of progressSteps) {
        setPersonalizationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      const personalized = await generatePersonalization(template, businessContext, settings);
      setPersonalizedTemplate(personalized);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      console.error('Personalization failed:', error);
    } finally {
      setIsPersonalizing(false);
      setPersonalizationProgress(0);
    }
  }, [template, businessContext, settings]);

  // Save personalization
  const savePersonalization = useCallback(() => {
    if (personalizedTemplate) {
      onPersonalizationComplete(personalizedTemplate);
    }
  }, [personalizedTemplate, onPersonalizationComplete]);

  // Color palette selector
  const renderColorPalette = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Color Palette</Label>
        <p className="text-sm text-gray-600">Choose colors that match your brand</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {colorPalettes.map(palette => (
          <Card 
            key={palette.id}
            className={`p-4 cursor-pointer transition-all ${
              JSON.stringify(settings.brand_colors) === JSON.stringify(palette.colors)
                ? 'ring-2 ring-blue-500' 
                : 'hover:shadow-md'
            }`}
            onClick={() => updateSettings('brand_colors', '', palette.colors)}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Object.values(palette.colors).slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <div className="font-medium text-sm">{palette.name}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Custom Colors</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(settings.brand_colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Label className="min-w-20 text-sm capitalize">{key.replace('_', ' ')}</Label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => updateSettings('brand_colors', key, e.target.value)}
                  className="w-12 h-8 p-1 border"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => updateSettings('brand_colors', key, e.target.value)}
                  className="font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Typography selector
  const renderTypography = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Typography</Label>
        <p className="text-sm text-gray-600">Select fonts that match your brand personality</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fontCombinations.map(combo => (
          <Card 
            key={combo.id}
            className={`p-4 cursor-pointer transition-all ${
              settings.typography.heading_font === combo.headingFont
                ? 'ring-2 ring-blue-500' 
                : 'hover:shadow-md'
            }`}
            onClick={() => {
              updateSettings('typography', 'heading_font', combo.headingFont);
              updateSettings('typography', 'body_font', combo.bodyFont);
            }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{combo.name}</h4>
                <span className="text-xs text-gray-500">{combo.description}</span>
              </div>
              <div className="space-y-1">
                <div style={{ fontFamily: combo.headingFont }} className="text-lg font-semibold">
                  Heading Example
                </div>
                <div style={{ fontFamily: combo.bodyFont }} className="text-sm text-gray-600">
                  This is how your body text will look with this font combination.
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Font Size Scale</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm">Small</span>
          <Slider
            value={[settings.typography.font_size_scale]}
            onValueChange={([value]) => updateSettings('typography', 'font_size_scale', value)}
            min={0.8}
            max={1.4}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm">Large</span>
        </div>
        <p className="text-xs text-gray-500">
          Current scale: {settings.typography.font_size_scale}x
        </p>
      </div>
    </div>
  );

  // Content preferences
  const renderContentPreferences = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Content Preferences</Label>
        <p className="text-sm text-gray-600">Customize how your content is generated and displayed</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Content Tone</Label>
          <Select 
            value={settings.content_preferences.tone} 
            onValueChange={(value) => updateSettings('content_preferences', 'tone', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Content Length</Label>
          <Select 
            value={settings.content_preferences.content_length} 
            onValueChange={(value) => updateSettings('content_preferences', 'content_length', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Use Industry Terms</Label>
            <Switch
              checked={settings.content_preferences.use_industry_terms}
              onCheckedChange={(checked) => updateSettings('content_preferences', 'use_industry_terms', checked)}
            />
          </div>
          <p className="text-xs text-gray-500">
            Include terminology specific to your industry
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Include Social Proof</Label>
            <Switch
              checked={settings.content_preferences.include_social_proof}
              onCheckedChange={(checked) => updateSettings('content_preferences', 'include_social_proof', checked)}
            />
          </div>
          <p className="text-xs text-gray-500">
            Add testimonials and credibility indicators
          </p>
        </div>
      </div>
    </div>
  );

  // Layout preferences
  const renderLayoutPreferences = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Layout & Structure</Label>
        <p className="text-sm text-gray-600">Adjust spacing and layout preferences</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Component Spacing</Label>
          <Select 
            value={settings.layout_preferences.component_spacing} 
            onValueChange={(value) => updateSettings('layout_preferences', 'component_spacing', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tight">Tight</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Animations</Label>
            <Switch
              checked={settings.interactive_elements.animations}
              onCheckedChange={(checked) => updateSettings('interactive_elements', 'animations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Hover Effects</Label>
            <Switch
              checked={settings.interactive_elements.hover_effects}
              onCheckedChange={(checked) => updateSettings('interactive_elements', 'hover_effects', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Scroll Animations</Label>
            <Switch
              checked={settings.interactive_elements.scroll_animations}
              onCheckedChange={(checked) => updateSettings('interactive_elements', 'scroll_animations', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wand2 className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">Personalize Template</h2>
            <p className="text-sm text-gray-600">
              Customize "{template.name}" for your {businessContext.industry_classification.primary} business
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enablePreview && (
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          )}
          <Button 
            onClick={applyPersonalization}
            disabled={isPersonalizing}
            className="gap-2"
          >
            {isPersonalizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Personalizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Personalize
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography" className="gap-2">
                  <Type className="h-4 w-4" />
                  Fonts
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-2">
                  <Layout className="h-4 w-4" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="colors" className="space-y-0">
                  {renderColorPalette()}
                </TabsContent>

                <TabsContent value="typography" className="space-y-0">
                  {renderTypography()}
                </TabsContent>

                <TabsContent value="content" className="space-y-0">
                  {renderContentPreferences()}
                </TabsContent>

                <TabsContent value="layout" className="space-y-0">
                  {renderLayoutPreferences()}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          {/* Progress */}
          {isPersonalizing && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium">Personalizing...</span>
                </div>
                <Progress value={personalizationProgress} className="w-full" />
                <p className="text-sm text-gray-600">
                  AI is customizing your template
                </p>
              </div>
            </Card>
          )}

          {/* Personalization Results */}
          {personalizedTemplate && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Personalization Complete</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Personalization Score:</span>
                    <Badge variant="secondary">
                      {Math.round(personalizedTemplate.personalization_score * 100)}%
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Setup Time:</span>
                    <span className="text-sm font-medium">
                      ~{personalizedTemplate.estimated_setup_time} min
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Components Modified:</span>
                    <span className="text-sm font-medium">
                      {personalizedTemplate.personalized_components.length}
                    </span>
                  </div>
                </div>

                <Button onClick={savePersonalization} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Apply Personalization
                </Button>
              </div>
            </Card>
          )}

          {/* Tips */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Tips</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use colors from your existing brand for consistency</p>
                <p>• Choose fonts that reflect your business personality</p>
                <p>• Enable animations for a modern feel</p>
                <p>• Professional tone works best for B2B businesses</p>
              </div>
            </div>
          </Card>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Unsaved Changes
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Click "AI Personalize" to apply your changes
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};