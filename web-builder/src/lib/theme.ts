/**
 * Master Theme System Foundation
 * 
 * Centralized theme system to eliminate the 50% theme inconsistency problem
 * and provide professional-grade styling for all components.
 * 
 * Story 1.1: Master Theme System Foundation
 * - Addresses Critical Issue #1 from PO Master Checklist
 * - Implements TypeScript interfaces for theme structure
 * - Provides validation utilities to prevent hardcoded values
 * - Supports 8px grid-based spacing system
 * 
 * @author Developer Agent - Story 1.1 Implementation
 * @version 2.0 - Enhanced with story requirements
 */

// =============================================================================
// TYPESCRIPT INTERFACES (Story Requirement AC: 7)
// =============================================================================

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    accent: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ThemeSpacing {
  component: {
    padding: string;
    margin: string;
  };
  grid: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ThemePresets {
  landingPage: string;
  builderCanvas: string;
  navigation: string;
}

export interface MasterTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  presets: ThemePresets;
}

// =============================================================================
// CORE THEME CONFIGURATION (Story Requirements AC: 1, 2, 3)
// =============================================================================

/**
 * Simplified color system matching story requirements
 * Dark theme colors (AC: 2, 3) with WCAG 2.1 AA contrast compliance
 */
const colors: ThemeColors = {
  // Background Colors (AC: 2)
  background: {
    primary: 'bg-gray-900',     // Main dark background
    secondary: 'bg-gray-800',   // Secondary dark background  
    accent: 'bg-yellow-400',    // Brand accent color
  },

  // Text Colors (AC: 3)
  text: {
    primary: 'text-white',      // Primary text on dark backgrounds
    secondary: 'text-gray-300', // Secondary text (muted)
    accent: 'text-yellow-400',  // Brand accent text
  },
};

