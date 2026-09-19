import { vi } from "vitest";

export type KeycloakMockOptions = {
  authenticated?: boolean;
  // purepixel client roles, e.g. ["photographer"] or ["purepixel-admin"]
  roles?: string[];
  sub?: string;
  name?: string;
  token?: string;
};

// the subset of keycloak-js the app reads (useKeycloak().keycloak and UserService)
export function createKeycloakMock({
  authenticated = true,
  roles = [],
  sub = "user-1",
  name = "Test User",
  token = "test-token",
}: KeycloakMockOptions = {}) {
  return {
    authenticated,
    token: authenticated ? token : undefined,
    tokenParsed: authenticated
      ? {
          sub,
          name,
          preferred_username: name,
          resource_access: { purepixel: { roles } },
        }
      : undefined,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateToken: vi.fn().mockResolvedValue(true),
    hasResourceRole: vi.fn((role: string) => roles.includes(role)),
  };
}

// usage in a test file (vi.mock is hoisted, so load the helper inside the factory):
//
// vi.mock("@react-keycloak/web", async () => {
//   const { createKeycloakMock } = await import("../test/keycloak");
//   return {
//     useKeycloak: () => ({
//       keycloak: createKeycloakMock({ roles: ["photographer"] }),
//       initialized: true,
//     }),
//   };
// });
