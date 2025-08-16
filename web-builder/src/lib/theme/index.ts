/**
 * Master Theme System Integration
 * 
 * Consistent theme configuration and validation for Story 1.3 components
 * Part of Story 1.3: Frontend Context-Aware Template Integration (AC: 6)
 */

// =============================================================================
// Master Theme Configuration (from Story 1.1)
// =============================================================================

export const masterTheme = {
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
    // Secondary Colors
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    
    // Accent Colors
    accent: {
      purple: '#7c3aed',
      green: '#10b981',
      yellow: '#f59e0b',
      red: '#ef4444',
      orange: '#f97316',
      pink: '#ec4899',
      indigo: '#6366f1',
      cyan: '#06b6d4'
    },
    
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      900: '#14532d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      900: '#78350f'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      900: '#7f1d1d'
    },
    
    // Dark Mode Colors (enhanced for Story 1.3)
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceLight: '#334155',
      border: '#475569',
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#94a3b8'
      }
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }]
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },
  
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem'
  },
  
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
} as const;

// =============================================================================
// Component-Specific Theme Extensions for Story 1.3
// =============================================================================

export const contextAwareTheme = {
  // Business Analysis Colors
  analysis: {
    primary: masterTheme.colors.primary[600],
    secondary: masterTheme.colors.secondary[600],
    accent: masterTheme.colors.accent.purple,
    background: masterTheme.colors.primary[50],
    border: masterTheme.colors.primary[200],
    text: masterTheme.colors.secondary[900]
  },
  
  // Template Selection Colors
  selection: {
    primary: masterTheme.colors.accent.green,
    secondary: masterTheme.colors.secondary[600],
    accent: masterTheme.colors.accent.yellow,
    background: '#f0fdf4',
    border: '#bbf7d0',
    text: masterTheme.colors.secondary[900]
  },
  
  // Recommendations Colors
  recommendations: {
    primary: masterTheme.colors.accent.yellow,
    secondary: masterTheme.colors.secondary[600],
    accent: masterTheme.colors.accent.orange,
    background: '#fffbeb',
    border: '#fed7aa',
    text: masterTheme.colors.secondary[900]
  },
  
  // Personalization Colors
  personalization: {
    primary: masterTheme.colors.accent.purple,
    secondary: masterTheme.colors.secondary[600],
    accent: masterTheme.colors.accent.pink,
    background: '#faf5ff',
    border: '#e9d5ff',
    text: masterTheme.colors.secondary[900]
  },
  
  // Status Colors
  status: {
    loading: masterTheme.colors.primary[500],
    success: masterTheme.colors.success[500],
    warning: masterTheme.colors.warning[500],
    error: masterTheme.colors.error[500],
    info: masterTheme.colors.accent.cyan
  },
  
  // Dark Mode Variants
  dark: {
    analysis: {
      primary: masterTheme.colors.primary[400],
      background: masterTheme.colors.dark.surface,
      border: masterTheme.colors.dark.border,
      text: masterTheme.colors.dark.text.primary
    },
    
    selection: {
      primary: masterTheme.colors.accent.green,
      background: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: masterTheme.colors.dark.text.primary
    },
    
    recommendations: {
      primary: masterTheme.colors.accent.yellow,
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: masterTheme.colors.dark.text.primary
    },
    
    personalization: {
      primary: masterTheme.colors.accent.purple,
      background: 'rgba(124, 58, 237, 0.1)',
      border: 'rgba(124, 58, 237, 0.3)',
      text: masterTheme.colors.dark.text.primary
    }
  }
} as const;

// =============================================================================
// Theme Utility Functions
// =============================================================================

