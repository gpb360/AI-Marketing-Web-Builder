import { ComponentData } from '@/types/builder';

interface PageContext {
  templateType?: string;
  industry?: string;
  brandColors?: string[];
  existingComponents: ComponentData[];
  pageGoals: string[];
}

interface LayoutPattern {
  id: string;
  name: string;
  description: string;
  components: string[];
  bestFor: string[];
  confidence: number;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  complementary: string[];
}

interface TypographyPairing {
  heading: string;
  body: string;
  accent: string;
  confidence: number;
  reasoning: string;
}

interface AISuggestion {
  id: string;
  type: 'layout' | 'color' | 'typography' | 'content' | 'interaction';
  title: string;
  description: string;
  confidence: number;
  prompt: string;
  expectedOutcome: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export class AIContext {
  private pageContext: PageContext;
  private componentAnalysis: Map<string, any> = new Map();
  private layoutPatterns: LayoutPattern[] = [];

  constructor(pageContext: PageContext) {
    this.pageContext = pageContext;
    this.initializeLayoutPatterns();
  }

  private initializeLayoutPatterns() {
    this.layoutPatterns = [
      {
        id: 'hero-cta-features',
        name: 'Hero-CTA-Features',
        description: 'Classic landing page layout with hero section, call-to-action, and feature showcase',
        components: ['hero', 'button', 'features', 'testimonials'],
        bestFor: ['saas', 'product-launch', 'startup'],
        confidence: 0.92
      },
      {
        id: 'grid-showcase',
        name: 'Grid Showcase',
        description: 'Product or service showcase using card-based grid layout',
        components: ['card', 'grid', 'filter', 'pagination'],
        bestFor: ['portfolio', 'ecommerce', 'gallery'],
        confidence: 0.88
      },
      {
        id: 'story-timeline',
        name: 'Story Timeline',
        description: 'Narrative flow with timeline or step-by-step progression',
        components: ['timeline', 'steps', 'progress', 'narrative'],
        bestFor: ['process', 'journey', 'about'],
        confidence: 0.85
      },
      {
        id: 'dashboard-metrics',
        name: 'Dashboard Metrics',
        description: 'Data-driven layout with metrics, charts, and key indicators',
        components: ['metrics', 'chart', 'widget', 'kpi'],
        bestFor: ['analytics', 'reporting', 'business'],
        confidence: 0.90
      }
    ];
  }

  analyzePageContext(): {
    dominantPatterns: LayoutPattern[];
    missingElements: string[];
    improvementAreas: string[];
  } {
    const existingTypes = this.pageContext.existingComponents.map(c => c.type);
    const dominantPatterns = this.layoutPatterns
      .filter(pattern => {
        const overlap = pattern.components.filter(comp => 
          existingTypes.some(type => type.includes(comp) || comp.includes(type))
        ).length;
        return overlap >= pattern.components.length * 0.5;
      })
      .sort((a, b) => b.confidence - a.confidence);

    const missingElements = this.identifyMissingElements(existingTypes);
    const improvementAreas = this.identifyImprovementAreas();

    return {
      dominantPatterns,
      missingElements,
      improvementAreas
    };
  }

  private identifyMissingElements(existingTypes: string[]): string[] {
    const essential = ['navigation', 'header', 'footer', 'cta'];
    const recommended = ['testimonials', 'features', 'contact'];
    
    const missing = [];
    
    essential.forEach(element => {
      if (!existingTypes.some(type => type.includes(element))) {
        missing.push(element);
      }
    });
    
    recommended.forEach(element => {
      if (!existingTypes.some(type => type.includes(element))) {
        missing.push(element);
      }
    });
    
    return missing;
  }

  private identifyImprovementAreas(): string[] {
    const areas = [];
    const components = this.pageContext.existingComponents;
    
    // Check for responsive design
    const hasResponsiveDesign = components.some(c => 
      c.props.className?.includes('responsive') || 
      c.props.responsive === true
    );
    if (!hasResponsiveDesign) areas.push('responsive-design');
    
    // Check for accessibility
    const hasAccessibility = components.some(c => 
      c.props['aria-label'] || c.props.alt || c.props.role
    );
    if (!hasAccessibility) areas.push('accessibility');
    
    // Check for animations
    const hasAnimations = components.some(c => 
      c.props.className?.includes('animate') || 
      c.props.animation !== undefined
    );
    if (!hasAnimations) areas.push('animations');
    
    // Check for consistent styling
    const colorVariance = this.analyzeColorConsistency(components);
    if (colorVariance > 0.7) areas.push('color-consistency');
    
    return areas;
  }

  private analyzeColorConsistency(components: ComponentData[]): number {
    const colors = new Set<string>();
    
    components.forEach(component => {
      if (component.style?.backgroundColor) {
        colors.add(component.style.backgroundColor as string);
      }
      if (component.style?.color) {
        colors.add(component.style.color as string);
      }
    });
    
    // Return variance score (0 = very consistent, 1 = very inconsistent)
    return Math.min(colors.size / 10, 1);
  }

  generateSmartColorPalette(baseColor?: string): ColorPalette {
    // If no base color provided, analyze existing components
    if (!baseColor && this.pageContext.existingComponents.length > 0) {
      baseColor = this.extractDominantColor();
    }
    
    baseColor = baseColor || '#3B82F6'; // Default to blue
    
    return {
      primary: baseColor,
      secondary: this.adjustColor(baseColor, { lightness: 0.1, saturation: -0.1 }),
      accent: this.getComplementaryColor(baseColor),
      neutral: '#6B7280',
      complementary: [
        this.adjustColor(baseColor, { hue: 30 }),
        this.adjustColor(baseColor, { hue: -30 }),
        this.adjustColor(baseColor, { lightness: 0.2 }),
        this.adjustColor(baseColor, { lightness: -0.2 })
      ]
    };
  }

  private extractDominantColor(): string {
    const colorCounts = new Map<string, number>();
    
    this.pageContext.existingComponents.forEach(component => {
      const bgColor = component.style?.backgroundColor as string;
      const textColor = component.style?.color as string;
      
      if (bgColor && bgColor !== 'transparent') {
        colorCounts.set(bgColor, (colorCounts.get(bgColor) || 0) + 1);
      }
      if (textColor && textColor !== 'inherit') {
        colorCounts.set(textColor, (colorCounts.get(textColor) || 0) + 1);
      }
    });
    
    const sortedColors = Array.from(colorCounts.entries())
      .sort(([,a], [,b]) => b - a);
    
    return sortedColors[0]?.[0] || '#3B82F6';
  }

  private adjustColor(color: string, adjustments: {
    hue?: number;
    saturation?: number;
    lightness?: number;
  }): string {
    // Simplified color adjustment - in production, use a proper color library
    // This is a basic implementation for demonstration
    return color; // Would implement HSL adjustments here
  }

  private getComplementaryColor(color: string): string {
    // Simplified complementary color calculation
    // In production, would use proper color theory
    return color === '#3B82F6' ? '#F59E0B' : '#10B981';
  }

  generateTypographyPairings(): TypographyPairing[] {
    const pairings: TypographyPairing[] = [
      {
        heading: 'Inter',
        body: 'Inter',
        accent: 'Inter',
        confidence: 0.95,
        reasoning: 'Modern, clean, and highly readable across all screen sizes'
      },
      {
        heading: 'Poppins',
        body: 'Open Sans',
        accent: 'Poppins',
        confidence: 0.88,
        reasoning: 'Professional pairing with strong character and readability'
      },
      {
        heading: 'Montserrat',
        body: 'Source Sans Pro',
        accent: 'Montserrat',
        confidence: 0.85,
        reasoning: 'Classic combination with excellent brand presence'
      },
      {
        heading: 'Raleway',
        body: 'Lato',
        accent: 'Raleway',
        confidence: 0.82,
        reasoning: 'Elegant and modern with excellent hierarchy'
      }
    ];
    
    // Filter based on industry if available
    if (this.pageContext.industry) {
      return this.filterTypographyByIndustry(pairings);
    }
    
    return pairings;
  }

  private filterTypographyByIndustry(pairings: TypographyPairing[]): TypographyPairing[] {
    const industryPreferences: Record<string, string[]> = {
      'tech': ['Inter', 'Poppins', 'Roboto'],
      'finance': ['Montserrat', 'Source Sans Pro', 'Open Sans'],
      'creative': ['Playfair Display', 'Raleway', 'Merriweather'],
      'healthcare': ['Open Sans', 'Lato', 'Source Sans Pro'],
      'education': ['Open Sans', 'Lato', 'Merriweather']
    };
    
    const preferences = industryPreferences[this.pageContext.industry!] || [];
    
    return pairings.map(pairing => ({
      ...pairing,
      confidence: preferences.includes(pairing.heading) 
        ? pairing.confidence * 1.1 
        : pairing.confidence * 0.9
    })).sort((a, b) => b.confidence - a.confidence);
  }
}

export class AISuggestionEngine {
  private aiContext: AIContext;

