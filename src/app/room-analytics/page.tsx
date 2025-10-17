"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoomStats } from "@/components/RoomStats";
import { CurrentStatus } from "@/components/CurrentStatus";
import { UsageTrends } from "@/components/UsageTrends";
import { PeakHoursHeatmap } from "@/components/PeakHoursHeatmap";
import { CapacityAnalysis } from "@/components/CapacityAnalysis";
import { ExportReports } from "@/components/ExportReports";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { UserInfo } from "@/types/auth";

const ROOMS = [
  { id: 'all', name: 'All Rooms' },
  { id: 'confa', name: 'Conference Room A L014' },
  { id: 'greathall', name: 'Great Hall 100' },
  { id: 'seminar', name: 'Seminar Room L039' },
  { id: 'studentlounge206', name: 'Student Lounge 206' },
  { id: 'pavx-upper', name: 'Pavilion X Upper Garden' },
  { id: 'pavx-b1', name: 'Pavilion X Basement Room 1' },
  { id: 'pavx-b2', name: 'Pavilion X Basement Room 2' },
  { id: 'pavx-exhibit', name: 'Pavilion X Basement Exhibit' },
];

export default function RoomAnalytics() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  useEffect(() => {
    // Check if we're in dev mode (local development)
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // Mock user data for local development
      const mockUser = {
        clientPrincipal: {
          identityProvider: 'aad',
          userId: 'dev-user-123',
          userDetails: 'Dev User (Local)',
          userRoles: ['authenticated', 'FBS_StaffAll'],
        }
      };
      setUserInfo(mockUser);
      setLoading(false);
      return;
    }

    // Fetch user info from Azure Easy Auth (production only)
    fetch('/.auth/me')
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-uva-orange mx-auto mb-6"></div>
          <p className="text-xl text-uva-navy">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/garrett-hall-sunset.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'grayscale(100%)',
        }}
      ></div>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-white/85 -z-10"></div>

      <Header user={userInfo?.clientPrincipal} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-6">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-uva-navy hover:text-uva-orange transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </a>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-uva-navy mb-3">Room Analytics</h1>
          <div className="w-24 h-1 bg-uva-orange mb-4"></div>
          <p className="text-lg text-gray-700 max-w-3xl">
            Comprehensive usage statistics and insights for all Batten School facilities.
            Track room utilization, identify trends, and optimize space allocation.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-uva-navy">Time Range:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as 'day' | 'week' | 'month')}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-uva-navy focus:outline-none focus:border-uva-orange"
              >
                <option value="day">Today</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-uva-navy">Room:</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-uva-navy focus:outline-none focus:border-uva-orange"
              >
                {ROOMS.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 1: Current Status (full width) */}
        <div className="mb-8">
          <CurrentStatus selectedRoom={selectedRoom} />
        </div>

        {/* Row 2: Room Stats and Usage Trends side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RoomStats selectedTimeRange={selectedTimeRange} selectedRoom={selectedRoom} />
          <UsageTrends selectedTimeRange={selectedTimeRange} selectedRoom={selectedRoom} />
        </div>

        {/* Row 3: Peak Hours Heatmap (full width) */}
        <div className="mb-8">
          <PeakHoursHeatmap selectedRoom={selectedRoom} />
        </div>

        {/* Row 4: Capacity Analysis (full width) */}
        <div className="mb-8">
          <CapacityAnalysis selectedTimeRange={selectedTimeRange} selectedRoom={selectedRoom} />
        </div>

        {/* Row 5: Export Reports (full width) */}
        <div className="mb-8">
          <ExportReports selectedTimeRange={selectedTimeRange} selectedRoom={selectedRoom} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
