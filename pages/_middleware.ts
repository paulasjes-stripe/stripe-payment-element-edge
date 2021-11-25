import type { NextFetchEvent } from 'next/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { nextUrl: url, geo } = req;
  const country = geo.country?.replace('%20', ' ') || 'US';

  url.searchParams.set('country', country);

  return NextResponse.rewrite(url);
}