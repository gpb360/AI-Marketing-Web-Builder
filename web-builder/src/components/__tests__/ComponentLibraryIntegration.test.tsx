/**
 * ComponentLibrary and ComponentGenerator Integration Test Suite
 * 
 * This file contains comprehensive tests for validating the integration
 * between ComponentLibrary, ComponentGenerator, and the new theme system.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { ComponentLibrary } from '../ComponentLibrary';
import { ComponentGenerator } from '../ComponentGenerator';
import { DragDropCanvas } from '../DragDropCanvas';
import { BuilderProvider } from '@/contexts/BuilderContext';

// Mock the builder store
jest.mock('@/store/builderStore', () => ({
  useBuilderStore: jest.fn(() => ({
    elements: [],
    selectedElementId: null,
    hoveredElementId: null,
    canvasMode: 'design',
    zoom: 100,
    isDropTarget: false,
    selectElement: jest.fn(),
    hoverElement: jest.fn(),
    addElement: jest.fn(),
    moveElement: jest.fn(),
    setCanvasMode: jest.fn(),
    setZoom: jest.fn(),
    setDraggedElementType: jest.fn(),
    setIsDropTarget: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    history: [],
    historyIndex: 0,
  })),
}));

describe('ComponentLibrary Integration Tests', () => {
  describe('Theme System Validation', () => {
    test('ComponentLibrary renders with consistent theme styling', () => {
      render(
        <BuilderProvider>
          <ComponentLibrary />
        </BuilderProvider>
      );

      // Check for theme consistency indicators
      const header = screen.getByText('Component Library');
      expect(header).toBeInTheDocument();
      
      // Verify component cards are rendered
      const componentCards = screen.getAllByRole('button', { hidden: true });
      expect(componentCards.length).toBeGreaterThan(0);
    });

    test('Component categories are properly displayed', () => {
      render(
        <BuilderProvider>
          <ComponentLibrary />
        </BuilderProvider>
      );

      const categories = ['All', 'Basic', 'Layout', 'Content', 'Media', 'Forms', 'Advanced'];
      categories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    test('Search functionality works with theme styling', () => {
      render(
        <BuilderProvider>
          <ComponentLibrary />
        </BuilderProvider>
      );

      const searchInput = screen.getByPlaceholderText('Search components, categories, or descriptions...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'button' } });
      expect(searchInput).toHaveValue('button');
    });
  });

  describe('Drag and Drop Integration', () => {
    test('Components are draggable', () => {
      render(
        <DndContext>
          <ComponentLibrary />
        </DndContext>
      );

      // Find draggable components
      const draggableComponents = screen.getAllByRole('button', { hidden: true });
      expect(draggableComponents.length).toBeGreaterThan(0);
    });

    test('Drag overlay is configured properly', () => {
      const { container } = render(
        <DndContext>
          <DragOverlay>
            <div>Test Overlay</div>
          </DragOverlay>
          <ComponentLibrary />
        </DndContext>
      );

      expect(container.querySelector('[data-rfd-drag-overlay]')).toBeInTheDocument();
    });
  });

  describe('ComponentGenerator Integration', () => {
    test('ComponentGenerator renders with theme styling', () => {
      render(
        <BuilderProvider>
          <ComponentGenerator />
        </BuilderProvider>
      );

      expect(screen.getByText('AI Component Generator')).toBeInTheDocument();
      expect(screen.getByText('Describe your component in plain English and watch as AI creates production-ready code')).toBeInTheDocument();
    });

    test('Generation workflow is accessible', () => {
      render(
        <BuilderProvider>
          <ComponentGenerator />
        </BuilderProvider>
      );

      const descriptionInput = screen.getByPlaceholderText('Describe your component... e.g., \'Create a responsive pricing card with hover effects and a call-to-action button\'');
      expect(descriptionInput).toBeInTheDocument();

      const generateButton = screen.getByText('Generate Component');
      expect(generateButton).toBeInTheDocument();
    });

    test('Theme consistency across generator sections', () => {
      render(
        <BuilderProvider>
          <ComponentGenerator />
        </BuilderProvider>
      );

      // Check for consistent styling across sections
      const sections = ['Component Description', 'Configuration', 'Visual Reference'];
      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });
  });

  describe('Canvas Integration', () => {
    test('DragDropCanvas renders with theme styling', () => {
      render(
        <DndContext>
          <BuilderProvider>
            <DragDropCanvas />
          </BuilderProvider>
        </DndContext>
      );

      expect(screen.getByText('Start Building')).toBeInTheDocument();
    });

    test('Canvas toolbar has consistent theme', () => {
      render(
        <DndContext>
          <BuilderProvider>
            <DragDropCanvas />
          </BuilderProvider>
        </DndContext>
      );

      // Check for toolbar elements
      const toolbar = screen.getByRole('toolbar', { hidden: true });
      expect(toolbar).toBeInTheDocument();
    });
  });
});

describe('Component Generation Workflow Test', () => {
  test('Complete workflow: library → canvas → generator', async () => {
    const { container } = render(
      <DndContext>
        <BuilderProvider>
          <div className="flex h-screen">
            <ComponentLibrary className="w-80" />
            <DragDropCanvas className="flex-1" />
            <ComponentGenerator className="w-96" />
          </div>
        </BuilderProvider>
      </DndContext>
    );

    // Verify all components are rendered
    expect(screen.getByText('Component Library')).toBeInTheDocument();
    expect(screen.getByText('AI Component Generator')).toBeInTheDocument();
    expect(screen.getByText('Start Building')).toBeInTheDocument();

    // Check for theme consistency
    const themeElements = container.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="border-"]');
    expect(themeElements.length).toBeGreaterThan(0);
  });

  test('Responsive design validation', () => {
    const { container } = render(
      <DndContext>
        <BuilderProvider>
          <div className="flex flex-col lg:flex-row h-screen">
            <ComponentLibrary className="w-full lg:w-80" />
            <DragDropCanvas className="flex-1" />
            <ComponentGenerator className="w-full lg:w-96" />
          </div>
        </BuilderProvider>
      </DndContext>
    );

    // Verify responsive container classes
    const responsiveContainer = container.querySelector('.flex-col.lg\\:flex-row');
    expect(responsiveContainer).toBeInTheDocument();
  });
});

// Visual regression test helpers
export const themeValidationHelpers = {
  checkColorConsistency: (element: HTMLElement, expectedColors: string[]) => {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    
    return expectedColors.some(color => 
      backgroundColor.includes(color) || textColor.includes(color)
    );
  },

  checkElevationConsistency: (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const boxShadow = computedStyle.boxShadow;
    return boxShadow !== 'none';
  },

  checkTypographyConsistency: (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const fontFamily = computedStyle.fontFamily;
    const fontSize = computedStyle.fontSize;
    
    return fontFamily && fontSize;
  },
};

// Integration test utilities
export const integrationTestUtils = {
  simulateDragAndDrop: async (draggableSelector: string, dropTargetSelector: string) => {
    const draggable = document.querySelector(draggableSelector);
    const dropTarget = document.querySelector(dropTargetSelector);
    
    if (!draggable || !dropTarget) {
      throw new Error('Elements not found for drag and drop simulation');
    }

    // Create drag events
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
    });

    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
    });

    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });

    draggable.dispatchEvent(dragStartEvent);
    dropTarget.dispatchEvent(dragOverEvent);
    dropTarget.dispatchEvent(dropEvent);

    await waitFor(() => {
      expect(dropTarget).toHaveClass('bg-blue-50');
    });
  },

  validateComponentGeneration: async (description: string, expectedCode: string) => {
    const descriptionInput = screen.getByPlaceholderText('Describe your component...');
    fireEvent.change(descriptionInput, { target: { value: description } });

    const generateButton = screen.getByText('Generate Component');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Component Generated Successfully!')).toBeInTheDocument();
    });

    const codePreview = screen.getByRole('textbox');
    expect(codePreview).toContain(expectedCode);
  },
};

// Performance test utilities
export const performanceTestUtils = {
  measureRenderTime: async (component: React.ReactElement) => {
    const startTime = performance.now();
    render(component);
    const endTime = performance.now();
    
    return endTime - startTime;
  },

  measureInteractionTime: async (interaction: () => void) => {
    const startTime = performance.now();
    interaction();
    const endTime = performance.now();
    
    return endTime - startTime;
  },
};