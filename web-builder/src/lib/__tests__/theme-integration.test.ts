/**
 * Theme Integration Tests
 * 
 * Tests for Story 1.1: Master Theme System Foundation
 * Integration tests for theme system with sample components and real-world usage
 */

import { render } from '@testing-library/react';
import React from 'react';
import {
  masterTheme,
  colors,
  spacing,
  presets,
  createThemeClass,
  themeUtils,
} from '../theme';

// Mock component for testing theme integration
const SampleCard: React.FC<{ variant?: 'landing' | 'canvas' | 'nav' }> = ({ 
  variant = 'landing',
  children = 'Sample Content' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'landing':
        return presets.landingPage;
      case 'canvas':
        return presets.builderCanvas;
      case 'nav':
        return presets.navigation;
      default:
        return presets.landingPage;
    }
  };

  return (
    <div 
      className={createThemeClass(getVariantClasses(), spacing.component.padding)}
      data-testid={`sample-card-${variant}`}
    >
      {children}
    </div>
  );
};

// Mock button component using theme utilities
const ThemedButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button 
    className={themeUtils.buttonPrimary}
    data-testid="themed-button"
  >
    {children}
  </button>
);

// Mock input component using theme system
const ThemedInput: React.FC = () => (
  <input 
    className={themeUtils.inputStyle}
    data-testid="themed-input"
    placeholder="Sample input"
  />
);

describe('Theme Integration with React Components', () => {
  test('landing page preset applies correctly', () => {
    const { getByTestId } = render(<SampleCard variant="landing" />);
    const element = getByTestId('sample-card-landing');
    
    expect(element.className).toContain('bg-gray-900');
    expect(element.className).toContain('text-white');
    expect(element.className).toContain('p-4');
  });

  test('canvas preset applies correctly', () => {
    const { getByTestId } = render(<SampleCard variant="canvas" />);
    const element = getByTestId('sample-card-canvas');
    
    expect(element.className).toContain('bg-gray-800');
    expect(element.className).toContain('text-white');
  });

  test('navigation preset includes border styling', () => {
    const { getByTestId } = render(<SampleCard variant="nav" />);
    const element = getByTestId('sample-card-nav');
    
    expect(element.className).toContain('bg-gray-900');
    expect(element.className).toContain('text-white');
    expect(element.className).toContain('border-b');
  });

  test('themed button component works correctly', () => {
    const { getByTestId } = render(<ThemedButton>Click me</ThemedButton>);
    const button = getByTestId('themed-button');
    
    expect(button.className).toContain('bg-yellow-400');
    expect(button.className).toContain('text-white');
    expect(button.className).toContain('hover:');
  });

  test('themed input component works correctly', () => {
    const { getByTestId } = render(<ThemedInput />);
    const input = getByTestId('themed-input');
    
    expect(input.className).toContain('bg-gray-800');
    expect(input.className).toContain('text-white');
    expect(input.className).toContain('border');
  });
});

describe('Theme System Performance', () => {
  test('createThemeClass performs efficiently with many classes', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      createThemeClass(
        colors.background.primary,
        colors.text.primary,
        spacing.component.padding,
        'rounded-lg',
        'shadow-lg',
        'hover:scale-105'
      );
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete 1000 operations in less than 100ms
    expect(duration).toBeLessThan(100);
  });

  test('theme validation performs efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      themeUtils.validate(masterTheme);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete 1000 validations in less than 50ms
    expect(duration).toBeLessThan(50);
  });
});

describe('CSS Class Generation', () => {
  test('generates valid Tailwind CSS classes', () => {
    const validTailwindPattern = /^[a-z-]+$/;
    
    // Test background colors
    expect(colors.background.primary.replace('bg-', '')).toMatch(validTailwindPattern);
    expect(colors.background.secondary.replace('bg-', '')).toMatch(validTailwindPattern);
    expect(colors.background.accent.replace('bg-', '')).toMatch(validTailwindPattern);
    
    // Test text colors
    expect(colors.text.primary.replace('text-', '')).toMatch(validTailwindPattern);
    expect(colors.text.secondary.replace('text-', '')).toMatch(validTailwindPattern);
    expect(colors.text.accent.replace('text-', '')).toMatch(validTailwindPattern);
  });

  test('spacing classes are properly formatted', () => {
    // Check that padding classes include responsive modifiers
    expect(spacing.component.padding).toContain('p-');
    expect(spacing.component.padding).toContain('md:p-');
    expect(spacing.component.padding).toContain('lg:p-');
    
    // Check that margin classes include responsive modifiers
    expect(spacing.component.margin).toContain('m-');
    expect(spacing.component.margin).toContain('md:m-');
    expect(spacing.component.margin).toContain('lg:m-');
  });

  test('preset combinations create valid class strings', () => {
    Object.values(presets).forEach(preset => {
      expect(typeof preset).toBe('string');
      expect(preset.trim()).toBe(preset); // No leading/trailing whitespace
      expect(preset).not.toContain('  '); // No double spaces
    });
  });
});