// ===== LUXURY BRAND THEME SYSTEM =====
// Enhanced theme system for consistent luxury brand experience
const luxuryTheme = {
  // Core Luxury Colors
  colors: {
    // Backgrounds - Luxury Gold & Black Theme
    background: {
      primary: 'bg-gradient-to-br from-black via-gray-900 to-black',
      secondary: 'bg-gray-900',
      tertiary: 'bg-gray-800',
      card: 'bg-gray-900/80 backdrop-blur-xl',
      cardHover: 'bg-gray-800/90 backdrop-blur-xl',
      overlay: 'bg-black/60 backdrop-blur-sm',
      glass: 'bg-gray-900/50 backdrop-blur-xl',
      // Form & Auth specific backgrounds
      form: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
      auth: 'bg-gradient-to-br from-black via-gray-900 to-gray-800',
      dashboard: 'bg-gradient-to-br from-gray-900 to-black',
    },

    // Luxury Text Colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      muted: 'text-gray-500',
      accent: 'text-yellow-400',
      accentHover: 'text-yellow-300',
      gradient: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500',
      goldGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600',
      // Brand specific text colors
      brand: 'text-yellow-400',
      brandSecondary: 'text-amber-300',
      error: 'text-red-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
    },

    // Luxury Border Colors
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      accent: 'border-yellow-400',
      accentHover: 'border-yellow-300',
      focus: 'border-yellow-400',
      glass: 'border-white/10',
      glassHover: 'border-yellow-400/30',
    },

    // Professional Button System
    button: {
      // Primary luxury button
      primary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold',
      primaryHover: 'hover:from-yellow-300 hover:to-yellow-400 hover:shadow-xl hover:shadow-yellow-400/30 hover:-translate-y-1',
      // Secondary professional button
      secondary: 'bg-transparent border-2 border-gray-600 text-gray-300 font-semibold',
      secondaryHover: 'hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5',
      // Ghost button
      ghost: 'bg-transparent text-gray-300 font-medium',
      ghostHover: 'hover:text-yellow-400 hover:bg-yellow-400/10',
      // Professional outline button
      outline: 'bg-transparent border-2 border-yellow-400 text-yellow-400 font-semibold',
      outlineHover: 'hover:bg-yellow-400 hover:text-black hover:shadow-lg hover:shadow-yellow-400/30',
      // Danger button
      danger: 'bg-red-600 text-white font-semibold',
      dangerHover: 'hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30',
    },

    // Enhanced Status Colors
    status: {
      success: {
        text: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/20',
        full: 'text-green-400 bg-green-400/10 border border-green-400/20',
      },
      warning: {
        text: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20',
        full: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
      },
      error: {
        text: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        full: 'text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4',
      },
      info: {
        text: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
        full: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
      },
    },

    // Luxury Gold Palette
    luxury: {
      gold: {
        50: '#fefce8',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#facc15', // Primary luxury gold
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
      },
      black: {
        50: '#f8f8f8',
        900: '#0a0a0a', // Luxury black
        950: '#050505', // Deep luxury black
      }
    }
  },

  // Professional Component Styles
  components: {
    // Auth Form Styling
    authForm: {
      container: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800',
      wrapper: 'w-full max-w-md space-y-8',
      card: 'bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50',
      cardHover: 'hover:border-yellow-400/30 transition-all duration-300',
      header: 'text-center space-y-2',
      title: 'text-3xl font-bold text-white',
      subtitle: 'text-gray-300',
      link: 'text-yellow-400 hover:text-yellow-300 font-medium transition-colors',
    },

    // Dashboard Styling
    dashboard: {
      container: 'min-h-screen bg-gradient-to-br from-gray-900 to-black',
      header: 'bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 shadow-xl',
      headerTitle: 'text-2xl font-bold text-white',
      headerSubtitle: 'text-gray-300',
      card: 'bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-xl shadow-lg',
      cardHover: 'hover:border-yellow-400/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300',
      statCard: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6',
      statNumber: 'text-3xl font-bold text-white',
      statLabel: 'text-gray-400 font-medium',
    },

    // Input & Form Elements
    input: {
      base: 'bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3',
      focus: 'focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400',
      disabled: 'disabled:bg-gray-700 disabled:text-gray-500',
      full: 'bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors',
    },

    // Loading States
    loading: {
      spinner: 'animate-spin rounded-full border-2 border-gray-700 border-t-yellow-400',
      container: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black',
      text: 'text-gray-300 mt-4',
    },

    // Navigation Elements
    nav: {
      link: 'text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium',
      activeLink: 'text-yellow-400 font-semibold',
      button: 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 px-4 py-2 rounded-lg transition-all duration-200',
    },
  },

  // Professional Typography
  typography: {
    heading: {
      hero: 'text-6xl md:text-8xl font-black text-white leading-tight',
      h1: 'text-4xl md:text-5xl font-bold text-white',
      h2: 'text-3xl md:text-4xl font-bold text-white',
      h3: 'text-2xl md:text-3xl font-semibold text-white',
      h4: 'text-xl md:text-2xl font-semibold text-white',
    },
    body: {
      large: 'text-lg text-gray-300 leading-relaxed',
      base: 'text-base text-gray-300',
      small: 'text-sm text-gray-400',
      xs: 'text-xs text-gray-500',
    },
  },

  // Professional Animations
  animations: {
    hover: {
      lift: 'hover:-translate-y-1 transition-transform duration-200',
      scale: 'hover:scale-105 transition-transform duration-200',
      glow: 'hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300',
      goldGlow: 'hover:shadow-2xl hover:shadow-yellow-400/40 transition-all duration-300',
    },
    button: {
      primary: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/30',
      secondary: 'transition-all duration-200 hover:scale-105',
    },
  },
} as const;

// Backward compatibility - extend existing colors with luxury theme
const extendedColors = luxuryTheme.colors;

