import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware to handle API errors and prefetch issues
 * This helps prevent "Failed to fetch" errors from breaking navigation
 */
export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Add CORS headers for API routes
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // Handle prefetch requests
  if (request.headers.get('purpose') === 'prefetch' || 
      request.headers.get('x-purpose') === 'prefetch') {
    
    // Add headers to help with prefetch error handling
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('X-Prefetch-Safe', 'true');
    
    return response;
  }

  // Continue with normal request processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
