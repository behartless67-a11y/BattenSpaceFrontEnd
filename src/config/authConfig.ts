import { Configuration, PopupRequest } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || ""}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "/",
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI || "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 */
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "GroupMember.Read.All"],
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs.
 */
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphGroupsEndpoint: "https://graph.microsoft.com/v1.0/me/memberOf",
};

/**
 * Authorized Entra group IDs that can access the application
 * These should be set via environment variables
 */
export const authorizedGroups = (process.env.NEXT_PUBLIC_AUTHORIZED_GROUPS || "").split(",").filter(Boolean);
