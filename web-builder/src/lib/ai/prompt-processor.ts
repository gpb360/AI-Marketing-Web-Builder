interface PromptAnalysis {
  intent: 'style' | 'content' | 'layout' | 'interaction' | 'complex';
  confidence: number;
  entities: {
    colors: string[];
    dimensions: string[];
    animations: string[];
    properties: string[];
  };
  suggestions: string[];
  expandedPrompt: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  examples: string[];
}

export class PromptProcessor {
  private templates: PromptTemplate[] = [];
  private colorKeywords = [
    'blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'black', 'white',
    'primary', 'secondary', 'accent', 'brand', 'theme', 'dark', 'light', 'vibrant', 'muted'
  ];
  
  private dimensionKeywords = [
    'large', 'small', 'big', 'tiny', 'huge', 'compact', 'wide', 'narrow', 'tall', 'short',
    'responsive', 'mobile', 'desktop', 'tablet', 'full-width', 'centered'
  ];
  
  private animationKeywords = [
    'animate', 'animation', 'hover', 'transition', 'fade', 'slide', 'bounce', 'scale',
    'rotate', 'smooth', 'effect', 'interactive', 'motion', 'transform'
  ];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'modern-button',
        name: 'Modern Button',
        category: 'components',
        template: 'Create a modern {style} button with {color} background, {size} size, and {effect} hover effect',
        variables: ['style', 'color', 'size', 'effect'],
        examples: [
          'Create a modern sleek button with blue background, large size, and scale hover effect',
          'Create a modern rounded button with green background, medium size, and glow hover effect'
        ]
      },
      {
        id: 'responsive-card',
        name: 'Responsive Card',
        category: 'layout',
        template: 'Design a responsive card component with {layout} layout, {shadow} shadow, and {spacing} spacing',
        variables: ['layout', 'shadow', 'spacing'],
        examples: [
          'Design a responsive card component with vertical layout, subtle shadow, and comfortable spacing',
          'Design a responsive card component with horizontal layout, deep shadow, and tight spacing'
        ]
      },
      {
        id: 'hero-section',
        name: 'Hero Section',
        category: 'sections',
        template: 'Build a {style} hero section with {background} background, {alignment} text alignment, and {cta} call-to-action',
        variables: ['style', 'background', 'alignment', 'cta'],
        examples: [
          'Build a modern hero section with gradient background, center text alignment, and prominent call-to-action',
          'Build a minimal hero section with image background, left text alignment, and subtle call-to-action'
        ]
      },
      {
        id: 'navigation-menu',
        name: 'Navigation Menu',
        category: 'navigation',
        template: 'Create a {type} navigation menu with {style} styling, {responsive} responsive behavior, and {effect} hover effects',
        variables: ['type', 'style', 'responsive', 'effect'],
        examples: [
          'Create a horizontal navigation menu with modern styling, mobile responsive behavior, and underline hover effects',
          'Create a sidebar navigation menu with minimal styling, tablet responsive behavior, and background hover effects'
        ]
      }
    ];
  }

  analyzePrompt(prompt: string): PromptAnalysis {
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Determine primary intent
    const intent = this.determineIntent(normalizedPrompt);
    
    // Extract entities
    const entities = this.extractEntities(normalizedPrompt);
    
    // Calculate confidence based on specificity
    const confidence = this.calculateConfidence(normalizedPrompt, entities);
    
    // Generate suggestions for improvement
    const suggestions = this.generateSuggestions(normalizedPrompt, entities, intent);
    
    // Create expanded prompt
    const expandedPrompt = this.expandPrompt(normalizedPrompt, entities, intent);
    
    return {
      intent,
      confidence,
      entities,
      suggestions,
      expandedPrompt
    };
  }

  private determineIntent(prompt: string): PromptAnalysis['intent'] {
    const styleKeywords = ['color', 'background', 'border', 'shadow', 'gradient', 'theme', 'style'];
    const contentKeywords = ['text', 'content', 'copy', 'heading', 'title', 'description', 'label'];
    const layoutKeywords = ['layout', 'position', 'align', 'spacing', 'margin', 'padding', 'grid', 'flex'];
    const interactionKeywords = ['click', 'hover', 'animation', 'transition', 'interactive', 'effect'];
    
    const styleScore = this.countKeywords(prompt, styleKeywords);
    const contentScore = this.countKeywords(prompt, contentKeywords);
    const layoutScore = this.countKeywords(prompt, layoutKeywords);
    const interactionScore = this.countKeywords(prompt, interactionKeywords);
    
    const scores = {
      style: styleScore,
      content: contentScore,
      layout: layoutScore,
      interaction: interactionScore
    };
    
    const maxScore = Math.max(...Object.values(scores));
    const intents = Object.entries(scores).filter(([, score]) => score === maxScore);
    
    if (intents.length > 1 || maxScore >= 3) {
      return 'complex';
    }
    
    return (intents[0]?.[0] as PromptAnalysis['intent']) || 'style';
  }

  private countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);
  }

  private extractEntities(prompt: string): PromptAnalysis['entities'] {
    return {
      colors: this.extractColors(prompt),
      dimensions: this.extractDimensions(prompt),
      animations: this.extractAnimations(prompt),
      properties: this.extractProperties(prompt)
    };
  }

  private extractColors(prompt: string): string[] {
    const found: string[] = [];
    
    this.colorKeywords.forEach(color => {
      if (prompt.includes(color)) {
        found.push(color);
      }
    });
    
    // Extract hex codes
    const hexMatches = prompt.match(/#[0-9a-f]{6}/gi);
    if (hexMatches) {
      found.push(...hexMatches);
    }
    
    // Extract RGB values
    const rgbMatches = prompt.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi);
    if (rgbMatches) {
      found.push(...rgbMatches);
    }
    
    return [...new Set(found)];
  }

  private extractDimensions(prompt: string): string[] {
    const found: string[] = [];
    
    this.dimensionKeywords.forEach(dimension => {
      if (prompt.includes(dimension)) {
        found.push(dimension);
      }
    });
    
    // Extract specific measurements
    const measurementMatches = prompt.match(/\d+(?:px|em|rem|%|vh|vw)/gi);
    if (measurementMatches) {
      found.push(...measurementMatches);
    }
    
    return [...new Set(found)];
  }

  private extractAnimations(prompt: string): string[] {
    const found: string[] = [];
    
    this.animationKeywords.forEach(animation => {
      if (prompt.includes(animation)) {
        found.push(animation);
      }
    });
    
    return [...new Set(found)];
  }

  private extractProperties(prompt: string): string[] {
    const propertyKeywords = [
      'border-radius', 'box-shadow', 'opacity', 'z-index', 'position',
      'display', 'flex-direction', 'justify-content', 'align-items',
      'font-size', 'font-weight', 'line-height', 'letter-spacing'
    ];
    
    const found: string[] = [];
    
    propertyKeywords.forEach(property => {
      if (prompt.includes(property) || prompt.includes(property.replace('-', ' '))) {
        found.push(property);
      }
    });
    
    return [...new Set(found)];
  }

  private calculateConfidence(prompt: string, entities: PromptAnalysis['entities']): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on specificity
    const totalEntities = Object.values(entities).flat().length;
    confidence += Math.min(totalEntities * 0.1, 0.3);
    
    // Increase confidence based on prompt length (more detailed = higher confidence)
    const wordCount = prompt.split(' ').length;
    if (wordCount > 10) confidence += 0.1;
    if (wordCount > 20) confidence += 0.1;
    
    // Decrease confidence for vague terms
    const vagueTerms = ['nice', 'good', 'better', 'improve', 'fix', 'change'];
    const vagueCount = this.countKeywords(prompt, vagueTerms);
    confidence -= vagueCount * 0.1;
    
    return Math.max(0.1, Math.min(confidence, 1.0));
  }

  private generateSuggestions(
    prompt: string, 
    entities: PromptAnalysis['entities'], 
    intent: PromptAnalysis['intent']
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggest being more specific about colors
    if (intent === 'style' && entities.colors.length === 0) {
      suggestions.push('Consider specifying colors (e.g., "blue background" or "#3B82F6")');
    }
    
    // Suggest including dimensions
    if (entities.dimensions.length === 0) {
      suggestions.push('Add size information (e.g., "large", "medium", or specific pixels)');
    }
    
    // Suggest animations for interactions
    if (intent === 'interaction' && entities.animations.length === 0) {
      suggestions.push('Specify animation type (e.g., "fade in", "slide up", "scale on hover")');
    }
    
    // Suggest responsive considerations
    if (!prompt.includes('responsive') && !prompt.includes('mobile')) {
      suggestions.push('Consider mentioning responsive behavior for better mobile experience');
    }
    
    // Suggest accessibility
    if (!prompt.includes('accessible') && !prompt.includes('aria')) {
      suggestions.push('Consider accessibility requirements (e.g., "accessible", "high contrast")');
    }
    
    return suggestions;
  }

  private expandPrompt(
    prompt: string, 
    entities: PromptAnalysis['entities'], 
    intent: PromptAnalysis['intent']
  ): string {
    let expanded = prompt;
    
    // Add context based on intent
    const contextAdditions: Record<PromptAnalysis['intent'], string> = {
      'style': ' with modern design principles and consistent branding',
      'content': ' ensuring clear hierarchy and readability',
      'layout': ' with responsive design and proper spacing',
      'interaction': ' with smooth animations and good user feedback',
      'complex': ' following best practices for UX and accessibility'
    };
    
    expanded += contextAdditions[intent];
    
    // Add missing important details
    if (entities.colors.length === 0 && intent === 'style') {
      expanded += ', using appropriate brand colors';
    }
    
    if (!prompt.includes('responsive')) {
      expanded += ', optimized for all screen sizes';
    }
    
    if (!prompt.includes('accessible')) {
      expanded += ', with accessibility considerations';
    }
    
    return expanded;
  }

  validatePrompt(prompt: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check minimum length
    if (prompt.trim().length < 5) {
      errors.push('Prompt is too short. Please provide more details.');
    }
    
    // Check maximum length
    if (prompt.length > 1000) {
      errors.push('Prompt is too long. Please keep it under 1000 characters.');
    }
    
    // Check for potentially problematic content
    const problematicTerms = ['hack', 'exploit', 'inject', 'bypass'];
    const hasProblematic = problematicTerms.some(term => 
      prompt.toLowerCase().includes(term)
    );
    
    if (hasProblematic) {
      warnings.push('Prompt contains potentially problematic terms.');
    }
    
    // Check for very vague prompts
    const vaguePhrases = ['make it better', 'improve this', 'fix it', 'change it'];
    const isVague = vaguePhrases.some(phrase => 
      prompt.toLowerCase().includes(phrase)
    );
    
    if (isVague) {
      warnings.push('Prompt is quite vague. Consider being more specific about what you want to change.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getSuggestedTemplates(prompt: string): PromptTemplate[] {
    const analysis = this.analyzePrompt(prompt);
    
    return this.templates
      .map(template => {
        let score = 0;
        
        // Check if prompt mentions template category
        if (prompt.toLowerCase().includes(template.category)) {
          score += 0.5;
        }
        
        // Check if prompt mentions template variables
        template.variables.forEach(variable => {
          if (prompt.toLowerCase().includes(variable)) {
            score += 0.2;
          }
        });
        
        // Check intent alignment
        if (template.category === 'components' && analysis.intent === 'style') score += 0.3;
        if (template.category === 'layout' && analysis.intent === 'layout') score += 0.3;
        if (template.category === 'sections' && analysis.intent === 'complex') score += 0.3;
        
        return { ...template, score };
      })
      .filter(template => template.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  generatePromptVariations(basePrompt: string): string[] {
    const analysis = this.analyzePrompt(basePrompt);
    const variations: string[] = [];
    
    // Create more specific variation
    variations.push(`${basePrompt} with attention to detail and modern styling`);
    
    // Create variations with different focuses
    if (analysis.intent !== 'layout') {
      variations.push(`${basePrompt} ensuring responsive layout and proper spacing`);
    }
    
    if (analysis.intent !== 'interaction') {
      variations.push(`${basePrompt} with smooth animations and hover effects`);
    }
    
    if (analysis.entities.colors.length === 0) {
      variations.push(`${basePrompt} using modern color palette and gradients`);
    }
    
    // Create simplified variation
    variations.push(`Simplify: ${basePrompt}`);
    
    return variations.slice(0, 4);
  }
}

export { PromptAnalysis, PromptTemplate };