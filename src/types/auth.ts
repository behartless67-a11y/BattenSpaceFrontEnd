export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims?: Array<{
    typ: string;
    val: string;
  }>;
}

export interface UserInfo {
  clientPrincipal: ClientPrincipal | null;
}
