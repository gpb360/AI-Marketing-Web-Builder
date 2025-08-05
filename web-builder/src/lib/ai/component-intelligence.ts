import { ComponentData } from '@/types/builder';
import { PromptProcessor, PromptAnalysis } from './prompt-processor';

interface ComponentPattern {
  id: string;
  name: string;
  type: string;
  description: string;
  properties: Record<string, any>;
  variants: ComponentVariant[];
  confidence: number;
}

interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  props: Record<string, any>;
  style: Record<string, any>;
  className?: string;
  score?: number;
}

interface GenerationContext {
  templateType?: string;
  industry?: string;
  targetAudience?: string;
  brandGuidelines?: {
    colors: string[];
    fonts: string[];
    style: 'modern' | 'classic' | 'minimal' | 'bold';
  };
  existingComponents: ComponentData[];
}

interface SmartGenerationResult {
  component: ComponentData;
  reasoning: string;
  alternatives: ComponentData[];
  optimizations: string[];
  confidence: number;
}

export class ComponentIntelligence {
  private patterns: ComponentPattern[] = [];
  private promptProcessor: PromptProcessor;

  constructor() {
    this.promptProcessor = new PromptProcessor();
    this.initializePatterns();
  }

  private initializePatterns() {
    this.patterns = [
      {
        id: 'modern-button',
        name: 'Modern Button',
        type: 'button',
        description: 'Contemporary button with hover effects and accessibility',
        properties: {
          interactive: true,
          accessible: true,
          responsive: true
        },
        variants: [
          {
            id: 'primary-button',
            name: 'Primary Button',
            description: 'Main call-to-action button',
            props: {
              content: 'Get Started',
              type: 'primary',
              size: 'large'
            },
            style: {
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            },
            className: 'hover:bg-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          },
          {
            id: 'secondary-button',
            name: 'Secondary Button',
            description: 'Alternative action button',
            props: {
              content: 'Learn More',
              type: 'secondary',
              size: 'medium'
            },
            style: {
              backgroundColor: 'transparent',
              color: '#3B82F6',
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid #3B82F6',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            },
            className: 'hover:bg-blue-50 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          },
          {
            id: 'ghost-button',
            name: 'Ghost Button',
            description: 'Minimal button for subtle actions',
            props: {
              content: 'Cancel',
              type: 'ghost',
              size: 'small'
            },
            style: {
              backgroundColor: 'transparent',
              color: '#6B7280',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer'
            },
            className: 'hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300'
          }
        ],
        confidence: 0.95
      },
      {
        id: 'content-card',
        name: 'Content Card',
        type: 'card',
        description: 'Versatile card component for displaying content',
        properties: {
          flexible: true,
          responsive: true,
          customizable: true
        },
        variants: [
          {
            id: 'feature-card',
            name: 'Feature Card',
            description: 'Card showcasing a feature or service',
            props: {
              title: 'Feature Title',
              description: 'Feature description goes here',
              icon: 'star',
              layout: 'vertical'
            },
            style: {
              backgroundColor: '#FFFFFF',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            },
            className: 'hover:shadow-lg hover:scale-105 transition-all duration-300'
          },
          {
            id: 'pricing-card',
            name: 'Pricing Card',
            description: 'Card for displaying pricing information',
            props: {
              title: 'Pro Plan',
              price: '$29',
              period: 'month',
              features: ['Feature 1', 'Feature 2', 'Feature 3'],
              highlighted: false
            },
            style: {
              backgroundColor: '#FFFFFF',
              padding: '32px 24px',
              borderRadius: '16px',
              border: '2px solid #E5E7EB',
              textAlign: 'center' as const
            },
            className: 'hover:border-blue-500 hover:shadow-xl transition-all duration-300'
          },
          {
            id: 'testimonial-card',
            name: 'Testimonial Card',
            description: 'Card for customer testimonials',
            props: {
              quote: 'This product changed our business completely.',
              author: 'John Doe',
              role: 'CEO, Company',
              avatar: '/avatar.jpg'
            },
            style: {
              backgroundColor: '#F9FAFB',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              position: 'relative' as const
            },
            className: 'hover:bg-white hover:shadow-md transition-all duration-300'
          }
        ],
        confidence: 0.92
      },
      {
        id: 'navigation-menu',
        name: 'Navigation Menu',
        type: 'navigation',
        description: 'Responsive navigation component',
        properties: {
          responsive: true,
          accessible: true,
          customizable: true
        },
        variants: [
          {
            id: 'horizontal-nav',
            name: 'Horizontal Navigation',
            description: 'Traditional horizontal navigation bar',
            props: {
              items: ['Home', 'About', 'Services', 'Contact'],
              logo: 'Company Logo',
              orientation: 'horizontal'
            },
            style: {
              backgroundColor: '#FFFFFF',
              padding: '16px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            },
            className: 'sticky top-0 z-50 backdrop-blur-sm'
          },
          {
            id: 'sidebar-nav',
            name: 'Sidebar Navigation',
            description: 'Vertical sidebar navigation',
            props: {
              items: ['Dashboard', 'Projects', 'Team', 'Settings'],
              orientation: 'vertical',
              collapsible: true
            },
            style: {
              backgroundColor: '#1F2937',
              color: '#FFFFFF',
              width: '256px',
              height: '100vh',
              padding: '24px 16px',
              position: 'fixed' as const,
              left: '0',
              top: '0'
            },
            className: 'shadow-lg transition-all duration-300'
          }
        ],
        confidence: 0.88
      },
      {
        id: 'form-input',
        name: 'Form Input',
        type: 'input',
        description: 'Accessible form input with validation',
        properties: {
          accessible: true,
          validatable: true,
          responsive: true
        },
        variants: [
          {
            id: 'text-input',
            name: 'Text Input',
            description: 'Standard text input field',
            props: {
              type: 'text',
              placeholder: 'Enter text...',
              label: 'Input Label',
              required: false
            },
            style: {
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #E5E7EB',
              fontSize: '16px',
              backgroundColor: '#FFFFFF'
            },
            className: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200'
          },
          {
            id: 'textarea-input',
            name: 'Textarea Input',
            description: 'Multi-line text input',
            props: {
              type: 'textarea',
              placeholder: 'Enter your message...',
              label: 'Message',
              rows: 4
            },
            style: {
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #E5E7EB',
              fontSize: '16px',
              backgroundColor: '#FFFFFF',
              resize: 'vertical' as const
            },
            className: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200'
          }
        ],
        confidence: 0.90
      }
    ];
  }

  detectComponentFromPrompt(prompt: string): {
    detectedType: string;
    confidence: number;
    reasoning: string;
    suggestedPatterns: ComponentPattern[];
  } {
    const analysis = this.promptProcessor.analyzePrompt(prompt);
    const normalizedPrompt = prompt.toLowerCase();
    
    const typeScores = new Map<string, number>();
    const reasonings = new Map<string, string[]>();
    
    // Analyze prompt for component type indicators
    this.patterns.forEach(pattern => {
      let score = 0;
      const reasons: string[] = [];
      
      // Direct type mentions
      if (normalizedPrompt.includes(pattern.type)) {
        score += 0.5;
        reasons.push(`Directly mentions '${pattern.type}'`);
      }
      
      // Name mentions
      if (normalizedPrompt.includes(pattern.name.toLowerCase())) {
        score += 0.4;
        reasons.push(`Mentions component name '${pattern.name}'`);
      }
      
      // Keyword analysis
      const keywords = this.getTypeKeywords(pattern.type);
      keywords.forEach(keyword => {
        if (normalizedPrompt.includes(keyword)) {
          score += 0.2;
          reasons.push(`Contains keyword '${keyword}'`);
        }
      });
      
      // Property analysis
      Object.keys(pattern.properties).forEach(property => {
        if (normalizedPrompt.includes(property)) {
          score += 0.1;
          reasons.push(`References property '${property}'`);
        }
      });
      
      if (score > 0) {
        typeScores.set(pattern.type, score);
        reasonings.set(pattern.type, reasons);
      }
    });
    
    // Find the best match
    const sortedTypes = Array.from(typeScores.entries())
      .sort(([,a], [,b]) => b - a);
    
    const detectedType = sortedTypes[0]?.[0] || 'container';
    const confidence = Math.min(sortedTypes[0]?.[1] || 0.3, 1.0);
    const reasoning = reasonings.get(detectedType)?.join(', ') || 'Generic container component';
    
    // Get suggested patterns
    const suggestedPatterns = this.patterns
      .filter(pattern => typeScores.has(pattern.type))
      .sort((a, b) => (typeScores.get(b.type) || 0) - (typeScores.get(a.type) || 0))
      .slice(0, 3);
    
    return {
      detectedType,
      confidence,
      reasoning,
      suggestedPatterns
    };
  }

  private getTypeKeywords(type: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'button': ['click', 'press', 'submit', 'action', 'cta', 'call-to-action'],
      'card': ['showcase', 'display', 'feature', 'content', 'item', 'product'],
      'navigation': ['menu', 'nav', 'links', 'header', 'sidebar', 'breadcrumb'],
      'input': ['form', 'field', 'enter', 'type', 'search', 'text'],
      'text': ['heading', 'title', 'paragraph', 'content', 'copy', 'description'],
      'container': ['wrapper', 'section', 'layout', 'group', 'box', 'panel']
    };
    
    return keywordMap[type] || [];
  }

  generateSmartComponent(
    prompt: string, 
    context: GenerationContext
  ): SmartGenerationResult {
    const detection = this.detectComponentFromPrompt(prompt);
    const analysis = this.promptProcessor.analyzePrompt(prompt);
    
    // Select the best pattern
    const selectedPattern = detection.suggestedPatterns[0] || this.patterns[0];
    
    // Choose the most appropriate variant
    const selectedVariant = this.selectBestVariant(
      selectedPattern, 
      analysis, 
      context
    );
    
    // Generate the component
    const component = this.createComponent(
      selectedPattern,
      selectedVariant,
      analysis,
      context
    );
    
    // Generate alternatives
    const alternatives = this.generateAlternatives(
      selectedPattern,
      analysis,
      context
    );
    
    // Generate optimizations
    const optimizations = this.generateOptimizations(
      component,
      analysis,
      context
    );
    
    const reasoning = this.generateReasoning(
      selectedPattern,
      selectedVariant,
      analysis,
      detection
    );
    
    return {
      component,
      reasoning,
      alternatives,
      optimizations,
      confidence: Math.min(detection.confidence + analysis.confidence, 1.0)
    };
  }

  private selectBestVariant(
    pattern: ComponentPattern,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): ComponentVariant {
    return pattern.variants.reduce((best, variant) => {
      let score = 0;
      
      // Check prompt entities match
      if (analysis.entities.colors.length > 0) {
        const hasColorStyling = variant.style.backgroundColor || variant.style.color;
        if (hasColorStyling) score += 0.3;
      }
      
      // Check context alignment
      if (context.brandGuidelines?.style) {
        const styleAlignment = this.checkStyleAlignment(
          variant, 
          context.brandGuidelines.style
        );
        score += styleAlignment;
      }
      
      // Industry-specific preferences
      if (context.industry) {
        const industryScore = this.getIndustryScore(variant, context.industry);
        score += industryScore;
      }
      
      return score > (best.score || 0) ? { ...variant, score } : best;
    }, pattern.variants[0]);
  }

  private checkStyleAlignment(
    variant: ComponentVariant, 
    brandStyle: 'modern' | 'classic' | 'minimal' | 'bold'
  ): number {
    const styleScores: Record<string, Record<string, number>> = {
      'modern': {
        'borderRadius': 0.2,
        'boxShadow': 0.2,
        'gradient': 0.3
      },
      'classic': {
        'serif': 0.2,
        'border': 0.2,
        'traditional': 0.3
      },
      'minimal': {
        'clean': 0.3,
        'simple': 0.2,
        'whitespace': 0.2
      },
      'bold': {
        'vibrant': 0.3,
        'large': 0.2,
        'impact': 0.2
      }
    };
    
    // Simplified alignment check
    return brandStyle === 'modern' && variant.style.borderRadius ? 0.3 : 0.1;
  }

  private getIndustryScore(variant: ComponentVariant, industry: string): number {
    const industryPreferences: Record<string, string[]> = {
      'tech': ['modern', 'clean', 'minimal'],
      'finance': ['professional', 'secure', 'traditional'],
      'healthcare': ['accessible', 'clear', 'trustworthy'],
      'creative': ['bold', 'unique', 'expressive'],
      'education': ['clear', 'accessible', 'structured']
    };
    
    const preferences = industryPreferences[industry] || [];
    
    // Check if variant description matches industry preferences
    return preferences.some(pref => 
      variant.description.toLowerCase().includes(pref)
    ) ? 0.2 : 0;
  }

  private createComponent(
    pattern: ComponentPattern,
    variant: ComponentVariant,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): ComponentData {
    const id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Apply context-specific customizations
    const customizedStyle = this.customizeStyle(
      variant.style,
      analysis,
      context
    );
    
    const customizedProps = this.customizeProps(
      variant.props,
      analysis,
      context
    );
    
    return {
      id,
      type: pattern.type,
      name: variant.name,
      props: {
        ...customizedProps,
        className: variant.className,
        'aria-label': `${variant.name} component`,
        'data-ai-generated': true
      },
      style: customizedStyle,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      children: []
    };
  }

  private customizeStyle(
    baseStyle: Record<string, any>,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): Record<string, any> {
    const customized = { ...baseStyle };
    
    // Apply color customizations
    if (analysis.entities.colors.length > 0) {
      const primaryColor = analysis.entities.colors[0];
      if (customized.backgroundColor && customized.backgroundColor !== 'transparent') {
        customized.backgroundColor = this.normalizeColor(primaryColor);
      }
    }
    
    // Apply brand colors if available
    if (context.brandGuidelines?.colors.length) {
      const brandPrimary = context.brandGuidelines.colors[0];
      if (customized.backgroundColor === '#3B82F6') {
        customized.backgroundColor = brandPrimary;
      }
    }
    
    // Apply dimension customizations
    analysis.entities.dimensions.forEach(dimension => {
      if (dimension === 'large') {
        customized.padding = this.increasePadding(customized.padding);
        customized.fontSize = this.increaseFontSize(customized.fontSize);
      } else if (dimension === 'small') {
        customized.padding = this.decreasePadding(customized.padding);
        customized.fontSize = this.decreaseFontSize(customized.fontSize);
      }
    });
    
    return customized;
  }

  private customizeProps(
    baseProps: Record<string, any>,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): Record<string, any> {
    const customized = { ...baseProps };
    
    // Extract content from prompt if applicable
    if (analysis.intent === 'content' && baseProps.content) {
      // Simple extraction - in production, would use more sophisticated NLP
      const quotedText = analysis.expandedPrompt.match(/["'](.*?)["']/)?.[1];
      if (quotedText) {
        customized.content = quotedText;
      }
    }
    
    return customized;
  }

  private generateAlternatives(
    pattern: ComponentPattern,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): ComponentData[] {
    return pattern.variants
      .filter(variant => variant.id !== pattern.variants[0].id)
      .slice(0, 2)
      .map(variant => this.createComponent(pattern, variant, analysis, context));
  }

  private generateOptimizations(
    component: ComponentData,
    analysis: PromptAnalysis,
    context: GenerationContext
  ): string[] {
    const optimizations: string[] = [];
    
    // Responsive optimization
    if (!analysis.expandedPrompt.includes('responsive')) {
      optimizations.push('Add responsive breakpoints for mobile and tablet');
    }
    
    // Accessibility optimization
    if (!component.props['aria-label']) {
      optimizations.push('Add accessibility attributes for screen readers');
    }
    
    // Performance optimization
    if (component.style?.boxShadow) {
      optimizations.push('Consider using CSS transforms for better performance');
    }
    
    // Brand consistency
    if (context.brandGuidelines && component.style?.backgroundColor && !context.brandGuidelines.colors.includes(component.style.backgroundColor)) {
      optimizations.push('Align colors with brand guidelines');
    }
    
    return optimizations;
  }

  private generateReasoning(
    pattern: ComponentPattern,
    variant: ComponentVariant,
    analysis: PromptAnalysis,
    detection: ReturnType<ComponentIntelligence['detectComponentFromPrompt']>
  ): string {
    return `Selected ${pattern.name} (${variant.name}) based on: ${detection.reasoning}. ` +
           `Confidence: ${Math.round(detection.confidence * 100)}%. ` +
           `Applied ${analysis.intent} optimizations with ${analysis.entities.colors.length} color(s) and ` +
           `${analysis.entities.dimensions.length} dimension(s) specified.`;
  }

  // Utility methods
  private normalizeColor(color: string): string {
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'red': '#EF4444',
      'green': '#10B981',
      'yellow': '#F59E0B',
      'purple': '#8B5CF6',
      'pink': '#EC4899',
      'gray': '#6B7280',
      'black': '#000000',
      'white': '#FFFFFF'
    };
    
    return colorMap[color.toLowerCase()] || color;
  }

  private increasePadding(padding: string | undefined): string {
    if (!padding) return '16px 20px';
    // Simple padding increase logic
    return padding.replace(/\d+/g, match => `${parseInt(match) * 1.5}`);
  }

  private decreasePadding(padding: string | undefined): string {
    if (!padding) return '8px 12px';
    // Simple padding decrease logic
    return padding.replace(/\d+/g, match => `${Math.max(4, parseInt(match) * 0.75)}`);
  }

  private increaseFontSize(fontSize: string | undefined): string {
    if (!fontSize) return '18px';
    return fontSize.replace(/\d+/g, match => `${parseInt(match) * 1.2}`);
  }

  private decreaseFontSize(fontSize: string | undefined): string {
    if (!fontSize) return '14px';
    return fontSize.replace(/\d+/g, match => `${Math.max(12, parseInt(match) * 0.9)}`);
  }
}

export type { ComponentPattern, ComponentVariant, GenerationContext, SmartGenerationResult };