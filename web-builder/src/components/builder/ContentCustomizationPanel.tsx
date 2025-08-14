/**
 * Content Customization Panel Component
 * 
 * AI-powered content generation and customization panel
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Wand2, 
  RefreshCw, 
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  Copy,
  Edit3,
  Sparkles
} from 'lucide-react';

import { 
  BusinessAnalysisResult, 
  ContentPreferences, 
  ContentCustomizationPanelProps 
} from '@/types/context-aware-templates';

// Sample content sections for different template types
const contentSections = [
  {
    id: 'hero',
    title: 'Hero Section',
    description: 'Main headline and call-to-action',
    fields: ['headline', 'subheadline', 'cta_text']
  },
  {
    id: 'about',
    title: 'About Section',
    description: 'Company overview and value proposition',
    fields: ['about_title', 'about_description']
  },
  {
    id: 'services',
    title: 'Services/Features',
    description: 'Key offerings and benefits',
    fields: ['services_title', 'service_1', 'service_2', 'service_3']
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    description: 'Customer reviews and social proof',
    fields: ['testimonial_title', 'testimonial_1', 'testimonial_2']
  },
  {
    id: 'contact',
    title: 'Contact Section',
    description: 'Contact information and forms',
    fields: ['contact_title', 'contact_description']
  }
];

// AI content generation based on business context
const generateAIContent = (
  businessContext: BusinessAnalysisResult,
  sectionId: string,
  fieldId: string,
  preferences: ContentPreferences
): string => {
  const industry = businessContext.industry_classification.primary;
  const businessType = businessContext.business_type;
  const tone = preferences.tone;
  const goals = businessContext.content_requirements;

  // Industry-specific content templates
  const contentTemplates: Record<string, Record<string, string>> = {
    technology: {
      headline: tone === 'professional' 
        ? 'Transform Your Business with Cutting-Edge Technology Solutions'
        : 'Revolutionize Your Digital Experience',
      subheadline: `Advanced ${industry} solutions designed for ${businessType === 'b2b' ? 'enterprises' : 'modern consumers'}`,
      cta_text: businessType === 'b2b' ? 'Schedule Demo' : 'Get Started Free',
      about_title: 'Innovation Meets Excellence',
      about_description: `We're pioneering the future of ${industry} with solutions that drive real results for your business.`
    },
    healthcare: {
      headline: 'Compassionate Care, Advanced Solutions',
      subheadline: 'Providing exceptional healthcare services with a patient-first approach',
      cta_text: 'Book Appointment',
      about_title: 'Your Health, Our Priority',
      about_description: 'Committed to delivering personalized healthcare solutions that improve lives and build healthier communities.'
    },
    finance: {
      headline: 'Secure Your Financial Future',
      subheadline: 'Trusted financial services tailored to your goals',
      cta_text: 'Start Planning',
      about_title: 'Trusted Financial Partnership',
      about_description: 'Building wealth and securing futures through expert financial guidance and innovative solutions.'
    },
    default: {
      headline: `Transform Your ${industry.charAt(0).toUpperCase() + industry.slice(1)} Business`,
      subheadline: `Professional ${industry} solutions tailored to your success`,
      cta_text: businessType === 'b2b' ? 'Learn More' : 'Get Started',
      about_title: 'Excellence in Every Detail',
      about_description: `We deliver exceptional ${industry} services that drive results and exceed expectations.`
    }
  };

  const templates = contentTemplates[industry] || contentTemplates.default;
  return templates[fieldId] || `Generated content for ${fieldId}`;
};

export const ContentCustomizationPanel: React.FC<ContentCustomizationPanelProps> = ({
  businessContext,
  contentPreferences,
  onContentChange,
  onPreferencesChange,
  className = ''
}) => {
  const [selectedSection, setSelectedSection] = useState('hero');
  const [sectionContent, setSectionContent] = useState<Record<string, Record<string, string>>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Initialize content for all sections
  useEffect(() => {
    const initialContent: Record<string, Record<string, string>> = {};
    contentSections.forEach(section => {
      initialContent[section.id] = {};
      section.fields.forEach(field => {
        initialContent[section.id][field] = generateAIContent(
          businessContext,
          section.id,
          field,
          contentPreferences
        );
      });
    });
    setSectionContent(initialContent);
  }, [businessContext, contentPreferences]);

  // Generate AI suggestions
  useEffect(() => {
    const suggestions = [
      `Use ${contentPreferences.tone} tone to match your brand personality`,
      `Include ${businessContext.industry_classification.primary} industry terms for SEO`,
      `Target ${businessContext.target_audience.demographics.join(', ')} in your messaging`,
      'Highlight your unique value proposition in the hero section'
    ];
    setAiSuggestions(suggestions);
  }, [businessContext, contentPreferences]);

  // Handle content changes
  const handleContentChange = useCallback((sectionId: string, fieldId: string, content: string) => {
    setSectionContent(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: content
      }
    }));
    onContentChange(sectionId, content);
  }, [onContentChange]);

  // Generate AI content for a specific field
  const handleGenerateAIContent = useCallback(async (sectionId: string, fieldId: string) => {
    const key = `${sectionId}-${fieldId}`;
    setIsGenerating(prev => ({ ...prev, [key]: true }));

    // Simulate AI generation
    setTimeout(() => {
      const aiContent = generateAIContent(businessContext, sectionId, fieldId, contentPreferences);
      handleContentChange(sectionId, fieldId, aiContent);
      setIsGenerating(prev => ({ ...prev, [key]: false }));
    }, 1500);
  }, [businessContext, contentPreferences, handleContentChange]);

  // Generate all content for a section
  const handleGenerateSection = useCallback(async (sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId);
    if (!section) return;

    setIsGenerating(prev => ({ ...prev, [sectionId]: true }));

    // Simulate AI generation for all fields
    setTimeout(() => {
      const newContent: Record<string, string> = {};
      section.fields.forEach(field => {
        newContent[field] = generateAIContent(businessContext, sectionId, field, contentPreferences);
      });

      setSectionContent(prev => ({
        ...prev,
        [sectionId]: newContent
      }));

      setIsGenerating(prev => ({ ...prev, [sectionId]: false }));
    }, 2000);
  }, [businessContext, contentPreferences]);

  // Copy content to clipboard
  const handleCopyContent = useCallback(async (content: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  }, []);

  // Handle preference changes
  const handlePreferenceChange = useCallback((key: keyof ContentPreferences, value: any) => {
    const newPreferences = { ...contentPreferences, [key]: value };
    onPreferencesChange(newPreferences);
  }, [contentPreferences, onPreferencesChange]);

  const selectedSectionData = contentSections.find(s => s.id === selectedSection);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Content Customization</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate and customize content for your template
          </p>
        </div>
        
        <Button
          onClick={() => selectedSectionData && handleGenerateSection(selectedSection)}
          disabled={isGenerating[selectedSection]}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {isGenerating[selectedSection] ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Section
            </>
          )}
        </Button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-100 text-sm">Content Strategy Tips</span>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {suggestion}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Preferences */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Content Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Tone</Label>
            <Select 
              value={contentPreferences.tone} 
              onValueChange={(value: any) => handlePreferenceChange('tone', value)}
            >
              <SelectTrigger className="mt-1">
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
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Length</Label>
            <Select 
              value={contentPreferences.content_length} 
              onValueChange={(value: any) => handlePreferenceChange('content_length', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Use Industry Terms</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Include terminology specific to your industry</p>
            </div>
            <Switch
              checked={contentPreferences.use_industry_terms}
              onCheckedChange={(checked) => handlePreferenceChange('use_industry_terms', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Social Proof</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add testimonials and credibility indicators</p>
            </div>
            <Switch
              checked={contentPreferences.include_social_proof}
              onCheckedChange={(checked) => handlePreferenceChange('include_social_proof', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Section Selector */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Content Sections</h4>
        <div className="flex flex-wrap gap-2">
          {contentSections.map((section) => (
            <Button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              variant={selectedSection === section.id ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              {section.title}
              {isGenerating[section.id] && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Editor */}
      {selectedSectionData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {selectedSectionData.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSectionData.description}
              </p>
            </div>
            <Badge variant="outline">
              {selectedSectionData.fields.length} fields
            </Badge>
          </div>

          <div className="space-y-4">
            {selectedSectionData.fields.map((fieldId) => {
              const content = sectionContent[selectedSection]?.[fieldId] || '';
              const isFieldGenerating = isGenerating[`${selectedSection}-${fieldId}`];
              
              return (
                <div key={fieldId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {fieldId.replace(/_/g, ' ')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCopyContent(content, fieldId)}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                      >
                        {copiedField === fieldId ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleGenerateAIContent(selectedSection, fieldId)}
                        disabled={isFieldGenerating}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                      >
                        {isFieldGenerating ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(selectedSection, fieldId, e.target.value)}
                    placeholder={`Enter ${fieldId.replace(/_/g, ' ')}...`}
                    className="min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={fieldId.includes('description') ? 4 : 2}
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{content.length} characters</span>
                    {content.length > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        SEO optimized
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Content Preview */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preview</h4>
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {selectedSectionData && (
            <div className="space-y-3">
              {selectedSectionData.fields.map((fieldId) => {
                const content = sectionContent[selectedSection]?.[fieldId] || '';
                if (!content) return null;
                
                return (
                  <div key={fieldId}>
                    {fieldId.includes('headline') && (
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {content}
                      </h2>
                    )}
                    {fieldId.includes('subheadline') && (
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {content}
                      </p>
                    )}
                    {fieldId.includes('title') && !fieldId.includes('headline') && (
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {content}
                      </h3>
                    )}
                    {fieldId.includes('description') && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {content}
                      </p>
                    )}
                    {fieldId.includes('cta') && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">
                        {content}
                      </button>
                    )}
                    {!fieldId.includes('headline') && 
                     !fieldId.includes('subheadline') && 
                     !fieldId.includes('title') && 
                     !fieldId.includes('description') && 
                     !fieldId.includes('cta') && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ContentCustomizationPanel;