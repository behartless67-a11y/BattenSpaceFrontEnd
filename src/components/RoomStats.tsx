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

// ICS files are publicly available at roomres.thebattenspace.org
// Mapping of room IDs to their ICS file sources
const ROOM_ICS_MAPPING: Record<string, string> = {
  'confa': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'greathall': 'https://roomres.thebattenspace.org/ics/GreatHall.ics',
  'seminar': 'https://roomres.thebattenspace.org/ics/SeminarRoom.ics',
  'studentlounge206': 'https://roomres.thebattenspace.org/ics/ConfA.ics', // StudentLounge events are in ConfA.ics
  'pavx-upper': 'https://roomres.thebattenspace.org/ics/ConfA.ics', // PavX events are in ConfA.ics
  'pavx-b1': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-b2': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
  'pavx-exhibit': 'https://roomres.thebattenspace.org/ics/ConfA.ics',
};

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
  rrule?: string;
  uid?: string;
  _isRecurringParent?: boolean;
  _isRecurringInstance?: boolean;
}

function expandRecurringEvent(parentEvent: CalendarEvent): CalendarEvent[] {
  const instances: CalendarEvent[] = [];
  const rrule = parentEvent.rrule;

  if (!rrule) return instances;

  // Parse basic RRULE format: FREQ=WEEKLY;UNTIL=20251216T204500Z;INTERVAL=1;BYDAY=TU;WKST=SU
  const rruleParams: Record<string, string> = {};
  rrule.split(';').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      rruleParams[key] = value;
    }
  });

  if (rruleParams.FREQ === 'WEEKLY' && rruleParams.BYDAY) {
    const startDate = new Date(parentEvent.startTime);
    const endDate = new Date(parentEvent.endTime);
    const duration = endDate.getTime() - startDate.getTime(); // Duration in milliseconds

    // Parse UNTIL date if present
    let untilDate: Date | null = null;
    if (rruleParams.UNTIL) {
      // Parse UNTIL format: 20251216T204500Z
      const untilStr = rruleParams.UNTIL;
      const parsedUntil = parseDateString(untilStr);
      if (parsedUntil) {
        untilDate = parsedUntil;
      }
    }

    // Map day abbreviations to day numbers (0 = Sunday)
    const dayMap: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
    const targetDay = dayMap[rruleParams.BYDAY];

    if (targetDay !== undefined) {
      // Only expand up to the UNTIL date, or a reasonable max of 1 year from start
      const oneYearFromStart = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
      const maxDate = untilDate || oneYearFromStart;

      let currentDate = new Date(startDate);

      // Find the first occurrence on the target day
      while (currentDate.getDay() !== targetDay && currentDate < maxDate) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Generate weekly instances
      while (currentDate <= maxDate) {
        const instanceStart = new Date(currentDate);
        const instanceEnd = new Date(instanceStart.getTime() + duration);

        // Create a new event instance
        const instance: CalendarEvent = {
          summary: parentEvent.summary || 'Untitled',
          startTime: instanceStart,
          endTime: instanceEnd,
          duration: (instanceEnd.getTime() - instanceStart.getTime()) / (1000 * 60),
          uid: `${parentEvent.uid || 'unknown'}_${instanceStart.getTime()}`,
          _isRecurringInstance: true,
        };

        instances.push(instance);

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
  }

  return instances;
}

function parseICSContent(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split(/\r?\n/); // Handle both \n and \r\n line endings
  const seenUIDs = new Set<string>(); // Track UIDs to detect duplicates

  let currentEvent: Partial<CalendarEvent> = {};
  let inEvent = false;
  let eventCount = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ? lines[i].trim() : '';

    // Handle line continuation (lines starting with space or tab)
    while (i + 1 < lines.length && lines[i + 1] && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i] ? lines[i].substring(1) : '';
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      eventCount++;
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.startTime && currentEvent.endTime) {
        const duration = (currentEvent.endTime.getTime() - currentEvent.startTime.getTime()) / (1000 * 60);
        const event: CalendarEvent = {
          summary: currentEvent.summary || 'Untitled',
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
          duration,
          rrule: currentEvent.rrule,
          uid: currentEvent.uid,
        };

        // Check for duplicate UID
        if (event.uid) {
          if (seenUIDs.has(event.uid)) {
            // Skip this duplicate event entirely (silently)
            inEvent = false;
            continue;
          }
          seenUIDs.add(event.uid);
        } else {
          console.warn(`⚠️ Event without UID: "${event.summary}" at ${event.startTime?.toISOString()}`);
        }

        // Handle recurring events (RRULE)
        if (event.rrule && event.startTime && event.endTime) {
          console.log(`🔁 Found recurring event: ${event.summary}`);
          const recurringEvents = expandRecurringEvent(event);
          if (recurringEvents.length > 0) {
            console.log(`🔁 Expanded into ${recurringEvents.length} instances`);
            // Add expanded instances to events array
            events.push(...recurringEvents);
            // Mark original as processed so it doesn't get added again
            event._isRecurringParent = true;
          }
        }

        // Only add the event if it's not a recurring parent
        if (!event._isRecurringParent) {
          events.push(event);
        }
      }
      inEvent = false;
    } else if (inEvent && line) {
      // Parse event properties using the same approach as RoomTool
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      if (key === 'SUMMARY') {
        currentEvent.summary = value;
      } else if (key.startsWith('DTSTART')) {
        const parsedDate = parseDateString(value, key);
        if (parsedDate) {
          currentEvent.startTime = parsedDate;
        }
      } else if (key.startsWith('DTEND')) {
        const parsedDate = parseDateString(value, key);
        if (parsedDate) {
          currentEvent.endTime = parsedDate;
        }
      } else if (key === 'RRULE') {
        currentEvent.rrule = value;
      } else if (key === 'UID') {
        currentEvent.uid = value;
      }
    }
  }

  // Calculate date range of all events for debugging
  if (events.length > 0) {
    const dates = events.map(e => e.startTime.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    console.log(`📊 Parsed ${eventCount} total events, ${events.length} valid events with dates (including recurring instances)`);
    console.log(`   Date range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`);
    console.log(`   Sample events:`, events.slice(0, 3).map(e => `${e.summary} on ${e.startTime.toLocaleString()}`));
  }

  return events;
}

