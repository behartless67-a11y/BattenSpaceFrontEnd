"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

const ROOMS = [
  { id: 'confa', name: 'Conference Room A', building: 'Garrett Hall' },
  { id: 'greathall', name: 'Great Hall', building: 'Garrett Hall' },
  { id: 'seminar', name: 'Seminar Room', building: 'Garrett Hall' },
  { id: 'studentlounge206', name: 'Student Lounge', building: 'Garrett Hall' },
  { id: 'pavx-upper', name: 'Pavilion X Upper', building: 'Pavilion X' },
];

// ICS files are publicly available at roomres.thebattenspace.org
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

interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  rrule?: string;
  uid?: string;
}

interface MonthlyStats {
  month: string; // YYYY-MM format
  totalHours: number;
  avgHoursPerDay: number;
  bookingCount: number;
  busiestDay: { date: string; hours: number };
}

interface AllTimeData {
  totalHours: number;
  totalBookings: number;
  firstEventDate: Date | null;
  lastEventDate: Date | null;
  busiestDay: { date: string; hours: number };
  monthlyBreakdown: MonthlyStats[];
}

function expandRecurringEvent(parentEvent: any): CalendarEvent[] {
  const instances: CalendarEvent[] = [];
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
          summary: parentEvent.summary || 'Untitled',
          startTime: instanceStart,
          endTime: instanceEnd,
          duration: duration / (1000 * 60),
        });

        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
  }

  return instances;
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
  } catch {
    return null;
  }
}

function parseICSContent(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
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
      if (currentEvent.startTime && currentEvent.endTime && currentEvent.summary) {
        const duration = (currentEvent.endTime.getTime() - currentEvent.startTime.getTime()) / (1000 * 60);
        const event: any = {
          summary: currentEvent.summary,
          startTime: currentEvent.startTime,
          endTime: currentEvent.endTime,
          duration,
          rrule: currentEvent.rrule,
          uid: currentEvent.uid,
        };

        // Handle recurring events (RRULE)
        if (event.rrule) {
          const recurringEvents = expandRecurringEvent(event);
          events.push(...recurringEvents);
        } else {
          events.push(event);
        }
      }
      inEvent = false;
    } else if (inEvent && line) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      if (key === 'SUMMARY') {
        currentEvent.summary = value;
      } else if (key.startsWith('DTSTART')) {
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

  return events;
}

