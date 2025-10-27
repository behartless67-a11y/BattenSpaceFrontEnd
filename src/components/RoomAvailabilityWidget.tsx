"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";

interface RoomStatus {
  name: string;
  available: boolean;
  nextEvent?: string;
}

interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
}

export function RoomAvailabilityWidget() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);

  const ROOM_CONFIG = [
    { id: "greathall", name: "Great Hall 100" },
    { id: "confa", name: "Conference Room A L014" },
    { id: "seminar", name: "Seminar Room L039" },
    { id: "studentlounge206", name: "Student Lounge 206" },
    { id: "pavx-upper", name: "Pavilion X Upper Garden" },
  ];

  const ROOM_ICS_MAPPING: Record<string, string> = {
    'confa': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
    'greathall': 'https://roomres.thebattenspace.org/ics/GreatHall.ics',
    'seminar': 'https://roomres.thebattenspace.org/ics/SeminarRoom.ics',
    'studentlounge206': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
    'pavx-upper': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  };

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const now = new Date();
        const roomStatuses: RoomStatus[] = [];

        for (const room of ROOM_CONFIG) {
          try {
            const icsUrl = ROOM_ICS_MAPPING[room.id];
            if (!icsUrl) {
              roomStatuses.push({ name: room.name, available: true });
              continue;
            }
            const response = await fetch(icsUrl, { cache: 'no-cache', mode: 'cors' });

            if (!response.ok) {
              roomStatuses.push({ name: room.name, available: true });
              continue;
            }

            const data = await response.text();
            const events = parseICS(data);

            // Check if room is currently in use
            const currentEvent = events.find(event =>
              event.startTime <= now && event.endTime > now
            );

            if (currentEvent) {
              roomStatuses.push({
                name: room.name,
                available: false,
                nextEvent: formatTime(currentEvent.endTime)
              });
            } else {
              // Find next upcoming event today
              const nextEvent = events.find(event => event.startTime > now);
              roomStatuses.push({
                name: room.name,
                available: true,
                nextEvent: nextEvent ? formatTime(nextEvent.startTime) : undefined
              });
            }
          } catch (err) {
            console.error(`Error fetching ${room.name}:`, err);
            roomStatuses.push({ name: room.name, available: true });
          }
        }

        setRooms(roomStatuses);
        setAvailableCount(roomStatuses.filter(r => r.available).length);
      } catch (err) {
        console.error('Error fetching room statuses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, []);

  // Simple ICS parser for events
  const parseICS = (icsData: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const lines = icsData.split('\n');
    let currentEvent: Partial<CalendarEvent> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.startTime = parseICSDate(dateStr);
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.endTime = parseICSDate(dateStr);
      } else if (line.startsWith('SUMMARY')) {
        currentEvent.summary = line.substring(8);
      } else if (line === 'END:VEVENT' && currentEvent.startTime && currentEvent.endTime) {
        events.push(currentEvent as CalendarEvent);
      }
    }

    return events;
  };

  const parseICSDate = (dateStr: string): Date => {
    // Format: 20251020T140000Z or 20251020T140000
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));

    return new Date(Date.UTC(year, month, day, hour, minute));
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 h-full">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <Calendar className="w-5 h-5 text-uva-orange" />
        <h3 className="font-semibold text-uva-navy">Room Availability</h3>
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-uva-navy">{availableCount}/{rooms.length}</div>
        <div className="text-sm text-gray-600">Rooms available now</div>
      </div>

      <div className="space-y-2">
        {rooms.map((room, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm py-1 border-t border-gray-100 first:border-t-0"
          >
            <span className="text-gray-700 truncate flex-1">{room.name}</span>
            {room.available ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500">{room.nextEvent}</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      <a
        href="https://roomres.thebattenspace.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-uva-orange hover:text-uva-orange-light font-semibold transition-colors"
      >
        View Full Schedule →
      </a>
    </div>
  );
}