function parseDateString(dateStr: string, key?: string): Date | null {
  try {
    const cleanValue = dateStr.trim();

    if (!cleanValue || cleanValue.length < 8) {
      return null;
    }

    // Handle timezone info in the key (e.g., DTSTART;TZID=Eastern Standard Time)
    const tzidMatch = key ? key.match(/TZID=([^;:]+)/) : null;
    const timezone = tzidMatch ? tzidMatch[1] : null;

    // Parse date-only format (YYYYMMDD)
    if (cleanValue.length === 8) {
      const year = parseInt(cleanValue.substring(0, 4));
      const month = parseInt(cleanValue.substring(4, 6)) - 1;
      const day = parseInt(cleanValue.substring(6, 8));

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }

      return new Date(year, month, day);
    }

    // Parse datetime format (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
    if (cleanValue.length === 15 || cleanValue.length === 16) {
      const year = parseInt(cleanValue.substring(0, 4));
      const month = parseInt(cleanValue.substring(4, 6)) - 1;
      const day = parseInt(cleanValue.substring(6, 8));
      const hour = parseInt(cleanValue.substring(9, 11));
      const minute = parseInt(cleanValue.substring(11, 13));
      const second = parseInt(cleanValue.substring(13, 15));

      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        return null;
      }

      // Handle UTC time (ends with Z)
      if (cleanValue.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }

      // For timezone-aware dates or default: treat all as UTC
      // This ensures consistent behavior regardless of browser timezone settings
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    return null;
  } catch (e) {
    return null;
  }
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
  // Use UTC dates to match the ICS event dates which are parsed as UTC
  const now = new Date();
  console.log(`🕐 Current date from browser: ${now.toString()}`);
  console.log(`🕐 Current UTC date: ${now.toUTCString()}`);

  const endDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999
  ));

  const startDate = new Date(endDate);
  // Subtract (daysToCheck - 1) to get exactly daysToCheck days inclusive
  // e.g., for 7 days: Oct 18 - 6 = Oct 12, giving us Oct 12-18 (7 days)
  startDate.setUTCDate(startDate.getUTCDate() - (daysToCheck - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  // Filter events within the date range (past daysToCheck days)
  const recentEvents = events.filter(event => {
    return event.startTime >= startDate && event.startTime <= endDate;
  });

  const totalMinutes = recentEvents.reduce((sum, event) => sum + event.duration, 0);
  const totalHours = totalMinutes / 60;
  const averageHoursPerDay = totalHours / daysToCheck;

  // DETAILED LOGGING: Show exactly which events are being counted
  console.log(`\n📊 === DETAILED EVENT BREAKDOWN ===`);
  console.log(`Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
  console.log(`Start date ISO: ${startDate.toISOString()}`);
  console.log(`End date ISO: ${endDate.toISOString()}`);
  console.log(`Total events in feed: ${events.length}`);
  console.log(`Events in range: ${recentEvents.length}`);
  console.log(`\n🔍 Events being counted:`);

  // Group events by date for easier reading
  const eventsByDate: Record<string, Array<{summary: string, duration: number, start: string}>> = {};
  recentEvents.forEach(event => {
    const dateKey = event.startTime.toLocaleDateString();
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push({
      summary: event.summary,
      duration: event.duration,
      start: event.startTime.toISOString()
    });
  });

  Object.keys(eventsByDate).sort().forEach(date => {
    const dayEvents = eventsByDate[date];
    const dayHours = dayEvents.reduce((sum, e) => sum + e.duration, 0) / 60;
    console.log(`\n  📅 ${date} (${dayHours.toFixed(2)} hours):`);
    dayEvents.forEach(e => {
      console.log(`    • ${e.summary} - ${(e.duration / 60).toFixed(2)}h (${e.start})`);
    });
  });

  console.log(`\n📈 Summary:`);
  console.log(`  Total hours: ${totalHours.toFixed(2)}`);
  console.log(`  Days checked: ${daysToCheck}`);
  console.log(`  Average hours/day: ${averageHoursPerDay.toFixed(2)}`);
  console.log(`=================================\n`);

  return Math.round(averageHoursPerDay * 10) / 10;
}

interface RoomStatsProps {
  selectedTimeRange: 'day' | 'week' | 'month';
  selectedRoom: string;
}

export function RoomStats({ selectedTimeRange, selectedRoom }: RoomStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localRoomFilter, setLocalRoomFilter] = useState<string>('top5');

  useEffect(() => {
    fetchStats();
    // Refresh every 4 hours
    const interval = setInterval(fetchStats, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeRange, selectedRoom]);

  const getDaysForRange = () => {
    switch (selectedTimeRange) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 7;
    }
  };

  const fetchStats = async () => {
    try {
      const fetchId = Math.random().toString(36).substring(7);
      console.log(`\n🔵 === RoomStats fetchStats called (ID: ${fetchId}) ===`);
      const daysToCheck = getDaysForRange();
      const roomsToFetch = selectedRoom === 'all' ? ROOMS : ROOMS.filter(r => r.id === selectedRoom);
      console.log(`Fetching ${roomsToFetch.length} rooms, ${daysToCheck} days`);
      const roomStats = await Promise.all(
        roomsToFetch.map(async (room) => {
          try {
            console.log(`\n🏢 [${fetchId}] ========== FETCHING DATA FOR: ${room.name.toUpperCase()} ==========`);
            const icsUrl = ROOM_ICS_MAPPING[room.id];
            if (!icsUrl) {
              console.error(`No ICS mapping found for room: ${room.id}`);
              return {
                id: room.id,
                name: room.name,
                building: room.building,
                averageHoursPerDay: 0,
                todayEvents: 0,
                error: true,
              };
            }
            const response = await fetch(icsUrl, { mode: 'cors' });

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
  const allRoomsSorted = [...stats.rooms]
    .filter(room => !room.error)
    .sort((a, b) => b.averageHoursPerDay - a.averageHoursPerDay);

  const topRooms = allRoomsSorted.slice(0, 5);

  // Get the selected room for display
  const displayRooms = localRoomFilter === 'top5'
    ? topRooms
    : allRoomsSorted.filter(room => room.id === localRoomFilter);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Room Usage Statistics</h2>
        </div>

        {/* Local Room Filter */}
        <select
          value={localRoomFilter}
          onChange={(e) => setLocalRoomFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-uva-navy focus:outline-none focus:border-uva-orange"
        >
          <option value="top5">Top 5 Rooms</option>
          <option disabled>──────────</option>
          {ROOMS.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
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
            {selectedTimeRange === 'day' ? 'Today' : selectedTimeRange === 'week' ? '7-day' : '30-day'} average, all rooms
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

      {/* Rooms Display */}
      <div>
        <h3 className="text-lg font-bold text-uva-navy mb-3">
          {localRoomFilter === 'top5' ? 'Most Used Rooms' : 'Room Details'}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Average hours per day over the last {selectedTimeRange === 'day' ? 'day' : selectedTimeRange === 'week' ? '7 days' : '30 days'}
        </p>
        <div className="space-y-2">
          {displayRooms.map((room, index) => (
            <div
              key={room.id}
              className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                localRoomFilter !== 'top5' ? 'border-2 border-uva-orange' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {localRoomFilter === 'top5' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-uva-orange text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-uva-navy text-lg">{room.name}</p>
                    <p className="text-sm text-gray-500">{room.building}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-uva-orange">{room.averageHoursPerDay}h</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
              </div>

              {/* Enhanced details when viewing single room */}
              {localRoomFilter !== 'top5' && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Today's Events</p>
                    <p className="text-2xl font-bold text-uva-navy">{room.todayEvents}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Hours ({selectedTimeRange})</p>
                    <p className="text-2xl font-bold text-uva-navy">
                      {(room.averageHoursPerDay * getDaysForRange()).toFixed(1)}h
                    </p>
                  </div>
                </div>
              )}

              {/* Compact view for top 5 */}
              {localRoomFilter === 'top5' && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{room.todayEvents} events today</span>
                  <span>{(room.averageHoursPerDay * getDaysForRange()).toFixed(1)}h total</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {localRoomFilter !== 'top5' && displayRooms.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What does this mean?</strong> This room was used an average of{' '}
              <strong>{displayRooms[0].averageHoursPerDay} hours per day</strong> over the{' '}
              {selectedTimeRange === 'day' ? 'last day' : selectedTimeRange === 'week' ? 'last 7 days' : 'last 30 days'}.
              {' '}That's a total of <strong>{(displayRooms[0].averageHoursPerDay * getDaysForRange()).toFixed(1)} hours</strong> during this period.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}
