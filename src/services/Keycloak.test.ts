type FakeKeycloak = {
  token?: string;
  tokenParsed?: { sub?: string; realm_access?: { roles: string[] } };
  resourceAccess?: Record<string, { roles: string[] }>;
  login: ReturnType<typeof vi.fn>;
  updateToken: ReturnType<typeof vi.fn>;
  hasResourceRole: ReturnType<typeof vi.fn>;
};

const fake = vi.hoisted(
  (): FakeKeycloak => ({
    login: vi.fn(),
    updateToken: vi.fn(),
    hasResourceRole: vi.fn(),
  }),
);

vi.mock("keycloak-js", () => ({
  default: vi.fn(function () {
    return fake;
  }),
}));

import UserService from "./Keycloak";

describe("UserService", () => {
  beforeEach(() => {
    fake.token = undefined;
    fake.tokenParsed = undefined;
    fake.resourceAccess = undefined;
    vi.clearAllMocks();
  });

  it("exposes the keycloak instance", () => {
    expect(UserService.keycloakService).toBe(fake);
  });

  it("reports login state and token from the instance", () => {
    expect(UserService.isLoggedIn()).toBe(false);
    expect(UserService.getToken()).toBeUndefined();

    fake.token = "abc";
    fake.tokenParsed = { sub: "user-1" };
    expect(UserService.isLoggedIn()).toBe(true);
    expect(UserService.getToken()).toBe("abc");
    expect(UserService.getTokenParsed()).toEqual({ sub: "user-1" });
    expect(UserService.getUserId()).toBe("user-1");
  });

  it("returns no user id before login", () => {
    expect(UserService.getUserId()).toBeUndefined();
  });

  it("refreshes tokens that expire within 5 seconds", async () => {
    fake.updateToken.mockResolvedValue(true);
    await expect(UserService.updateToken()).resolves.toBe(true);
    expect(fake.updateToken).toHaveBeenCalledWith(5);
  });

  it("sends the user to login when the refresh fails", async () => {
    fake.updateToken.mockRejectedValue(new Error("expired"));
    await expect(UserService.updateToken()).resolves.toBeUndefined();
    expect(fake.login).toHaveBeenCalled();
  });

  it("checks client roles", () => {
    fake.hasResourceRole.mockImplementation(
      (role: string) => role === "photographer",
    );
    expect(UserService.hasRole(["customer", "photographer"])).toBe(true);
    expect(UserService.hasRole(["customer"])).toBe(false);
    expect(UserService.hasRole(undefined)).toBeUndefined();
  });

  it("returns resource access only when the token has realm access", () => {
    expect(UserService.getUserRoles()).toEqual([]);

    fake.tokenParsed = { sub: "user-1" };
    expect(UserService.getUserRoles()).toEqual([]);

    fake.tokenParsed = { sub: "user-1", realm_access: { roles: [] } };
    fake.resourceAccess = { purepixel: { roles: ["photographer"] } };
    expect(UserService.getUserRoles()).toEqual({
      purepixel: { roles: ["photographer"] },
    });
  });
});