function calculateAllTimeStats(events: CalendarEvent[]): AllTimeData {
  if (events.length === 0) {
    return {
      totalHours: 0,
      totalBookings: 0,
      firstEventDate: null,
      lastEventDate: null,
      busiestDay: { date: '', hours: 0 },
      monthlyBreakdown: [],
    };
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Calculate total hours
  const totalMinutes = events.reduce((sum, event) => sum + event.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Find first and last event dates
  const firstEventDate = sortedEvents[0].startTime;
  const lastEventDate = sortedEvents[sortedEvents.length - 1].startTime;

  // Calculate daily usage to find busiest day
  const dailyUsage: { [key: string]: number } = {};
  events.forEach(event => {
    const dateKey = event.startTime.toISOString().split('T')[0];
    const hours = event.duration / 60;
    dailyUsage[dateKey] = (dailyUsage[dateKey] || 0) + hours;
  });

  const busiestDayEntry = Object.entries(dailyUsage).reduce(
    (max, [date, hours]) => (hours > max.hours ? { date, hours } : max),
    { date: '', hours: 0 }
  );

  // Calculate monthly breakdown
  const monthlyData: { [key: string]: { hours: number; bookings: number; dailyHours: { [key: string]: number } } } = {};

  events.forEach(event => {
    const monthKey = event.startTime.toISOString().substring(0, 7); // YYYY-MM
    const dateKey = event.startTime.toISOString().split('T')[0];
    const hours = event.duration / 60;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { hours: 0, bookings: 0, dailyHours: {} };
    }

    monthlyData[monthKey].hours += hours;
    monthlyData[monthKey].bookings += 1;
    monthlyData[monthKey].dailyHours[dateKey] = (monthlyData[monthKey].dailyHours[dateKey] || 0) + hours;
  });

  const monthlyBreakdown: MonthlyStats[] = Object.entries(monthlyData).map(([month, data]) => {
    const [year, monthNum] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const avgHoursPerDay = data.hours / daysInMonth;

    const busiestDay = Object.entries(data.dailyHours).reduce(
      (max, [date, hours]) => (hours > max.hours ? { date, hours } : max),
      { date: '', hours: 0 }
    );

    return {
      month,
      totalHours: Math.round(data.hours * 10) / 10,
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      bookingCount: data.bookings,
      busiestDay,
    };
  }).sort((a, b) => b.month.localeCompare(a.month)); // Most recent first

  return {
    totalHours,
    totalBookings: events.length,
    firstEventDate,
    lastEventDate,
    busiestDay: {
      date: busiestDayEntry.date,
      hours: Math.round(busiestDayEntry.hours * 10) / 10,
    },
    monthlyBreakdown,
  };
}

interface AllTimeStatsProps {
  selectedRoom: string;
}

export function AllTimeStats({ selectedRoom }: AllTimeStatsProps) {
  const [allTimeData, setAllTimeData] = useState<{ [roomId: string]: AllTimeData }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTimeData();
  }, [selectedRoom]);

  const fetchAllTimeData = async () => {
    setLoading(true);
    try {
      const roomsToFetch = selectedRoom === 'all'
        ? ROOMS
        : ROOMS.filter(r => r.id === selectedRoom);

      const dataPromises = roomsToFetch.map(async (room) => {
        try {
          const icsUrl = ROOM_ICS_MAPPING[room.id];
          if (!icsUrl) {
            return { roomId: room.id, data: null };
          }
          const response = await fetch(icsUrl, { mode: 'cors' });
          if (!response.ok) {
            return { roomId: room.id, data: null };
          }

          const icsContent = await response.text();
          const events = parseICSContent(icsContent);
          const stats = calculateAllTimeStats(events);

          return { roomId: room.id, data: stats };
        } catch (error) {
          console.error(`Error fetching all-time data for ${room.name}:`, error);
          return { roomId: room.id, data: null };
        }
      });

      const results = await Promise.all(dataPromises);
      const dataMap: { [roomId: string]: AllTimeData } = {};
      results.forEach(({ roomId, data }) => {
        if (data) {
          dataMap[roomId] = data;
        }
      });

      setAllTimeData(dataMap);
      setError(Object.keys(dataMap).length === 0);
    } catch (err) {
      console.error('Error fetching all-time data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">All-Time Statistics</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error || Object.keys(allTimeData).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">All-Time Statistics</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load historical data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-uva-orange" />
        <h2 className="text-2xl font-bold text-uva-navy">All-Time Statistics</h2>
      </div>

      {Object.entries(allTimeData).map(([roomId, data]) => {
        const room = ROOMS.find(r => r.id === roomId);
        if (!room) return null;

        const isExpanded = expandedRoom === roomId;

        return (
          <div key={roomId} className="mb-6 last:mb-0 border-b pb-6 last:border-b-0 last:pb-0">
            <h3 className="text-lg font-bold text-uva-navy mb-4">{room.name}</h3>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-uva-orange">{data.totalHours.toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-uva-orange">{data.totalBookings.toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">First Event</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(data.firstEventDate)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Last Event</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(data.lastEventDate)}</p>
              </div>
            </div>

            {/* Busiest Day */}
            {data.busiestDay.date && (
              <div className="bg-uva-orange/10 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-1">Busiest Day Ever</p>
                <p className="text-lg font-bold text-uva-navy">
                  {new Date(data.busiestDay.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  <span className="text-uva-orange ml-2">({data.busiestDay.hours}h)</span>
                </p>
              </div>
            )}

            {/* Expandable Monthly Breakdown */}
            {data.monthlyBreakdown.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedRoom(isExpanded ? null : roomId)}
                  className="flex items-center gap-2 text-uva-navy hover:text-uva-orange transition-colors font-semibold"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  {isExpanded ? 'Hide' : 'View'} Monthly Breakdown ({data.monthlyBreakdown.length} months)
                </button>

                {isExpanded && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-700">Month</th>
                          <th className="text-right p-3 font-semibold text-gray-700">Total Hours</th>
                          <th className="text-right p-3 font-semibold text-gray-700">Avg Hours/Day</th>
                          <th className="text-right p-3 font-semibold text-gray-700">Bookings</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Busiest Day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.monthlyBreakdown.map((month) => (
                          <tr key={month.month} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{formatMonthYear(month.month)}</td>
                            <td className="p-3 text-right text-gray-700">{month.totalHours}h</td>
                            <td className="p-3 text-right text-gray-700">{month.avgHoursPerDay}h</td>
                            <td className="p-3 text-right text-gray-700">{month.bookingCount}</td>
                            <td className="p-3 text-gray-700">
                              {month.busiestDay.date ? (
                                <>
                                  {new Date(month.busiestDay.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                  <span className="text-uva-orange ml-1">({month.busiestDay.hours}h)</span>
                                </>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
