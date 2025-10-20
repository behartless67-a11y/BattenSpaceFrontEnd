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
    // Mock data for now - this can be connected to actual Batten events calendar later
    const mockEvents: BattenEvent[] = [
      {
        title: "Public Policy Forum: Climate Change & Local Governance",
        date: "Oct 22",
        time: "4:00 PM",
        location: "Great Hall 100",
      },
      {
        title: "Democracy Initiative Lecture Series",
        date: "Oct 24",
        time: "12:00 PM",
        location: "Pavilion X",
      },
      {
        title: "Career Services Workshop: Federal Careers",
        date: "Oct 25",
        time: "2:30 PM",
        location: "Conference Room A",
      },
      {
        title: "Student Research Showcase",
        date: "Oct 28",
        time: "5:00 PM",
        location: "Great Hall 100",
      },
    ];

    setEvents(mockEvents);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
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
        href="https://batten.virginia.edu/events"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-uva-orange hover:text-uva-orange-light font-semibold transition-colors"
      >
        View All Events →
      </a>
    </div>
  );
}
