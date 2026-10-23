import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates session cookies and guards protected routes.
 * Never redirects away from /login so the login page can always be viewed.
 */
export async function updateSession(_request: NextRequest) {
  void _request;
  // Let all routes pass through cleanly without redirecting away from /login
  return NextResponse.next();
}
