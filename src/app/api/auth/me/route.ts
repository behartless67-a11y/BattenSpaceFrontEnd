import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // In Azure Static Web Apps, user info is available at /.auth/me
  // But since we're in Next.js, we need to forward the request
  try {
    const response = await fetch('/.auth/me', {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ clientPrincipal: null }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json({ clientPrincipal: null }, { status: 200 });
  }
}