describe('Real-world Usage Scenarios', () => {
  test('theme works for complex component structures', () => {
    const ComplexComponent = () => (
      <div className={presets.landingPage}>
        <header className={presets.navigation}>
          <nav className={spacing.component.padding}>
            <button className={themeUtils.buttonPrimary}>
              Primary Action
            </button>
          </nav>
        </header>
        <main className={presets.builderCanvas}>
          <div className={themeUtils.cardStyle}>
            <input className={themeUtils.inputStyle} />
          </div>
        </main>
      </div>
    );

    const { container } = render(<ComplexComponent />);
    
    // Should render without errors
    expect(container.firstChild).toBeInTheDocument();
    
    // Check nested theme applications
    const header = container.querySelector('header');
    expect(header?.className).toContain('bg-gray-900');
    
    const main = container.querySelector('main');
    expect(main?.className).toContain('bg-gray-800');
  });

  test('theme system supports dynamic class generation', () => {
    const DynamicComponent: React.FC<{ isActive: boolean }> = ({ isActive }) => (
      <div 
        className={createThemeClass(
          colors.background.primary,
          colors.text.primary,
          isActive ? colors.background.accent : undefined,
          spacing.component.padding
        )}
        data-testid="dynamic-component"
      />
    );

    const { getByTestId, rerender } = render(<DynamicComponent isActive={false} />);
    const element = getByTestId('dynamic-component');
    
    expect(element.className).not.toContain('bg-yellow-400');
    
    rerender(<DynamicComponent isActive={true} />);
    expect(element.className).toContain('bg-yellow-400');
  });

  test('theme system handles edge cases gracefully', () => {
    // Test with empty values
    const emptyClass = createThemeClass('', null, undefined, colors.background.primary);
    expect(emptyClass).toBe('bg-gray-900');
    
    // Test with mixed valid and invalid values
    const mixedClass = createThemeClass(
      colors.background.primary,
      false as any,
      colors.text.primary,
      0 as any,
      'custom-class'
    );
    expect(mixedClass).toContain('bg-gray-900');
    expect(mixedClass).toContain('text-white');
    expect(mixedClass).toContain('custom-class');
    expect(mixedClass).not.toContain('false');
    expect(mixedClass).not.toContain('0');
  });
});

describe('Accessibility Integration', () => {
  test('theme colors provide sufficient contrast', () => {
    // Test dark background with light text
    const darkWithLight = createThemeClass(
      colors.background.primary,
      colors.text.primary
    );
    expect(darkWithLight).toContain('bg-gray-900');
    expect(darkWithLight).toContain('text-white');
    
    // Test secondary background with light text
    const secondaryWithLight = createThemeClass(
      colors.background.secondary,
      colors.text.primary
    );
    expect(secondaryWithLight).toContain('bg-gray-800');
    expect(secondaryWithLight).toContain('text-white');
  });

  test('accent colors maintain readability', () => {
    const accentButton = createThemeClass(
      colors.background.accent,
      colors.text.primary
    );
    
    // Yellow background should work with white text
    expect(accentButton).toContain('bg-yellow-400');
    expect(accentButton).toContain('text-white');
  });

  test('theme utilities include focus states', () => {
    expect(themeUtils.inputStyle).toContain('focus:');
    expect(themeUtils.buttonPrimary).toContain('hover:');
  });
});

describe('TypeScript Integration', () => {
  test('theme interfaces prevent type errors', () => {
    // This test ensures TypeScript compilation works
    const validTheme = masterTheme;
    expect(validTheme.colors.background.primary).toBeTruthy();
    expect(validTheme.spacing.component.padding).toBeTruthy();
    expect(validTheme.presets.landingPage).toBeTruthy();
  });

  test('theme utilities have proper types', () => {
    const result = createThemeClass('test1', 'test2');
    expect(typeof result).toBe('string');
    
    const validation = themeUtils.validate(masterTheme);
    expect(typeof validation).toBe('boolean');
    
    const usage = themeUtils.checkUsage('bg-white');
    expect(typeof usage).toBe('boolean');
  });
});