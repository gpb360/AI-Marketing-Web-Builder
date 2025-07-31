import React from 'react';
import { cn } from '@/lib/utils';

interface TextSectionProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    title?: string;
    subtitle?: string;
    body?: string;
    align?: 'left' | 'center' | 'right';
    maxWidth?: string;
    spacing?: 'tight' | 'normal' | 'loose';
    typography?: 'default' | 'large' | 'small';
  };
}

export const TextSection: React.FC<TextSectionProps> = ({ 
  content, 
  styles, 
  className,
  props = {}
}) => {
  const {
    title,
    subtitle,
    body,
    align = 'left',
    maxWidth = '800px',
    spacing = 'normal',
    typography = 'default'
  } = props;

  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    loose: 'space-y-8'
  };

  const typographyClasses = {
    default: {
      title: 'text-3xl md:text-4xl font-bold',
      subtitle: 'text-xl md:text-2xl text-gray-600',
      body: 'text-base md:text-lg text-gray-700 leading-relaxed'
    },
    large: {
      title: 'text-4xl md:text-5xl font-bold',
      subtitle: 'text-2xl md:text-3xl text-gray-600',
      body: 'text-lg md:text-xl text-gray-700 leading-relaxed'
    },
    small: {
      title: 'text-2xl md:text-3xl font-bold',
      subtitle: 'text-lg md:text-xl text-gray-600',
      body: 'text-sm md:text-base text-gray-700 leading-relaxed'
    }
  };

  const textStyles: React.CSSProperties = {
    textAlign: align as React.CSSProperties['textAlign'],
    maxWidth,
    margin: '0 auto',
    ...styles,
  };

  return (
    <section style={textStyles} className={cn('text-section py-16', className)}>
      <div className={cn(spacingClasses[spacing], 'px-4')}>
        {title && (
          <h2 className={typographyClasses[typography].title}>
            {title}
          </h2>
        )}
        {subtitle && (
          <h3 className={typographyClasses[typography].subtitle}>
            {subtitle}
          </h3>
        )}
        {body && (
          <div className={typographyClasses[typography].body}>
            <p>{body}</p>
          </div>
        )}
        {content && !title && !subtitle && !body && (
          <div className={typographyClasses[typography].body}>
            {content}
          </div>
        )}
      </div>
    </section>
  );
};