// ===== ENHANCED COMPONENT STYLES =====
const componentStyles = {
  // Professional Card System
  card: {
    base: `${luxuryTheme.components.dashboard.card}`,
    interactive: `${luxuryTheme.components.dashboard.cardHover}`,
    featured: `bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-400/50 rounded-xl shadow-xl shadow-yellow-400/20`,
    auth: `${luxuryTheme.components.authForm.card}`,
    dashboard: `${luxuryTheme.components.dashboard.statCard}`,
  },

  // Professional Button System
  button: {
    // Primary luxury button
    primary: `${luxuryTheme.colors.button.primary} ${luxuryTheme.colors.button.primaryHover} px-6 py-3 rounded-lg ${luxuryTheme.animations.button.primary}`,
    // Secondary professional button
    secondary: `${luxuryTheme.colors.button.secondary} ${luxuryTheme.colors.button.secondaryHover} px-6 py-3 rounded-lg ${luxuryTheme.animations.button.secondary}`,
    // Ghost button
    ghost: `${luxuryTheme.colors.button.ghost} ${luxuryTheme.colors.button.ghostHover} px-4 py-2 rounded-lg transition-all duration-200`,
    // Outline button
    outline: `${luxuryTheme.colors.button.outline} ${luxuryTheme.colors.button.outlineHover} px-6 py-3 rounded-lg transition-all duration-200`,
    // Icon button
    icon: `${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.accent} p-2 rounded-lg transition-colors duration-200`,
    // Danger button
    danger: `${luxuryTheme.colors.button.danger} ${luxuryTheme.colors.button.dangerHover} px-6 py-3 rounded-lg transition-all duration-200`,
  },

  // Professional Input System
  input: {
    base: `${luxuryTheme.components.input.full}`,
    search: `${luxuryTheme.components.input.base} ${luxuryTheme.components.input.focus} pl-10 pr-4 py-3`,
    disabled: `${luxuryTheme.components.input.base} ${luxuryTheme.components.input.disabled}`,
  },

  // Enhanced Status Badges
  badge: {
    featured: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg',
    premium: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg',
    published: 'bg-green-400/20 text-green-400 border border-green-400/30 text-xs font-medium px-3 py-1 rounded-full',
    draft: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-xs font-medium px-3 py-1 rounded-full',
    archived: 'bg-gray-600/20 text-gray-400 border border-gray-600/30 text-xs font-medium px-3 py-1 rounded-full',
  },

  // Professional Navigation
  nav: {
    link: `${luxuryTheme.components.nav.link}`,
    activeLink: `${luxuryTheme.components.nav.activeLink}`,
    button: `${luxuryTheme.components.nav.button}`,
  },

  // Enhanced Layout System
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 md:py-20',
    hero: 'min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16',
    // Auth specific layouts
    authContainer: `${luxuryTheme.components.authForm.container}`,
    authWrapper: `${luxuryTheme.components.authForm.wrapper}`,
    // Dashboard specific layouts
    dashboardContainer: `${luxuryTheme.components.dashboard.container}`,
    dashboardHeader: `${luxuryTheme.components.dashboard.header}`,
  },

  // Loading States
  loading: {
    spinner: `${luxuryTheme.components.loading.spinner} h-8 w-8`,
    container: `${luxuryTheme.components.loading.container}`,
    text: `${luxuryTheme.components.loading.text}`,
  },

  // Error States
  error: {
    container: `${luxuryTheme.colors.status.error.full}`,
    text: `${luxuryTheme.colors.status.error.text}`,
  },
} as const;

// ===== PROFESSIONAL ANIMATION SYSTEM =====
const animations = {
  // Enhanced Hover Effects
  hover: {
    lift: `${luxuryTheme.animations.hover.lift}`,
    scale: `${luxuryTheme.animations.hover.scale}`,
    glow: `${luxuryTheme.animations.hover.glow}`,
    goldGlow: `${luxuryTheme.animations.hover.goldGlow}`,
    card: 'hover:border-yellow-400/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300',
  },

  // Button Animations
  button: {
    primary: `${luxuryTheme.animations.button.primary}`,
    secondary: `${luxuryTheme.animations.button.secondary}`,
    ghost: 'transition-all duration-200 hover:bg-yellow-400/10',
  },

  // Loading States
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  },

  // Entrance Animations (for Framer Motion)
  entrance: {
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    staggerContainer: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
  },
} as const;

