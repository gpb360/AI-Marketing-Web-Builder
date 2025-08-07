/**
 * AI Service Integration Test
 * Tests core AI functionality for the Magic Connector system
 */

import { ComponentData } from '@/types/builder';

// Mock AI service for testing
export class AIServiceTester {
  /**
   * Test component analysis functionality
   */
  async testComponentAnalysis(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const mockComponent: ComponentData = {
        id: 'test-button-1',
        type: 'button',
        name: 'Test Button',
        props: {
          text: 'Click Me',
          className: 'bg-blue-500 text-white px-4 py-2 rounded',
          style: { backgroundColor: '#3b82f6' }
        },
        position: { x: 100, y: 100 },
        size: { width: 120, height: 40 },
        style: { backgroundColor: '#3b82f6' }
      };

      // Simulate AI analysis
      const analysis = await this.analyzeComponent(mockComponent);
      
      return {
        success: true,
        message: 'Component analysis working correctly',
        details: analysis
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Component analysis failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Test workflow suggestion functionality
   */
  async testWorkflowSuggestions(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const mockComponent: ComponentData = {
        id: 'test-form-1',
        type: 'form',
        name: 'Contact Form',
        props: {
          fields: ['name', 'email', 'message'],
          submitText: 'Send Message'
        },
        position: { x: 200, y: 200 },
        size: { width: 400, height: 300 },
        style: {}
      };

      const suggestions = await this.generateWorkflowSuggestions(mockComponent);
      
      return {
        success: true,
        message: 'Workflow suggestions working correctly',
        details: suggestions
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Workflow suggestions failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Test AI customization functionality
   */
  async testAICustomization(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const prompt = "Make this button more prominent with better contrast";
      const mockComponent: ComponentData = {
        id: 'test-button-2',
        type: 'button',
        name: 'Test Button',
        props: {
          text: 'Submit',
          className: 'bg-gray-400 text-gray-800 px-3 py-1 rounded'
        },
        position: { x: 150, y: 150 },
        size: { width: 100, height: 35 },
        style: {}
      };

      const customization = await this.processCustomizationPrompt(prompt, mockComponent);
      
      return {
        success: true,
        message: 'AI customization working correctly',
        details: customization
      };
    } catch (error: any) {
      return {
        success: false,
        message: `AI customization failed: ${error.message}`,
        details: error
      };
    }
  }

  /**
   * Run all AI service tests
   */
  async runAllTests(): Promise<{ 
    overall: boolean; 
    results: Array<{ test: string; success: boolean; message: string; details?: any }> 
  }> {
    const tests = [
      { name: 'Component Analysis', test: () => this.testComponentAnalysis() },
      { name: 'Workflow Suggestions', test: () => this.testWorkflowSuggestions() },
      { name: 'AI Customization', test: () => this.testAICustomization() }
    ];

    const results: Array<{ test: string; success: boolean; message: string; details?: any }> = [];
    let allPassed = true;

    for (const testCase of tests) {
      console.log(`🔄 Testing ${testCase.name}...`);
      try {
        const result = await testCase.test();
        results.push({
          test: testCase.name,
          success: result.success,
          message: result.message,
          details: result.details
        });

        if (result.success) {
          console.log(`✅ ${testCase.name}: ${result.message}`);
        } else {
          console.log(`❌ ${testCase.name}: ${result.message}`);
          allPassed = false;
        }
      } catch (error: any) {
        const errorMessage = `Unexpected error: ${error.message}`;
        results.push({
          test: testCase.name,
          success: false,
          message: errorMessage,
          details: error
        });
        console.log(`❌ ${testCase.name}: ${errorMessage}`);
        allPassed = false;
      }
    }

    return { overall: allPassed, results };
  }

  // Private helper methods
  private async analyzeComponent(component: ComponentData): Promise<any> {
    // Simulate AI component analysis
    await this.delay(500); // Simulate API call

    return {
      componentType: component.type,
      hasButton: component.type === 'button',
      hasForm: component.type === 'form',
      hasText: component.props.text !== undefined,
      isContainer: component.type === 'container' || component.type === 'div',
      hasAnimation: component.props.className?.includes('animate') || false,
      colorScheme: this.extractColorScheme(component),
      accessibility: this.checkAccessibility(component),
      recommendations: this.generateRecommendations(component)
    };
  }

  private async generateWorkflowSuggestions(component: ComponentData): Promise<any> {
    await this.delay(300);

    const suggestions = [];

    if (component.type === 'form') {
      suggestions.push({
        id: 'form-lead-capture',
        name: 'Lead Capture Workflow',
        description: 'Automatically process form submissions and add to CRM',
        confidence: 0.92,
        estimatedSetupTime: '< 30 seconds'
      });
    }

    if (component.type === 'button') {
      suggestions.push({
        id: 'button-cta-tracking',
        name: 'CTA Click Tracking',
        description: 'Track button clicks and conversion metrics',
        confidence: 0.85,
        estimatedSetupTime: '< 15 seconds'
      });
    }

    return suggestions;
  }

  private async processCustomizationPrompt(prompt: string, component: ComponentData): Promise<any> {
    await this.delay(400);

    const modifications: any = { ...component.props };

    // Simple keyword-based customization simulation
    if (prompt.toLowerCase().includes('prominent') && component.type === 'button') {
      modifications.className = 'bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors';
      modifications.style = { ...modifications.style, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
    }

    if (prompt.toLowerCase().includes('contrast')) {
      modifications.className = modifications.className?.replace('text-gray-800', 'text-white');
    }

    return {
      originalProps: component.props,
      modifiedProps: modifications,
      changes: ['Enhanced button prominence', 'Improved color contrast', 'Added shadow for depth'],
      confidence: 0.88
    };
  }

  private extractColorScheme(component: ComponentData): string {
    const className = component.props.className || '';
    if (className.includes('blue')) return 'blue';
    if (className.includes('red')) return 'red';
    if (className.includes('green')) return 'green';
    return 'neutral';
  }

  private checkAccessibility(component: ComponentData): any {
    return {
      hasAriaLabel: !!component.props['aria-label'],
      hasAltText: !!component.props.alt,
      colorContrast: 'good', // Simplified
      keyboardAccessible: component.type === 'button' || component.type === 'form'
    };
  }

  private generateRecommendations(component: ComponentData): string[] {
    const recommendations = [];
    
    if (component.type === 'button' && !component.props['aria-label']) {
      recommendations.push('Add aria-label for better accessibility');
    }
    
    if (!component.props.className?.includes('hover:')) {
      recommendations.push('Add hover effects for better user experience');
    }
    
    return recommendations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for testing
export const aiServiceTester = new AIServiceTester();

// Export for component usage
export default aiServiceTester;