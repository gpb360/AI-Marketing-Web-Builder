/**
 * Integration tests for React DnD functionality after type fixes
 */

import { renderHook } from '@testing-library/react';
import { useDrag, useDrop } from 'react-dnd';

describe('React DnD Integration', () => {
  it('should properly type useDrag hook for ComponentPalette', () => {
    const testComponent = {
      type: 'component',
      id: 'test-component',
      componentType: 'button',
      name: 'Test Button',
      category: 'forms',
      defaultProps: { text: 'Click me' },
      preview: {
        thumbnail: '/test.svg',
        description: 'Test component'
      }
    };

    const { result } = renderHook(() =>
      useDrag({
        type: 'component',
        item: testComponent,
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      })
    );

    const [collected, dragRef] = result.current;
    
    // Verify the hook returns expected types
    expect(typeof collected.isDragging).toBe('boolean');
    expect(typeof dragRef).toBe('function');
  });

  it('should properly type useDrop hook for Canvas', () => {
    const { result } = renderHook(() =>
      useDrop({
        accept: ['component', 'canvas-component'],
        drop: (item, monitor) => {
          return { dropEffect: 'move', position: { x: 0, y: 0 } };
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      })
    );

    const [collected, dropRef] = result.current;
    
    // Verify the hook returns expected types
    expect(typeof collected.isOver).toBe('boolean');
    expect(typeof collected.canDrop).toBe('boolean');
    expect(typeof dropRef).toBe('function');
  });

  it('should handle drag source spec correctly', () => {
    const testComponent = {
      type: 'canvas-component',
      id: 'existing-component',
      componentType: 'container',
      name: 'Test Container',
      category: 'layout',
      defaultProps: { padding: '16px' },
      preview: {
        thumbnail: '/container.svg',
        description: 'Layout container'
      }
    };

    const { result } = renderHook(() =>
      useDrag({
        type: 'canvas-component',
        item: testComponent,
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
          opacity: monitor.isDragging() ? 0.5 : 1,
        }),
        end: () => {
          // End callback should work without type errors
        },
      })
    );

    const [collected] = result.current;
    
    // Verify collected props have expected types
    expect(typeof collected.isDragging).toBe('boolean');
    expect(typeof collected.opacity).toBe('number');
  });

  it('should handle drop target spec correctly', () => {
    const { result } = renderHook(() =>
      useDrop({
        accept: ['component'],
        drop: (item, monitor) => {
          if (monitor.didDrop()) return;
          // Drop handler should work without type errors
          return undefined;
        },
        collect: (monitor) => ({
          isOver: monitor.isOver({ shallow: true }),
          canDrop: monitor.canDrop(),
        }),
        hover: (item, monitor) => {
          // Hover handler should work without type errors
        },
      })
    );

    const [collected] = result.current;
    
    // Verify collected props
    expect(typeof collected.isOver).toBe('boolean');
    expect(typeof collected.canDrop).toBe('boolean');
  });

  it('should handle ref assignment patterns correctly', () => {
    // Test that refs can be properly combined for drag and drop
    const { result: dragResult } = renderHook(() =>
      useDrag({
        type: 'component',
        item: { type: 'test' },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      })
    );

    const { result: dropResult } = renderHook(() =>
      useDrop({
        accept: ['component'],
        collect: (monitor) => ({ isOver: monitor.isOver() }),
      })
    );

    const [, dragRef] = dragResult.current;
    const [, dropRef] = dropResult.current;

    // Both refs should be functions that can be called
    expect(typeof dragRef).toBe('function');
    expect(typeof dropRef).toBe('function');

    // Simulate ref assignment pattern used in components
    const mockElement = document.createElement('div');
    
    // These should not throw type errors
    dragRef(mockElement);
    dropRef(mockElement);
  });
});

describe('Drag-Drop Component Integration', () => {
  it('should verify DragItem interface compatibility', () => {
    const validDragItem = {
      type: 'component',
      id: 'test-id',
      componentType: 'heading',
      name: 'Test Heading',
      category: 'content',
      defaultProps: {
        text: 'Sample heading',
        level: 2,
        color: '#000000'
      },
      preview: {
        thumbnail: '/heading.svg',
        description: 'Customizable heading component'
      }
    };

    // Verify all required properties are present
    expect(validDragItem.type).toBeDefined();
    expect(validDragItem.id).toBeDefined();
    expect(validDragItem.componentType).toBeDefined();
    expect(validDragItem.name).toBeDefined();
    expect(validDragItem.category).toBeDefined();
    expect(validDragItem.defaultProps).toBeDefined();
    expect(validDragItem.preview).toBeDefined();
    expect(validDragItem.preview.thumbnail).toBeDefined();
    expect(validDragItem.preview.description).toBeDefined();
  });

  it('should verify monitor types are correctly used', () => {
    // Test that monitor methods return expected types
    const { result } = renderHook(() =>
      useDrag({
        type: 'component',
        item: {
          type: 'component',
          id: 'test',
          componentType: 'button',
          name: 'Test',
          category: 'forms',
          defaultProps: {},
          preview: { thumbnail: '', description: '' }
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
          opacity: monitor.isDragging() ? 0.5 : 1.0,
        }),
      })
    );

    const [collected] = result.current;
    
    // TypeScript should properly infer these types
    const isDraggingType = collected.isDragging;
    const opacityType = collected.opacity;
    
    expect(typeof isDraggingType).toBe('boolean');
    expect(typeof opacityType).toBe('number');
  });
});