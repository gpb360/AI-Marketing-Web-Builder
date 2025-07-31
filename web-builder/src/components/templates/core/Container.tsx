import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  id?: string;
  children?: React.ReactNode;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    maxWidth?: string;
    padding?: string;
    backgroundColor?: string;
    responsive?: boolean;
  };
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  styles, 
  className,
  props = {}
}) => {
  const {
    maxWidth = '1200px',
    padding = '20px',
    backgroundColor = 'transparent',
    responsive = true
  } = props;

  const containerStyles: React.CSSProperties = {
    maxWidth,
    padding,
    backgroundColor,
    margin: '0 auto',
    ...styles,
  };

  return (
    <div 
      className={cn(
        responsive && 'w-full px-4 sm:px-6 lg:px-8',
        className
      )}
      style={containerStyles}
    >
      {children}
    </div>
  );
};