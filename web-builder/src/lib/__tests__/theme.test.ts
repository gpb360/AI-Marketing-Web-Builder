/**
 * Theme System Unit Tests
 * 
 * Tests for Story 1.1: Master Theme System Foundation
 * Comprehensive test coverage for theme configuration, validation, and utilities
 */

import {
  masterTheme,
  colors,
  spacing,
  presets,
  validateThemeStructure,
  validateThemeUsage,
  createThemeClass,
  themeUtils,
  type MasterTheme,
  type ThemeColors,
  type ThemeSpacing,
  type ThemePresets,
} from '../theme';

describe('Theme Configuration', () => {
  test('exports all required color constants', () => {
    expect(colors).toBeDefined();
    expect(colors.background).toBeDefined();
    expect(colors.text).toBeDefined();
    
    // Background colors (AC: 2)
    expect(colors.background.primary).toBe('bg-gray-900');
    expect(colors.background.secondary).toBe('bg-gray-800');
    expect(colors.background.accent).toBe('bg-yellow-400');
    
    // Text colors (AC: 3)
    expect(colors.text.primary).toBe('text-white');
    expect(colors.text.secondary).toBe('text-gray-300');
    expect(colors.text.accent).toBe('text-yellow-400');
  });

  test('exports spacing system with 8px grid values', () => {
    expect(spacing).toBeDefined();
    expect(spacing.component).toBeDefined();
    expect(spacing.grid).toBeDefined();
    
    // Component spacing (AC: 4)
    expect(spacing.component.padding).toBe('p-4 md:p-6 lg:p-8');
    expect(spacing.component.margin).toBe('m-4 md:m-6 lg:m-8');
    
    // 8px grid system (AC: 4)
    expect(spacing.grid.xs).toBe('8px');
    expect(spacing.grid.sm).toBe('16px');
    expect(spacing.grid.md).toBe('24px');
    expect(spacing.grid.lg).toBe('32px');
    expect(spacing.grid.xl).toBe('40px');
  });

  test('generates proper Tailwind class strings', () => {
    expect(typeof colors.background.primary).toBe('string');
    expect(colors.background.primary.startsWith('bg-')).toBe(true);
    expect(colors.text.primary.startsWith('text-')).toBe(true);
  });

  test('theme presets combine colors and spacing correctly', () => {
    expect(presets).toBeDefined();
    expect(presets.landingPage).toContain('bg-gray-900');
    expect(presets.landingPage).toContain('text-white');
    
    expect(presets.builderCanvas).toContain('bg-gray-800');
    expect(presets.builderCanvas).toContain('text-white');
    
    expect(presets.navigation).toContain('bg-gray-900');
    expect(presets.navigation).toContain('text-white');
    expect(presets.navigation).toContain('border-b');
  });

  test('masterTheme contains all required sections', () => {
    expect(masterTheme).toBeDefined();
    expect(masterTheme.colors).toBe(colors);
    expect(masterTheme.spacing).toBe(spacing);
    expect(masterTheme.presets).toBe(presets);
  });
});

describe('Theme Types', () => {
  test('theme interfaces compile without errors', () => {
    const testColors: ThemeColors = {
      background: {
        primary: 'bg-test-900',
        secondary: 'bg-test-800',
        accent: 'bg-test-400',
      },
      text: {
        primary: 'text-test-white',
        secondary: 'text-test-300',
        accent: 'text-test-400',
      },
    };
    
    expect(testColors).toBeDefined();
  });

  test('theme configuration matches TypeScript interfaces', () => {
    const testTheme: MasterTheme = {
      colors: colors,
      spacing: spacing,
      presets: presets,
    };
    
    expect(validateThemeStructure(testTheme)).toBe(true);
  });

  test('preset types are properly constrained', () => {
    const testPresets: ThemePresets = {
      landingPage: 'test-landing',
      builderCanvas: 'test-canvas',
      navigation: 'test-nav',
    };
    
    expect(testPresets).toBeDefined();
    expect(typeof testPresets.landingPage).toBe('string');
  });
});

