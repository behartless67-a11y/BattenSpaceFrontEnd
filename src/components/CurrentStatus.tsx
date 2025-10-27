"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const ROOMS = [
  { id: 'confa', name: 'Conference Room A L014', building: 'Garrett Hall' },
  { id: 'greathall', name: 'Great Hall 100', building: 'Garrett Hall' },
  { id: 'seminar', name: 'Seminar Room L039', building: 'Garrett Hall' },
  { id: 'studentlounge206', name: 'Student Lounge 206', building: 'Garrett Hall' },
  { id: 'pavx-upper', name: 'Pavilion X Upper Garden', building: 'Pavilion X' },
  { id: 'pavx-b1', name: 'Pavilion X Basement Room 1', building: 'Pavilion X' },
  { id: 'pavx-b2', name: 'Pavilion X Basement Room 2', building: 'Pavilion X' },
  { id: 'pavx-exhibit', name: 'Pavilion X Basement Exhibit', building: 'Pavilion X' },
];

// ICS files are from Outlook calendars
// Using CORS proxy to bypass CORS restrictions
const CORS_PROXY = 'https://corsproxy.io/?';

const ROOM_ICS_URLS: Record<string, string> = {
  'confa': 'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics',
  'greathall': 'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics',
  'seminar': 'https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics',
  'studentlounge206': 'https://outlook.office365.com/owa/calendar/bfd63ea7933c4c3d965a632e5d6b703d@virginia.edu/05f41146b7274347a5e374b91f0e7eda6953039659626971784/calendar.ics',
  'pavx-upper': 'https://outlook.office365.com/owa/calendar/52b9b2d41868473fac5d3e9963512a9b@virginia.edu/311e34fd14384759b006ccf185c1db677813060047149602177/calendar.ics',
  'pavx-b1': 'https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics',
  'pavx-b2': 'https://outlook.office365.com/owa/calendar/3f60cb3359dd40f7943b9de3b062b18d@virginia.edu/1e78265cf5eb44da903745ca3d872e6910017444746788834359/calendar.ics',
  'pavx-exhibit': 'https://outlook.office365.com/owa/calendar/4df4134c83844cef9d9357180ccfb48c@virginia.edu/e46a84ae5d8842d4b33a842ddc5ff66c11207228220277930183/calendar.ics',
};

const ROOM_IDENTIFIERS: Record<string, string> = {
  'confa': 'FBS-ConfA-L014',
  'greathall': 'FBS-GreatHall-100',
  'seminar': 'FBS-SeminarRoom-L039',
  'studentlounge206': 'FBS-StudentLounge-206',
  'pavx-upper': 'FBS-PavX-UpperGarden',
  'pavx-b1': 'FBS-PavX-BasementRoom1',
  'pavx-b2': 'FBS-PavX-BasementRoom2',
  'pavx-exhibit': 'FBS-PavX-',
};

interface CalendarEvent {
  summary: string;
  location?: string;
  startTime: Date;
  endTime: Date;
}

interface RoomStatus {
  id: string;
  name: string;
  building: string;
  isOccupied: boolean;
  currentEvent: CalendarEvent | null;
  nextEvent: CalendarEvent | null;
  availableUntil: Date | null;
  error: boolean;
}

function parseICSContent(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split('\n');
  let currentEvent: Partial<CalendarEvent> = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.startTime && currentEvent.endTime) {
        events.push({
          summary: currentEvent.summary || 'Untitled',
          location: currentEvent.location,
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
        });
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      } else if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.startTime = parseDateString(dateStr);
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.endTime = parseDateString(dateStr);
      }
    }
  }

  return events;
}

