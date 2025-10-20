"use client";

import { ClientPrincipal } from "@/types/auth";

interface HeaderProps {
  user?: ClientPrincipal | null;
}

export function Header({ user }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  // Extract user's actual name from claims
  const getUserName = () => {
    if (!user) return null;

    // Try to get name from claims first
    const claims = user.claims;
    if (claims) {
      // Try givenname and surname claims (most reliable for Azure AD)
      const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
      const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

      if (givenName && surname) {
        return `${givenName} ${surname}`;
      }

      // Try displayname claim
      const displayName = claims.find(c => c.typ === 'http://schemas.microsoft.com/identity/claims/displayname')?.val;
      if (displayName) return displayName;

      // Try alternative name claim types
      const name = claims.find(c => c.typ === 'name' || c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')?.val;
      if (name) return name;
    }

    // Fall back to userDetails
    const userDetails = user.userDetails;

    // If it's an email, extract the name part before @
    if (userDetails && userDetails.includes('@')) {
      const namePart = userDetails.split('@')[0];
      // Convert something like "john.doe" to "John Doe"
      return namePart.split('.').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }

    return userDetails || 'User';
  };

  const displayName = getUserName();

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
                <p className="text-sm font-semibold">{displayName}</p>
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
