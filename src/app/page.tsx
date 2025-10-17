"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExternalLink, Wrench, Users, FileText, BarChart, Database } from "lucide-react";
import { UserInfo } from "@/types/auth";

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: "wrench" | "users" | "file" | "chart" | "database" | "link";
  category: string;
}

// Configure your tools here
const tools: Tool[] = [
  {
    id: "1",
    name: "Room Reservations",
    description: "View and manage Batten School room reservations and availability",
    url: "https://roomres.thebattenspace.org/",
    icon: "chart",
    category: "Facilities",
  },
  {
    id: "2",
    name: "APP Explorer",
    description: "Browse, search, and download Applied Policy Projects from the Batten School archives",
    url: "https://appexplorer.thebattenspace.org/",
    icon: "database",
    category: "Academic Resources",
  },
];

function getIcon(iconName: string) {
  const iconClass = "w-8 h-8";
  switch (iconName) {
    case "wrench":
      return <Wrench className={iconClass} />;
    case "users":
      return <Users className={iconClass} />;
    case "file":
      return <FileText className={iconClass} />;
    case "chart":
      return <BarChart className={iconClass} />;
    case "database":
      return <Database className={iconClass} />;
    default:
      return <ExternalLink className={iconClass} />;
  }
}

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  // Required groups - update these if needed
  const REQUIRED_GROUPS = ["FBS_StaffAll", "FBS_Community"];

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
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Fetch user info from Azure Easy Auth (production only)
    fetch('/.auth/me')
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);

        if (data.clientPrincipal) {
          // TEMPORARY: Allow all authenticated users until groups are configured
          // TODO: Re-enable group check once Judy configures group emission
          const userRoles = data.clientPrincipal.userRoles || [];
          // const authorized = REQUIRED_GROUPS.some(group => userRoles.includes(group));
          const authorized = userRoles.includes('authenticated');
          setHasAccess(authorized);
        } else {
          // Not authenticated
          window.location.href = '/.auth/login/aad';
        }
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

  if (!userInfo?.clientPrincipal) {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/.auth/login/aad';
    }
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-uva-navy mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You are not a member of the required groups to access this application.
            Please contact your administrator if you believe this is an error.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Required groups: {REQUIRED_GROUPS.join(", ")}
          </p>
          <button
            onClick={() => window.location.href = '/.auth/logout'}
            className="px-6 py-3 bg-uva-orange text-white rounded-lg font-semibold hover:bg-uva-orange-light transition-colors"
          >
            Sign Out
          </button>
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

      <Header user={userInfo.clientPrincipal} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-4 text-uva-navy animate-fade-in-up">
              Welcome to The Batten Space
            </h1>
            <div className="w-24 h-1 bg-uva-orange mx-auto mb-6 animate-fade-in-up animation-delay-200"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Your central hub for digital tools and resources at the Frank Batten School of
              Leadership and Public Policy
            </p>
          </div>

          {/* Tools Grid */}
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-uva-navy mb-2">Available Tools</h2>
              <div className="w-16 h-1 bg-uva-orange"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {tools.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-uva-orange"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-uva-navy group-hover:bg-uva-orange transition-colors duration-300 flex items-center justify-center text-white">
                            {getIcon(tool.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-uva-navy mb-2 group-hover:text-uva-orange transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-uva-orange font-semibold text-sm">
                          <span className="group-hover:translate-x-1 transition-transform">
                            Open Tool
                          </span>
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      {/* Hover Effect Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-uva-orange/5 to-uva-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </a>
            ))}
            </div>
          </div>

        </main>

      <Footer />
    </div>
  );
}