function parseDateString(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(9, 11));
  const minute = parseInt(dateStr.substring(11, 13));
  const second = parseInt(dateStr.substring(13, 15));

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function filterEventsByRoom(events: CalendarEvent[], roomIdentifier: string): CalendarEvent[] {
  return events.filter(event => event.location && event.location.includes(roomIdentifier));
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} min`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface CurrentStatusProps {
  selectedRoom: string;
}

export function CurrentStatus({ selectedRoom }: CurrentStatusProps) {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchRoomStatuses();
    // Refresh every 4 hours
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      fetchRoomStatuses();
    }, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const fetchRoomStatuses = async () => {
    try {
      const now = new Date();
      const roomsToFetch = selectedRoom === 'all' ? ROOMS : ROOMS.filter(r => r.id === selectedRoom);
      const statuses = await Promise.all(
        roomsToFetch.map(async (room) => {
          try {
            const icsUrl = ROOM_ICS_URLS[room.id];
            if (!icsUrl) {
              return {
                id: room.id,
                name: room.name,
                building: room.building,
                isOccupied: false,
                currentEvent: null,
                nextEvent: null,
                availableUntil: null,
                error: true,
              };
            }
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(icsUrl)}`);
            if (!response.ok) {
              return {
                id: room.id,
                name: room.name,
                building: room.building,
                isOccupied: false,
                currentEvent: null,
                nextEvent: null,
                availableUntil: null,
                error: true,
              };
            }

            const icsContent = await response.text();
            const allEvents = parseICSContent(icsContent);

            // Filter events for this specific room
            const roomIdentifier = ROOM_IDENTIFIERS[room.id];
            const events = roomIdentifier ? filterEventsByRoom(allEvents, roomIdentifier) : allEvents;

            // Sort events by start time
            const sortedEvents = events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            // Find current event (ongoing now)
            const currentEvent = sortedEvents.find(
              event => event.startTime <= now && event.endTime > now
            );

            // Find next upcoming event
            const nextEvent = sortedEvents.find(
              event => event.startTime > now
            );

            // Determine when the room will be available
            let availableUntil: Date | null = null;
            if (currentEvent) {
              availableUntil = currentEvent.endTime;
            } else if (nextEvent) {
              availableUntil = nextEvent.startTime;
            }

            return {
              id: room.id,
              name: room.name,
              building: room.building,
              isOccupied: !!currentEvent,
              currentEvent: currentEvent || null,
              nextEvent: nextEvent || null,
              availableUntil,
              error: false,
            };
          } catch (error) {
            console.error(`Error fetching status for ${room.name}:`, error);
            return {
              id: room.id,
              name: room.name,
              building: room.building,
              isOccupied: false,
              currentEvent: null,
              nextEvent: null,
              availableUntil: null,
              error: true,
            };
          }
        })
      );

      setRoomStatuses(statuses);
      setError(false);
    } catch (err) {
      console.error('Error fetching room statuses:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Current Status</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading room status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Current Status</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load room status</p>
      </div>
    );
  }

  const occupiedRooms = roomStatuses.filter(r => r.isOccupied && !r.error);
  const availableRooms = roomStatuses.filter(r => !r.isOccupied && !r.error);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Current Status</h2>
        </div>
        <div className="text-sm text-gray-500">
          Updated: {formatTime(currentTime)}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-800">Available</p>
          </div>
          <p className="text-3xl font-bold text-green-600">{availableRooms.length}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-800">Occupied</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{occupiedRooms.length}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">Total Rooms</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{ROOMS.length}</p>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roomStatuses.map((room) => (
          <div
            key={room.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
              room.error
                ? 'bg-gray-50 border-gray-200'
                : room.isOccupied
                ? 'bg-red-50 border-red-200 hover:border-red-300'
                : 'bg-green-50 border-green-200 hover:border-green-300'
            }`}
          >
            {/* Room Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {room.error ? (
                  <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : room.isOccupied ? (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-uva-navy truncate">{room.name.split(' ').slice(0, 3).join(' ')}</h4>
                </div>
              </div>
              {!room.error && (
                <span
                  className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${
                    room.isOccupied
                      ? 'bg-red-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {room.isOccupied ? 'BUSY' : 'FREE'}
                </span>
              )}
            </div>

            {/* Room Status Details */}
            <div className="space-y-2">
              {room.error ? (
                <p className="text-xs text-gray-500">Status unavailable</p>
              ) : room.isOccupied && room.currentEvent ? (
                <>
                  <p className="text-xs font-semibold text-red-700 truncate">
                    {room.currentEvent.summary}
                  </p>
                  <p className="text-xs text-gray-600">
                    Until {formatTime(room.currentEvent.endTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({getTimeUntil(room.currentEvent.endTime)})
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-green-700">Available Now</p>
                  {room.nextEvent ? (
                    <>
                      <p className="text-xs text-gray-600">
                        Next: {formatTime(room.nextEvent.startTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({getTimeUntil(room.nextEvent.startTime)})
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-600">No upcoming bookings</p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Refreshes automatically every 4 hours
      </p>
    </div>
  );
}
