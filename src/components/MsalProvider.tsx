"use client";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider as BaseMsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/config/authConfig";
import { useEffect, useState } from "react";

const msalInstance = new PublicClientApplication(msalConfig);

export function MsalProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uva-orange mx-auto mb-4"></div>
          <p className="text-uva-navy">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BaseMsalProvider instance={msalInstance}>
      {children}
    </BaseMsalProvider>
  );
}
