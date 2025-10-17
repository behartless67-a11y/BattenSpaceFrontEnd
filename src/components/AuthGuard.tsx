"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest, graphConfig, authorizedGroups } from "@/config/authConfig";
import { InteractionStatus } from "@azure/msal-browser";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, inProgress, instance]);

  useEffect(() => {
    const checkGroupMembership = async () => {
      if (isAuthenticated && accounts.length > 0) {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });

          const groupsResponse = await fetch(graphConfig.graphGroupsEndpoint, {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          });

          if (!groupsResponse.ok) {
            throw new Error("Failed to fetch group membership");
          }

          const groupsData = await groupsResponse.json();
          const memberGroupIds = groupsData.value.map((group: any) => group.id);
          setUserGroups(memberGroupIds);

          // Check if user is in any authorized group
          if (authorizedGroups.length === 0) {
            // If no groups are configured, allow all authenticated users
            setIsAuthorized(true);
          } else {
            const hasAccess = memberGroupIds.some((groupId: string) =>
              authorizedGroups.includes(groupId)
            );
            setIsAuthorized(hasAccess);
          }
        } catch (err) {
          console.error("Error checking group membership:", err);
          setError("Failed to verify access permissions");
          setIsAuthorized(false);
        }
      }
    };

    checkGroupMembership();
  }, [isAuthenticated, accounts, instance]);

  if (!isAuthenticated || inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-uva-orange mx-auto mb-6"></div>
          <p className="text-xl text-uva-navy">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-uva-orange mx-auto mb-6"></div>
          <p className="text-xl text-uva-navy">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
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
            You are not authorized to access this application. Please contact your administrator if you believe this is an error.
          </p>
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <button
            onClick={() => instance.logout()}
            className="px-6 py-3 bg-uva-orange text-white rounded-lg font-semibold hover:bg-uva-orange-light transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
