"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoomStats } from "@/components/RoomStats";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { UserInfo } from "@/types/auth";

export default function RoomAnalytics() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

        {/* Room Statistics Component */}
        <RoomStats />

        {/* Placeholder for future analytics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-uva-navy mb-3">Coming Soon: Usage Trends</h3>
            <p className="text-gray-600">
              Visual charts showing room usage patterns over time, peak hours, and seasonal trends.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-uva-navy mb-3">Coming Soon: Capacity Analysis</h3>
            <p className="text-gray-600">
              Detailed insights into room capacity utilization and recommendations for optimal scheduling.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-uva-navy mb-3">Coming Soon: Event Calendar</h3>
            <p className="text-gray-600">
              Integrated calendar view showing all upcoming reservations across all facilities.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-uva-navy mb-3">Coming Soon: Export Reports</h3>
            <p className="text-gray-600">
              Download detailed usage reports in CSV or PDF format for administrative review.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
