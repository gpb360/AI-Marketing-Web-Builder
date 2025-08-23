/**
 * Authentication Security Module
 * Centralized exports for all authentication security features
 */

// Core security modules
export * from './password-validation';
export * from './rate-limiting';
export * from './token-manager';
export * from './error-handler';

// Default instances for common use
export { passwordValidator } from './password-validation';
export { 
  loginRateLimiter, 
  registerRateLimiter, 
  passwordResetRateLimiter,
  apiRateLimiter 
} from './rate-limiting';
export { tokenManager } from './token-manager';
export { authErrorHandler } from './error-handler';