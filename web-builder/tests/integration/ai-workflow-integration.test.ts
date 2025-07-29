/**
 * Integration Test: AI Customization and Workflow Connector Integration
 * Tests the "Magic Moment" user journey: AI customization → workflow connection
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData, AICustomizationContext } from '@/types/builder';

// Mock available workflows (from WorkflowConnector component)
const mockWorkflows = [
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Capture and qualify leads automatically',
    category: 'Marketing',
    triggers: ['form-submit', 'button-click'],
  },
  {
    id: 'email-sequence',
    name: 'Email Sequence',
    description: 'Automated email marketing campaigns',
    category: 'Marketing',
    triggers: ['form-submit', 'button-click'],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Route customer inquiries to the right team',
    category: 'Support',
    triggers: ['chat-message', 'contact-form'],
  }
];

describe('AI Customization Integration', () => {
  let testComponent: ComponentData;

  beforeEach(() => {
    const { clearCanvas } = useBuilderStore.getState();
    clearCanvas();
    
    testComponent = {
      id: 'test-button-1',
      type: 'button',
      name: 'CTA Button',
      props: {
        content: 'Sign Up Now',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px'
      },
      position: { x: 100, y: 200 },
      size: { width: 150, height: 48 }
    };
  });

  describe('AI Context Management', () => {
    test('should initialize AI context for selected component', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.selectComponent(testComponent.id);
      });

      // Simulate AI context initialization
      const expectedContext: AICustomizationContext = {
        componentId: testComponent.id,
        currentProps: testComponent.props,
        availableActions: ['modify', 'style', 'enhance', 'connect'],
        suggestedModifications: []
      };

      act(() => {
        result.current.setAIContext(expectedContext);
      });

      expect(result.current.aiContext).toBeDefined();
      expect(result.current.aiContext?.componentId).toBe(testComponent.id);
      expect(result.current.aiContext?.availableActions).toContain('modify');
      expect(result.current.aiContext?.availableActions).toContain('style');
      expect(result.current.aiContext?.availableActions).toContain('enhance');
      expect(result.current.aiContext?.availableActions).toContain('connect');
    });

    test('should clear AI context when component is deselected', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.selectComponent(testComponent.id);
        result.current.setAIContext({
          componentId: testComponent.id,
          currentProps: testComponent.props,
          availableActions: ['modify'],
          suggestedModifications: []
        });
      });

      expect(result.current.aiContext).toBeDefined();

      act(() => {
        result.current.selectComponent(null);
        result.current.setAIContext(null);
      });

      expect(result.current.aiContext).toBeNull();
    });
  });

  describe('AI Customization Workflow', () => {
    test('should process AI customization request', async () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.selectComponent(testComponent.id);
      });

      const prompt = "Make this button more prominent and add a hover effect";

      act(() => {
        result.current.requestAICustomization(testComponent.id, prompt);
      });

      // Initially should set loading context
      expect(result.current.aiContext).toBeDefined();
      expect(result.current.aiContext?.componentId).toBe(testComponent.id);

      // Wait for AI processing simulation
      await waitFor(() => {
        expect(result.current.aiContext?.suggestedModifications).toBeDefined();
      }, { timeout: 2000 });

      // Should have suggestions after processing
      const suggestions = result.current.aiContext?.suggestedModifications;
      expect(suggestions).toBeDefined();
      expect(suggestions?.length).toBeGreaterThan(0);
      
      // Check specific suggestions
      const styleSuggestion = suggestions?.find(s => s.property === 'style');
      const animationSuggestion = suggestions?.find(s => s.property === 'animation');
      
      expect(styleSuggestion).toBeDefined();
      expect(styleSuggestion?.suggestion).toContain('shadow');
      expect(animationSuggestion).toBeDefined();
      expect(animationSuggestion?.suggestion).toContain('hover');
    });

    test('should handle AI suggestions application', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.selectComponent(testComponent.id);
      });

      // Mock applying a style suggestion
      const mockSuggestion = {
        property: 'style',
        suggestion: 'Add rounded corners and shadow',
        reason: 'Improves visual appeal and modern design'
      };

      act(() => {
        const component = result.current.getSelectedComponent();
        if (component) {
          result.current.updateComponent(component.id, {
            props: {
              ...component.props,
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          });
        }
      });

      const updatedComponent = result.current.getComponentById(testComponent.id);
      expect(updatedComponent?.props.borderRadius).toBe('12px');
      expect(updatedComponent?.props.boxShadow).toBeDefined();
    });
  });

  describe('Component-AI Integration Edge Cases', () => {
    test('should handle AI request for non-existent component', async () => {
      const { result } = renderHook(() => useBuilderStore());
      
      expect(() => {
        act(() => {
          result.current.requestAICustomization('non-existent-id', 'test prompt');
        });
      }).not.toThrow();

      // Should not create AI context for non-existent component
      expect(result.current.aiContext).toBeNull();
    });

    test('should handle multiple concurrent AI requests', async () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.selectComponent(testComponent.id);
      });

      // Send multiple requests
      act(() => {
        result.current.requestAICustomization(testComponent.id, 'First request');
      });

      act(() => {
        result.current.requestAICustomization(testComponent.id, 'Second request');
      });

      // Should handle the latest request
      await waitFor(() => {
        expect(result.current.aiContext?.componentId).toBe(testComponent.id);
      });
    });
  });
});

describe('Workflow Connector Integration', () => {
  let testComponent: ComponentData;

  beforeEach(() => {
    const { clearCanvas } = useBuilderStore.getState();
    clearCanvas();
    
    testComponent = {
      id: 'test-form-1',
      type: 'form',
      name: 'Contact Form',
      props: {
        fields: ['name', 'email', 'message'],
        submitText: 'Send Message'
      },
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 }
    };
  });

  describe('Workflow Connection Management', () => {
    test('should connect component to workflow', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
      });

      const workflowId = 'lead-capture';
      
      act(() => {
        result.current.connectToWorkflow(testComponent.id, workflowId);
      });

      const connectedComponent = result.current.getComponentById(testComponent.id);
      expect(connectedComponent?.isConnectedToWorkflow).toBe(true);
      expect(connectedComponent?.workflowId).toBe(workflowId);
    });

    test('should disconnect component from workflow', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.connectToWorkflow(testComponent.id, 'lead-capture');
      });

      // Verify connection
      let component = result.current.getComponentById(testComponent.id);
      expect(component?.isConnectedToWorkflow).toBe(true);

      act(() => {
        result.current.disconnectFromWorkflow(testComponent.id);
      });

      // Verify disconnection
      component = result.current.getComponentById(testComponent.id);
      expect(component?.isConnectedToWorkflow).toBe(false);
      expect(component?.workflowId).toBeUndefined();
    });

    test('should handle workflow connection for non-existent component', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      expect(() => {
        act(() => {
          result.current.connectToWorkflow('non-existent-id', 'lead-capture');
        });
      }).not.toThrow();

      // Should not affect any components
      expect(result.current.components).toHaveLength(0);
    });
  });

  describe('Workflow Type Validation', () => {
    test('should validate workflow triggers against component type', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Button component with button-click trigger
      const buttonComponent: ComponentData = {
        id: 'test-button-1',
        type: 'button',
        name: 'CTA Button',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 120, height: 40 }
      };

      act(() => {
        result.current.addComponent(buttonComponent);
      });

      // Lead capture workflow supports button-click triggers
      const leadCaptureWorkflow = mockWorkflows.find(w => w.id === 'lead-capture');
      expect(leadCaptureWorkflow?.triggers).toContain('button-click');

      act(() => {
        result.current.connectToWorkflow(buttonComponent.id, 'lead-capture');
      });

      const connectedComponent = result.current.getComponentById(buttonComponent.id);
      expect(connectedComponent?.isConnectedToWorkflow).toBe(true);
    });

    test('should handle form component with form-submit workflow', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
      });

      // Email sequence workflow supports form-submit triggers
      const emailWorkflow = mockWorkflows.find(w => w.id === 'email-sequence');
      expect(emailWorkflow?.triggers).toContain('form-submit');

      act(() => {
        result.current.connectToWorkflow(testComponent.id, 'email-sequence');
      });

      const connectedComponent = result.current.getComponentById(testComponent.id);
      expect(connectedComponent?.isConnectedToWorkflow).toBe(true);
      expect(connectedComponent?.workflowId).toBe('email-sequence');
    });
  });

  describe('Multiple Workflow Connections', () => {
    test('should handle switching between workflows', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
      });

      // Connect to first workflow
      act(() => {
        result.current.connectToWorkflow(testComponent.id, 'lead-capture');
      });

      let component = result.current.getComponentById(testComponent.id);
      expect(component?.workflowId).toBe('lead-capture');

      // Switch to different workflow
      act(() => {
        result.current.connectToWorkflow(testComponent.id, 'email-sequence');
      });

      component = result.current.getComponentById(testComponent.id);
      expect(component?.workflowId).toBe('email-sequence');
      expect(component?.isConnectedToWorkflow).toBe(true);
    });

    test('should maintain workflow state across component updates', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.addComponent(testComponent);
        result.current.connectToWorkflow(testComponent.id, 'customer-support');
      });

      // Update component properties
      act(() => {
        result.current.updateComponent(testComponent.id, {
          props: { ...testComponent.props, backgroundColor: '#green' }
        });
      });

      const updatedComponent = result.current.getComponentById(testComponent.id);
      expect(updatedComponent?.isConnectedToWorkflow).toBe(true);
      expect(updatedComponent?.workflowId).toBe('customer-support');
      expect(updatedComponent?.props.backgroundColor).toBe('#green');
    });
  });
});

describe('AI + Workflow Integration (Magic Moment)', () => {
  let testComponent: ComponentData;

  beforeEach(() => {
    const { clearCanvas } = useBuilderStore.getState();
    clearCanvas();
    
    testComponent = {
      id: 'magic-button-1',
      type: 'button',
      name: 'Magic CTA Button',
      props: {
        content: 'Get Started',
        backgroundColor: '#6366f1',
        color: '#ffffff'
      },
      position: { x: 200, y: 300 },
      size: { width: 160, height: 50 }
    };
  });

  test('should complete full magic moment workflow', async () => {
    const { result } = renderHook(() => useBuilderStore());
    
    // Step 1: Add component to canvas
    act(() => {
      result.current.addComponent(testComponent);
      result.current.selectComponent(testComponent.id);
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.selectedComponentId).toBe(testComponent.id);

    // Step 2: AI customization
    act(() => {
      result.current.requestAICustomization(
        testComponent.id, 
        "Make this button more conversion-focused and professional"
      );
    });

    await waitFor(() => {
      expect(result.current.aiContext?.suggestedModifications.length).toBeGreaterThan(0);
    });

    // Step 3: Apply AI suggestions
    act(() => {
      const component = result.current.getSelectedComponent();
      if (component) {
        result.current.updateComponent(component.id, {
          props: {
            ...component.props,
            content: 'Start Your Free Trial →',
            backgroundColor: '#10b981',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '16px 32px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }
        });
      }
    });

    // Step 4: Connect to workflow
    act(() => {
      result.current.connectToWorkflow(testComponent.id, 'lead-capture');
    });

    // Verify complete integration
    const finalComponent = result.current.getComponentById(testComponent.id);
    expect(finalComponent?.props.content).toBe('Start Your Free Trial →');
    expect(finalComponent?.props.backgroundColor).toBe('#10b981');
    expect(finalComponent?.isConnectedToWorkflow).toBe(true);
    expect(finalComponent?.workflowId).toBe('lead-capture');
  });

  test('should maintain component state through AI and workflow changes', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.addComponent(testComponent);
    });

    const originalPosition = testComponent.position;
    const originalSize = testComponent.size;

    // AI customization should not affect position/size
    act(() => {
      result.current.updateComponent(testComponent.id, {
        props: { ...testComponent.props, content: 'AI Updated Button' }
      });
    });

    // Workflow connection should not affect position/size/content
    act(() => {
      result.current.connectToWorkflow(testComponent.id, 'email-sequence');
    });

    const finalComponent = result.current.getComponentById(testComponent.id);
    expect(finalComponent?.position).toEqual(originalPosition);
    expect(finalComponent?.size).toEqual(originalSize);
    expect(finalComponent?.props.content).toBe('AI Updated Button');
    expect(finalComponent?.workflowId).toBe('email-sequence');
  });

  test('should handle AI context cleanup after workflow connection', async () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.addComponent(testComponent);
      result.current.selectComponent(testComponent.id);
    });

    // Set AI context
    act(() => {
      result.current.requestAICustomization(testComponent.id, 'test prompt');
    });

    await waitFor(() => {
      expect(result.current.aiContext).toBeDefined();
    });

    // Connect to workflow should not interfere with AI context
    act(() => {
      result.current.connectToWorkflow(testComponent.id, 'lead-capture');
    });

    expect(result.current.aiContext?.componentId).toBe(testComponent.id);
    
    // Clear AI context manually (simulating user closing AI panel)
    act(() => {
      result.current.setAIContext(null);
    });

    expect(result.current.aiContext).toBeNull();
    
    // Workflow connection should persist
    const component = result.current.getComponentById(testComponent.id);
    expect(component?.isConnectedToWorkflow).toBe(true);
  });
});