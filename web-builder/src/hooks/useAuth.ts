/**
 * Authentication Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api/services';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  LoadingState 
} from '@/lib/api/types';

interface UseAuthReturn extends LoadingState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  refreshToken: () => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        // Clear invalid token
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      setUser(response.user);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<AuthResponse> => {
    try {
      setError(null);
      
      const response = await authService.refreshToken();
      setUser(response.user);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Token refresh failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ message: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    changePassword
  };
}