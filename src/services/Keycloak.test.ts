const fake = vi.hoisted(() => ({
  token: undefined as string | undefined,
  tokenParsed: undefined as { sub?: string } | undefined,
  resourceAccess: undefined as unknown,
  login: vi.fn(),
  updateToken: vi.fn(),
  hasResourceRole: vi.fn(),
}));

const AuthentikClientMock = vi.hoisted(() => vi.fn());

vi.mock("./AuthentikClient", () => ({
  AuthentikClient: AuthentikClientMock,
}));

beforeEach(() => {
  vi.resetModules();
  AuthentikClientMock.mockClear();
  AuthentikClientMock.mockImplementation(() => fake);
  fake.token = undefined;
  fake.tokenParsed = undefined;
  fake.resourceAccess = undefined;
  fake.login.mockReset();
  fake.updateToken.mockReset();
  fake.hasResourceRole.mockReset();
  vi.stubEnv(
    "VITE_OIDC_AUTHORITY",
    "https://auth.test/application/o/purepixel/",
  );
  vi.stubEnv("VITE_OIDC_CLIENT_ID", "purepixel");
  vi.stubEnv(
    "VITE_AUTH_REGISTER_URL",
    "https://auth.test/if/flow/purepixel-enrollment/",
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Keycloak (Authentik-backed UserService)", () => {
  it("constructs AuthentikClient once with the OIDC config read from env", async () => {
    await import("./Keycloak");

    expect(AuthentikClientMock).toHaveBeenCalledTimes(1);
    expect(AuthentikClientMock).toHaveBeenCalledWith({
      authority: "https://auth.test/application/o/purepixel/",
      clientId: "purepixel",
      registerUrl: "https://auth.test/if/flow/purepixel-enrollment/",
    });
  });

  it("keycloakService is the AuthentikClient instance", async () => {
    const { default: UserService } = await import("./Keycloak");

    expect(UserService.keycloakService).toBe(fake);
  });

  it("getToken reads the client's token and isLoggedIn reflects whether it is set", async () => {
    const { default: UserService } = await import("./Keycloak");

    expect(UserService.getToken()).toBeUndefined();
    expect(UserService.isLoggedIn()).toBe(false);

    fake.token = "abc";
    expect(UserService.getToken()).toBe("abc");
    expect(UserService.isLoggedIn()).toBe(true);
  });

  it("getTokenParsed reads the client's tokenParsed and getUserId reads its sub claim", async () => {
    const { default: UserService } = await import("./Keycloak");

    expect(UserService.getUserId()).toBeUndefined();

    fake.tokenParsed = { sub: "u1" };
    expect(UserService.getTokenParsed()).toBe(fake.tokenParsed);
    expect(UserService.getUserId()).toBe("u1");
  });

  it("doLogin calls the client's login", async () => {
    const { default: UserService } = await import("./Keycloak");

    UserService.doLogin();

    expect(fake.login).toHaveBeenCalled();
  });

  it("updateToken calls the client's updateToken with 5 and resolves its result", async () => {
    fake.updateToken.mockResolvedValue(true);
    const { default: UserService } = await import("./Keycloak");

    await expect(UserService.updateToken()).resolves.toBe(true);
    expect(fake.updateToken).toHaveBeenCalledWith(5);
  });

  it("updateToken resolves undefined and logs in again when the client's updateToken rejects", async () => {
    fake.updateToken.mockRejectedValue(new Error("expired"));
    const { default: UserService } = await import("./Keycloak");

    await expect(UserService.updateToken()).resolves.toBeUndefined();
    expect(fake.login).toHaveBeenCalled();
  });

  it("forceRefreshToken always calls updateToken with -1, resolving its result or logging in again on failure", async () => {
    fake.updateToken.mockResolvedValueOnce(true);
    const { default: UserService } = await import("./Keycloak");

    await expect(UserService.forceRefreshToken()).resolves.toBe(true);
    expect(fake.updateToken).toHaveBeenCalledWith(-1);

    fake.updateToken.mockRejectedValueOnce(new Error("expired"));
    await expect(UserService.forceRefreshToken()).resolves.toBeUndefined();
    expect(fake.login).toHaveBeenCalled();
  });

  it("hasRole checks each role against hasResourceRole, and handles undefined/empty role lists", async () => {
    fake.hasResourceRole.mockImplementation((role: string) => role === "b");
    const { default: UserService } = await import("./Keycloak");

    expect(UserService.hasRole(["a", "b"])).toBe(true);
    expect(UserService.hasRole(undefined)).toBeUndefined();
    expect(UserService.hasRole([])).toBe(false);
  });

  it("getUserRoles returns [] without a parsed token and the client's resourceAccess when one is set", async () => {
    const { default: UserService } = await import("./Keycloak");

    expect(UserService.getUserRoles()).toEqual([]);

    fake.tokenParsed = { sub: "u1" };
    fake.resourceAccess = { purepixel: { roles: ["photographer"] } };
    expect(UserService.getUserRoles()).toBe(fake.resourceAccess);
  });
});
