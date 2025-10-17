"use client";

import { ClientPrincipal } from "@/types/auth";

interface HeaderProps {
  user?: ClientPrincipal | null;
}

export function Header({ user }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  return (
    <header className="bg-uva-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">The Batten Space</h1>
            <p className="text-sm text-gray-300">Frank Batten School Digital Tools</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-semibold">{user.userDetails}</p>
                <p className="text-xs text-gray-300">
                  {user.userRoles.filter(role => role !== 'anonymous' && role !== 'authenticated').join(', ') || 'Staff'}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-uva-orange hover:bg-uva-orange-light rounded-lg font-semibold transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
