'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useIsClient } from '@/lib/utils/hydration';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

/**
 * Error boundary specifically designed to catch hydration errors
 * and provide a graceful fallback during the hydration process
 */
class HydrationErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a hydration error
    const isHydrationError = 
      error.message.includes('Hydration') ||
      error.message.includes('hydration') ||
      error.message.includes('server HTML') ||
      error.message.includes('client-side HTML');

    return {
      hasError: isHydrationError,
      error: isHydrationError ? error : undefined
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log hydration errors for debugging
    if (this.state.hasError) {
      console.warn('Hydration error caught:', error.message);
      console.warn('Error info:', errorInfo);
      
      // In development, provide more detailed information
      if (process.env.NODE_ENV === 'development') {
        console.group('Hydration Error Details');
        console.log('Error:', error);
        console.log('Component Stack:', errorInfo.componentStack);
        console.log('Possible causes:');
        console.log('- Browser extensions modifying DOM');
        console.log('- Client-side only logic in components');
        console.log('- Non-deterministic values (Date.now(), Math.random())');
        console.log('- Conditional rendering based on window/document');
        console.groupEnd();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Hydration Issue Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The component is being re-rendered on the client to fix a hydration mismatch.
                  This is likely caused by browser extensions or dynamic content.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component that only renders children after hydration is complete
 * This prevents hydration mismatches for components that behave differently on server vs client
 */
export function HydrationSafeWrapper({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Main hydration error boundary component
 * Use this to wrap components that might have hydration issues
 */
export function HydrationErrorBoundary({ children, fallback }: Props) {
  return (
    <HydrationErrorBoundaryClass fallback={fallback}>
      {children}
    </HydrationErrorBoundaryClass>
  );
}

/**
 * Higher-order component to wrap components with hydration error boundary
 */
export function withHydrationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <HydrationErrorBoundary fallback={fallback}>
      <Component {...props} />
    </HydrationErrorBoundary>
  );
  
  WrappedComponent.displayName = `withHydrationErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default HydrationErrorBoundary;