export const getThemeColor = (path: string, isDark = false): string => {
  const keys = path.split('.');
  let current: any = isDark ? { ...masterTheme, contextAware: contextAwareTheme.dark } : { ...masterTheme, contextAware: contextAwareTheme };
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Theme color path "${path}" not found`);
      return masterTheme.colors.secondary[500];
    }
    current = current[key];
  }
  
  return typeof current === 'string' ? current : masterTheme.colors.secondary[500];
};

export const getComponentTheme = (component: 'analysis' | 'selection' | 'recommendations' | 'personalization', isDark = false) => {
  return isDark ? contextAwareTheme.dark[component] : contextAwareTheme[component];
};

export const validateThemeConsistency = (componentColors: Record<string, string>): boolean => {
  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'border', 'text'];
  
  for (const color of requiredColors) {
    if (!componentColors[color]) {
      console.warn(`Missing required theme color: ${color}`);
      return false;
    }
    
    // Validate hex color format
    if (!/^#[0-9A-F]{6}$/i.test(componentColors[color])) {
      console.warn(`Invalid color format for ${color}: ${componentColors[color]}`);
      return false;
    }
  }
  
  return true;
};

// =============================================================================
// CSS Custom Properties Generator
// =============================================================================

export const generateCSSVariables = (isDark = false) => {
  const theme = isDark ? contextAwareTheme.dark : contextAwareTheme;
  const variables: Record<string, string> = {};
  
  // Master theme variables
  variables['--color-primary'] = masterTheme.colors.primary[500];
  variables['--color-secondary'] = masterTheme.colors.secondary[500];
  variables['--color-success'] = masterTheme.colors.success[500];
  variables['--color-warning'] = masterTheme.colors.warning[500];
  variables['--color-error'] = masterTheme.colors.error[500];
  
  // Component-specific variables
  Object.entries(theme).forEach(([component, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([colorName, colorValue]) => {
        variables[`--color-${component}-${colorName}`] = colorValue as string;
      });
    }
  });
  
  // Dark mode specific variables
  if (isDark) {
    variables['--bg-primary'] = masterTheme.colors.dark.background;
    variables['--bg-secondary'] = masterTheme.colors.dark.surface;
    variables['--text-primary'] = masterTheme.colors.dark.text.primary;
    variables['--text-secondary'] = masterTheme.colors.dark.text.secondary;
    variables['--border-color'] = masterTheme.colors.dark.border;
  } else {
    variables['--bg-primary'] = '#ffffff';
    variables['--bg-secondary'] = masterTheme.colors.secondary[50];
    variables['--text-primary'] = masterTheme.colors.secondary[900];
    variables['--text-secondary'] = masterTheme.colors.secondary[600];
    variables['--border-color'] = masterTheme.colors.secondary[200];
  }
  
  return variables;
};

// =============================================================================
// Tailwind CSS Integration
// =============================================================================

export const extendTailwindTheme = {
  colors: {
    primary: masterTheme.colors.primary,
    secondary: masterTheme.colors.secondary,
    accent: masterTheme.colors.accent,
    success: masterTheme.colors.success,
    warning: masterTheme.colors.warning,
    error: masterTheme.colors.error,
    
    // Component-specific colors
    'context-analysis': contextAwareTheme.analysis.primary,
    'context-selection': contextAwareTheme.selection.primary,
    'context-recommendations': contextAwareTheme.recommendations.primary,
    'context-personalization': contextAwareTheme.personalization.primary
  },
  
  fontFamily: masterTheme.typography.fontFamily,
  fontSize: masterTheme.typography.fontSize,
  fontWeight: masterTheme.typography.fontWeight,
  spacing: masterTheme.spacing,
  borderRadius: masterTheme.borderRadius,
  boxShadow: masterTheme.shadows,
  
  animation: {
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'slide-down': 'slideDown 0.3s ease-out',
    'scale-in': 'scaleIn 0.2s ease-out',
    'pulse-slow': 'pulse 2s infinite'
  },
  
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    slideDown: {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    }
  }
};

// =============================================================================
// Theme Validation for Components
// =============================================================================

export const validateComponentTheme = (componentName: string, props: any): boolean => {
  const expectedThemeProps = ['className', 'theme', 'isDark'];
  const hasThemeProps = expectedThemeProps.some(prop => prop in props);
  
  if (!hasThemeProps) {
    console.warn(`Component ${componentName} should accept theme props for consistency`);
    return false;
  }
  
  return true;
};

// =============================================================================
// Responsive Design Utilities
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
} as const;

// =============================================================================
// Exports
// =============================================================================

export default {
  masterTheme,
  contextAwareTheme,
  getThemeColor,
  getComponentTheme,
  validateThemeConsistency,
  generateCSSVariables,
  extendTailwindTheme,
  validateComponentTheme,
  breakpoints,
  mediaQueries
};