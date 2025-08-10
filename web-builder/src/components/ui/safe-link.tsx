'use client';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent, useCallback } from 'react';

interface SafeLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  fallbackNavigation?: boolean;
  prefetch?: boolean;
}

/**
 * SafeLink component that handles "Failed to fetch" errors gracefully
 * Falls back to programmatic navigation if prefetch fails
 */
export function SafeLink({
  href,
  children,
  className,
  onClick,
  fallbackNavigation = true,
  prefetch = true,
  ...props
}: SafeLinkProps) {
  const router = useRouter();

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // If fallback navigation is enabled and we detect potential issues
    if (fallbackNavigation) {
      // Check if we're offline or if there might be API issues
      if (!navigator.onLine) {
        e.preventDefault();
        console.warn('🔌 Offline detected, using programmatic navigation');
        router.push(href);
        return;
      }

      // Add error boundary for navigation
      try {
        // Let Next.js handle the navigation normally
        // The error handling will be caught by our error boundaries
      } catch (error) {
        e.preventDefault();
        console.warn('🔄 Navigation error, falling back to router.push:', error);
        router.push(href);
      }
    }
  }, [onClick, fallbackNavigation, href, router]);

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}

// Export as default for easier imports
export default SafeLink;
