import { NextRequest, NextResponse } from 'next/server';

// Mapping of room IDs to their ICS file URLs
const ROOM_ICS_MAPPING: Record<string, string> = {
  'confa': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'greathall': 'https://roomres.thebattenspace.org/ics/GreatHall.ics',
  'seminar': 'https://roomres.thebattenspace.org/ics/SeminarRoom.ics',
  'studentlounge206': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-upper': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-b1': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-b2': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-exhibit': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('room');

  if (!roomId) {
    return NextResponse.json(
      { error: 'Room ID is required' },
      { status: 400 }
    );
  }

  const icsUrl = ROOM_ICS_MAPPING[roomId];

  if (!icsUrl) {
    return NextResponse.json(
      { error: `Invalid room ID: ${roomId}` },
      { status: 404 }
    );
  }

  try {
    // Fetch the ICS file from roomres.thebattenspace.org
    const response = await fetch(icsUrl, {
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ICS file: ${response.statusText}`);
    }

    const icsContent = await response.text();

    // Return the ICS content with appropriate headers
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('Error fetching ICS file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
