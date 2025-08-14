/**
 * Template Preview Component
 * 
 * Real-time preview of template customizations with device simulation,
 * interactive elements, and before/after comparison
 * 
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Download, 
  Share2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Layers,
  Info,
  ExternalLink
} from 'lucide-react';

import { 
  Template, 
  PersonalizationSettings, 
  BusinessAnalysisResult,
  BrandColors,
  Typography 
} from '@/types/context-aware-templates';

interface TemplatePreviewProps {
  template: Template;
  personalizationSettings: PersonalizationSettings;
  businessContext: BusinessAnalysisResult;
  isLoading?: boolean;
  showComparison?: boolean;
  onSettingsChange?: (settings: PersonalizationSettings) => void;
  className?: string;
}

interface PreviewMetrics {
  loadTime: number;
  interactionScore: number;
  mobileScore: number;
  accessibilityScore: number;
}

// Mock template content for preview
const mockTemplateContent = {
  hero: {
    headline: "Transform Your Business Today",
    subheadline: "Discover innovative solutions that drive growth and success",
    ctaText: "Get Started"
  },
  features: [
    {
      title: "Advanced Analytics",
      description: "Get deep insights into your business performance",
      icon: "📊"
    },
    {
      title: "24/7 Support", 
      description: "Our team is here to help you succeed",
      icon: "🔧"
    },
    {
      title: "Easy Integration",
      description: "Connect with your existing tools seamlessly",
      icon: "🔗"
    }
  ],
  testimonial: {
    text: "This solution transformed our business operations completely.",
    author: "Sarah Johnson",
    company: "Tech Innovators Inc."
  }
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  personalizationSettings,
  businessContext,
  isLoading = false,
  showComparison = false,
  onSettingsChange,
  className = ''
}) => {
  // State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [previewMetrics, setPreviewMetrics] = useState<PreviewMetrics>({
    loadTime: 0,
    interactionScore: 0,
    mobileScore: 0,
    accessibilityScore: 0
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Device dimensions
  const deviceDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' }
  };

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setLoadProgress(0);
    }
  }, [isLoading]);

  // Calculate preview metrics
  useEffect(() => {
    const calculateMetrics = () => {
      // Mock calculations based on personalization settings
      const loadTime = Math.random() * 2 + 1; // 1-3 seconds
      const interactionScore = Math.random() * 30 + 70; // 70-100
      const mobileScore = previewDevice === 'mobile' ? Math.random() * 20 + 80 : Math.random() * 15 + 85;
      const accessibilityScore = Math.random() * 25 + 75; // 75-100

      setPreviewMetrics({
        loadTime: parseFloat(loadTime.toFixed(1)),
        interactionScore: Math.round(interactionScore),
        mobileScore: Math.round(mobileScore),
        accessibilityScore: Math.round(accessibilityScore)
      });
    };

    const timer = setTimeout(calculateMetrics, 1000);
    return () => clearTimeout(timer);
  }, [personalizationSettings, previewDevice]);

  // Generate personalized content
  const personalizedContent = useMemo(() => {
    const industry = businessContext.industry_classification.primary;
    const brandTone = businessContext.brand_personality.tone;
    
    return {
      hero: {
        headline: showOriginal 
          ? mockTemplateContent.hero.headline
          : `Transform Your ${industry.charAt(0).toUpperCase() + industry.slice(1)} Business`,
        subheadline: showOriginal
          ? mockTemplateContent.hero.subheadline
          : `${brandTone.charAt(0).toUpperCase() + brandTone.slice(1)} solutions for ${businessContext.target_audience.demographics.join(' and ')} looking for growth`,
        ctaText: showOriginal
          ? mockTemplateContent.hero.ctaText
          : businessContext.business_type === 'b2b' ? 'Schedule Demo' : 'Get Started Today'
      },
      features: mockTemplateContent.features.map((feature, index) => ({
        ...feature,
        title: showOriginal ? feature.title : `${feature.title} for ${industry}`,
        description: showOriginal ? feature.description : `${feature.description} tailored for your business needs`
      }))
    };
  }, [businessContext, showOriginal]);

  // Handle device change
  const handleDeviceChange = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewDevice(device);
  }, []);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle export/download
  const handleExport = useCallback(() => {
    // Mock export functionality
    console.log('Exporting preview...', { template, personalizationSettings });
  }, [template, personalizationSettings]);

  // Generate preview styles
  const previewStyles = useMemo(() => {
    const { brand_colors, typography, interactive_elements } = personalizationSettings;
    
    return {
      '--primary-color': brand_colors.primary,
      '--secondary-color': brand_colors.secondary,
      '--accent-color': brand_colors.accent,
      '--text-color': brand_colors.text,
      '--background-color': brand_colors.background,
      '--heading-font': typography.heading_font,
      '--body-font': typography.body_font,
      '--font-scale': typography.font_size_scale,
      '--animations': interactive_elements.animations ? 'enabled' : 'disabled'
    } as React.CSSProperties;
  }, [personalizationSettings]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Live Preview</span>
          </div>
          
          {/* Device Controls */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDeviceChange('desktop')}
              className="px-3"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDeviceChange('tablet')}
              className="px-3"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDeviceChange('mobile')}
              className="px-3"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showComparison && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {showOriginal ? 'Show Customized' : 'Show Original'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInteractive(!isInteractive)}
            className="gap-2"
          >
            {isInteractive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isInteractive ? 'Static' : 'Interactive'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreenToggle}
            className="gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating Preview...</span>
              <span className="text-sm text-gray-600">{Math.round(loadProgress)}%</span>
            </div>
            <Progress value={loadProgress} className="w-full" />
          </div>
        </Card>
      )}

      {/* Preview Container */}
      <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''} overflow-hidden`}>
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-sm text-gray-600">
              {template.name} - {previewDevice} preview
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{previewMetrics.loadTime}s load time</span>
          </div>
        </div>

        {/* Preview Content */}
        <div 
          className="flex justify-center bg-gray-100 p-4"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}
        >
          <div
            ref={previewRef}
            className="bg-white shadow-lg transition-all duration-300 overflow-hidden"
            style={{
              width: deviceDimensions[previewDevice].width,
              height: deviceDimensions[previewDevice].height,
              maxWidth: '100%',
              ...previewStyles
            }}
          >
            {/* Mock Template Content */}
            <div className="h-full overflow-y-auto">
              {/* Hero Section */}
              <section 
                className="px-8 py-16 text-center"
                style={{ 
                  backgroundColor: personalizationSettings.brand_colors.background,
                  color: personalizationSettings.brand_colors.text
                }}
              >
                <h1 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ 
                    fontFamily: personalizationSettings.typography.heading_font,
                    fontSize: `${2.5 * personalizationSettings.typography.font_size_scale}rem`,
                    color: personalizationSettings.brand_colors.primary
                  }}
                >
                  {personalizedContent.hero.headline}
                </h1>
                <p 
                  className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: personalizationSettings.typography.body_font,
                    fontSize: `${1.25 * personalizationSettings.typography.font_size_scale}rem`
                  }}
                >
                  {personalizedContent.hero.subheadline}
                </p>
                <button 
                  className="px-8 py-4 rounded-lg font-semibold text-white transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: personalizationSettings.brand_colors.primary,
                    fontFamily: personalizationSettings.typography.body_font,
                    transform: isInteractive && personalizationSettings.interactive_elements.hover_effects 
                      ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {personalizedContent.hero.ctaText}
                </button>
              </section>

              {/* Features Section */}
              <section className="px-8 py-16 bg-gray-50">
                <h2 
                  className="text-3xl font-bold text-center mb-12"
                  style={{ 
                    fontFamily: personalizationSettings.typography.heading_font,
                    fontSize: `${2 * personalizationSettings.typography.font_size_scale}rem`,
                    color: personalizationSettings.brand_colors.text
                  }}
                >
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {personalizedContent.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="text-center p-6 bg-white rounded-lg shadow-sm"
                      style={{
                        transform: isInteractive && personalizationSettings.interactive_elements.animations
                          ? `translateY(${Math.sin(Date.now() / 1000 + index) * 2}px)`
                          : 'none'
                      }}
                    >
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 
                        className="text-xl font-semibold mb-3"
                        style={{ 
                          fontFamily: personalizationSettings.typography.heading_font,
                          color: personalizationSettings.brand_colors.secondary
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p 
                        className="text-gray-600"
                        style={{ 
                          fontFamily: personalizationSettings.typography.body_font
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Testimonial Section */}
              <section 
                className="px-8 py-16 text-center"
                style={{ backgroundColor: personalizationSettings.brand_colors.accent + '20' }}
              >
                <blockquote 
                  className="text-2xl italic mb-6 max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: personalizationSettings.typography.body_font,
                    color: personalizationSettings.brand_colors.text
                  }}
                >
                  "{mockTemplateContent.testimonial.text}"
                </blockquote>
                <cite 
                  className="font-semibold"
                  style={{ 
                    fontFamily: personalizationSettings.typography.heading_font,
                    color: personalizationSettings.brand_colors.secondary
                  }}
                >
                  {mockTemplateContent.testimonial.author}
                </cite>
                <div className="text-gray-600 text-sm mt-1">
                  {mockTemplateContent.testimonial.company}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Load Time</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{previewMetrics.loadTime}s</div>
          <div className="text-xs text-gray-500">Target: &lt;3s</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Interaction</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{previewMetrics.interactionScore}%</div>
          <div className="text-xs text-gray-500">Engagement score</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Mobile</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{previewMetrics.mobileScore}%</div>
          <div className="text-xs text-gray-500">Mobile optimized</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Accessibility</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{previewMetrics.accessibilityScore}%</div>
          <div className="text-xs text-gray-500">WCAG compliance</div>
        </Card>
      </div>

      {/* Preview Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Preview Actions</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="text-sm text-gray-600">
              {showOriginal ? 'Original Template' : 'Customized Version'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Preview
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button size="sm" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TemplatePreview;