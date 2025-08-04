import { ComponentData } from '@/types/builder';

interface LayoutPattern {
  id: string;
  name: string;
  description: string;
  structure: LayoutStructure;
  bestFor: string[];
  confidence: number;
  variants: LayoutVariant[];
}

interface LayoutStructure {
  containers: number;
  sections: string[];
  hierarchy: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

interface LayoutVariant {
  id: string;
  name: string;
  components: ComponentTemplate[];
  spacing: SpacingSystem;
  responsive: ResponsiveBreakpoints;
}

interface ComponentTemplate {
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
  relationships: string[];
}

interface SpacingSystem {
  base: number;
  scale: number[];
  margins: Record<string, number>;
  paddings: Record<string, number>;
}

interface ResponsiveBreakpoints {
  mobile: { maxWidth: number; columns: number };
  tablet: { maxWidth: number; columns: number };
  desktop: { maxWidth: number; columns: number };
}

interface LayoutSuggestion {
  pattern: LayoutPattern;
  reasoning: string;
  modifications: string[];
  confidence: number;
  expectedImpact: string;
}

export class LayoutIntelligence {
  private patterns: LayoutPattern[] = [];
  private spacingSystem: SpacingSystem;

  constructor() {
    this.initializePatterns();
    this.spacingSystem = {
      base: 16,
      scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8],
      margins: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48
      },
      paddings: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48
      }
    };
  }

  private initializePatterns() {
    this.patterns = [
      {
        id: 'hero-features-cta',
        name: 'Hero-Features-CTA Pattern',
        description: 'Classic landing page with hero section, feature showcase, and call-to-action',
        structure: {
          containers: 3,
          sections: ['hero', 'features', 'cta'],
          hierarchy: 3,
          complexity: 'moderate'
        },
        bestFor: ['landing-pages', 'product-launches', 'saas', 'marketing'],
        confidence: 0.95,
        variants: [
          {
            id: 'centered-hero',
            name: 'Centered Hero Layout',
            components: [
              {
                type: 'hero',
                position: { x: 0, y: 0 },
                size: { width: 1200, height: 600 },
                props: {
                  alignment: 'center',
                  backgroundType: 'gradient',
                  hasImage: true
                },
                relationships: ['cta-button']
              },
              {
                type: 'features',
                position: { x: 0, y: 650 },
                size: { width: 1200, height: 400 },
                props: {
                  layout: 'grid',
                  columns: 3,
                  cards: true
                },
                relationships: []
              },
              {
                type: 'cta',
                position: { x: 0, y: 1100 },
                size: { width: 1200, height: 200 },
                props: {
                  style: 'prominent',
                  background: 'accent'
                },
                relationships: ['hero']
              }
            ],
            spacing: {
              base: 16,
              scale: [1, 1.5, 2, 3, 4],
              margins: { section: 64, container: 32 },
              paddings: { section: 80, container: 24 }
            },
            responsive: {
              mobile: { maxWidth: 768, columns: 1 },
              tablet: { maxWidth: 1024, columns: 2 },
              desktop: { maxWidth: 1200, columns: 3 }
            }
          }
        ]
      },
      {
        id: 'dashboard-grid',
        name: 'Dashboard Grid Pattern',
        description: 'Data-focused layout with metrics, charts, and widgets in organized grid',
        structure: {
          containers: 4,
          sections: ['header', 'metrics', 'charts', 'widgets'],
          hierarchy: 2,
          complexity: 'complex'
        },
        bestFor: ['dashboards', 'analytics', 'admin-panels', 'reporting'],
        confidence: 0.92,
        variants: [
          {
            id: 'metric-focused',
            name: 'Metrics-First Dashboard',
            components: [
              {
                type: 'header',
                position: { x: 0, y: 0 },
                size: { width: 1200, height: 80 },
                props: {
                  navigation: 'horizontal',
                  search: true,
                  notifications: true
                },
                relationships: []
              },
              {
                type: 'metrics',
                position: { x: 0, y: 100 },
                size: { width: 1200, height: 160 },
                props: {
                  layout: 'horizontal',
                  cards: 4,
                  animated: true
                },
                relationships: ['charts']
              },
              {
                type: 'charts',
                position: { x: 0, y: 280 },
                size: { width: 800, height: 400 },
                props: {
                  primary: 'line-chart',
                  interactive: true
                },
                relationships: ['metrics']
              },
              {
                type: 'widgets',
                position: { x: 820, y: 280 },
                size: { width: 380, height: 400 },
                props: {
                  layout: 'vertical',
                  count: 3
                },
                relationships: []
              }
            ],
            spacing: {
              base: 16,
              scale: [0.5, 1, 1.5, 2, 3],
              margins: { widget: 16, section: 24 },
              paddings: { card: 20, section: 32 }
            },
            responsive: {
              mobile: { maxWidth: 768, columns: 1 },
              tablet: { maxWidth: 1024, columns: 2 },
              desktop: { maxWidth: 1200, columns: 4 }
            }
          }
        ]
      },
      {
        id: 'content-sidebar',
        name: 'Content-Sidebar Pattern',
        description: 'Two-column layout with main content area and complementary sidebar',
        structure: {
          containers: 2,
          sections: ['main-content', 'sidebar'],
          hierarchy: 2,
          complexity: 'simple'
        },
        bestFor: ['blogs', 'documentation', 'news-sites', 'portfolios'],
        confidence: 0.88,
        variants: [
          {
            id: 'left-sidebar',
            name: 'Left Sidebar Layout',
            components: [
              {
                type: 'sidebar',
                position: { x: 0, y: 0 },
                size: { width: 300, height: 800 },
                props: {
                  position: 'left',
                  navigation: true,
                  widgets: ['recent', 'categories', 'tags']
                },
                relationships: ['main-content']
              },
              {
                type: 'main-content',
                position: { x: 320, y: 0 },
                size: { width: 880, height: 800 },
                props: {
                  type: 'article',
                  comments: true,
                  sharing: true
                },
                relationships: ['sidebar']
              }
            ],
            spacing: {
              base: 16,
              scale: [1, 1.5, 2, 2.5],
              margins: { content: 20, sidebar: 16 },
              paddings: { content: 32, sidebar: 24 }
            },
            responsive: {
              mobile: { maxWidth: 768, columns: 1 },
              tablet: { maxWidth: 1024, columns: 1 },
              desktop: { maxWidth: 1200, columns: 2 }
            }
          }
        ]
      },
      {
        id: 'ecommerce-grid',
        name: 'E-commerce Grid Pattern',
        description: 'Product showcase with filters, grid layout, and detailed product cards',
        structure: {
          containers: 3,
          sections: ['filters', 'product-grid', 'pagination'],
          hierarchy: 2,
          complexity: 'moderate'
        },
        bestFor: ['e-commerce', 'catalogs', 'galleries', 'marketplaces'],
        confidence: 0.90,
        variants: [
          {
            id: 'filter-grid',
            name: 'Filterable Product Grid',
            components: [
              {
                type: 'filters',
                position: { x: 0, y: 0 },
                size: { width: 250, height: 600 },
                props: {
                  categories: true,
                  priceRange: true,
                  ratings: true,
                  collapsible: true
                },
                relationships: ['product-grid']
              },
              {
                type: 'product-grid',
                position: { x: 270, y: 0 },
                size: { width: 930, height: 600 },
                props: {
                  columns: 3,
                  cardStyle: 'detailed',
                  hover: 'zoom',
                  quickView: true
                },
                relationships: ['filters', 'pagination']
              },
              {
                type: 'pagination',
                position: { x: 270, y: 620 },
                size: { width: 930, height: 60 },
                props: {
                  type: 'numbered',
                  showInfo: true
                },
                relationships: ['product-grid']
              }
            ],
            spacing: {
              base: 16,
              scale: [1, 1.5, 2, 3],
              margins: { card: 12, section: 20 },
              paddings: { card: 16, filter: 20 }
            },
            responsive: {
              mobile: { maxWidth: 768, columns: 1 },
              tablet: { maxWidth: 1024, columns: 2 },
              desktop: { maxWidth: 1200, columns: 3 }
            }
          }
        ]
      }
    ];
  }

  analyzeCurrentLayout(components: ComponentData[]): {
    detectedPatterns: LayoutPattern[];
    layoutScore: number;
    improvementAreas: string[];
    recommendations: LayoutSuggestion[];
  } {
    const detectedPatterns = this.detectPatterns(components);
    const layoutScore = this.calculateLayoutScore(components);
    const improvementAreas = this.identifyImprovementAreas(components);
    const recommendations = this.generateRecommendations(
      components, 
      detectedPatterns, 
      improvementAreas
    );

    return {
      detectedPatterns,
      layoutScore,
      improvementAreas,
      recommendations
    };
  }

  private detectPatterns(components: ComponentData[]): LayoutPattern[] {
    const matches: Array<{pattern: LayoutPattern, score: number}> = [];

    this.patterns.forEach(pattern => {
      let score = 0;
      const componentTypes = components.map(c => c.type);
      
      // Check structural similarity
      const expectedSections = pattern.structure.sections;
      const matchedSections = expectedSections.filter(section => 
        componentTypes.some(type => 
          type.includes(section) || section.includes(type)
        )
      );
      
      score += (matchedSections.length / expectedSections.length) * 0.6;
      
      // Check component count similarity
      const expectedContainers = pattern.structure.containers;
      const actualContainers = components.filter(c => 
        c.type === 'container' || c.children?.length
      ).length;
      
      const containerSimilarity = 1 - Math.abs(expectedContainers - actualContainers) / Math.max(expectedContainers, actualContainers);
      score += containerSimilarity * 0.2;
      
      // Check complexity alignment
      const actualComplexity = this.calculateComplexity(components);
      const expectedComplexity = pattern.structure.complexity;
      
      if (actualComplexity === expectedComplexity) {
        score += 0.2;
      }
      
      if (score > 0.3) {
        matches.push({ pattern, score });
      }
    });

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(match => match.pattern);
  }

  private calculateComplexity(components: ComponentData[]): 'simple' | 'moderate' | 'complex' {
    const totalComponents = components.length;
    const hasNesting = components.some(c => c.children && c.children.length > 0);
    const hasInteractions = components.some(c => 
      c.props.onClick || c.props.onHover || c.type === 'button'
    );
    
    if (totalComponents <= 5 && !hasNesting) return 'simple';
    if (totalComponents <= 15 && hasNesting && hasInteractions) return 'moderate';
    return 'complex';
  }

  private calculateLayoutScore(components: ComponentData[]): number {
    let score = 0;
    const maxScore = 100;
    
    // Visual hierarchy (25 points)
    const hierarchyScore = this.evaluateHierarchy(components);
    score += hierarchyScore * 25;
    
    // Spacing consistency (25 points)
    const spacingScore = this.evaluateSpacing(components);
    score += spacingScore * 25;
    
    // Responsive design (20 points)
    const responsiveScore = this.evaluateResponsiveness(components);
    score += responsiveScore * 20;
    
    // Component relationships (15 points)
    const relationshipScore = this.evaluateRelationships(components);
    score += relationshipScore * 15;
    
    // Accessibility (15 points)
    const accessibilityScore = this.evaluateAccessibility(components);
    score += accessibilityScore * 15;
    
    return Math.min(score, maxScore);
  }

  private evaluateHierarchy(components: ComponentData[]): number {
    let score = 0;
    const totalComponents = components.length;
    
    // Check for clear size differentiation
    const sizes = components.map(c => c.size.width * c.size.height);
    const sizeVariance = this.calculateVariance(sizes);
    score += Math.min(sizeVariance / 10000, 0.4); // Max 0.4 for size variance
    
    // Check for proper z-index usage
    const hasZIndex = components.some(c => c.style?.zIndex);
    if (hasZIndex) score += 0.2;
    
    // Check for heading hierarchy
    const headings = components.filter(c => 
      c.type === 'heading' || c.type === 'text'
    );
    if (headings.length > 1) {
      const hasHierarchy = headings.some(h => 
        h.props.level || h.style?.fontSize
      );
      if (hasHierarchy) score += 0.4;
    }
    
    return Math.min(score, 1);
  }

  private evaluateSpacing(components: ComponentData[]): number {
    if (components.length < 2) return 1;
    
    const spacings: number[] = [];
    
    // Calculate spacing between adjacent components
    for (let i = 0; i < components.length - 1; i++) {
      const comp1 = components[i];
      const comp2 = components[i + 1];
      
      const spacing = Math.abs(
        (comp2.position.y - comp1.position.y) - comp1.size.height
      );
      spacings.push(spacing);
    }
    
    // Check consistency (lower variance = better score)
    const variance = this.calculateVariance(spacings);
    const maxVariance = 1000; // Reasonable threshold
    
    return Math.max(0, 1 - (variance / maxVariance));
  }

  private evaluateResponsiveness(components: ComponentData[]): number {
    let score = 0;
    const totalComponents = components.length;
    let responsiveCount = 0;
    
    components.forEach(component => {
      // Check for responsive properties
      if (component.props.responsive || 
          component.props.className?.includes('responsive') ||
          component.style?.maxWidth === '100%') {
        responsiveCount++;
      }
      
      // Check for breakpoint-aware styling
      if (component.props.className?.includes('sm:') ||
          component.props.className?.includes('md:') ||
          component.props.className?.includes('lg:')) {
        responsiveCount++;
      }
    });
    
    return responsiveCount / totalComponents;
  }

  private evaluateRelationships(components: ComponentData[]): number {
    let score = 0;
    
    // Check for proper nesting
    const nestedComponents = components.filter(c => c.children && c.children.length > 0);
    if (nestedComponents.length > 0) {
      score += 0.5;
    }
    
    // Check for logical grouping (components close together)
    const clusters = this.findClusters(components);
    if (clusters.length > 1 && clusters.length < components.length) {
      score += 0.5;
    }
    
    return score;
  }

  private evaluateAccessibility(components: ComponentData[]): number {
    let score = 0;
    const totalComponents = components.length;
    let accessibleCount = 0;
    
    components.forEach(component => {
      // Check for ARIA labels
      if (component.props['aria-label'] || component.props['aria-labelledby']) {
        accessibleCount++;
      }
      
      // Check for semantic elements
      if (['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'].includes(component.type)) {
        accessibleCount++;
      }
      
      // Check for alt text on images
      if (component.type === 'image' && component.props.alt) {
        accessibleCount++;
      }
    });
    
    return accessibleCount / totalComponents;
  }

  private identifyImprovementAreas(components: ComponentData[]): string[] {
    const areas: string[] = [];
    
    // Check spacing consistency
    const spacingScore = this.evaluateSpacing(components);
    if (spacingScore < 0.7) {
      areas.push('spacing-consistency');
    }
    
    // Check responsive design
    const responsiveScore = this.evaluateResponsiveness(components);
    if (responsiveScore < 0.5) {
      areas.push('responsive-design');
    }
    
    // Check visual hierarchy
    const hierarchyScore = this.evaluateHierarchy(components);
    if (hierarchyScore < 0.6) {
      areas.push('visual-hierarchy');
    }
    
    // Check accessibility
    const accessibilityScore = this.evaluateAccessibility(components);
    if (accessibilityScore < 0.4) {
      areas.push('accessibility');
    }
    
    // Check for empty areas
    const totalArea = this.calculateTotalArea(components);
    const usedArea = components.reduce((sum, c) => sum + (c.size.width * c.size.height), 0);
    const utilization = usedArea / totalArea;
    
    if (utilization < 0.3) {
      areas.push('space-utilization');
    }
    
    return areas;
  }

  private generateRecommendations(
    components: ComponentData[],
    detectedPatterns: LayoutPattern[],
    improvementAreas: string[]
  ): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];
    
    // Pattern-based suggestions
    if (detectedPatterns.length > 0) {
      const topPattern = detectedPatterns[0];
      suggestions.push({
        pattern: topPattern,
        reasoning: `Your layout partially matches the ${topPattern.name}, which is ideal for ${topPattern.bestFor.join(', ')}`,
        modifications: this.generatePatternModifications(components, topPattern),
        confidence: topPattern.confidence,
        expectedImpact: 'Improved user experience and conversion rates'
      });
    }
    
    // Improvement-based suggestions
    improvementAreas.forEach(area => {
      const suggestion = this.generateImprovementSuggestion(area, components);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private generatePatternModifications(components: ComponentData[], pattern: LayoutPattern): string[] {
    const modifications: string[] = [];
    const componentTypes = components.map(c => c.type);
    
    // Check for missing sections
    pattern.structure.sections.forEach(section => {
      if (!componentTypes.some(type => type.includes(section) || section.includes(type))) {
        modifications.push(`Add ${section} section to complete the pattern`);
      }
    });
    
    // Check spacing alignment
    modifications.push('Align spacing with pattern standards');
    modifications.push('Optimize component relationships');
    
    return modifications;
  }

  private generateImprovementSuggestion(area: string, components: ComponentData[]): LayoutSuggestion | null {
    const areaPatterns: Record<string, LayoutPattern> = {
      'spacing-consistency': this.patterns.find(p => p.id === 'hero-features-cta')!,
      'responsive-design': this.patterns.find(p => p.id === 'dashboard-grid')!,
      'visual-hierarchy': this.patterns.find(p => p.id === 'content-sidebar')!,
      'accessibility': this.patterns.find(p => p.id === 'ecommerce-grid')!
    };
    
    const pattern = areaPatterns[area];
    if (!pattern) return null;
    
    const suggestionMap: Record<string, { reasoning: string; impact: string }> = {
      'spacing-consistency': {
        reasoning: 'Inconsistent spacing reduces visual cohesion and professional appearance',
        impact: 'Better visual flow and increased user engagement'
      },
      'responsive-design': {
        reasoning: 'Mobile users represent significant traffic - responsive design is essential',
        impact: 'Improved mobile experience and higher conversion rates'
      },
      'visual-hierarchy': {
        reasoning: 'Clear hierarchy guides users through your content effectively',
        impact: 'Better content consumption and user journey completion'
      },
      'accessibility': {
        reasoning: 'Accessible design ensures usability for all users and improves SEO',
        impact: 'Wider audience reach and better search engine rankings'
      }
    };
    
    const info = suggestionMap[area];
    
    return {
      pattern,
      reasoning: info.reasoning,
      modifications: [`Improve ${area.replace('-', ' ')}`],
      confidence: 0.8,
      expectedImpact: info.impact
    };
  }

  // Utility methods
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private findClusters(components: ComponentData[]): ComponentData[][] {
    const clusters: ComponentData[][] = [];
    const visited = new Set<string>();
    const clusterDistance = 100; // Components within 100px are considered clustered
    
    components.forEach(component => {
      if (visited.has(component.id)) return;
      
      const cluster = [component];
      visited.add(component.id);
      
      components.forEach(other => {
        if (visited.has(other.id)) return;
        
        const distance = Math.sqrt(
          Math.pow(component.position.x - other.position.x, 2) +
          Math.pow(component.position.y - other.position.y, 2)
        );
        
        if (distance <= clusterDistance) {
          cluster.push(other);
          visited.add(other.id);
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  }

  private calculateTotalArea(components: ComponentData[]): number {
    if (components.length === 0) return 1;
    
    const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
    const maxY = Math.max(...components.map(c => c.position.y + c.size.height));
    
    return maxX * maxY;
  }

  generateOptimalLayout(
    components: ComponentData[],
    targetPattern: string
  ): ComponentData[] {
    const pattern = this.patterns.find(p => p.id === targetPattern);
    if (!pattern || !pattern.variants.length) return components;
    
    const variant = pattern.variants[0];
    const optimizedComponents = [...components];
    
    // Apply pattern-based positioning and sizing
    variant.components.forEach((template, index) => {
      if (optimizedComponents[index]) {
        optimizedComponents[index] = {
          ...optimizedComponents[index],
          position: template.position,
          size: template.size,
          props: {
            ...optimizedComponents[index].props,
            ...template.props
          }
        };
      }
    });
    
    return optimizedComponents;
  }
}

export {
  LayoutPattern,
  LayoutStructure,
  LayoutVariant,
  ComponentTemplate,
  SpacingSystem,
  ResponsiveBreakpoints,
  LayoutSuggestion
};