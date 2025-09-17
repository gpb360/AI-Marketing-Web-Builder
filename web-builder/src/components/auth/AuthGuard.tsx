'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import theme from '@/lib/theme';

const { luxuryTheme } = theme;

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login',
  fallback = <AuthLoadingSpinner />
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isInitialized && requireAuth && !isAuthenticated) {
      // Store the intended destination
      const returnUrl = pathname !== '/auth/login' ? pathname : '/';
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isInitialized, requireAuth, isAuthenticated, router, redirectTo, pathname]);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return fallback;
  }

  // If auth is required but user is not authenticated, don't render anything
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If auth is not required but user is authenticated, redirect from auth pages
  if (!requireAuth && isAuthenticated && pathname.startsWith('/auth/')) {
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
}

function AuthLoadingSpinner() {
  return (
    <div className={luxuryTheme.components.loading.container}>
      <div className="flex flex-col items-center space-y-6">
        {/* Luxury Loading Animation */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-yellow-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Professional Loading Text */}
        <div className="text-center space-y-2">
          <p className={`text-lg font-medium ${luxuryTheme.colors.text.primary}`}>Loading...</p>
          <p className={`text-sm ${luxuryTheme.colors.text.secondary}`}>Preparing your experience</p>
        </div>
        
        {/* Luxury Brand Touch */}
        <div className="flex items-center space-x-2 opacity-70">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">AI</span>
          </div>
          <span className={`text-sm font-medium ${luxuryTheme.colors.text.secondary}`}>Marketing Pro</span>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking auth status in components
export function useAuthGuard(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  const redirectToLogin = (returnUrl?: string) => {
    const url = returnUrl 
      ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/login';
    router.push(url);
  };

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    canAccess: !requireAuth || isAuthenticated,
    redirectToLogin,
    redirectToDashboard
  };
}