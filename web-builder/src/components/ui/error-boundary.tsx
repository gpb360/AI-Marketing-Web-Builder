/**
 * Error Boundary Component for Story 1.3
 * 
 * Comprehensive error handling with fallback templates and recovery options
 * Part of Story 1.3: Frontend Context-Aware Template Integration
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Home, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  fallbackMessage?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false
    });
  };

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError') return 'Network';
    if (error.message.includes('Loading chunk')) return 'Loading';
    if (error.message.includes('API')) return 'API';
    if (error.message.includes('fetch')) return 'Network';
    return 'Application';
  };

  getRecoveryMessage = (error: Error): string => {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'Network':
        return 'Please check your internet connection and try again.';
      case 'Loading':
        return 'There was an issue loading the application. Please refresh the page.';
      case 'API':
        return 'Our servers are temporarily unavailable. Please try again in a moment.';
      default:
        return 'An unexpected error occurred. Our team has been notified.';
    }
  };

  getSeverityLevel = (error: Error): 'low' | 'medium' | 'high' => {
    const errorType = this.getErrorType(error);
    
    if (errorType === 'Network' || errorType === 'Loading') return 'medium';
    if (errorType === 'API') return 'high';
    return 'low';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount, showDetails } = this.state;
      const { 
        fallback, 
        fallbackMessage, 
        enableRetry = true, 
        showErrorDetails = false, 
        className = '' 
      } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const errorType = this.getErrorType(error!);
      const recoveryMessage = this.getRecoveryMessage(error!);
      const severity = this.getSeverityLevel(error!);
      const canRetry = enableRetry && retryCount < this.maxRetries;

      return (
        <div className={`min-h-[400px] flex items-center justify-center p-6 ${className}`}>
          <Card className="max-w-2xl w-full p-8 text-center space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            {/* Error Icon and Status */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`p-4 rounded-full ${
                  severity === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : severity === 'medium'
                    ? 'bg-orange-100 dark:bg-orange-900/30'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <AlertTriangle className={`h-8 w-8 ${
                    severity === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : severity === 'medium'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Something went wrong
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {errorType} Error
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {fallbackMessage || recoveryMessage}
                </p>
              </div>
            </div>

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Retry attempt {retryCount} of {this.maxRetries}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Reset
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>

            {/* Error Details Toggle */}
            {(showErrorDetails || process.env.NODE_ENV === 'development') && error && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-gray-600 dark:text-gray-400"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showDetails ? 'Hide' : 'Show'} Error Details
                </Button>

                {showDetails && (
                  <div className="mt-4 text-left space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Error Message:</h4>
                      <code className="text-sm text-red-600 dark:text-red-400 break-words">
                        {error.message}
                      </code>
                    </div>

                    {error.stack && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Stack Trace:</h4>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo && errorInfo.componentStack && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Component Stack:</h4>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Support Contact */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If the problem persists, please{' '}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-blue-600 dark:text-blue-400"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  contact support
                </Button>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;