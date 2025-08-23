'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { ComponentData } from '@/types/builder';
import { BreakpointSize, ResponsiveComponentProps } from '@/types/responsive';
import { cn } from '@/lib/utils';

interface ResponsiveComponentWrapperProps {
  component: ComponentData;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that applies responsive styles and props to components
 * based on the current viewport breakpoint
 */
export function ResponsiveComponentWrapper({
  component,
  children,
  className
}: ResponsiveComponentWrapperProps) {
  const { viewport } = useBuilderStore();
  
  // Get responsive props for current breakpoint
  const responsiveProps = useMemo(() => {
    const props = component.props as ResponsiveComponentProps;
    const currentBreakpoint = viewport.currentBreakpoint;
    
    // Start with base props and override with breakpoint-specific props
    let mergedProps = { ...props };
    
    // Apply breakpoint-specific props in mobile-first order
    if (props.mobile && (currentBreakpoint === 'mobile' || shouldInheritFromMobile(currentBreakpoint, props))) {
      mergedProps = { ...mergedProps, ...props.mobile };
    }
    
    if (props.tablet && (currentBreakpoint === 'tablet' || shouldInheritFromTablet(currentBreakpoint, props))) {
      mergedProps = { ...mergedProps, ...props.tablet };
    }
    
    if (props.desktop && (currentBreakpoint === 'desktop' || currentBreakpoint === 'wide')) {
      mergedProps = { ...mergedProps, ...props.desktop };
    }
    
    if (props.wide && currentBreakpoint === 'wide') {
      mergedProps = { ...mergedProps, ...props.wide };
    }
    
    return mergedProps;
  }, [component.props, viewport.currentBreakpoint]);
  
  // Calculate responsive size based on breakpoint
  const responsiveSize = useMemo(() => {
    const baseSize = component.size;
    const breakpoint = viewport.currentBreakpoint;
    
    // Apply mobile-first responsive sizing
    switch (breakpoint) {
      case 'mobile':
        return {
          width: Math.min(baseSize.width, viewport.width - 40), // Leave 20px margin on each side
          height: baseSize.height
        };
      case 'tablet':
        return {
          width: Math.min(baseSize.width, viewport.width - 60), // Leave 30px margin on each side
          height: baseSize.height
        };
      default:
        return baseSize;
    }
  }, [component.size, viewport]);
  
  // Generate responsive classes based on component type and breakpoint
  const responsiveClasses = useMemo(() => {
    const breakpoint = viewport.currentBreakpoint;
    const componentType = component.type;
    
    const classes = [];
    
    // Base responsive classes
    classes.push('transition-all duration-200');
    
    // Component type specific responsive behavior
    switch (componentType) {
      case 'text':
        classes.push(
          breakpoint === 'mobile' ? 'text-sm' : 
          breakpoint === 'tablet' ? 'text-base' : 'text-lg'
        );
        break;
      case 'button':
        classes.push(
          breakpoint === 'mobile' ? 'px-3 py-2 text-sm' : 
          breakpoint === 'tablet' ? 'px-4 py-2' : 'px-6 py-3'
        );
        break;
      case 'container':
        classes.push(
          breakpoint === 'mobile' ? 'p-4' : 
          breakpoint === 'tablet' ? 'p-6' : 'p-8'
        );
        break;
      case 'image':
        classes.push('w-full h-auto object-cover');
        if (breakpoint === 'mobile') {
          classes.push('rounded-lg');
        }
        break;
    }
    
    // Spacing adjustments for mobile
    if (breakpoint === 'mobile') {
      classes.push('mb-4'); // Increased spacing between components on mobile
    }
    
    return classes.join(' ');
  }, [component.type, viewport.currentBreakpoint]);
  
  // Handle touch interactions for mobile
  const touchProps = viewport.currentBreakpoint === 'mobile' ? {
    style: {
      ...responsiveSize,
      touchAction: 'manipulation', // Optimized for touch
      WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
    }
  } : {
    style: responsiveSize
  };
  
  return (
    <div
      className={cn(responsiveClasses, className)}
      data-responsive-breakpoint={viewport.currentBreakpoint}
      data-component-type={component.type}
      {...touchProps}
    >
      {React.cloneElement(children as React.ReactElement, {
        ...responsiveProps,
        // Pass through responsive context
        responsiveBreakpoint: viewport.currentBreakpoint,
        isResponsivePreview: viewport.currentBreakpoint !== 'desktop'
      })}
      
      {/* Mobile-specific overlay for touch interaction feedback */}
      {viewport.currentBreakpoint === 'mobile' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Touch interaction indicator */}
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}

/**
 * Helper functions for responsive prop inheritance
 */
function shouldInheritFromMobile(currentBreakpoint: BreakpointSize, props: ResponsiveComponentProps): boolean {
  // Inherit mobile props for tablet if no tablet-specific props exist
  return currentBreakpoint === 'tablet' && !props.tablet;
}

function shouldInheritFromTablet(currentBreakpoint: BreakpointSize, props: ResponsiveComponentProps): boolean {
  // Inherit tablet props for desktop if no desktop-specific props exist
  return currentBreakpoint === 'desktop' && !props.desktop && props.tablet;
}