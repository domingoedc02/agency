import { NextResponse, type NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';
import { requestIdFrom } from '@/lib/security/request-id';

export function middleware(request: NextRequest): NextResponse {
  const requestId = requestIdFrom(request);
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
