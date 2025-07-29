/**
 * Integration Test: Template Loading and Component Placement Workflow
 * Tests the complete user journey from template selection to component manipulation
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '@/store/builderStore';
import { sampleTemplates, getTemplateById } from '@/data/templates';
import { ComponentData } from '@/types/builder';

describe('Template Loading and Component Placement Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { clearCanvas } = useBuilderStore.getState();
    clearCanvas();
  });

  describe('Template Loading Workflow', () => {
    test('should load premium SaaS template with all components', () => {
      const { result } = renderHook(() => useBuilderStore());
      const template = getTemplateById('premium-saas-landing-1');
      
      expect(template).toBeDefined();
      expect(template?.components).toHaveLength(33); // Premium template has 33 components
      expect(template?.name).toBe('Premium SaaS Landing Page');
    });

    test('should maintain component hierarchy when loading template', () => {
      const template = getTemplateById('premium-saas-landing-1');
      if (!template) throw new Error('Template not found');

      // Test parent-child relationships
      const navElement = template.components.find(el => el.id === 'saas-nav');
      const heroElement = template.components.find(el => el.id === 'saas-hero');
      const heroContent = template.components.find(el => el.id === 'hero-content');

      expect(navElement?.parentId).toBeNull(); // Root element
      expect(heroElement?.parentId).toBeNull(); // Root element  
      expect(heroContent?.parentId).toBe('saas-hero'); // Child of hero
    });

    test('should convert template components to ComponentData format', () => {
      const { result } = renderHook(() => useBuilderStore());
      const template = getTemplateById('premium-saas-landing-1');
      
      if (!template) throw new Error('Template not found');
      
      // Mock converting template component to ComponentData
      const templateComponent = template.components[0];
      const componentData: ComponentData = {
        id: templateComponent.id,
        type: templateComponent.type,
        name: templateComponent.name,
        props: {
          ...templateComponent.props,
          content: templateComponent.content,
          styles: templateComponent.styles
        },
        position: { x: 0, y: 0 }, // Default position
        size: { width: 100, height: 100 }, // Default size
        children: []
      };

      expect(componentData.id).toBe(templateComponent.id);
      expect(componentData.type).toBe(templateComponent.type);
      expect(componentData.name).toBe(templateComponent.name);
    });

    test('should actually load template into store', () => {
      const { result } = renderHook(() => useBuilderStore());
      const template = getTemplateById('premium-saas-landing-1');
      
      if (!template) throw new Error('Template not found');
      
      act(() => {
        result.current.loadTemplate(template);
      });

      // Check that template was loaded
      expect(result.current.currentTemplate).toBe(template);
      expect(result.current.components.length).toBeGreaterThan(0);
      
      // Check that components have proper structure
      const firstComponent = result.current.components[0];
      expect(firstComponent.id).toBeDefined();
      expect(firstComponent.type).toBeDefined();
      expect(firstComponent.position).toBeDefined();
      expect(firstComponent.size).toBeDefined();
    });
  });

  describe('Component Placement Integration', () => {
    test('should add component to canvas with correct position', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'button',
        name: 'Test Button',
        props: { content: 'Click me' },
        position: { x: 100, y: 200 },
        size: { width: 120, height: 40 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      const addedComponent = result.current.getComponentById('test-component-1');
      expect(addedComponent).toBeDefined();
      expect(addedComponent?.position).toEqual({ x: 100, y: 200 });
      expect(addedComponent?.size).toEqual({ width: 120, height: 40 });
    });

    test('should maintain component selection state', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'text',
        name: 'Test Text',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      // Component should be auto-selected when added
      expect(result.current.selectedComponentId).toBe('test-component-1');
      
      act(() => {
        result.current.selectComponent(null);
      });

      expect(result.current.selectedComponentId).toBeNull();
    });

    test('should update component properties correctly', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'button',
        name: 'Test Button',
        props: { content: 'Original Text' },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      act(() => {
        result.current.updateComponent('test-component-1', {
          props: { content: 'Updated Text', color: 'blue' }
        });
      });

      const updatedComponent = result.current.getComponentById('test-component-1');
      expect(updatedComponent?.props.content).toBe('Updated Text');
      expect(updatedComponent?.props.color).toBe('blue');
    });
  });

  describe('Drag and Drop Integration', () => {
    test('should handle component position updates with grid snapping', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'card',
        name: 'Test Card',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 200, height: 150 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      // Test position update with grid snapping enabled (default)
      act(() => {
        result.current.updateComponentPosition('test-component-1', { x: 33, y: 47 });
      });

      const component = result.current.getComponentById('test-component-1');
      // Should snap to 20px grid
      expect(component?.position).toEqual({ x: 40, y: 40 });
    });

    test('should handle component resizing with constraints', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'container',
        name: 'Test Container',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 200, height: 150 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      act(() => {
        result.current.updateComponentSize('test-component-1', { width: 33, height: 27 });
      });

      const component = result.current.getComponentById('test-component-1');
      // Should enforce minimum size and snap to grid
      expect(component?.size.width).toBeGreaterThanOrEqual(40);
      expect(component?.size.height).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Canvas State Management', () => {
    test('should manage canvas zoom and grid settings', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Test zoom functionality
      act(() => {
        result.current.setZoom(150);
      });
      expect(result.current.zoom).toBe(150);

      // Test zoom limits
      act(() => {
        result.current.setZoom(500); // Above max
      });
      expect(result.current.zoom).toBe(300); // Clamped to max

      act(() => {
        result.current.setZoom(10); // Below min
      });
      expect(result.current.zoom).toBe(25); // Clamped to min

      // Test grid toggle
      const initialGridState = result.current.gridEnabled;
      act(() => {
        result.current.toggleGrid();
      });
      expect(result.current.gridEnabled).toBe(!initialGridState);
    });

    test('should handle canvas size changes', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      act(() => {
        result.current.setCanvasSize({ width: 1920, height: 1080 });
      });

      expect(result.current.canvasSize).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('Auto-save Integration', () => {
    test('should trigger auto-save when components change', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Mock localStorage
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      
      const testComponent: ComponentData = {
        id: 'test-component-1',
        type: 'text',
        name: 'Test Text',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      // Auto-save should be triggered
      expect(mockSetItem).toHaveBeenCalledWith(
        'builder-auto-save',
        expect.stringContaining('test-component-1')
      );

      mockSetItem.mockRestore();
    });
  });

  describe('Component Hierarchy Management', () => {
    test('should handle nested component relationships', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const parentComponent: ComponentData = {
        id: 'parent-container',
        type: 'container',
        name: 'Parent Container',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 }
      };

      const childComponent: ComponentData = {
        id: 'child-text',
        type: 'text',
        name: 'Child Text',
        props: {},
        position: { x: 20, y: 20 },
        size: { width: 200, height: 50 },
        children: []
      };

      act(() => {
        result.current.addComponent(parentComponent);
        result.current.addComponent(childComponent);
      });

      // Verify both components exist
      expect(result.current.components).toHaveLength(2);
      expect(result.current.getComponentById('parent-container')).toBeDefined();
      expect(result.current.getComponentById('child-text')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid component operations gracefully', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Test operations on non-existent component
      expect(() => {
        act(() => {
          result.current.updateComponent('non-existent-id', { name: 'Updated' });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.removeComponent('non-existent-id');
        });
      }).not.toThrow();

      // Component count should remain 0
      expect(result.current.components).toHaveLength(0);
    });
  });
});

describe('Template Categories and Filtering', () => {
  test('should filter templates by category correctly', () => {
    const landingTemplates = sampleTemplates.filter(t => t.category === 'landing');
    const blogTemplates = sampleTemplates.filter(t => t.category === 'blog');
    
    expect(landingTemplates.length).toBeGreaterThan(0);
    expect(blogTemplates.length).toBeGreaterThan(0);
    
    landingTemplates.forEach(template => {
      expect(template.category).toBe('landing');
    });
  });

  test('should provide template metadata correctly', () => {
    sampleTemplates.forEach(template => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.components).toBeDefined();
      expect(Array.isArray(template.components)).toBe(true);
    });
  });
});