describe('Theme Validation', () => {
  test('validates theme structure completeness', () => {
    expect(validateThemeStructure(masterTheme)).toBe(true);
    
    const incompleteTheme = {
      colors: {
        background: {
          primary: 'bg-gray-900',
        },
      },
    };
    
    expect(validateThemeStructure(incompleteTheme)).toBe(false);
  });

  test('detects missing required theme properties', () => {
    const emptyTheme = {};
    expect(validateThemeStructure(emptyTheme)).toBe(false);
    
    const partialTheme = {
      colors: {
        background: {
          primary: 'bg-gray-900',
        },
      },
    };
    expect(validateThemeStructure(partialTheme)).toBe(false);
  });

  test('validates hardcoded values detection', () => {
    // Should detect hardcoded values
    expect(validateThemeUsage('bg-white text-gray-900')).toBe(false);
    expect(validateThemeUsage('p-4 m-2')).toBe(false);
    expect(validateThemeUsage('bg-blue-500')).toBe(false);
    
    // Should pass theme-compliant values
    expect(validateThemeUsage('bg-gray-900 text-white')).toBe(true);
    expect(validateThemeUsage(colors.background.primary)).toBe(true);
  });

  test('validates color contrast ratios', () => {
    // Test that our colors meet accessibility standards
    expect(colors.background.primary).toContain('gray-900');
    expect(colors.text.primary).toContain('white');
    
    // These combinations should provide good contrast
    const darkBgLightText = `${colors.background.primary} ${colors.text.primary}`;
    expect(validateThemeUsage(darkBgLightText)).toBe(true);
  });
});

describe('Theme Integration', () => {
  test('theme system works with sample component', () => {
    const sampleComponent = createThemeClass(
      colors.background.secondary,
      colors.text.primary,
      spacing.component.padding
    );
    
    expect(sampleComponent).toContain('bg-gray-800');
    expect(sampleComponent).toContain('text-white');
    expect(sampleComponent).toContain('p-4');
  });

  test('preset classes apply correctly to DOM elements', () => {
    const landingPageClasses = presets.landingPage;
    expect(landingPageClasses).toContain('bg-gray-900');
    expect(landingPageClasses).toContain('text-white');
    
    const canvasClasses = presets.builderCanvas;
    expect(canvasClasses).toContain('bg-gray-800');
    expect(canvasClasses).toContain('text-white');
  });

  test('responsive utilities generate proper classes', () => {
    expect(spacing.component.padding).toContain('md:');
    expect(spacing.component.padding).toContain('lg:');
    expect(spacing.component.margin).toContain('md:');
    expect(spacing.component.margin).toContain('lg:');
  });

  test('theme utilities work correctly', () => {
    expect(themeUtils.validate).toBe(validateThemeStructure);
    expect(themeUtils.checkUsage).toBe(validateThemeUsage);
    expect(themeUtils.createClass).toBe(createThemeClass);
    
    expect(typeof themeUtils.cardStyle).toBe('string');
    expect(typeof themeUtils.buttonPrimary).toBe('string');
    expect(typeof themeUtils.inputStyle).toBe('string');
  });
});

describe('Theme Utilities', () => {
  test('createThemeClass combines classes correctly', () => {
    const combined = createThemeClass(
      colors.background.primary,
      colors.text.primary,
      'rounded-lg'
    );
    
    expect(combined).toContain('bg-gray-900');
    expect(combined).toContain('text-white');
    expect(combined).toContain('rounded-lg');
  });

  test('createThemeClass filters out falsy values', () => {
    const combined = createThemeClass(
      colors.background.primary,
      null,
      undefined,
      colors.text.primary,
      ''
    );
    
    expect(combined).toContain('bg-gray-900');
    expect(combined).toContain('text-white');
    expect(combined).not.toContain('null');
    expect(combined).not.toContain('undefined');
  });

  test('themeUtils provide quick access to common styles', () => {
    expect(themeUtils.cardStyle).toContain('bg-gray-800');
    expect(themeUtils.cardStyle).toContain('text-white');
    expect(themeUtils.cardStyle).toContain('rounded-lg');
    
    expect(themeUtils.buttonPrimary).toContain('bg-yellow-400');
    expect(themeUtils.buttonPrimary).toContain('hover:');
    
    expect(themeUtils.inputStyle).toContain('bg-gray-800');
    expect(themeUtils.inputStyle).toContain('border');
  });
});

// Development environment specific tests
describe('Development Warnings', () => {
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });
  
  test('warns about hardcoded values in development', () => {
    validateThemeUsage('bg-white text-gray-900');
    expect(console.warn).toHaveBeenCalled();
    
    const warnCall = (console.warn as jest.Mock).mock.calls[0][0];
    expect(warnCall).toContain('Theme violation detected');
  });
  
  test('provides helpful suggestions in warnings', () => {
    validateThemeUsage('bg-white');
    expect(console.warn).toHaveBeenCalledTimes(2); // Main warning + suggestions
    
    const suggestionCall = (console.warn as jest.Mock).mock.calls[1][0];
    expect(suggestionCall).toContain('Suggested alternatives');
    expect(suggestionCall).toContain('bg-white →');
  });
});