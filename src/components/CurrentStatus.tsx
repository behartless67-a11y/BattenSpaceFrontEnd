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

// ICS files are publicly available at roomres.thebattenspace.org
const ICS_BASE_URL = 'https://roomres.thebattenspace.org/ics/';

const ROOM_ICS_FILES: Record<string, string> = {
  'confa': 'ConfA.ics',
  'greathall': 'GreatHall.ics',
  'seminar': 'SeminarRoom.ics',
  'studentlounge206': 'ConfA.ics',
  'pavx-upper': 'ConfA.ics',
  'pavx-b1': 'ConfA.ics',
  'pavx-b2': 'ConfA.ics',
  'pavx-exhibit': 'ConfA.ics',
};

interface CalendarEvent {
  summary: string;
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
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
        });
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
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
            const icsFile = ROOM_ICS_FILES[room.id];
            if (!icsFile) {
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
            const response = await fetch(`${ICS_BASE_URL}${icsFile}`);
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
            const events = parseICSContent(icsContent);

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
