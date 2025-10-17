"use client";

import { useEffect, useState } from "react";
import { PieChart, AlertCircle, TrendingUp, Clock } from "lucide-react";

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

interface CapacityMetrics {
  roomId: string;
  roomName: string;
  building: string;
  utilizationRate: number; // percentage of available hours used
  totalHours: number;
  availableHours: number;
  peakUtilization: number;
  recommendation: 'underutilized' | 'optimal' | 'overbooked';
}

interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface CapacityAnalysisProps {
  selectedTimeRange: 'day' | 'week' | 'month';
  selectedRoom: string;
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

function calculateCapacityMetrics(
  events: CalendarEvent[],
  daysToCheck: number
): { utilizationRate: number; totalHours: number; availableHours: number; peakUtilization: number } {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToCheck);
  startDate.setHours(0, 0, 0, 0);

  const recentEvents = events.filter(event => event.startTime >= startDate);
  const totalMinutes = recentEvents.reduce((sum, event) => sum + event.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Assume 12 available hours per day (8am-8pm)
  const availableHours = daysToCheck * 12;
  const utilizationRate = Math.round((totalHours / availableHours) * 100);

  // Calculate peak utilization (busiest day)
  const dailyUsage: { [key: string]: number } = {};
  recentEvents.forEach(event => {
    const dateKey = event.startTime.toISOString().split('T')[0];
    const durationHours = event.duration / 60;
    dailyUsage[dateKey] = (dailyUsage[dateKey] || 0) + durationHours;
  });

  const peakHours = Math.max(...Object.values(dailyUsage), 0);
  const peakUtilization = Math.round((peakHours / 12) * 100);

  return { utilizationRate, totalHours, availableHours, peakUtilization };
}

export function CapacityAnalysis({ selectedTimeRange, selectedRoom }: CapacityAnalysisProps) {
  const [metrics, setMetrics] = useState<CapacityMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCapacityMetrics();
    // Refresh every 15 minutes
    const interval = setInterval(fetchCapacityMetrics, 15 * 60 * 1000);
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

  const fetchCapacityMetrics = async () => {
    try {
      const daysToCheck = getDaysForRange();
      const roomsToFetch = selectedRoom === 'all' ? ROOMS : ROOMS.filter(r => r.id === selectedRoom);

      const capacityMetrics = await Promise.all(
        roomsToFetch.map(async (room) => {
          try {
            const response = await fetch(`${AZURE_FUNCTION_URL}?room=${room.id}`);
            if (!response.ok) {
              return {
                roomId: room.id,
                roomName: room.name,
                building: room.building,
                utilizationRate: 0,
                totalHours: 0,
                availableHours: daysToCheck * 12,
                peakUtilization: 0,
                recommendation: 'underutilized' as const,
              };
            }

            const icsContent = await response.text();
            const events = parseICSContent(icsContent);
            const { utilizationRate, totalHours, availableHours, peakUtilization } =
              calculateCapacityMetrics(events, daysToCheck);

            // Determine recommendation
            let recommendation: 'underutilized' | 'optimal' | 'overbooked';
            if (utilizationRate < 30) {
              recommendation = 'underutilized';
            } else if (utilizationRate > 80) {
              recommendation = 'overbooked';
            } else {
              recommendation = 'optimal';
            }

            return {
              roomId: room.id,
              roomName: room.name,
              building: room.building,
              utilizationRate,
              totalHours,
              availableHours,
              peakUtilization,
              recommendation,
            };
          } catch (error) {
            console.error(`Error processing room ${room.name}:`, error);
            return {
              roomId: room.id,
              roomName: room.name,
              building: room.building,
              utilizationRate: 0,
              totalHours: 0,
              availableHours: daysToCheck * 12,
              peakUtilization: 0,
              recommendation: 'underutilized' as const,
            };
          }
        })
      );

      setMetrics(capacityMetrics);
      setError(false);
    } catch (err) {
      console.error('Error fetching capacity metrics:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Capacity Analysis</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-uva-orange mx-auto"></div>
          <p className="text-gray-600 mt-4">Analyzing capacity...</p>
        </div>
      </div>
    );
  }

  if (error || metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="w-6 h-6 text-uva-orange" />
          <h2 className="text-2xl font-bold text-uva-navy">Capacity Analysis</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Unable to load capacity analysis</p>
      </div>
    );
  }

  const averageUtilization = Math.round(
    metrics.reduce((sum, m) => sum + m.utilizationRate, 0) / metrics.length
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-6 h-6 text-uva-orange" />
        <h2 className="text-2xl font-bold text-uva-navy">Capacity Analysis</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Space utilization analysis based on available hours (8am-8pm, 12 hours/day)
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Average Utilization</p>
          </div>
          <p className="text-3xl font-bold">{averageUtilization}%</p>
          <p className="text-xs opacity-75 mt-1">
            Across {metrics.length} room{metrics.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Total Booked Hours</p>
          </div>
          <p className="text-3xl font-bold">
            {metrics.reduce((sum, m) => sum + m.totalHours, 0).toFixed(1)}h
          </p>
          <p className="text-xs opacity-75 mt-1">
            {selectedTimeRange === 'day' ? 'Today' : selectedTimeRange === 'week' ? 'This week' : 'This month'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-semibold opacity-90">Needs Attention</p>
          </div>
          <p className="text-3xl font-bold">
            {metrics.filter(m => m.recommendation !== 'optimal').length}
          </p>
          <p className="text-xs opacity-75 mt-1">Under/over utilized spaces</p>
        </div>
      </div>

      {/* Detailed Room Metrics */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-uva-navy mb-3">Room-by-Room Analysis</h3>
        {metrics.map((metric) => (
          <div
            key={metric.roomId}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-semibold text-uva-navy">{metric.roomName}</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    metric.recommendation === 'underutilized'
                      ? 'bg-yellow-100 text-yellow-800'
                      : metric.recommendation === 'overbooked'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {metric.recommendation === 'underutilized'
                    ? 'Underutilized'
                    : metric.recommendation === 'overbooked'
                    ? 'High Demand'
                    : 'Optimal'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{metric.building}</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Utilization Bar */}
              <div className="w-48">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Utilization</span>
                  <span className="text-sm font-bold text-uva-navy">{metric.utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.utilizationRate < 30
                        ? 'bg-yellow-500'
                        : metric.utilizationRate > 80
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metric.utilizationRate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Hours */}
              <div className="text-right min-w-[100px]">
                <p className="text-sm font-bold text-uva-navy">{metric.totalHours}h</p>
                <p className="text-xs text-gray-500">of {metric.availableHours}h</p>
              </div>

              {/* Peak */}
              <div className="text-right min-w-[80px]">
                <p className="text-xs text-gray-600">Peak Day</p>
                <p className="text-sm font-bold text-uva-orange">{metric.peakUtilization}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
