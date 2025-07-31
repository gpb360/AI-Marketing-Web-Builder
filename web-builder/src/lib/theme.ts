/**
 * AI Marketing Web Builder - Centralized Theme System
 * 
 * This file contains all theme constants, colors, and styling configurations
 * to ensure consistent theming across the entire application.
 * 
 * REFERENCE THEME: Dark theme based on landing page design
 * - Background: Black to gray gradient
 * - Text: White and gray tones
 * - Accent: Yellow (brand color)
 * - Cards: Dark glass-morphism style
 */

// ===== COLOR PALETTE =====
export const colors = {
  // Background Colors
  background: {
    primary: 'bg-gradient-to-br from-black via-gray-900 to-black',
    secondary: 'bg-gray-900',
    tertiary: 'bg-gray-800',
    card: 'bg-gray-900/50',
    cardHover: 'bg-gray-800/80',
    overlay: 'bg-black/50',
    glass: 'bg-gray-900/50 backdrop-blur-sm',
  },

  // Text Colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    tertiary: 'text-gray-400',
    muted: 'text-gray-500',
    accent: 'text-yellow-400',
    gradient: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500',
  },

  // Border Colors
  border: {
    primary: 'border-gray-700',
    secondary: 'border-gray-600',
    accent: 'border-yellow-400',
    accentHover: 'border-yellow-400/50',
    focus: 'border-yellow-400',
  },

  // Button Colors
  button: {
    primary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black',
    primaryHover: 'hover:from-yellow-300 hover:to-yellow-400',
    secondary: 'border border-gray-600 text-gray-300',
    secondaryHover: 'hover:border-yellow-400 hover:text-yellow-400',
    ghost: 'text-gray-300 hover:text-yellow-400',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  },

  // Status Colors
  status: {
    success: 'text-green-400 bg-green-400/10 border-green-400/20',
    warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
    info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  },

  // Special Colors
  accent: {
    yellow: {
      50: '#fefce8',
      100: '#fef3c7',
      400: '#facc15', // Primary accent
      500: '#eab308',
      600: '#ca8a04',
    }
  }
} as const;

// ===== COMPONENT STYLES =====
export const componentStyles = {
  // Card Styles
  card: {
    base: `${colors.background.glass} ${colors.border.primary} border rounded-xl`,
    interactive: `${colors.background.glass} ${colors.border.primary} border rounded-xl hover:${colors.border.accentHover} transition-all duration-300 hover:shadow-2xl hover:shadow-black/20`,
    featured: `${colors.background.glass} ${colors.border.accent} border rounded-xl shadow-xl shadow-yellow-400/10`,
  },

  // Button Styles
  button: {
    primary: `${colors.button.primary} ${colors.button.primaryHover} font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/30`,
    secondary: `${colors.button.secondary} ${colors.button.secondaryHover} font-semibold px-6 py-3 rounded-lg transition-all duration-200`,
    ghost: `${colors.button.ghost} font-semibold px-4 py-2 rounded-lg transition-all duration-200`,
    icon: `${colors.text.secondary} hover:${colors.text.accent} p-2 rounded-lg transition-colors duration-200`,
  },

  // Input Styles
  input: {
    base: `${colors.background.tertiary} ${colors.border.primary} ${colors.text.primary} border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:${colors.border.focus} transition-colors`,
    search: `${colors.background.tertiary} ${colors.border.primary} ${colors.text.primary} border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:${colors.border.focus}`,
  },

  // Badge/Tag Styles
  badge: {
    featured: 'bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full',
    premium: 'bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full',
    category: 'bg-gray-700 text-gray-300 text-xs font-medium px-2 py-1 rounded-full',
  },

  // Navigation Styles
  nav: {
    link: `${colors.text.secondary} hover:${colors.text.accent} transition-colors duration-200`,
    activeLink: `${colors.text.accent} font-medium`,
  },

  // Layout Styles
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 md:py-20',
    hero: 'min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16',
  },
} as const;

// ===== ANIMATION STYLES =====
export const animations = {
  // Hover Effects
  hover: {
    lift: 'hover:-translate-y-1 transition-transform duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    glow: 'hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-200',
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
export const typography = {
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

// ===== SPACING & LAYOUT =====
export const spacing = {
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
export const themes = {
  // Dark theme (default/primary)
  dark: {
    name: 'dark',
    background: colors.background.primary,
    surface: colors.background.glass,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    accent: colors.text.accent,
    border: colors.border.primary,
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

// ===== UTILITY FUNCTIONS =====

/**
 * Combines multiple theme classes into a single string
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Gets the complete card style for a given variant
 */
export const getCardStyle = (variant: 'base' | 'interactive' | 'featured' = 'base'): string => {
  return componentStyles.card[variant];
};

/**
 * Gets the complete button style for a given variant
 */
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' | 'icon' = 'primary'): string => {
  return componentStyles.button[variant];
};

/**
 * Gets themed input styles
 */
export const getInputStyle = (variant: 'base' | 'search' = 'base'): string => {
  return componentStyles.input[variant];
};

/**
 * Gets status-specific styling
 */
export const getStatusStyle = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  return colors.status[status];
};

// ===== COMPONENT PRESETS =====

/**
 * Pre-configured component styles for common patterns
 */
export const presets = {
  // Page layouts
  landingPage: `min-h-screen ${colors.background.primary}`,
  dashboardPage: `min-h-screen ${colors.background.secondary}`,
  
  // Common cards
  featureCard: `${getCardStyle('interactive')} ${spacing.component.lg}`,
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

// Export everything as default for easier importing
export default {
  colors,
  componentStyles,
  animations,
  typography,
  spacing,
  themes,
  cn,
  getCardStyle,
  getButtonStyle,
  getInputStyle,
  getStatusStyle,
  presets,
} as const;