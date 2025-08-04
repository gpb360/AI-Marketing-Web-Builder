/**
 * Base API Client for AI Marketing Web Builder Platform
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import type { APIResponse, APIError } from './types';
import { errorHandler, isNetworkError } from './error-handler';

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';
const TOKEN_COOKIE_NAME = 'auth_token';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Custom error class for API errors
export class APIClientError extends Error {
  public status: number;
  public details?: any;
  public retryable: boolean;

  constructor(message: string, status: number, details?: any, retryable: boolean = false) {
    super(message);
    this.name = 'APIClientError';
    this.status = status;
    this.details = details;
    this.retryable = retryable;
  }
}

/**
 * Utility function to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) return true; // Network errors
  
  const status = error.response.status;
  // Retry on 5xx errors and specific 4xx errors
  return (
    status >= 500 || // Server errors
    status === 429 || // Rate limit
    status === 408 || // Request timeout
    status === 409   // Conflict
  );
};

/**
 * Base API Client class
 */
export class APIClient {
  private _client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_VERSION}`;
    
    this._client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get the axios client instance (for special cases like blob responses)
   */
  get client(): AxiosInstance {
    return this._client;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this._client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common response patterns
    this._client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        
        return response;
      },
      (error: AxiosError) => {
        // Handle 401 unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
          this.clearToken();
          // In a real app, you might want to redirect to login page
          // window.location.href = '/login';
        }

        // Transform axios error to our custom error format
        const apiError = this.transformError(error);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Execute request with enhanced retry logic and error handling
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle network errors with enhanced error handler
      if (isNetworkError(axiosError)) {
        try {
          return await errorHandler.handleFetchError(
            axiosError,
            requestFn,
            { method: 'API_REQUEST' }
          );
        } catch (handledError) {
          throw this.transformError(axiosError);
        }
      }

      // Original retry logic for other errors
      if (retries > 0 && isRetryableError(axiosError)) {
        const delayMs = RETRY_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
        if (process.env.NODE_ENV === 'development') {
          console.log(`Retrying request, ${retries} attempts remaining...`);
        }

        await delay(delayMs);
        return this.executeWithRetry(requestFn, retries - 1);
      }

      throw this.transformError(axiosError);
    }
  }

  /**
   * Transform axios error to our custom API error format
   */
  private transformError(error: AxiosError): APIClientError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as APIError;
      return new APIClientError(
        data.message || 'An error occurred',
        error.response.status,
        data.details,
        isRetryableError(error)
      );
    } else if (error.request) {
      // Network error
      return new APIClientError(
        'Network error - please check your connection',
        0,
        null,
        true // Network errors are retryable
      );
    } else {
      // Request setup error
      return new APIClientError(
        error.message || 'Request configuration error',
        0,
        null,
        false
      );
    }
  }

  /**
   * Get authentication token from cookies
   */
  public getToken(): string | null {
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
  }

  /**
   * Set authentication token in cookies
   */
  public setToken(token: string): void {
    Cookies.set(TOKEN_COOKIE_NAME, token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  /**
   * Clear authentication token from cookies
   */
  public clearToken(): void {
    Cookies.remove(TOKEN_COOKIE_NAME);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Generic GET request
   */
  public async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await this._client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  public async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this._client.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  public async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this._client.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic PATCH request
   */
  public async patch<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this._client.patch<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  public async delete<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this._client.delete<T>(url, { data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file
   */
  public async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this._client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Build URL with query parameters
   */
  public buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<{ status: string; version: string; environment: string }> {
    try {
      return await this.get('/health');
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export for use in services
export default apiClient;