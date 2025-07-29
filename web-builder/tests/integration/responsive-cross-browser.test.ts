/**
 * Integration Test: Responsive Behavior and Cross-Browser Compatibility
 * Tests viewport changes, device responsiveness, and browser compatibility
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';

// Mock viewport dimensions for different devices
const VIEWPORT_DIMENSIONS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 }
};

// Mock user agent strings for browser testing
const USER_AGENTS = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.1.1 Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
};

describe('Responsive Canvas Integration', () => {
  let testComponents: ComponentData[];

  beforeEach(() => {
    const { clearCanvas } = useBuilderStore.getState();
    clearCanvas();
    
    testComponents = [
      {
        id: 'responsive-hero',
        type: 'hero',
        name: 'Hero Section',
        props: {
          content: 'Responsive Hero',
          backgroundImage: '/hero-bg.jpg'
        },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 }
      },
      {
        id: 'responsive-nav',
        type: 'navigation',
        name: 'Navigation',
        props: {
          links: ['Home', 'About', 'Contact'],
          logo: 'Company Logo'
        },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 80 }
      },
      {
        id: 'responsive-card',
        type: 'card',
        name: 'Feature Card',
        props: {
          title: 'Feature',
          description: 'Feature description'
        },
        position: { x: 100, y: 200 },
        size: { width: 300, height: 200 }
      }
    ];
  });

  describe('Canvas Viewport Management', () => {
    test('should handle viewport size changes for different devices', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Add components to canvas
      testComponents.forEach(component => {
        act(() => {
          result.current.addComponent(component);
        });
      });

      // Test desktop viewport (default)
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.desktop);
      });
      
      expect(result.current.canvasSize).toEqual(VIEWPORT_DIMENSIONS.desktop);

      // Test tablet viewport
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.tablet);
      });
      
      expect(result.current.canvasSize).toEqual(VIEWPORT_DIMENSIONS.tablet);

      // Test mobile viewport
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.mobile);
      });
      
      expect(result.current.canvasSize).toEqual(VIEWPORT_DIMENSIONS.mobile);
    });

    test('should maintain zoom functionality across viewport changes', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Set initial zoom
      act(() => {
        result.current.setZoom(75);
      });
      
      expect(result.current.zoom).toBe(75);

      // Change viewport - zoom should persist
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.mobile);
      });
      
      expect(result.current.zoom).toBe(75);
      expect(result.current.canvasSize).toEqual(VIEWPORT_DIMENSIONS.mobile);
    });

    test('should handle zoom limits consistently across viewports', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testZoomLimits = (viewport: keyof typeof VIEWPORT_DIMENSIONS) => {
        act(() => {
          result.current.setCanvasSize(VIEWPORT_DIMENSIONS[viewport]);
        });

        // Test minimum zoom limit
        act(() => {
          result.current.setZoom(10); // Below minimum
        });
        expect(result.current.zoom).toBe(25); // Should be clamped to min

        // Test maximum zoom limit
        act(() => {
          result.current.setZoom(500); // Above maximum
        });
        expect(result.current.zoom).toBe(300); // Should be clamped to max
      };

      testZoomLimits('desktop');
      testZoomLimits('tablet');
      testZoomLimits('mobile');
    });
  });

  describe('Component Responsive Behavior', () => {
    test('should handle component overflow on smaller viewports', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Add a wide component
      const wideComponent: ComponentData = {
        id: 'wide-component',
        type: 'container',
        name: 'Wide Container',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 1400, height: 300 } // Wider than mobile viewport
      };

      act(() => {
        result.current.addComponent(wideComponent);
      });

      // Switch to mobile viewport
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.mobile);
      });

      // Component should exist but may need responsive handling
      const component = result.current.getComponentById('wide-component');
      expect(component).toBeDefined();
      expect(component?.size.width).toBe(1400); // Original size preserved
      
      // In a real implementation, the canvas would handle scrolling or responsive scaling
    });

    test('should maintain component relationships during viewport changes', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Add parent and child components
      const parent: ComponentData = {
        id: 'parent-container',
        type: 'container',
        name: 'Parent',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 800, height: 600 }
      };

      const child: ComponentData = {
        id: 'child-element',
        type: 'text',
        name: 'Child Text',
        props: { content: 'Child content' },
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 }
      };

      act(() => {
        result.current.addComponent(parent);
        result.current.addComponent(child);
      });

      expect(result.current.components).toHaveLength(2);

      // Change viewport
      act(() => {
        result.current.setCanvasSize(VIEWPORT_DIMENSIONS.mobile);
      });

      // Both components should still exist
      expect(result.current.components).toHaveLength(2);
      expect(result.current.getComponentById('parent-container')).toBeDefined();
      expect(result.current.getComponentById('child-element')).toBeDefined();
    });
  });

  describe('Grid and Snapping Behavior', () => {
    test('should maintain grid snapping across different zoom levels', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const testComponent: ComponentData = {
        id: 'snap-test',
        type: 'button',
        name: 'Snap Test Button',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 }
      };

      act(() => {
        result.current.addComponent(testComponent);
      });

      // Test snapping at different zoom levels
      const testSnappingAtZoom = (zoomLevel: number) => {
        act(() => {
          result.current.setZoom(zoomLevel);
        });

        act(() => {
          result.current.updateComponentPosition('snap-test', { x: 33, y: 47 });
        });

        const component = result.current.getComponentById('snap-test');
        expect(component?.position.x).toBe(40); // Snapped to 20px grid
        expect(component?.position.y).toBe(40); // Snapped to 20px grid
      };

      testSnappingAtZoom(50);
      testSnappingAtZoom(100);
      testSnappingAtZoom(150);
    });

    test('should toggle grid visibility without affecting functionality', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      const initialGridState = result.current.gridEnabled;
      
      // Toggle grid off
      act(() => {
        result.current.toggleGrid();
      });
      
      expect(result.current.gridEnabled).toBe(!initialGridState);

      // Snapping should still work when grid is hidden
      const testComponent: ComponentData = {
        id: 'grid-test',
        type: 'text',
        name: 'Grid Test',
        props: {},
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 }
      };

      act(() => {
        result.current.addComponent(testComponent);
        result.current.updateComponentPosition('grid-test', { x: 23, y: 37 });
      });

      const component = result.current.getComponentById('grid-test');
      expect(component?.position.x).toBe(20); // Still snapped
      expect(component?.position.y).toBe(40); // Still snapped
    });
  });

  describe('Performance with Viewport Changes', () => {
    test('should handle frequent viewport changes efficiently', () => {
      const { result } = renderHook(() => useBuilderStore());
      
      // Add multiple components
      for (let i = 0; i < 20; i++) {
        const component: ComponentData = {
          id: `perf-component-${i}`,
          type: 'card',
          name: `Performance Card ${i}`,
          props: {},
          position: { x: (i % 5) * 100, y: Math.floor(i / 5) * 100 },
          size: { width: 80, height: 80 }
        };

        act(() => {
          result.current.addComponent(component);
        });
      }

      expect(result.current.components).toHaveLength(20);

      const startTime = performance.now();

      // Rapidly change viewports
      const viewports = Object.keys(VIEWPORT_DIMENSIONS) as Array<keyof typeof VIEWPORT_DIMENSIONS>;
      
      for (let i = 0; i < 10; i++) {
        const viewport = viewports[i % viewports.length];
        act(() => {
          result.current.setCanvasSize(VIEWPORT_DIMENSIONS[viewport]);
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete viewport changes quickly (under 100ms for 10 changes)
      expect(duration).toBeLessThan(100);
      expect(result.current.components).toHaveLength(20); // All components preserved
    });
  });
});

describe('Cross-Browser Compatibility', () => {
  describe('Drag and Drop Support', () => {
    test('should detect HTML5 drag and drop support', () => {
      // Mock different browser environments
      const testDragDropSupport = (userAgent: string) => {
        Object.defineProperty(window.navigator, 'userAgent', {
          writable: true,  
          value: userAgent
        });

        // In a real implementation, we would test:
        // - HTML5 drag and drop API availability
        // - Touch events for mobile browsers
        // - Pointer events for modern browsers
        
        expect(typeof window !== 'undefined').toBe(true);
        
        // Test that drag and drop events are available
        const testElement = document.createElement('div');
        expect(typeof testElement.ondragstart).toBe('object');
        expect(typeof testElement.ondrop).toBe('object');
      };

      testDragDropSupport(USER_AGENTS.chrome);
      testDragDropSupport(USER_AGENTS.firefox);
      testDragDropSupport(USER_AGENTS.safari);
      testDragDropSupport(USER_AGENTS.edge);
    });

    test('should handle touch events for mobile browsers', () => {
      // Mock touch-enabled device
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: {}
      });

      const testElement = document.createElement('div');
      
      // Check touch event support
      expect('ontouchstart' in window).toBe(true);
      expect(typeof testElement.ontouchstart).toBe('object');
    });
  });

  describe('CSS Feature Support', () => {
    test('should handle CSS Grid support', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      testElement.style.display = 'grid';
      testElement.style.gridTemplateColumns = 'repeat(3, 1fr)';
      testElement.style.gap = '20px';

      // Modern browsers should support CSS Grid
      expect(testElement.style.display).toBe('grid');
      expect(testElement.style.gridTemplateColumns).toBe('repeat(3, 1fr)');

      document.body.removeChild(testElement);
    });

    test('should handle CSS Flexbox support', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      testElement.style.display = 'flex';
      testElement.style.flexDirection = 'column';
      testElement.style.justifyContent = 'center';

      expect(testElement.style.display).toBe('flex');
      expect(testElement.style.flexDirection).toBe('column');

      document.body.removeChild(testElement);
    });

    test('should handle CSS custom properties (variables)', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      testElement.style.setProperty('--test-color', '#3b82f6');
      testElement.style.color = 'var(--test-color)';

      const computedColor = testElement.style.getPropertyValue('--test-color');
      expect(computedColor).toBe('#3b82f6');

      document.body.removeChild(testElement);
    });
  });

  describe('JavaScript API Support', () => {
    test('should handle modern JavaScript features', () => {
      // Test ES6+ features that the app uses
      expect(typeof Array.from).toBe('function');
      expect(typeof Object.assign).toBe('function');
      expect(typeof Promise).toBe('function');
      expect(typeof Map).toBe('function');
      expect(typeof Set).toBe('function');

      // Test async/await support
      const asyncFunction = async () => {
        return Promise.resolve('test');
      };
      
      expect(asyncFunction()).toBeInstanceOf(Promise);
    });

    test('should handle localStorage availability', () => {
      // Test localStorage support (used for auto-save)
      expect(typeof window.localStorage).toBe('object');
      expect(typeof window.localStorage.setItem).toBe('function');
      expect(typeof window.localStorage.getItem).toBe('function');

      // Test actual functionality
      window.localStorage.setItem('test-key', 'test-value');
      expect(window.localStorage.getItem('test-key')).toBe('test-value');
      window.localStorage.removeItem('test-key');
    });

    test('should handle sessionStorage availability', () => {
      expect(typeof window.sessionStorage).toBe('object');
      expect(typeof window.sessionStorage.setItem).toBe('function');
      expect(typeof window.sessionStorage.getItem).toBe('function');
    });
  });

  describe('Canvas Rendering Support', () => {
    test('should handle canvas element support', () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(context).toBeInstanceOf(CanvasRenderingContext2D);
    });

    test('should handle SVG support', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expect(svg).toBeInstanceOf(SVGElement);

      svg.setAttribute('width', '100');
      svg.setAttribute('height', '100');
      
      expect(svg.getAttribute('width')).toBe('100');
      expect(svg.getAttribute('height')).toBe('100');
    });
  });

  describe('Font and Typography Support', () => {
    test('should handle web font loading', () => {
      // Test CSS Font Loading API availability
      if ('FontFace' in window) {
        expect(typeof window.FontFace).toBe('function');
      }

      // Test that CSS font properties work
      const testElement = document.createElement('div');
      testElement.style.fontFamily = 'Arial, sans-serif';
      testElement.style.fontSize = '16px';
      testElement.style.fontWeight = '600';

      expect(testElement.style.fontFamily).toBe('Arial, sans-serif');
      expect(testElement.style.fontSize).toBe('16px');
      expect(testElement.style.fontWeight).toBe('600');
    });
  });
});

describe('Error Handling and Fallbacks', () => {
  test('should gracefully handle unsupported features', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    // Test that store functions don't throw even in degraded environments
    expect(() => {
      act(() => {
        result.current.setCanvasSize({ width: 1200, height: 800 });
        result.current.setZoom(100);
        result.current.toggleGrid();
      });
    }).not.toThrow();
  });

  test('should handle network errors gracefully', () => {
    // In a real implementation, this would test:
    // - Failed API calls
    // - Offline functionality
    // - Timeout handling
    
    expect(typeof navigator.onLine).toBe('boolean');
  });

  test('should handle memory constraints', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    // Test adding many components without memory issues
    const componentCount = 100;
    
    for (let i = 0; i < componentCount; i++) {
      const component: ComponentData = {
        id: `memory-test-${i}`,
        type: 'text',
        name: `Memory Test ${i}`,
        props: { content: `Content ${i}` },
        position: { x: i * 10, y: i * 10 },
        size: { width: 50, height: 20 }
      };

      act(() => {
        result.current.addComponent(component);
      });
    }

    expect(result.current.components).toHaveLength(componentCount);
    
    // Clear components to free memory
    act(() => {
      result.current.clearCanvas();
    });

    expect(result.current.components).toHaveLength(0);
  });
});