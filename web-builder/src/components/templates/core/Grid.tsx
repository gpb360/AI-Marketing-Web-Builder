import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  id?: string;
  children?: React.ReactNode;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    columns?: number;
    gap?: string;
    responsive?: boolean;
    equalHeight?: boolean;
    masonry?: boolean;
    container?: boolean;
    item?: boolean;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  };
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  styles, 
  className,
  props = {}
}) => {
  const {
    columns = 3,
    gap = '2rem',
    responsive = true,
    equalHeight = true,
    masonry = false,
    container = false,
    item = false,
    alignItems = 'stretch',
    justifyContent = 'start'
  } = props;

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap,
    alignItems,
    justifyContent: justifyContent,
    ...styles,
  };

  const getResponsiveColumns = () => {
    if (!responsive) return columns;
    
    const columnMap: { [key: number]: string } = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    };

    return columnMap[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const gridClasses = cn(
    !item && {
      [getResponsiveColumns()]: !masonry,
      'auto-rows-auto': masonry,
      'grid-cols-1': container,
      'grid-cols-12': item,
    },
    equalHeight && 'items-stretch',
    className
  );

  if (masonry) {
    return (
      <div 
        className={cn("masonry-grid", gridClasses)} 
        style={{
          ...gridStyles,
          columnCount: columns,
          columnGap: gap,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            key={index} 
            className="masonry-item break-inside-avoid mb-4"
            style={{ marginBottom: gap }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={gridClasses} 
      style={gridStyles}
    >
      {children}
    </div>
  );
};

// Helper components for grid system
interface GridItemProps {
  children?: React.ReactNode;
  className?: string;
  span?: number;
  offset?: number;
  styles?: React.CSSProperties;
}

export const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  className, 
  span = 1, 
  offset = 0,
  styles 
}) => {
  const spanClass = `col-span-${span}`;
  const offsetClass = offset ? `col-start-${offset + 1}` : '';

  return (
    <div 
      className={cn(spanClass, offsetClass, className)} 
      style={styles}
    >
      {children}
    </div>
  );
};

// Flex grid alternative
interface FlexGridProps {
  children?: React.ReactNode;
  className?: string;
  columns?: number;
  gap?: string;
  responsive?: boolean;
}

export const FlexGrid: React.FC<FlexGridProps> = ({ 
  children, 
  className, 
  columns = 3, 
  gap = '1rem',
  responsive = true 
}) => {
  const getFlexBasis = () => {
    const basisMap: { [key: number]: string } = {
      1: 'basis-full',
      2: 'basis-full md:basis-1/2',
      3: 'basis-full md:basis-1/2 lg:basis-1/3',
      4: 'basis-full sm:basis-1/2 lg:basis-1/4',
    };
    return basisMap[columns] || 'basis-full md:basis-1/2 lg:basis-1/3';
  };

  return (
    <div 
      className={cn(
        "flex flex-wrap",
        className
      )} 
      style={{ gap }}
    >
      {React.Children.map(children, (child) => (
        <div className={getFlexBasis()} style={{ flexGrow: 1, minWidth: '250px' }}>
          {child}
        </div>
      ))}
    </div>
  );
};