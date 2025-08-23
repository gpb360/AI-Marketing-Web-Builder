/**
 * Authentication Error Handler
 * Comprehensive error handling for authentication flows
 */

export enum AuthErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  
  // Token Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  
  // Registration Errors
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  
  // Network & Server Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  userMessage: string;
  timestamp: number;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: {
    type: 'retry' | 'redirect' | 'wait';
    url?: string;
    waitTime?: number;
  };
}

export class AuthErrorHandler {
  private errorMetrics: Map<AuthErrorCode, number> = new Map();

  handleError(error: any): AuthError {
    const authError = this.transformError(error);
    this.trackError(authError);
    this.logError(authError);
    return authError;
  }

  private transformError(error: any): AuthError {
    const timestamp = Date.now();
    
    // Handle HTTP response errors
    if (error.response) {
      return this.handleHttpError(error.response, timestamp);
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return this.createError(
        AuthErrorCode.NETWORK_ERROR,
        'Network connection failed',
        'Connection failed. Please check your internet connection.',
        timestamp,
        true,
        'medium',
        { type: 'retry', waitTime: 5 }
      );
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return this.createError(
        AuthErrorCode.TIMEOUT,
        'Request timeout',
        'Request took too long. Please try again.',
        timestamp,
        true,
        'medium',
        { type: 'retry', waitTime: 3 }
      );
    }
    
    // Default unknown error
    return this.createError(
      AuthErrorCode.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      'Something went wrong. Please try again.',
      timestamp,
      true,
      'medium',
      { type: 'retry', waitTime: 5 }
    );
  }

  private handleHttpError(response: any, timestamp: number): AuthError {
    const status = response.status;
    const data = response.data || {};
    
    switch (status) {
      case 400:
        return this.handleBadRequestError(data, timestamp);
      case 401:
        return this.handleUnauthorizedError(data, timestamp);
      case 403:
        return this.handleForbiddenError(data, timestamp);
      case 422:
        return this.handleValidationError(data, timestamp);
      case 429:
        return this.handleRateLimitError(data, timestamp);
      case 500:
      case 502:
      case 503:
      case 504:
        return this.handleServerError(status, data, timestamp);
      default:
        return this.createError(
          AuthErrorCode.UNKNOWN_ERROR,
          `HTTP ${status}: ${data.message || 'Unknown error'}`,
          'An unexpected error occurred. Please try again.',
          timestamp,
          true,
          'medium',
          { type: 'retry', waitTime: 5 }
        );
    }
  }

  private handleBadRequestError(data: any, timestamp: number): AuthError {
    const errorCode = data.code || data.error_code;
    
    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        return this.createError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Invalid email or password',
          'The email or password you entered is incorrect.',
          timestamp,
          false,
          'low'
        );
      case 'WEAK_PASSWORD':
        return this.createError(
          AuthErrorCode.WEAK_PASSWORD,
          'Password does not meet requirements',
          'Please choose a stronger password.',
          timestamp,
          false,
          'low'
        );
      default:
        return this.createError(
          AuthErrorCode.VALIDATION_ERROR,
          data.message || 'Invalid request',
          'Please check your input and try again.',
          timestamp,
          false,
          'low'
        );
    }
  }

  private handleUnauthorizedError(data: any, timestamp: number): AuthError {
    const errorCode = data.code || data.error_code;
    
    switch (errorCode) {
      case 'TOKEN_EXPIRED':
        return this.createError(
          AuthErrorCode.TOKEN_EXPIRED,
          'Session expired',
          'Your session has expired. Please log in again.',
          timestamp,
          false,
          'medium',
          { type: 'redirect', url: '/auth/login' }
        );
      case 'EMAIL_NOT_VERIFIED':
        return this.createError(
          AuthErrorCode.EMAIL_NOT_VERIFIED,
          'Email not verified',
          'Please verify your email address before logging in.',
          timestamp,
          false,
          'medium',
          { type: 'redirect', url: '/auth/verify-email' }
        );
      default:
        return this.createError(
          AuthErrorCode.TOKEN_INVALID,
          'Authentication failed',
          'Please log in again to continue.',
          timestamp,
          false,
          'medium',
          { type: 'redirect', url: '/auth/login' }
        );
    }
  }

  private handleForbiddenError(data: any, timestamp: number): AuthError {
    return this.createError(
      AuthErrorCode.ACCOUNT_LOCKED,
      'Account temporarily locked',
      'Your account has been temporarily locked. Please try again later.',
      timestamp,
      false,
      'high'
    );
  }

  private handleValidationError(data: any, timestamp: number): AuthError {
    const errorCode = data.code || data.error_code;
    
    if (errorCode === 'EMAIL_ALREADY_EXISTS') {
      return this.createError(
        AuthErrorCode.EMAIL_ALREADY_EXISTS,
        'Email already registered',
        'An account with this email already exists. Please log in or use a different email.',
        timestamp,
        false,
        'low',
        { type: 'redirect', url: '/auth/login' }
      );
    }
    
    return this.createError(
      AuthErrorCode.VALIDATION_ERROR,
      data.message || 'Validation failed',
      'Please check your input and try again.',
      timestamp,
      false,
      'low'
    );
  }

  private handleRateLimitError(data: any, timestamp: number): AuthError {
    const retryAfter = data.retry_after || 60;
    
    return this.createError(
      AuthErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      `Too many attempts. Please wait ${Math.ceil(retryAfter / 60)} minute(s) before trying again.`,
      timestamp,
      true,
      'medium',
      { type: 'wait', waitTime: retryAfter }
    );
  }

  private handleServerError(status: number, data: any, timestamp: number): AuthError {
    return this.createError(
      AuthErrorCode.SERVER_ERROR,
      `Server error (${status})`,
      'A server error occurred. Please try again in a few moments.',
      timestamp,
      true,
      'high',
      { type: 'retry', waitTime: 30 }
    );
  }

  private createError(
    code: AuthErrorCode,
    message: string,
    userMessage: string,
    timestamp: number,
    retryable: boolean,
    severity: 'low' | 'medium' | 'high' | 'critical',
    actionRequired?: any
  ): AuthError {
    return {
      code,
      message,
      userMessage,
      timestamp,
      retryable,
      severity,
      actionRequired,
    };
  }

  private trackError(error: AuthError): void {
    const existing = this.errorMetrics.get(error.code) || 0;
    this.errorMetrics.set(error.code, existing + 1);
  }

  private logError(error: AuthError): void {
    const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn';
    console[logLevel]('Auth Error:', error);
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [code, count] of this.errorMetrics.entries()) {
      stats[code] = count;
    }
    return stats;
  }
}

export const authErrorHandler = new AuthErrorHandler();

export const isRetryableError = (error: AuthError): boolean => error.retryable;
export const getRetryDelay = (error: AuthError): number => error.actionRequired?.waitTime || 5;
export const formatErrorMessage = (error: AuthError): string => error.userMessage;