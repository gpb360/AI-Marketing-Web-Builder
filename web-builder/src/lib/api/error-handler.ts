/**
 * Enhanced API Error Handler for Next.js App Router
 * Handles "Failed to fetch" errors and provides fallback mechanisms
 */

import { APIClientError } from './client';

export interface ErrorHandlerOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
  fallbackData?: any;
  enableLogging?: boolean;
}

export interface ErrorContext {
  url?: string;
  method?: string;
  timestamp: string;
  userAgent?: string;
  networkStatus?: 'online' | 'offline';
}

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private options: ErrorHandlerOptions;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableFallback: true,
      enableLogging: true,
      ...options
    };
  }

  static getInstance(options?: ErrorHandlerOptions): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler(options);
    }
    return EnhancedErrorHandler.instance;
  }

  /**
   * Handle fetch errors with retry and fallback mechanisms
   */
  async handleFetchError(
    error: Error,
    fetchFn: () => Promise<any>,
    context: Partial<ErrorContext> = {}
  ): Promise<any> {
    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      networkStatus: navigator.onLine ? 'online' : 'offline',
      userAgent: navigator.userAgent,
      ...context
    };

    // Log error if enabled
    if (this.options.enableLogging) {
      this.logError(error, errorContext);
    }

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, fetchFn, errorContext);
    }

    // Check if it's a server error
    if (this.isServerError(error)) {
      return this.handleServerError(error, fetchFn, errorContext);
    }

    // For other errors, throw as-is
    throw error;
  }

  /**
   * Handle network-related errors (connection refused, timeout, etc.)
   */
  private async handleNetworkError(
    error: Error,
    fetchFn: () => Promise<any>,
    context: ErrorContext
  ): Promise<any> {
    // If offline, return fallback immediately
    if (context.networkStatus === 'offline') {
      console.warn('🔌 Network is offline, using fallback data');
      return this.getFallbackData(context);
    }

    // Try retry mechanism
    if (this.options.enableRetry) {
      try {
        return await this.retryWithBackoff(fetchFn, this.options.maxRetries!);
      } catch (retryError) {
        console.warn('🔄 All retries failed, using fallback data');
        return this.getFallbackData(context);
      }
    }

    // Return fallback if no retry
    return this.getFallbackData(context);
  }

  /**
   * Handle server errors (5xx status codes)
   */
  private async handleServerError(
    error: Error,
    fetchFn: () => Promise<any>,
    context: ErrorContext
  ): Promise<any> {
    // For server errors, try retry with exponential backoff
    if (this.options.enableRetry) {
      try {
        return await this.retryWithBackoff(fetchFn, this.options.maxRetries!);
      } catch (retryError) {
        return this.getFallbackData(context);
      }
    }

    return this.getFallbackData(context);
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async retryWithBackoff(
    fetchFn: () => Promise<any>,
    maxRetries: number
  ): Promise<any> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
        return await fetchFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = this.options.retryDelay! * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Get fallback data based on context
   */
  private getFallbackData(context: ErrorContext): any {
    if (!this.options.enableFallback) {
      throw new APIClientError(
        'API request failed and fallback is disabled',
        0,
        context
      );
    }

    // Return custom fallback data if provided
    if (this.options.fallbackData) {
      return this.options.fallbackData;
    }

    // Return default fallback based on URL pattern
    const url = context.url || '';
    
    if (url.includes('/templates')) {
      return { templates: [], total: 0 };
    }
    
    if (url.includes('/workflows')) {
      return { workflows: [], total: 0 };
    }
    
    if (url.includes('/auth')) {
      return { error: 'Authentication service unavailable' };
    }

    // Generic fallback
    return {
      error: true,
      message: 'Service temporarily unavailable',
      fallback: true,
      timestamp: context.timestamp
    };
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorMessages = [
      'Failed to fetch',
      'Network request failed',
      'Connection refused',
      'Connection timeout',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED'
    ];

    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * Check if error is server-related
   */
  private isServerError(error: Error): boolean {
    if (error instanceof APIClientError) {
      return error.status >= 500 && error.status < 600;
    }
    return false;
  }

  /**
   * Log error with context
   */
  private logError(error: Error, context: ErrorContext): void {
    console.group('🚨 API Error Handler');
    console.error('Error:', error.message);
    console.log('Context:', context);
    console.log('Stack:', error.stack);
    console.groupEnd();

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorTrackingService.captureException(error, context);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const errorHandler = EnhancedErrorHandler.getInstance();

// Export utility functions
export const handleAPIError = (error: Error, fetchFn: () => Promise<any>, context?: Partial<ErrorContext>) => {
  return errorHandler.handleFetchError(error, fetchFn, context);
};

export const isNetworkError = (error: Error): boolean => {
  return error.message.toLowerCase().includes('failed to fetch') ||
         error.message.toLowerCase().includes('network request failed') ||
         error.message.toLowerCase().includes('connection refused');
};
