'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; errorInfo?: React.ErrorInfo; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  reset 
}: { 
  error?: Error; 
  errorInfo?: React.ErrorInfo; 
  reset: () => void; 
}) {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Error Details:</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {error?.message || 'Unknown error'}
          </pre>
        </div>
        
        {error?.stack && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Stack Trace:</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
              {error.stack}
            </pre>
          </div>
        )}
        
        {errorInfo?.componentStack && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;