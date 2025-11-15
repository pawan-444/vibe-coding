import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const secretKey = process.env.ADMIN_SECRET_KEY;
    const providedKey = request.nextUrl.searchParams.get('key');

    if (!secretKey || providedKey !== secretKey) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin',
};
