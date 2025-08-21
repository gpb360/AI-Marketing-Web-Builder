// Responsive design types for mobile-first web builder

export type BreakpointSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface Breakpoint {
  id: BreakpointSize;
  name: string;
  width: number;
  height: number;
  icon: string;
  minWidth?: number;
  maxWidth?: number;
}

export interface ResponsiveComponentProps {
  mobile?: Record<string, any>;
  tablet?: Record<string, any>;
  desktop?: Record<string, any>;
  wide?: Record<string, any>;
}

export interface ViewportState {
  currentBreakpoint: BreakpointSize;
  width: number;
  height: number;
  zoom: number;
  orientation: 'portrait' | 'landscape';
}

export interface ResponsivePreviewSettings {
  showBreakpointBorders: boolean;
  showResponsiveGrid: boolean;
  autoRotate: boolean;
  simulateTouch: boolean;
}

export const BREAKPOINTS: Record<BreakpointSize, Breakpoint> = {
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: 'smartphone',
    maxWidth: 768
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    minWidth: 768,
    maxWidth: 1024
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop',
    width: 1024,
    height: 768,
    icon: 'monitor',
    minWidth: 1024,
    maxWidth: 1440
  },
  wide: {
    id: 'wide',
    name: 'Wide Screen',
    width: 1440,
    height: 900,
    icon: 'tv',
    minWidth: 1440
  }
};

export const MOBILE_PREVIEW_DEVICES = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 834, height: 1194 }
];