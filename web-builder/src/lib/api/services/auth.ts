/**
 * Authentication API Service
 */

import apiClient from '../client';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '../types';

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store the token after successful login
      if (response.access_token) {
        apiClient.setToken(response.access_token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      // Store the token after successful registration
      if (response.access_token) {
        apiClient.setToken(response.access_token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if the API call fails, we should clear the token
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear the token on logout
      apiClient.clearToken();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>('/auth/me');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      return await apiClient.put<User>('/auth/me', userData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      
      // Update stored token
      if (response.access_token) {
        apiClient.setToken(response.access_token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/password-reset', { email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/password-reset/confirm', {
        token,
        new_password: newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for use in components and hooks
export default authService;