// ===== TYPOGRAPHY STYLES =====
const typography = {
  // Headings
  heading: {
    hero: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
    h1: 'text-3xl md:text-4xl font-bold',
    h2: 'text-2xl md:text-3xl font-bold',
    h3: 'text-xl md:text-2xl font-semibold',
    h4: 'text-lg md:text-xl font-semibold',
  },

  // Body Text
  body: {
    large: 'text-lg md:text-xl leading-relaxed',
    base: 'text-base leading-relaxed',
    small: 'text-sm',
    xs: 'text-xs',
  },

  // Special Text
  special: {
    gradient: `${colors.text.gradient}`,
    code: 'font-mono text-sm bg-gray-800 px-2 py-1 rounded',
  },
} as const;

// =============================================================================
// SPACING SYSTEM (Story Requirement AC: 4)
// =============================================================================

/**
 * 8px grid-based spacing system (AC: 4)
 * Mobile-first responsive design approach
 */
const spacing: ThemeSpacing = {
  component: {
    padding: 'p-4 md:p-6 lg:p-8',    // Responsive component padding
    margin: 'm-4 md:m-6 lg:m-8',     // Responsive component margins
  },
  grid: {
    xs: '8px',   // 8px base unit
    sm: '16px',  // 2 * base (8px * 2)
    md: '24px',  // 3 * base (8px * 3)
    lg: '32px',  // 4 * base (8px * 4)
    xl: '40px',  // 5 * base (8px * 5)
  },
};

// Extended spacing for backward compatibility
const extendedSpacing = {
  // Container Spacing
  container: {
    xs: 'px-4',
    sm: 'px-6',
    md: 'px-8',
    lg: 'px-12',
    xl: 'px-16',
  },

  // Section Spacing
  section: {
    xs: 'py-8',
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  },

  // Component Spacing
  component: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },
} as const;

// ===== THEME VARIANTS =====
const themes = {
  // Dark theme (default/primary)
  dark: {
    name: 'dark',
    background: colors.background.primary,
    surface: luxuryTheme.colors.background.glass,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    accent: colors.text.accent,
    border: luxuryTheme.colors.border.primary,
  },

  // Alternative light theme for specific sections (use sparingly)
  light: {
    name: 'light',
    background: 'bg-white',
    surface: 'bg-white border border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-yellow-600',
    border: 'border-gray-200',
  },
} as const;

// =============================================================================
// THEME PRESETS (Story Requirement AC: 5)
// =============================================================================

/**
 * Theme presets for common component combinations (AC: 5)
 * Pre-composed classes for consistent styling
 */
const presets: ThemePresets = {
  landingPage: `${colors.background.primary} ${colors.text.primary}`,
  builderCanvas: `${colors.background.secondary} ${colors.text.primary}`,
  navigation: `${colors.background.primary} ${colors.text.primary} border-b border-gray-700`,
};

/**
 * Master theme configuration object (AC: 1)
 */
const masterTheme: MasterTheme = {
  colors,
  spacing,
  presets,
};

// =============================================================================
// THEME VALIDATION UTILITIES (Story Requirement AC: 8)
// =============================================================================

/**
 * Validates theme structure completeness (AC: 8)
 */
