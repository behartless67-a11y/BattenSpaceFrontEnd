"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { staffDirectory, StaffMember } from "@/data/staff-directory";
import { Search, Grid3x3, List, ArrowLeft, User } from "lucide-react";
import { UserInfo } from "@/types/auth";

// Helper function to get photo path with correct extension
const getPhotoPath = (staff: StaffMember): string => {
  // Use custom photoFilename if provided, otherwise use lastName
  const baseFilename = staff.photoFilename ||
    (staff.lastName.charAt(0).toUpperCase() + staff.lastName.slice(1).toLowerCase().replace(/\s+/g, '-'));

  return `/staff-photos/${baseFilename}.jpeg`;
};

export default function StaffDirectory() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
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

  const filteredStaff = staffDirectory.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.biography.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className="flex-1 max-w-[1800px] w-full mx-auto px-6 py-6">
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
          <h1 className="text-4xl font-bold text-uva-navy mb-3">Staff Directory</h1>
          <div className="w-24 h-1 bg-uva-orange mb-4"></div>
          <p className="text-lg text-gray-700 max-w-3xl">
            Meet the dedicated team at the Frank Batten School of Leadership and Public Policy
          </p>
        </div>

        {/* Search Bar and View Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, position, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-uva-orange transition-colors"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-white text-uva-navy shadow-sm"
                    : "text-gray-600 hover:text-uva-navy"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-white text-uva-navy shadow-sm"
                    : "text-gray-600 hover:text-uva-navy"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredStaff.length} of {staffDirectory.length} staff members
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredStaff.map((staff, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-uva-orange"
              >
                {/* Photo/Avatar */}
                <div className="relative w-full h-64 bg-gradient-to-br from-uva-navy to-uva-navy/90 overflow-hidden">
                  {!imageErrors.has(staff.name) ? (
                    <img
                      src={getPhotoPath(staff)}
                      alt={staff.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Try .jpg extension
                        const target = e.target as HTMLImageElement;
                        const currentSrc = target.src;
                        if (currentSrc.endsWith('.jpeg')) {
                          target.src = currentSrc.replace('.jpeg', '.jpg');
                        } else if (currentSrc.endsWith('.jpg')) {
                          target.src = currentSrc.replace('.jpg', '.png');
                        } else {
                          // All extensions failed, show fallback
                          setImageErrors(prev => new Set(prev).add(staff.name));
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                        <span className="text-4xl font-bold text-white">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-uva-navy mb-1 line-clamp-1">
                    {staff.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                    {staff.position}
                  </p>

                  {(staff.officeNumber || staff.phone || staff.building) && (
                    <div className="mb-3 text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
                      {staff.building && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-uva-navy">Building:</span> {staff.building}
                        </p>
                      )}
                      {staff.officeNumber && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-uva-navy">Office:</span> {staff.officeNumber}
                        </p>
                      )}
                      {staff.phone && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-uva-navy">Phone:</span> {staff.phone}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-700 line-clamp-4">
                    {staff.biography}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4 mb-12">
            {filteredStaff.map((staff, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-uva-orange"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-uva-navy to-uva-navy/90">
                    {!imageErrors.has(staff.name) ? (
                      <img
                        src={getPhotoPath(staff)}
                        alt={staff.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          if (currentSrc.endsWith('.jpeg')) {
                            target.src = currentSrc.replace('.jpeg', '.jpg');
                          } else if (currentSrc.endsWith('.jpg')) {
                            target.src = currentSrc.replace('.jpg', '.png');
                          } else {
                            setImageErrors(prev => new Set(prev).add(staff.name));
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-uva-navy mb-1">
                          {staff.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{staff.position}</p>

                        {(staff.building || staff.officeNumber || staff.phone) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700 mt-2">
                            {staff.building && (
                              <span>
                                <span className="font-semibold text-uva-navy">Building:</span> {staff.building}
                              </span>
                            )}
                            {staff.officeNumber && (
                              <span>
                                <span className="font-semibold text-uva-navy">Office:</span> {staff.officeNumber}
                              </span>
                            )}
                            {staff.phone && (
                              <span>
                                <span className="font-semibold text-uva-navy">Phone:</span> {staff.phone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {staff.biography}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredStaff.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              No staff members found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