  constructor(pageContext: PageContext) {
    this.aiContext = new AIContext(pageContext);
  }

  generateContextualSuggestions(selectedComponent: ComponentData): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const analysis = this.aiContext.analyzePageContext();
    
    // Layout suggestions
    suggestions.push(...this.generateLayoutSuggestions(selectedComponent, analysis));
    
    // Color suggestions
    suggestions.push(...this.generateColorSuggestions(selectedComponent));
    
    // Typography suggestions
    suggestions.push(...this.generateTypographySuggestions(selectedComponent));
    
    // Content suggestions
    suggestions.push(...this.generateContentSuggestions(selectedComponent));
    
    // Interaction suggestions
    suggestions.push(...this.generateInteractionSuggestions(selectedComponent));
    
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Return top 8 suggestions
  }

  private generateLayoutSuggestions(
    component: ComponentData, 
    analysis: ReturnType<AIContext['analyzePageContext']>
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    if (analysis.missingElements.includes('cta') && component.type !== 'button') {
      suggestions.push({
        id: 'add-cta',
        type: 'layout',
        title: 'Add Call-to-Action',
        description: 'Include a prominent CTA to guide user actions',
        confidence: 0.9,
        prompt: 'Add a prominent call-to-action button below this component',
        expectedOutcome: 'Improved conversion rates and user engagement',
        category: 'conversion',
        priority: 'high'
      });
    }
    
    if (component.type === 'container' && !component.children?.length) {
      suggestions.push({
        id: 'improve-spacing',
        type: 'layout',
        title: 'Optimize Spacing',
        description: 'Improve visual hierarchy with better spacing',
        confidence: 0.85,
        prompt: 'Optimize the spacing and padding of this container for better visual flow',
        expectedOutcome: 'Better visual hierarchy and readability',
        category: 'design',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private generateColorSuggestions(component: ComponentData): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const palette = this.aiContext.generateSmartColorPalette();
    
    if (!component.style?.backgroundColor || component.style.backgroundColor === 'transparent') {
      suggestions.push({
        id: 'apply-brand-colors',
        type: 'color',
        title: 'Apply Brand Colors',
        description: 'Use consistent brand colors for better recognition',
        confidence: 0.88,
        prompt: `Apply the primary brand color ${palette.primary} as background`,
        expectedOutcome: 'Consistent brand identity and visual appeal',
        category: 'branding',
        priority: 'high'
      });
    }
    
    if (component.type === 'button') {
      suggestions.push({
        id: 'gradient-button',
        type: 'color',
        title: 'Add Gradient Effect',
        description: 'Make buttons more engaging with gradient backgrounds',
        confidence: 0.82,
        prompt: `Create a gradient from ${palette.primary} to ${palette.accent}`,
        expectedOutcome: 'More engaging and modern button appearance',
        category: 'engagement',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private generateTypographySuggestions(component: ComponentData): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const pairings = this.aiContext.generateTypographyPairings();
    const topPairing = pairings[0];
    
    if (component.type === 'text' || component.type === 'heading') {
      suggestions.push({
        id: 'optimize-typography',
        type: 'typography',
        title: 'Optimize Typography',
        description: topPairing.reasoning,
        confidence: topPairing.confidence,
        prompt: `Apply ${topPairing.heading} font with improved line spacing and hierarchy`,
        expectedOutcome: 'Better readability and professional appearance',
        category: 'readability',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private generateContentSuggestions(component: ComponentData): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    if (component.type === 'text' && (!component.props.content || component.props.content.length < 10)) {
      suggestions.push({
        id: 'enhance-content',
        type: 'content',
        title: 'Enhance Content',
        description: 'Add more descriptive and engaging content',
        confidence: 0.78,
        prompt: 'Expand this text with more engaging and descriptive content',
        expectedOutcome: 'Better user engagement and clarity',
        category: 'content',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  private generateInteractionSuggestions(component: ComponentData): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    const hasAnimation = component.props.className?.includes('animate') || 
                        component.props.animation !== undefined;
    
    if (!hasAnimation) {
      suggestions.push({
        id: 'add-animations',
        type: 'interaction',
        title: 'Add Micro-interactions',
        description: 'Enhance user experience with subtle animations',
        confidence: 0.75,
        prompt: 'Add hover effects and subtle animations to make this component more interactive',
        expectedOutcome: 'More engaging user experience',
        category: 'engagement',
        priority: 'low'
      });
    }
    
    return suggestions;
  }

  analyzeComponentRelationships(components: ComponentData[]): {
    clusters: ComponentData[][];
    suggestions: string[];
  } {
    // Group components by proximity and type
    const clusters = this.clusterComponents(components);
    const suggestions = this.generateRelationshipSuggestions(clusters);
    
    return { clusters, suggestions };
  }

  private clusterComponents(components: ComponentData[]): ComponentData[][] {
    // Simple clustering based on position proximity
    const clusters: ComponentData[][] = [];
    const visited = new Set<string>();
    
    components.forEach(component => {
      if (visited.has(component.id)) return;
      
      const cluster = [component];
      visited.add(component.id);
      
      // Find nearby components
      components.forEach(other => {
        if (visited.has(other.id)) return;
        
        const distance = Math.sqrt(
          Math.pow(component.position.x - other.position.x, 2) +
          Math.pow(component.position.y - other.position.y, 2)
        );
        
        if (distance < 150) { // Within 150px
          cluster.push(other);
          visited.add(other.id);
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  }

  private generateRelationshipSuggestions(clusters: ComponentData[][]): string[] {
    const suggestions: string[] = [];
    
    clusters.forEach(cluster => {
      if (cluster.length > 3) {
        suggestions.push(`Consider grouping ${cluster.length} nearby components into a container`);
      }
      
      const types = cluster.map(c => c.type);
      if (types.includes('text') && types.includes('button')) {
        suggestions.push('Text and button components work well together - consider aligning them');
      }
    });
    
    return suggestions;
  }
}

export { AISuggestion, PageContext, LayoutPattern, ColorPalette, TypographyPairing };