function validateThemeStructure(theme: Partial<MasterTheme>): boolean {
  const requiredPaths = [
    'colors.background.primary',
    'colors.background.secondary', 
    'colors.background.accent',
    'colors.text.primary',
    'colors.text.secondary',
    'colors.text.accent',
    'spacing.component.padding',
    'spacing.component.margin',
    'presets.landingPage',
    'presets.builderCanvas',
    'presets.navigation',
  ];

  return requiredPaths.every(path => {
    const value = path.split('.').reduce((obj: any, key) => obj?.[key], theme);
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Runtime theme validation with development warnings (AC: 8)
 * Detects hardcoded values that violate theme system
 */
function validateThemeUsage(className: string): boolean {
  const hardcodedPatterns = [
    /bg-white/,
    /text-gray-900/,
    /bg-blue-\d+/,
    /p-[0-9]+(?:\s|$)/,  // Direct padding numbers
    /m-[0-9]+(?:\s|$)/,  // Direct margin numbers
  ];

  const hasHardcodedValues = hardcodedPatterns.some(pattern => pattern.test(className));
  
  if (hasHardcodedValues && process.env.NODE_ENV === 'development') {
    console.warn(`🎨 Theme violation detected: "${className}" contains hardcoded values. Use theme system instead.`);
    console.warn(`💡 Suggested alternatives:
    - bg-white → ${colors.background.primary}
    - text-gray-900 → ${colors.text.primary}
    - Use spacing.component.padding instead of hardcoded padding`);
  }

  return !hasHardcodedValues;
}

/**
 * Creates theme-compliant Tailwind classes (AC: 6)
 */
function createThemeClass(...classes: string[]): string {
  const combinedClasses = classes.filter(Boolean).join(' ');
  
  // Validate in development
  if (process.env.NODE_ENV === 'development') {
    validateThemeUsage(combinedClasses);
  }
  
  return combinedClasses;
}

// =============================================================================
// UTILITY EXPORTS (Story Requirement AC: 6)
// =============================================================================

/**
 * Convenience utilities for common theme operations (AC: 6)
 */
const themeUtils = {
  validate: validateThemeStructure,
  checkUsage: validateThemeUsage,
  createClass: createThemeClass,
  
  // Button style utilities
  getButtonClasses: (variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' = 'primary'): string => {
    return componentStyles.button[variant];
  },
  
  // Quick access to common combinations
  cardStyle: `${colors.background.secondary} ${colors.text.primary} rounded-lg shadow-lg`,
  buttonPrimary: `${colors.background.accent} ${colors.text.primary} hover:opacity-90 transition-opacity`,
  inputStyle: `${colors.background.secondary} ${colors.text.primary} border border-gray-600 focus:border-yellow-400`,
} as const;

// =============================================================================
// UTILITY FUNCTIONS =====

/**
 * Combines multiple theme classes into a single string
 */
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Gets the complete card style for a given variant
 */
const getCardStyle = (variant: 'base' | 'interactive' | 'featured' = 'base'): string => {
  return componentStyles.card[variant];
};

/**
 * Gets the complete button style for a given variant
 */
const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' | 'icon' = 'primary'): string => {
  return componentStyles.button[variant];
};

/**
 * Gets themed input styles
 */
const getInputStyle = (variant: 'base' | 'search' = 'base'): string => {
  return componentStyles.input[variant];
};

/**
 * Gets status-specific styling
 */
const getStatusStyle = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  return luxuryTheme.colors.status[status].full;
};

// ===== COMPONENT PRESETS UTILITIES =====

/**
 * Additional preset utilities for component patterns
 */
const componentPresets = {
  // Page layouts
  landingPage: `min-h-screen ${colors.background.primary}`,
  dashboardPage: `min-h-screen ${colors.background.secondary}`,
  
  // Common cards
  featureCard: `${getCardStyle('interactive')} ${extendedSpacing.component.lg}`,
  templateCard: `${getCardStyle('interactive')} overflow-hidden cursor-pointer`,
  
  // Common buttons
  ctaButton: `${getButtonStyle('primary')} text-lg px-8 py-4`,
  navButton: `${getButtonStyle('ghost')}`,
  
  // Form elements
  searchInput: `${getInputStyle('search')} w-full`,
  formInput: `${getInputStyle('base')} w-full`,
  
  // Typography combinations
  heroTitle: `${typography.heading.hero} ${colors.text.primary} mb-6`,
  sectionTitle: `${typography.heading.h2} ${colors.text.primary} mb-4`,
  bodyText: `${typography.body.base} ${colors.text.secondary}`,
} as const;

// =============================================================================
// EXPORTS (Story Requirement AC: 6, 7)
// =============================================================================

// Primary exports matching story requirements
export {
  type MasterTheme,
  type ThemeColors,
  type ThemeSpacing,
  type ThemePresets,
};

// Export everything as default for easier importing (AC: 6)
export default {
  // Story requirements
  masterTheme,
  colors,
  spacing,
  presets,
  validateThemeStructure,
  validateThemeUsage,
  createThemeClass,
  themeUtils,
  
  // Extended functionality for backward compatibility
  extendedColors,
  componentStyles,
  animations,
  typography,
  cn,
  getCardStyle,
  getButtonStyle,
  getInputStyle,
  getStatusStyle,
  componentPresets,
  
  // New luxury theme exports
  luxuryTheme,
  theme: luxuryTheme,
} as const;