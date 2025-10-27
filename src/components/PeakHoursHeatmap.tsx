"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const ROOMS = [
  { id: 'confa', name: 'Conf A' },
  { id: 'greathall', name: 'Great Hall' },
  { id: 'seminar', name: 'Seminar' },
  { id: 'studentlounge206', name: 'Lounge' },
  { id: 'pavx-upper', name: 'Pav X Upper' },
  { id: 'pavx-b1', name: 'Pav X B1' },
  { id: 'pavx-b2', name: 'Pav X B2' },
  { id: 'pavx-exhibit', name: 'Pav X Exhibit' },
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

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface HeatmapData {
  [roomId: string]: {
    [day: number]: {
      [hour: number]: number; // Number of bookings
    };
  };
}

function parseICSContent(icsContent: string): HeatmapData[string] {
  const heatmapData: HeatmapData[string] = {};

  // Initialize structure
  for (let day = 0; day < 7; day++) {
    heatmapData[day] = {};
    for (let hour = 8; hour <= 20; hour++) {
      heatmapData[day][hour] = 0;
    }
  }

  const lines = icsContent.split('\n');
  let currentEvent: any = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.startTime && currentEvent.endTime) {
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = currentEvent.startTime.getDay();
        // Convert to Monday = 0, Sunday = 6
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const startHour = currentEvent.startTime.getHours();
        const endHour = currentEvent.endTime.getHours();

        // Mark all hours during this event as occupied
        for (let hour = startHour; hour < endHour; hour++) {
          if (hour >= 8 && hour <= 20 && heatmapData[dayIndex]) {
            heatmapData[dayIndex][hour]++;
          }
        }
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.startTime = parseDateString(dateStr);
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.endTime = parseDateString(dateStr);
      }
    }
  }

  return heatmapData;
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

function getHeatColor(value: number, max: number): string {
  if (value === 0) return '#f3f4f6'; // gray-100
  const intensity = value / max;

  if (intensity < 0.2) return '#fed7aa'; // orange-200
  if (intensity < 0.4) return '#fdba74'; // orange-300
  if (intensity < 0.6) return '#fb923c'; // orange-400
  if (intensity < 0.8) return '#f97316'; // orange-500
  return '#ea580c'; // orange-600
}

interface PeakHoursHeatmapProps {
  selectedRoom: string;
}

export function PeakHoursHeatmap({ selectedRoom }: PeakHoursHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localRoomFilter, setLocalRoomFilter] = useState<string>('all');

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedRoom]);

  const fetchHeatmapData = async () => {
    try {
      const allData: HeatmapData = {};

      await Promise.all(
        ROOMS.map(async (room) => {
          try {
            const icsFile = ROOM_ICS_FILES[room.id];
            if (!icsFile) {
              allData[room.id] = {};
              return;
            }
            const response = await fetch(`${ICS_BASE_URL}${icsFile}`);
            if (!response.ok) {
              allData[room.id] = {};
              return;
            }

            const icsContent = await response.text();
            allData[room.id] = parseICSContent(icsContent);
          } catch (error) {
            console.error(`Error fetching heatmap for ${room.name}:`, error);
            allData[room.id] = {};
          }
        })
      );

      setHeatmapData(allData);
      setError(false);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Peak Hours Heatmap</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Peak Hours Heatmap</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load heatmap data</p>
      </div>
    );
  }

  // Aggregate data across all rooms or show selected room (use local filter)
  const displayData: HeatmapData[string] = {};

  if (localRoomFilter === 'all') {
    // Sum up all rooms
    for (let day = 0; day < 7; day++) {
      displayData[day] = {};
      for (let hour = 8; hour <= 20; hour++) {
        displayData[day][hour] = 0;
        Object.values(heatmapData).forEach(roomData => {
          displayData[day][hour] += roomData[day]?.[hour] || 0;
        });
      }
    }
  } else {
    // Show specific room
    Object.assign(displayData, heatmapData[localRoomFilter] || {});
  }

  // Find max value for color scaling
  const maxValue = Math.max(
    ...Object.values(displayData).flatMap(dayData =>
      Object.values(dayData)
    ),
    1
  );

  // Get the full room name for display
  const getFullRoomName = (roomId: string) => {
    const fullRooms = [
      { id: 'confa', name: 'Conference Room A L014' },
      { id: 'greathall', name: 'Great Hall 100' },
      { id: 'seminar', name: 'Seminar Room L039' },
      { id: 'studentlounge206', name: 'Student Lounge 206' },
      { id: 'pavx-upper', name: 'Pavilion X Upper Garden' },
      { id: 'pavx-b1', name: 'Pavilion X Basement Room 1' },
      { id: 'pavx-b2', name: 'Pavilion X Basement Room 2' },
      { id: 'pavx-exhibit', name: 'Pavilion X Basement Exhibit' },
    ];
    return fullRooms.find(r => r.id === roomId)?.name || roomId;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Peak Hours Heatmap</h2>
        </div>

        {/* Local Room Filter */}
        <select
          value={localRoomFilter}
          onChange={(e) => setLocalRoomFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-uva-navy focus:outline-none focus:border-uva-orange"
        >
          <option value="all">All Rooms Combined</option>
          <option disabled>──────────</option>
          {ROOMS.map((room) => (
            <option key={room.id} value={room.id}>
              {getFullRoomName(room.id)}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {localRoomFilter === 'all'
          ? 'Shows booking frequency across all rooms by day of week and time of day'
          : `Shows booking frequency for ${getFullRoomName(localRoomFilter)}`}
      </p>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour Labels */}
          <div className="flex mb-2">
            <div className="w-16"></div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs font-semibold text-gray-600 min-w-[40px]"
              >
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'p' : 'a'}
              </div>
            ))}
          </div>

          {/* Heatmap Rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex mb-1">
              <div className="w-16 flex items-center text-sm font-semibold text-gray-700">
                {day}
              </div>
              {HOURS.map((hour) => {
                const value = displayData[dayIndex]?.[hour] || 0;
                const color = getHeatColor(value, maxValue);

                return (
                  <div
                    key={hour}
                    className="flex-1 min-w-[40px] h-10 mx-0.5 rounded group relative"
                    style={{ backgroundColor: color }}
                    title={`${day} ${hour}:00 - ${value} bookings`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs font-bold rounded transition-opacity">
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">Booking Frequency:</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Low</span>
            <div className="flex gap-1">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#fed7aa' }}></div>
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#fdba74' }}></div>
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#fb923c' }}></div>
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <div className="w-6 h-4 rounded" style={{ backgroundColor: '#ea580c' }}></div>
            </div>
            <span className="text-xs text-gray-600">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
