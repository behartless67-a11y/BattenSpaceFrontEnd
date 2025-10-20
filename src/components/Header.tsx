"use client";

import { ClientPrincipal } from "@/types/auth";
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from "lucide-react";
import { lookupStaffMember } from "@/lib/staffLookup";

interface HeaderProps {
  user?: ClientPrincipal | null;
}

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
}

export function Header({ user }: HeaderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch on client side
    if (typeof window === 'undefined') return;

    // Fetch weather for Charlottesville, VA using Open-Meteo free API (no key required, no CORS issues)
    // Coordinates for Charlottesville, VA: 38.0293°N, 78.4767°W
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0293&longitude=-78.4767&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather API response:', data); // Debug log

        const current = data.current;
        const weatherCode = current.weather_code;

        // Map WMO weather codes to descriptions
        const getWeatherDescription = (code: number) => {
          if (code === 0) return 'Clear';
          if (code <= 3) return 'Partly Cloudy';
          if (code <= 48) return 'Foggy';
          if (code <= 67) return 'Rainy';
          if (code <= 77) return 'Snowy';
          if (code <= 82) return 'Showers';
          if (code <= 99) return 'Thunderstorm';
          return 'Cloudy';
        };

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getWeatherDescription(weatherCode),
          description: getWeatherDescription(weatherCode)
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-5 h-5" />;

    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="w-5 h-5" />;
    } else if (condition.includes('snow')) {
      return <CloudSnow className="w-5 h-5" />;
    } else if (condition.includes('clear') || condition.includes('sunny')) {
      return <Sun className="w-5 h-5" />;
    } else if (condition.includes('wind')) {
      return <Wind className="w-5 h-5" />;
    } else {
      return <Cloud className="w-5 h-5" />;
    }
  };

  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  // Extract user's actual name from claims or staff directory
  const getUserName = () => {
    if (!user) return null;

    // Try to get name from claims first (if Azure AD provides them)
    const claims = user.claims;
    if (claims) {
      // Try givenname and surname claims (most reliable for Azure AD)
      const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
      const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

      if (givenName && surname) {
        return `${givenName} ${surname}`;
      }

      // Try alternative claim types
      const name = claims.find(c => c.typ === 'name' || c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')?.val;
      if (name) return name;

      const displayName = claims.find(c => c.typ === 'http://schemas.microsoft.com/identity/claims/displayname')?.val;
      if (displayName) return displayName;
    }

    // Fall back to staff directory lookup
    const userDetails = user.userDetails;
    if (userDetails) {
      const staffName = lookupStaffMember(userDetails);
      if (staffName) {
        return staffName;
      }

      // If not in staff directory and it's an email, extract the computing ID
      if (userDetails.includes('@')) {
        return userDetails.split('@')[0];
      }
    }

    return userDetails || 'User';
  };

  const fullName = getUserName();
  // Extract first name from full name (e.g., "Ben Hartless" -> "Ben")
  const firstName = fullName ? fullName.split(' ')[0] : null;

  return (
    <header className="bg-uva-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">The Batten Space</h1>
            <p className="text-sm text-gray-300">Frank Batten School Digital Tools</p>
          </div>

          {/* Weather Widget */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-pulse">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : weather ? (
              <>
                <div className="text-uva-orange">
                  {getWeatherIcon()}
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{weather.temp}°F</p>
                  <p className="text-xs text-gray-300">Charlottesville</p>
                </div>
                <div className="text-sm text-gray-200">
                  {weather.description}
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-300">Weather unavailable</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-semibold">{fullName}</p>
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
