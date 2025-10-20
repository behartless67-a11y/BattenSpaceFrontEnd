"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExternalLink, Wrench, Users, FileText, BarChart, Database, Calendar, Newspaper } from "lucide-react";
import { UserInfo } from "@/types/auth";
import { lookupStaffMember } from "@/lib/staffLookup";

interface NewsHeadline {
  title: string;
  url: string;
  source: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: "wrench" | "users" | "file" | "chart" | "database" | "calendar" | "link";
  category: string;
  comingSoon?: boolean;
}

// Configure your tools here
const tools: Tool[] = [
  {
    id: "1",
    name: "Room Reservations",
    description: "View and manage Batten School room reservations and availability",
    url: "https://roomres.thebattenspace.org/",
    icon: "calendar",
    category: "Facilities",
  },
  {
    id: "2",
    name: "Room Analytics",
    description: "View detailed room usage statistics, trends, and insights across all Batten School facilities",
    url: "/room-analytics",
    icon: "chart",
    category: "Facilities",
  },
  {
    id: "3",
    name: "APP Explorer",
    description: "Browse, search, and download Applied Policy Projects from the Batten School archives",
    url: "https://appexplorer.thebattenspace.org/",
    icon: "database",
    category: "Academic Resources",
  },
  // Staff Directory removed from public view but still accessible at /staff-directory
  // {
  //   id: "4",
  //   name: "Staff Directory",
  //   description: "Search and browse contact information for Batten School faculty and staff",
  //   url: "/staff-directory",
  //   icon: "users",
  //   category: "Resources",
  // },
];

function getIcon(iconName: string) {
  const iconClass = "w-7 h-7";
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
    case "calendar":
      return <Calendar className={iconClass} />;
    default:
      return <ExternalLink className={iconClass} />;
  }
}

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isNewsVisible, setIsNewsVisible] = useState(true);

  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  // Extract user's full name and first name from claims or staff directory
  const getUserName = () => {
    if (!userInfo?.clientPrincipal) return null;

    // Try to get name from claims first
    const claims = userInfo.clientPrincipal.claims;
    if (claims) {
      // Try givenname and surname claims (most reliable for Azure AD)
      const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
      const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

      if (givenName && surname) {
        return { full: `${givenName} ${surname}`, first: givenName };
      }

      if (givenName) {
        return { full: givenName, first: givenName };
      }

      // Try displayname claim
      const displayName = claims.find(c => c.typ === 'http://schemas.microsoft.com/identity/claims/displayname')?.val;
      if (displayName) {
        const firstName = displayName.split(' ')[0];
        return { full: displayName, first: firstName };
      }

      // Try alternative name claim types
      const name = claims.find(c => c.typ === 'name' || c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')?.val;
      if (name) {
        const firstName = name.split(' ')[0];
        return { full: name, first: firstName };
      }
    }

    // Fall back to staff directory lookup
    const userDetails = userInfo.clientPrincipal.userDetails;
    if (userDetails) {
      const staffName = lookupStaffMember(userDetails);
      if (staffName) {
        const firstName = staffName.split(' ')[0];
        return { full: staffName, first: firstName };
      }

      // If not in staff directory and it's an email, extract the computing ID
      if (userDetails.includes('@')) {
        const computingId = userDetails.split('@')[0];
        return { full: computingId, first: computingId };
      }
    }

    const fallbackName = userDetails || 'User';
    return { full: fallbackName, first: fallbackName };
  };

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

  // Fetch news headlines
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchNews = async () => {
      try {
        const feeds = [
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.virginia.edu/feed',
          'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.npr.org/1001/rss.xml',
        ];

        const responses = await Promise.all(
          feeds.map(url =>
            fetch(url)
              .then(res => res.json())
              .catch(() => null)
          )
        );

        const allHeadlines: NewsHeadline[] = [];

        responses.forEach(data => {
          if (data && data.status === 'ok' && data.items) {
            data.items.slice(0, 5).forEach((item: any) => {
              allHeadlines.push({
                title: item.title,
                url: item.link,
                source: data.feed?.title || 'News'
              });
            });
          }
        });

        if (allHeadlines.length > 0) {
          setHeadlines(allHeadlines);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, []);

  // Rotate news headlines
  useEffect(() => {
    if (headlines.length === 0) return;

    const interval = setInterval(() => {
      setIsNewsVisible(false);

      setTimeout(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % headlines.length);
        setIsNewsVisible(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [headlines]);

  const currentHeadline = headlines[currentNewsIndex];

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
            <h1 className="text-5xl font-bold mb-3 text-uva-navy animate-fade-in-up">
              Welcome{(() => {
                const userName = getUserName();
                return userName ? `, ${userName.first}` : '';
              })()} to The Batten Space
            </h1>
            <div className="w-24 h-1 bg-uva-orange mx-auto mb-4 animate-fade-in-up animation-delay-200"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Your central hub for digital tools and resources<br />
              at the Frank Batten School of Leadership and Public Policy
            </p>

            {/* News Ticker */}
            {headlines.length > 0 && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md border border-gray-200">
                  <div className="flex items-center gap-2 text-uva-orange flex-shrink-0">
                    <Newspaper className="w-5 h-5" />
                    <span className="text-sm font-semibold">Latest News</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <a
                      href={currentHeadline?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block hover:text-uva-orange transition-all duration-500 ${
                        isNewsVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {currentHeadline?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentHeadline?.source}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tools Grid */}
          <div className="mb-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-uva-navy mb-2">Available Tools</h2>
              <div className="w-16 h-1 bg-uva-orange"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tools.map((tool) => (
                    tool.comingSoon ? (
                      <div
                        key={tool.id}
                        className="group relative bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border-2 border-gray-200 h-full cursor-not-allowed opacity-75"
                      >
                        {/* Coming Soon Badge */}
                        <div className="absolute top-4 right-4 bg-uva-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                          Coming Soon
                        </div>

                        <div className="p-6 h-full flex flex-col">
                          <div className="flex flex-col items-center text-center mb-auto">
                            {/* Icon with gradient background */}
                            <div className="relative mb-4">
                              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-md">
                                {getIcon(tool.icon)}
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-600 mb-2">
                              {tool.name}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                              {tool.description}
                            </p>
                          </div>

                          {/* Coming Soon indicator */}
                          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 text-gray-400 font-semibold text-sm">
                            <span>Coming Soon</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        key={tool.id}
                        href={tool.url}
                        target={tool.url.startsWith('/') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-uva-orange hover:-translate-y-2 h-full"
                      >
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-uva-orange/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="p-6 h-full flex flex-col">
                          <div className="flex flex-col items-center text-center mb-auto">
                            {/* Icon with gradient background */}
                            <div className="relative mb-4">
                              <div className="absolute inset-0 bg-gradient-to-br from-uva-orange to-uva-navy rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
                              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-uva-navy to-uva-navy/80 group-hover:from-uva-orange group-hover:to-uva-orange/80 transition-all duration-300 flex items-center justify-center text-white shadow-md">
                                {getIcon(tool.icon)}
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-uva-navy mb-2 group-hover:text-uva-orange transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {tool.description}
                            </p>
                          </div>

                          {/* Call to action */}
                          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 text-uva-orange font-semibold text-sm">
                            <span className="group-hover:translate-x-1 transition-transform">
                              Launch
                            </span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Hover Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-uva-orange/5 to-uva-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </a>
                    )
              ))}
            </div>
          </div>

        </main>

      <Footer />
    </div>
  );
}
