// claims of the access token issued by Authentik that the app reads (same shape keycloak-js exposed)
export interface KeycloakTokenParsed {
  sub?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  resource_access?: Record<string, { roles: string[] }>;
  realm_access?: { roles: string[] };
  [key: string]: unknown;
}
