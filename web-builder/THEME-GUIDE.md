# AI Marketing Web Builder - Theme Guide

## Overview

This guide provides comprehensive guidelines for maintaining consistent theming across the AI Marketing Web Builder application. It covers the standardized dark theme, proper usage of colors, components, and common patterns to prevent theme inconsistencies.

## 🎨 Core Theme Philosophy

**Primary Theme**: Dark theme with yellow accent
- **Background**: Black to gray gradient creates depth and focus
- **Text**: White and gray hierarchy for readability
- **Accent**: Yellow (#facc15) for calls-to-action and highlights
- **Style**: Modern glass-morphism with subtle borders and shadows

## 📁 Theme System Architecture

### Central Theme File
All theme constants are defined in `/src/lib/theme.ts`:
```typescript
import theme, { colors, presets, getCardStyle } from '@/lib/theme';
```

### Theme Structure
```
theme.ts
├── colors (background, text, border, button, status)
├── componentStyles (card, button, input, badge, nav, layout)
├── animations (hover, loading, entrance)
├── typography (headings, body, special)
├── spacing (container, section, component)
├── themes (dark, light variants)
├── utility functions (cn, getCardStyle, etc.)
└── presets (common component combinations)
```

## 🎯 Color Usage Guidelines

### Background Colors

#### ✅ DO USE
```typescript
// Primary page background
className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black"

// Card backgrounds
className="bg-gray-900/50 backdrop-blur-sm border border-gray-700"

// Secondary surfaces
className="bg-gray-800"
```

#### ❌ DON'T USE
```typescript
// Avoid plain white backgrounds in main app
className="bg-white"

// Avoid light grays that break dark theme
className="bg-gray-100"

// Avoid inconsistent gradients
className="bg-gradient-to-r from-blue-500 to-purple-600"
```

### Text Colors

#### ✅ DO USE
```typescript
// Primary text (headings, important content)
className="text-white"

// Secondary text (descriptions, labels)
className="text-gray-300"

// Tertiary text (metadata, timestamps)
className="text-gray-400"

// Accent text (CTAs, highlights)
className="text-yellow-400"

// Gradient text (hero titles)
className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500"
```

#### ❌ DON'T USE
```typescript
// Avoid dark text on dark backgrounds
className="text-gray-900"

// Avoid colors that don't fit the palette
className="text-blue-500"

// Avoid insufficient contrast
className="text-gray-500" // (use only for very subtle text)
```

## 🧩 Component Guidelines

### Cards

#### ✅ Correct Card Usage
```typescript
// Basic card
<div className={getCardStyle('base')}>
  Content here
</div>

// Interactive card (hoverable)
<div className={getCardStyle('interactive')}>
  Clickable content
</div>

// Featured card (highlighted)
<div className={getCardStyle('featured')}>
  Important content
</div>
```

#### 📋 Card Variants
- **Base**: `bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl`
- **Interactive**: Adds hover effects and transitions
- **Featured**: Uses yellow accent border and shadow

### Buttons

#### ✅ Correct Button Usage
```typescript
// Primary CTA button
<button className={getButtonStyle('primary')}>
  Build My Website
</button>

// Secondary action button
<button className={getButtonStyle('secondary')}>
  Learn More
</button>

// Ghost/text button
<button className={getButtonStyle('ghost')}>
  Cancel
</button>
```

#### 🎨 Button Hierarchy
1. **Primary**: Yellow gradient - Use for main CTAs (max 1 per screen)
2. **Secondary**: Gray border - Use for secondary actions
3. **Ghost**: Text only - Use for tertiary actions or navigation

### Forms & Inputs

#### ✅ Correct Input Usage
```typescript
// Standard input
<input className={getInputStyle('base')} />

// Search input (with icon space)
<input className={getInputStyle('search')} />

// Using presets
<input className={presets.formInput} />
```

## 📄 Page-Specific Guidelines

### Landing Page (/)
- **Background**: `bg-gradient-to-br from-black via-gray-900 to-black`
- **Sections**: Use consistent spacing with `py-12 md:py-20`
- **Hero**: Center-aligned with gradient text for main headline
- **Cards**: Glass-morphism style with hover effects

### Templates Page (/templates)
- **Should match landing page theme** (currently inconsistent)
- **Background**: Use dark theme instead of `bg-gray-50`
- **Cards**: Use glass-morphism instead of white cards
- **Text**: Use white/gray hierarchy instead of dark text

### Builder Pages (/builder)
- **Background**: Can use `bg-gray-800` for work areas
- **Toolbars**: Use `bg-gray-900` with proper contrast
- **Canvas**: Can have different background for content area

## 🚀 Implementation Patterns

### Using Theme Constants
```typescript
import { colors, presets, getCardStyle } from '@/lib/theme';

// Use color constants
<div className={colors.background.primary}>

// Use presets for common patterns
<div className={presets.featureCard}>

// Use utility functions
<div className={getCardStyle('interactive')}>
```

### Combining Classes
```typescript
import { cn } from '@/lib/theme';

// Safely combine conditional classes
<div className={cn(
  colors.background.glass,
  colors.border.primary,
  'border rounded-xl p-6',
  isActive && colors.border.accent
)}>
```

## 🔧 Common Patterns

### Feature Cards
```typescript
<div className={presets.featureCard}>
  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
    <Icon className="text-white" />
  </div>
  <h3 className="text-xl font-semibold text-white mb-3">Feature Title</h3>
  <p className="text-gray-300">Feature description...</p>
</div>
```

### Hero Sections
```typescript
<section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16">
  <h1 className={presets.heroTitle}>
    Your Amazing <span className={colors.text.gradient}>Headline</span>
  </h1>
  <p className={presets.bodyText}>Supporting description text</p>
  <button className={presets.ctaButton}>Get Started</button>
</section>
```

### Navigation
```typescript
<nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700">
  <a className={colors.text.secondary + ' hover:' + colors.text.accent}>Link</a>
</nav>
```

## 🐛 Common Issues & Fixes

### Issue: Light theme on templates page
❌ **Problem**: Templates page uses light theme (`bg-gray-50`, `text-gray-900`)
✅ **Fix**: Replace with dark theme equivalents:
- `bg-gray-50` → `bg-gradient-to-br from-black via-gray-900 to-black`
- `text-gray-900` → `text-white`
- `bg-white` → `bg-gray-900/50 backdrop-blur-sm`

### Issue: Inconsistent button styles
❌ **Problem**: Buttons using different colors/styles across pages
✅ **Fix**: Use `getButtonStyle()` utility function consistently

### Issue: Mixed color schemes
❌ **Problem**: Some components using blue accents instead of yellow
✅ **Fix**: Replace with yellow accent (`text-yellow-400`, `border-yellow-400`)

## 📱 Responsive Guidelines

### Mobile-First Approach
```typescript
// Typography scales
className="text-4xl md:text-5xl lg:text-6xl"

// Spacing scales
className="px-4 sm:px-6 lg:px-8"

// Grid scales
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Container Widths
```typescript
// Use consistent container widths
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Or use the preset
className={presets.container}
```

## 🎭 Animation Guidelines

### Hover Effects
```typescript
// Subtle lift effect
className="hover:-translate-y-1 transition-transform duration-200"

// Scale effect
className="hover:scale-105 transition-transform duration-200"

// Glow effect (for primary elements)
className="hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-200"
```

### Loading States
```typescript
// Skeleton loading
<div className="bg-gray-800 rounded animate-pulse h-4" />

// Spinner
<div className="w-4 h-4 border-2 border-gray-600 border-t-yellow-400 rounded-full animate-spin" />
```

## ✅ Quality Checklist

Before deploying changes, verify:

- [ ] All backgrounds use dark theme colors
- [ ] Text has proper contrast (white/gray on dark)
- [ ] Buttons use consistent styling utilities
- [ ] Cards use glass-morphism style with proper borders
- [ ] Yellow accent is used consistently for CTAs
- [ ] No light theme elements in main app areas
- [ ] Responsive classes are applied appropriately
- [ ] Hover states provide appropriate feedback
- [ ] Loading states match theme

## 📚 Examples Repository

### Complete Page Example
```typescript
export default function MyPage() {
  return (
    <div className={presets.landingPage}>
      <div className={componentStyles.layout.container}>
        <section className={componentStyles.layout.section}>
          <h1 className={presets.sectionTitle}>Page Title</h1>
          <p className={presets.bodyText}>Description text</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {items.map(item => (
              <div key={item.id} className={presets.featureCard}>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

## 🚨 Emergency Theme Fixes

If you find theme inconsistencies:

1. **Immediate fix**: Replace problematic classes with theme constants
2. **Import theme**: `import { colors, presets } from '@/lib/theme'`
3. **Apply dark theme**: Use background gradients and white text
4. **Test contrast**: Ensure text is readable on dark backgrounds
5. **Verify buttons**: Use yellow accents for primary actions

## 📞 Support

For theme-related questions or issues:
1. Check this guide first
2. Review `/src/lib/theme.ts` for available constants
3. Look at landing page components for reference implementations
4. Follow the established patterns in existing dark-themed components

---

**Remember**: Consistency is key. When in doubt, follow the landing page theme patterns!