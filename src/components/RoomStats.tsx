"use client";

import { useEffect, useState } from "react";
import { BarChart, Clock, Calendar } from "lucide-react";

// Room configuration from the RoomTool
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

const AZURE_FUNCTION_URL = 'https://roomtool-calendar-function.azurewebsites.net/api/getcalendar';

interface RoomStat {
  id: string;
  name: string;
  building: string;
  averageHoursPerDay: number;
  todayEvents: number;
  error: boolean;
}

interface StatsData {
  rooms: RoomStat[];
  summary: {
    totalRooms: number;
    averageHoursAcrossRooms: number;
    totalTodayEvents: number;
  };
  lastUpdated: string;
}

interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  duration: number;
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
        const duration = (currentEvent.endTime.getTime() - currentEvent.startTime.getTime()) / (1000 * 60);
        events.push({
          summary: currentEvent.summary || 'Untitled',
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
          duration,
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

function getTodayEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return events.filter(event => {
    return event.startTime >= today && event.startTime < tomorrow;
  });
}

function calculateAverageHoursPerDay(events: CalendarEvent[], daysToCheck: number = 7): number {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToCheck);
  startDate.setHours(0, 0, 0, 0);

  const recentEvents = events.filter(event => event.startTime >= startDate);
  const totalMinutes = recentEvents.reduce((sum, event) => sum + event.duration, 0);
  const averageMinutesPerDay = totalMinutes / daysToCheck;
  const averageHoursPerDay = averageMinutesPerDay / 60;

  return Math.round(averageHoursPerDay * 10) / 10;
}

export function RoomStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchStats();
    // Refresh every 15 minutes
    const interval = setInterval(fetchStats, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const getDaysForRange = () => {
    switch (timeRange) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 7;
    }
  };

  const fetchStats = async () => {
    try {
      const daysToCheck = getDaysForRange();
      const roomStats = await Promise.all(
        ROOMS.map(async (room) => {
          try {
            const response = await fetch(`${AZURE_FUNCTION_URL}?room=${room.id}`);

            if (!response.ok) {
              console.error(`Failed to fetch calendar for ${room.name}`);
              return {
                id: room.id,
                name: room.name,
                building: room.building,
                averageHoursPerDay: 0,
                todayEvents: 0,
                error: true,
              };
            }

            const icsContent = await response.text();
            const events = parseICSContent(icsContent);
            const todayEvents = getTodayEvents(events);
            const averageHoursPerDay = calculateAverageHoursPerDay(events, daysToCheck);

            return {
              id: room.id,
              name: room.name,
              building: room.building,
              averageHoursPerDay,
              todayEvents: todayEvents.length,
              error: false,
            };
          } catch (error) {
            console.error(`Error processing room ${room.name}:`, error);
            return {
              id: room.id,
              name: room.name,
              building: room.building,
              averageHoursPerDay: 0,
              todayEvents: 0,
              error: true,
            };
          }
        })
      );

      const totalAverageHours = roomStats.reduce((sum, room) => sum + room.averageHoursPerDay, 0);
      const totalTodayEvents = roomStats.reduce((sum, room) => sum + room.todayEvents, 0);
      const averageHoursAcrossRooms = Math.round((totalAverageHours / roomStats.length) * 10) / 10;

      setStats({
        rooms: roomStats,
        summary: {
          totalRooms: ROOMS.length,
          averageHoursAcrossRooms,
          totalTodayEvents,
        },
        lastUpdated: new Date().toISOString(),
      });
      setError(false);
    } catch (err) {
      console.error('Error fetching room stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Room Usage Statistics</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Room Usage Statistics</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load room statistics</p>
      </div>
    );
  }

  // Sort rooms by average hours (highest first)
  const topRooms = [...stats.rooms]
    .filter(room => !room.error)
    .sort((a, b) => b.averageHoursPerDay - a.averageHoursPerDay)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Room Usage Statistics</h2>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              timeRange === 'day'
                ? 'bg-uva-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              timeRange === 'week'
                ? 'bg-uva-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              timeRange === 'month'
                ? 'bg-uva-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-uva-navy to-uva-navy/90 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Avg Hours/Day</p>
          </div>
          <p className="text-3xl font-bold">{stats.summary.averageHoursAcrossRooms}</p>
          <p className="text-xs opacity-75 mt-1">
            {timeRange === 'day' ? 'Today' : timeRange === 'week' ? '7-day' : '30-day'} average, all rooms
          </p>
        </div>

        <div className="bg-gradient-to-br from-uva-orange to-uva-orange/90 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Today's Events</p>
          </div>
          <p className="text-3xl font-bold">{stats.summary.totalTodayEvents}</p>
          <p className="text-xs opacity-75 mt-1">Scheduled bookings</p>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Active Rooms</p>
          </div>
          <p className="text-3xl font-bold">{stats.summary.totalRooms}</p>
          <p className="text-xs opacity-75 mt-1">Being tracked</p>
        </div>
      </div>

      {/* Top Rooms Table */}
      <div>
        <h3 className="text-lg font-bold text-uva-navy mb-3">Most Used Rooms</h3>
        <p className="text-sm text-gray-600 mb-3">
          Average hours per day over the last {timeRange === 'day' ? 'day' : timeRange === 'week' ? '7 days' : '30 days'}
        </p>
        <div className="space-y-2">
          {topRooms.map((room, index) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-uva-orange text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-uva-navy">{room.name}</p>
                  <p className="text-xs text-gray-500">{room.building}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-uva-orange">{room.averageHoursPerDay}h</p>
                <p className="text-xs text-gray-500">{room.todayEvents} today</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}
