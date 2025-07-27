/**
 * Hydration-safe utilities for Next.js applications
 * Prevents hydration mismatches between server and client rendering
 */

import React, { useEffect, useState } from 'react';

// Counter for deterministic ID generation
let idCounter = 0;

/**
 * Generates a deterministic ID that's consistent between server and client
 * Uses a counter-based approach instead of Date.now() or Math.random()
 */
export function generateDeterministicId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Generates a component ID that's safe for hydration
 * Uses a predictable pattern that works in both SSR and client-side rendering
 */
export function generateComponentId(type: string): string {
  return generateDeterministicId(`component-${type}`);
}

/**
 * Hook to detect if we're running on the client side
 * Returns false during SSR, true after hydration
 * Useful for components that need different behavior on client vs server
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for hydration-safe rendering
 * Returns null during SSR, renders children after hydration
 * Use this for components that should only render on the client
 */
export function useClientOnly(): boolean {
  return useIsClient();
}

/**
 * Component wrapper for client-only content
 * Prevents hydration mismatches by only rendering children on the client
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Resets the ID counter (useful for testing)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Gets the current ID counter value (useful for debugging)
 */
export function getCurrentIdCounter(): number {
  return idCounter;
}

/**
 * Hook for handling browser extension compatibility
 * Suppresses hydration warnings for elements that might be modified by extensions
 */
export function useBrowserExtensionSafe() {
  const [suppressHydration, setSuppressHydration] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment with potential extensions
    if (typeof window !== 'undefined') {
      // Look for common extension indicators
      const hasExtensions = 
        document.body.hasAttribute('data-atm-ext-installed') ||
        document.body.hasAttribute('data-extension-id') ||
        document.querySelector('[data-extension]') !== null;
      
      if (hasExtensions) {
        setSuppressHydration(true);
      }
    }
  }, []);

  return suppressHydration;
}

/**
 * Utility to safely access window object
 * Returns undefined during SSR, window object on client
 */
export function getWindow(): Window | undefined {
  return typeof window !== 'undefined' ? window : undefined;
}

/**
 * Utility to safely access document object
 * Returns undefined during SSR, document object on client
 */
export function getDocument(): Document | undefined {
  return typeof document !== 'undefined' ? document : undefined;
}

/**
 * Hook for safe localStorage access
 * Returns null during SSR, localStorage on client
 */
export function useLocalStorage() {
  const [storage, setStorage] = useState<Storage | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      setStorage(window.localStorage);
    }
  }, []);

  return storage;
}

/**
 * Hook for safe sessionStorage access
 * Returns null during SSR, sessionStorage on client
 */
export function useSessionStorage() {
  const [storage, setStorage] = useState<Storage | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      setStorage(window.sessionStorage);
    }
  }, []);

  return storage;
}
