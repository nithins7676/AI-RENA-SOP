// Example middleware.ts fix
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip authentication check for API routes and login page
  if (path.startsWith('/api/') || path === '/login' || path === '/signup' ) {
    return NextResponse.next();
  }
  
  // Check for authentication
  const isLogged = request.cookies.get('isLogged')?.value === 'true';
  
  if (!isLogged) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};