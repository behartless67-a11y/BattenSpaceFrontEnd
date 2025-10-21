"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock } from "lucide-react";

interface BattenEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  url?: string;
}

export function UpcomingEventsWidget() {
  const [events, setEvents] = useState<BattenEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBattenEvents = async () => {
      try {
        // Fetch Batten events calendar ICS file
        const response = await fetch('https://www.trumba.com/calendars/batten-school-events.ics', {
          cache: 'no-cache'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const icsData = await response.text();
        const parsedEvents = parseICSEvents(icsData);

        // Filter for upcoming events (next 7 days) and limit to 4
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcomingEvents = parsedEvents
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= weekFromNow;
          })
          .slice(0, 4);

        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Error fetching Batten events:', err);
        // Fall back to mock data if API fails
        setEvents([
          {
            title: "Check events.batten.virginia.edu for upcoming events",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: "",
            location: "Various Locations",
            url: "https://events.batten.virginia.edu/"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBattenEvents();
  }, []);

  // Parse ICS events
  const parseICSEvents = (icsData: string): BattenEvent[] => {
    const events: BattenEvent[] = [];
    const lines = icsData.split('\n');
    let currentEvent: any = {};

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (trimmed.startsWith('SUMMARY:')) {
        currentEvent.title = trimmed.substring(8);
      } else if (trimmed.startsWith('DTSTART')) {
        const dateStr = trimmed.split(':')[1];
        currentEvent.startDate = parseBattenICSDate(dateStr);
      } else if (trimmed.startsWith('LOCATION:')) {
        currentEvent.location = trimmed.substring(9);
      } else if (trimmed === 'END:VEVENT' && currentEvent.title) {
        if (currentEvent.startDate) {
          events.push({
            title: currentEvent.title,
            date: currentEvent.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: currentEvent.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            location: currentEvent.location || 'TBA',
          });
        }
      }
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const parseBattenICSDate = (dateStr: string): Date => {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11) || '0');
    const minute = parseInt(dateStr.substring(11, 13) || '0');
    return new Date(year, month, day, hour, minute);
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <CalendarDays className="w-5 h-5 text-uva-orange" />
        <h3 className="font-semibold text-uva-navy text-lg">Upcoming Events</h3>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded transition-colors"
          >
            <h4 className="font-semibold text-uva-navy mb-2 text-sm leading-snug">
              {event.title}
            </h4>
            <div className="flex flex-col gap-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{event.date}</span>
                <Clock className="w-3.5 h-3.5 ml-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://events.batten.virginia.edu/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-uva-orange hover:text-uva-orange-light font-semibold transition-colors"
      >
        View All Events →
      </a>
    </div>
  );
}
