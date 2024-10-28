import { NextRequest, NextResponse } from 'next/server';
import { JWTManager } from '../lib/jwt';
import { SessionManager } from '../lib/redis';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Get session token from cookie
  const sessionToken = request.cookies.get('sessionToken')?.value;
  
  // Protected routes configuration
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const authPaths = ['/auth/login', '/auth/signup'];
  const currentPath = request.nextUrl.pathname;
  
  const isProtectedPath = protectedPaths.some(path => 
    currentPath.startsWith(path)
  );
  const isAuthPath = authPaths.some(path => 
    currentPath.startsWith(path)
  );
  
  // Verify session
  let session = null;
  if (sessionToken) {
    const sessionId = JWTManager.verify(sessionToken);
    if (sessionId) {
      session = await SessionManager.getSession(sessionId);
      
      // Update last path if session exists
      if (session && !isAuthPath) {
        await SessionManager.updateLastPath(sessionId, currentPath);
      }
    }
  }
  
  // Handle protected routes
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', currentPath);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect logged-in users away from auth pages
  if (isAuthPath && session) {
    const redirectPath = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
