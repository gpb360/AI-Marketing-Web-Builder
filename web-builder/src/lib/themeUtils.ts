/**
 * Theme Utilities
 * 
 * Helper functions to apply consistent luxury theme styling
 * across all components and reduce missing styling classes
 */

// Button class utilities
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' = 'primary') => {
  const baseClasses = 'font-semibold transition-all duration-200 rounded-lg';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-xl hover:shadow-yellow-400/30 hover:-translate-y-1`;
    case 'secondary':
      return `${baseClasses} bg-transparent border-2 border-gray-600 text-gray-300 px-6 py-3 hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5`;
    case 'ghost':
      return `${baseClasses} bg-transparent text-gray-300 px-4 py-2 hover:text-yellow-400 hover:bg-yellow-400/10`;
    case 'outline':
      return `${baseClasses} bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 hover:bg-yellow-400 hover:text-black hover:shadow-lg hover:shadow-yellow-400/30`;
    case 'danger':
      return `${baseClasses} bg-red-600 text-white px-6 py-3 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30`;
    default:
      return baseClasses;
  }
};

// Card class utilities
export const getCardClasses = (variant: 'base' | 'interactive' | 'featured' | 'auth' = 'base') => {
  const baseClasses = 'rounded-xl shadow-lg';
  
  switch (variant) {
    case 'base':
      return `${baseClasses} bg-gray-900/80 backdrop-blur-xl border border-gray-700`;
    case 'interactive':
      return `${baseClasses} bg-gray-900/80 backdrop-blur-xl border border-gray-700 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300`;
    case 'featured':
      return `${baseClasses} bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-400/50 shadow-xl shadow-yellow-400/20`;
    case 'auth':
      return `${baseClasses} bg-gray-900/80 backdrop-blur-xl border border-gray-700 shadow-2xl shadow-black/50`;
    default:
      return baseClasses;
  }
};

// Text class utilities
export const getTextClasses = (variant: 'primary' | 'secondary' | 'accent' | 'muted' = 'primary') => {
  switch (variant) {
    case 'primary':
      return 'text-white';
    case 'secondary':
      return 'text-gray-300';
    case 'accent':
      return 'text-yellow-400';
    case 'muted':
      return 'text-gray-500';
    default:
      return 'text-white';
  }
};

// Background class utilities
export const getBackgroundClasses = (variant: 'primary' | 'secondary' | 'tertiary' | 'card' | 'gradient' = 'primary') => {
  switch (variant) {
    case 'primary':
      return 'bg-gray-900';
    case 'secondary':
      return 'bg-gray-800';
    case 'tertiary':
      return 'bg-gray-700';
    case 'card':
      return 'bg-gray-900/80 backdrop-blur-xl';
    case 'gradient':
      return 'bg-gradient-to-br from-black via-gray-900 to-black';
    default:
      return 'bg-gray-900';
  }
};

// Input class utilities
export const getInputClasses = (variant: 'base' | 'search' | 'disabled' = 'base') => {
  const baseClasses = 'bg-gray-800 border text-white rounded-lg transition-colors';
  
  switch (variant) {
    case 'base':
      return `${baseClasses} border-gray-600 px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400`;
    case 'search':
      return `${baseClasses} border-gray-600 pl-10 pr-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400`;
    case 'disabled':
      return `${baseClasses} border-gray-600 px-4 py-3 bg-gray-700 text-gray-500 cursor-not-allowed`;
    default:
      return baseClasses;
  }
};

// Status badge utilities
export const getBadgeClasses = (variant: 'featured' | 'premium' | 'published' | 'draft' | 'archived' = 'featured') => {
  const baseClasses = 'text-xs font-bold px-3 py-1 rounded-full';
  
  switch (variant) {
    case 'featured':
      return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg`;
    case 'premium':
      return `${baseClasses} bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg`;
    case 'published':
      return `${baseClasses} bg-green-400/20 text-green-400 border border-green-400/30`;
    case 'draft':
      return `${baseClasses} bg-yellow-400/20 text-yellow-400 border border-yellow-400/30`;
    case 'archived':
      return `${baseClasses} bg-gray-600/20 text-gray-400 border border-gray-600/30`;
    default:
      return baseClasses;
  }
};

// Layout utilities
export const getLayoutClasses = (variant: 'container' | 'section' | 'hero' | 'auth' | 'dashboard' = 'container') => {
  switch (variant) {
    case 'container':
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    case 'section':
      return 'py-12 md:py-20';
    case 'hero':
      return 'min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16';
    case 'auth':
      return 'min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800';
    case 'dashboard':
      return 'min-h-screen bg-gradient-to-br from-gray-900 to-black';
    default:
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  }
};

// Navigation utilities
export const getNavClasses = (variant: 'link' | 'activeLink' | 'button' = 'link') => {
  switch (variant) {
    case 'link':
      return 'text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium';
    case 'activeLink':
      return 'text-yellow-400 font-semibold';
    case 'button':
      return 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 px-4 py-2 rounded-lg transition-all duration-200';
    default:
      return 'text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium';
  }
};

// Animation utilities
export const getAnimationClasses = (variant: 'hover-lift' | 'hover-scale' | 'hover-glow' | 'button-primary' = 'hover-lift') => {
  switch (variant) {
    case 'hover-lift':
      return 'hover:-translate-y-1 transition-transform duration-200';
    case 'hover-scale':
      return 'hover:scale-105 transition-transform duration-200';
    case 'hover-glow':
      return 'hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300';
    case 'button-primary':
      return 'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-400/30';
    default:
      return 'hover:-translate-y-1 transition-transform duration-200';
  }
};

// Typography utilities
export const getTypographyClasses = (variant: 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-large' | 'body' | 'body-small' | 'body-xs' = 'body') => {
  switch (variant) {
    case 'hero':
      return 'text-6xl md:text-8xl font-black text-white leading-tight';
    case 'h1':
      return 'text-4xl md:text-5xl font-bold text-white';
    case 'h2':
      return 'text-3xl md:text-4xl font-bold text-white';
    case 'h3':
      return 'text-2xl md:text-3xl font-semibold text-white';
    case 'h4':
      return 'text-xl md:text-2xl font-semibold text-white';
    case 'body-large':
      return 'text-lg text-gray-300 leading-relaxed';
    case 'body':
      return 'text-base text-gray-300';
    case 'body-small':
      return 'text-sm text-gray-400';
    case 'body-xs':
      return 'text-xs text-gray-500';
    default:
      return 'text-base text-gray-300';
  }
};

// Utility to fix missing styling by adding default classes
export const ensureBackgroundClass = (existingClasses: string): string => {
  if (!existingClasses.includes('bg-')) {
    return `${existingClasses} ${getBackgroundClasses('secondary')}`;
  }
  return existingClasses;
};

export const ensureTextClass = (existingClasses: string): string => {
  if (!existingClasses.includes('text-')) {
    return `${existingClasses} ${getTextClasses('secondary')}`;
  }
  return existingClasses;
};

// Combined utility for complete styling
export const applyDefaultStyling = (existingClasses: string = ''): string => {
  let classes = existingClasses;
  classes = ensureBackgroundClass(classes);
  classes = ensureTextClass(classes);
  return classes.trim();
};