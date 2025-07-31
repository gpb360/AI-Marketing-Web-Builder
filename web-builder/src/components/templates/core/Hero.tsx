import React from 'react';
import { cn } from '@/lib/utils';

interface HeroProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    headline?: string;
    subheadline?: string;
    primaryCta?: string;
    secondaryCta?: string;
    primaryCtaLink?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
    overlay?: boolean;
    height?: string;
    align?: 'left' | 'center' | 'right';
    pattern?: boolean;
  };
}

export const Hero: React.FC<HeroProps> = ({ 
  content, 
  styles, 
  className,
  props = {}
}) => {
  const {
    headline = 'Transform Your Business',
    subheadline = 'Get started with our powerful platform and unlock your potential.',
    primaryCta = 'Get Started',
    secondaryCta = 'Learn More',
    primaryCtaLink = '#',
    secondaryCtaLink = '#',
    backgroundImage,
    overlay = true,
    height = '600px',
    align = 'center',
    pattern = false
  } = props;

  const heroStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    background: backgroundImage 
      ? `linear-gradient(rgba(0, 0, 0, ${overlay ? 0.5 : 0}), rgba(0, 0, 0, ${overlay ? 0.5 : 0})), url(${backgroundImage})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#ffffff',
    ...styles,
  };

  const contentStyles = {
    textAlign: align as React.CSSProperties['textAlign'],
    maxWidth: '800px',
    padding: '0 20px',
    zIndex: 10,
  };

  return (
    <section style={heroStyles} className={cn('hero-section', className)}>
      {/* Pattern overlay */}
      {pattern && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      )}

      <div style={contentStyles}>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {headline}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={primaryCtaLink}
            className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {primaryCta}
          </a>
          <a
            href={secondaryCtaLink}
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
};