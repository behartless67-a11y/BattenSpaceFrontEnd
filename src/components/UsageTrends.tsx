"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

const ROOMS = [
  { id: 'confa', name: 'Conference Room A', building: 'Garrett Hall', color: '#232d4b' },
  { id: 'greathall', name: 'Great Hall', building: 'Garrett Hall', color: '#e57200' },
  { id: 'seminar', name: 'Seminar Room', building: 'Garrett Hall', color: '#00758D' },
  { id: 'studentlounge206', name: 'Student Lounge', building: 'Garrett Hall', color: '#E89923' },
  { id: 'pavx-upper', name: 'Pavilion X Upper', building: 'Pavilion X', color: '#8B4513' },
];

const AZURE_FUNCTION_URL = 'https://roomtool-calendar-function.azurewebsites.net/api/getcalendar';

interface DailyUsage {
  date: string;
  hours: number;
}

interface RoomTrend {
  roomId: string;
  roomName: string;
  color: string;
  dailyUsage: DailyUsage[];
}

function expandRecurringEvent(parentEvent: any): Array<{ startTime: Date; endTime: Date }> {
  const instances: Array<{ startTime: Date; endTime: Date }> = [];
  const rrule = parentEvent.rrule;

  if (!rrule) return instances;

  const rruleParams: Record<string, string> = {};
  rrule.split(';').forEach((param: string) => {
    const [key, value] = param.split('=');
    if (key && value) {
      rruleParams[key] = value;
    }
  });

  if (rruleParams.FREQ === 'WEEKLY' && rruleParams.BYDAY) {
    const startDate = new Date(parentEvent.startTime);
    const endDate = new Date(parentEvent.endTime);
    const duration = endDate.getTime() - startDate.getTime();

    let untilDate: Date | null = null;
    if (rruleParams.UNTIL) {
      const parsedUntil = parseDateString(rruleParams.UNTIL);
      if (parsedUntil) {
        untilDate = parsedUntil;
      }
    }

    const dayMap: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
    const targetDay = dayMap[rruleParams.BYDAY];

    if (targetDay !== undefined) {
      const oneYearFromStart = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
      const maxDate = untilDate || oneYearFromStart;

      let currentDate = new Date(startDate);

      while (currentDate.getDay() !== targetDay && currentDate < maxDate) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      while (currentDate <= maxDate) {
        const instanceStart = new Date(currentDate);
        const instanceEnd = new Date(instanceStart.getTime() + duration);

        instances.push({
          startTime: instanceStart,
          endTime: instanceEnd,
        });

        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
  }

  return instances;
}

function parseICSContent(icsContent: string, daysBack: number = 14): DailyUsage[] {
  const events: Array<{ startTime: Date; endTime: Date }> = [];
  const lines = icsContent.split(/\r?\n/);
  const seenUIDs = new Set<string>(); // Track UIDs to detect duplicates
  let currentEvent: any = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ? lines[i].trim() : '';

    // Handle line continuation
    while (i + 1 < lines.length && lines[i + 1] && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i] ? lines[i].substring(1) : '';
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.startTime && currentEvent.endTime) {
        // Check for duplicate UID
        if (currentEvent.uid) {
          if (seenUIDs.has(currentEvent.uid)) {
            // Skip this duplicate event entirely
            inEvent = false;
            continue;
          }
          seenUIDs.add(currentEvent.uid);
        }

        // Handle recurring events (RRULE)
        if (currentEvent.rrule) {
          const recurringEvents = expandRecurringEvent(currentEvent);
          events.push(...recurringEvents);
        } else {
          events.push({
            startTime: currentEvent.startTime,
            endTime: currentEvent.endTime,
          });
        }
      }
      inEvent = false;
    } else if (inEvent && line) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      if (key.startsWith('DTSTART')) {
        const parsedDate = parseDateString(value, key);
        if (parsedDate) currentEvent.startTime = parsedDate;
      } else if (key.startsWith('DTEND')) {
        const parsedDate = parseDateString(value, key);
        if (parsedDate) currentEvent.endTime = parsedDate;
      } else if (key === 'RRULE') {
        currentEvent.rrule = value;
      } else if (key === 'UID') {
        currentEvent.uid = value;
      }
    }
  }

  // Group events by day
  // Use UTC dates to match the ICS event dates which are parsed as UTC
  const now = new Date();
  const endDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999
  ));

  const startDate = new Date(endDate);
  // Subtract (daysBack - 1) to get exactly daysBack days inclusive
  startDate.setUTCDate(startDate.getUTCDate() - (daysBack - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  const dailyUsageMap: { [key: string]: number } = {};

  // Initialize all days to 0
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailyUsageMap[dateKey] = 0;
  }

  // Calculate usage for each day
  events.forEach(event => {
    if (event.startTime >= startDate && event.startTime <= endDate) {
      const dateKey = event.startTime.toISOString().split('T')[0];
      const durationHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);

      if (dailyUsageMap[dateKey] !== undefined) {
        dailyUsageMap[dateKey] += durationHours;
      }
    }
  });

  return Object.entries(dailyUsageMap).map(([date, hours]) => ({
    date,
    hours: Math.round(hours * 10) / 10,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function parseDateString(dateStr: string, key?: string): Date | null {
  try {
    const cleanValue = dateStr.trim();

    if (!cleanValue || cleanValue.length < 8) {
      return null;
    }

    // Handle timezone info in the key
    const tzidMatch = key ? key.match(/TZID=([^;:]+)/) : null;
    const timezone = tzidMatch ? tzidMatch[1] : null;

    // Parse date-only format
    if (cleanValue.length === 8) {
      const year = parseInt(cleanValue.substring(0, 4));
      const month = parseInt(cleanValue.substring(4, 6)) - 1;
      const day = parseInt(cleanValue.substring(6, 8));

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }

      return new Date(year, month, day);
    }

    // Parse datetime format
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

      if (cleanValue.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }

      if (timezone === 'Eastern Standard Time') {
        return new Date(year, month, day, hour, minute, second);
      }

      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    return null;
  } catch (e) {
    return null;
  }
}

interface UsageTrendsProps {
  selectedTimeRange: 'day' | 'week' | 'month';
  selectedRoom: string;
}

export function UsageTrends({ selectedTimeRange, selectedRoom }: UsageTrendsProps) {
  const [trends, setTrends] = useState<RoomTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, [selectedTimeRange, selectedRoom]);

  const getDaysForRange = () => {
    switch (selectedTimeRange) {
      case 'day': return 1;
      case 'week': return 14;  // Show 14 days for better trend visualization
      case 'month': return 30;
      default: return 14;
    }
  };

  const fetchTrends = async () => {
    try {
      const daysBack = getDaysForRange();
      const roomsToFetch = selectedRoom === 'all'
        ? ROOMS
        : ROOMS.filter(r => r.id === selectedRoom);

      const roomTrends = await Promise.all(
        roomsToFetch.map(async (room) => {
          try {
            const response = await fetch(`${AZURE_FUNCTION_URL}?room=${room.id}`);
            if (!response.ok) {
              return {
                roomId: room.id,
                roomName: room.name,
                color: room.color,
                dailyUsage: [],
              };
            }

            const icsContent = await response.text();
            const dailyUsage = parseICSContent(icsContent, daysBack);

            return {
              roomId: room.id,
              roomName: room.name,
              color: room.color,
              dailyUsage,
            };
          } catch (error) {
            console.error(`Error fetching trends for ${room.name}:`, error);
            return {
              roomId: room.id,
              roomName: room.name,
              color: room.color,
              dailyUsage: [],
            };
          }
        })
      );

      setTrends(roomTrends);
      setError(false);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLabel = () => {
    switch (selectedTimeRange) {
      case 'day': return '1 Day';
      case 'week': return '14 Days';
      case 'month': return '30 Days';
      default: return '14 Days';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Usage Trends ({getDaysLabel()})</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (error || trends.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Usage Trends ({getDaysLabel()})</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load trend data</p>
      </div>
    );
  }

  // Get all dates from the first room (they should all have the same dates)
  const dates = trends[0]?.dailyUsage || [];
  const maxHours = Math.max(...trends.flatMap(t => t.dailyUsage.map(d => d.hours)), 10);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-uva-orange" />
        <h2 className="text-2xl font-bold text-uva-navy">Usage Trends ({getDaysLabel()})</h2>
      </div>

      {/* Simple Bar Chart */}
      <div className="mb-8">
        <div className="space-y-6">
          {trends.map((trend) => {
            const totalHours = trend.dailyUsage.reduce((sum, d) => sum + d.hours, 0);
            const avgHours = totalHours / trend.dailyUsage.length;

            return (
              <div key={trend.roomId}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-uva-navy">{trend.roomName}</h3>
                  <span className="text-sm text-gray-600">
                    Avg: {avgHours.toFixed(1)}h/day
                  </span>
                </div>

                <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-end gap-0.5 px-1 py-1">
                    {trend.dailyUsage.map((day, idx) => {
                      const heightPercent = (day.hours / maxHours) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 relative group"
                          title={`${day.date}: ${day.hours}h`}
                        >
                          <div
                            className="w-full rounded-t transition-all duration-200 hover:opacity-80"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: trend.color,
                              minHeight: day.hours > 0 ? '2px' : '0',
                            }}
                          ></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.hours}h
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-3">Showing daily usage hours for the past 14 days</p>
        <div className="flex flex-wrap gap-4">
          {trends.map((trend) => (
            <div key={trend.roomId} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: trend.color }}
              ></div>
              <span className="text-sm text-gray-700">{trend.roomName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
