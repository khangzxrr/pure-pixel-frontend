import { AuthentikClient } from "./AuthentikClient";

const authority = "https://auth.test/application/o/purepixel/";
const clientId = "purepixel";
const registerUrl = "https://auth.test/if/flow/purepixel-enrollment/";

const now = () => Math.floor(Date.now() / 1000);

const base64url = (json: string) =>
  btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const jwt = (payload: Record<string, unknown>) =>
  `h.${base64url(JSON.stringify(payload))}.s`;

const makeUserManager = () => ({
  getUser: vi.fn(),
  signinRedirect: vi.fn(),
  signinRedirectCallback: vi.fn(),
  signinSilent: vi.fn(),
  signoutRedirect: vi.fn(),
  removeUser: vi.fn(),
  metadataService: { getUserInfoEndpoint: vi.fn() },
});

type FakeUserManager = ReturnType<typeof makeUserManager>;

const makeOidcClient = () => ({ createSigninRequest: vi.fn() });

type FakeOidcClient = ReturnType<typeof makeOidcClient>;

const makeClient = (
  userManager: FakeUserManager,
  oidcClient?: FakeOidcClient,
) =>
  new AuthentikClient({
    authority,
    clientId,
    registerUrl,
    userManager,
    oidcClient,
  });

const makeUser = (
  payload: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
) => ({
  access_token: jwt(payload),
  id_token: jwt({ sub: "u1" }),
  refresh_token: "r1",
  expired: false,
  state: undefined,
  ...overrides,
});

// wires an AuthentikClient with getUser resolving an authenticated user for the given exp,
// then runs check-sso init on it, for tests that only care about post-init behaviour
const authenticatedClient = async (exp: number) => {
  const userManager = makeUserManager();
  userManager.getUser.mockResolvedValue(makeUser({ sub: "u1", exp }));
  const client = makeClient(userManager);
  await client.init({ onLoad: "check-sso" });
  return client;
};

let locationAssign: ReturnType<typeof vi.fn>;
let locationReplace: ReturnType<typeof vi.fn>;

const setLocation = (href: string) => {
  const url = new URL(href);
  locationAssign = vi.fn();
  locationReplace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      href: url.href,
      origin: url.origin,
      search: url.search,
      assign: locationAssign,
      replace: locationReplace,
    },
  });
};

beforeEach(() => {
  setLocation("http://localhost:3000/");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("AuthentikClient", () => {
  it("check-sso resolves a non-expired session from getUser", async () => {
    const userManager = makeUserManager();
    const user = makeUser({
      sub: "u1",
      exp: now() + 300,
      resource_access: { purepixel: { roles: ["photographer"] } },
    });
    userManager.getUser.mockResolvedValue(user);
    const onReady = vi.fn();
    const onAuthSuccess = vi.fn();
    const client = makeClient(userManager);
    client.onReady = onReady;
    client.onAuthSuccess = onAuthSuccess;

    await expect(client.init({ onLoad: "check-sso" })).resolves.toBe(true);

    expect(client.authenticated).toBe(true);
    expect(client.token).toBe(user.access_token);
    expect(client.tokenParsed?.sub).toBe("u1");
    expect(client.subject).toBe("u1");
    expect(client.refreshToken).toBe("r1");
    expect(onReady).toHaveBeenCalledWith(true);
    expect(onAuthSuccess).toHaveBeenCalledTimes(1);
    expect(userManager.signinSilent).not.toHaveBeenCalled();
  });

  it("check-sso falls back to signinSilent when there is no cached user", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(null);
    userManager.signinSilent.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 300 }),
    );
    const client = makeClient(userManager);

    await expect(client.init({ onLoad: "check-sso" })).resolves.toBe(true);
    expect(client.authenticated).toBe(true);
  });

  it("check-sso resolves unauthenticated when signinSilent rejects", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(null);
    userManager.signinSilent.mockRejectedValue(new Error("no session"));
    const onReady = vi.fn();
    const onAuthError = vi.fn();
    const client = makeClient(userManager);
    client.onReady = onReady;
    client.onAuthError = onAuthError;

    await expect(client.init({ onLoad: "check-sso" })).resolves.toBe(false);

    expect(client.authenticated).toBe(false);
    expect(client.token).toBeUndefined();
    expect(onReady).toHaveBeenCalledWith(false);
    expect(onAuthError).not.toHaveBeenCalled();
  });

  it("treats an already-expired cached user as unauthenticated", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() - 10 }, { expired: true }),
    );
    userManager.signinSilent.mockRejectedValue(new Error("no session"));
    const client = makeClient(userManager);

    await expect(client.init({ onLoad: "check-sso" })).resolves.toBe(false);
  });

  it("completes the redirect callback and returns to the saved returnTo URL", async () => {
    setLocation("http://localhost:3000/?code=c&state=s");
    const userManager = makeUserManager();
    const user = makeUser(
      { sub: "u1", exp: now() + 300 },
      { state: { returnTo: "http://localhost:3000/photo/1" } },
    );
    userManager.signinRedirectCallback.mockResolvedValue(user);
    const client = makeClient(userManager);

    await expect(client.init()).resolves.toBe(true);

    expect(locationReplace).toHaveBeenCalledWith(
      "http://localhost:3000/photo/1",
    );
  });

  it("strips code and state from the URL when there is no returnTo", async () => {
    setLocation("http://localhost:3000/?code=c&state=s");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const userManager = makeUserManager();
    const user = makeUser({ sub: "u1", exp: now() + 300 });
    userManager.signinRedirectCallback.mockResolvedValue(user);
    const client = makeClient(userManager);

    await client.init();

    expect(replaceState).toHaveBeenCalled();
    const strippedUrl = String(replaceState.mock.calls[0][2]);
    expect(strippedUrl).not.toContain("code=");
    expect(strippedUrl).not.toContain("state=");
    expect(locationReplace).not.toHaveBeenCalled();
  });

  it("resolves unauthenticated and calls onAuthError when the redirect callback rejects", async () => {
    setLocation("http://localhost:3000/?code=c&state=s");
    const userManager = makeUserManager();
    userManager.signinRedirectCallback.mockRejectedValue(
      new Error("bad state"),
    );
    const onAuthError = vi.fn();
    const client = makeClient(userManager);
    client.onAuthError = onAuthError;

    await expect(client.init()).resolves.toBe(false);
    expect(onAuthError).toHaveBeenCalled();
  });

  it("only calls getUser once for duplicate init calls, both resolving the same value", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 300 }),
    );
    const client = makeClient(userManager);

    const [first, second] = await Promise.all([client.init(), client.init()]);

    expect(userManager.getUser).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("redirects to login when onLoad is login-required and there is no session", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(null);
    userManager.signinSilent.mockRejectedValue(new Error("no session"));
    const client = makeClient(userManager);

    await client.init({ onLoad: "login-required" });

    expect(userManager.signinRedirect).toHaveBeenCalled();
  });

  it("login() calls signinRedirect with the current URL as returnTo", async () => {
    setLocation("http://localhost:3000/explore");
    const userManager = makeUserManager();
    const client = makeClient(userManager);

    await client.login();

    expect(userManager.signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: "http://localhost:3000/explore" },
    });
  });

  it("login({ redirectUri }) uses the given redirect URI as returnTo", async () => {
    const userManager = makeUserManager();
    const client = makeClient(userManager);

    await client.login({ redirectUri: "http://x/y" });

    expect(userManager.signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: "http://x/y" },
    });
  });

  it("register() requests a signin request for the current URL and assigns the enrollment flow URL with the relative authorize path as next", async () => {
    setLocation("http://localhost:3000/explore");
    const userManager = makeUserManager();
    const oidcClient = makeOidcClient();
    oidcClient.createSigninRequest.mockResolvedValue({
      url: "https://auth.test/application/o/authorize/?client_id=purepixel&state=abc",
    });
    const client = makeClient(userManager, oidcClient);

    await client.register();

    expect(oidcClient.createSigninRequest).toHaveBeenCalledWith({
      state: { returnTo: "http://localhost:3000/explore" },
    });
    expect(locationAssign).toHaveBeenCalledWith(
      "https://auth.test/if/flow/purepixel-enrollment/?next=" +
        encodeURIComponent(
          "/application/o/authorize/?client_id=purepixel&state=abc",
        ),
    );
  });

  it("register({ redirectUri }) uses the given redirect URI as returnTo and assigns a relative next", async () => {
    const userManager = makeUserManager();
    const oidcClient = makeOidcClient();
    oidcClient.createSigninRequest.mockResolvedValue({
      url: "https://auth.test/application/o/authorize/?client_id=purepixel&state=xyz",
    });
    const client = makeClient(userManager, oidcClient);

    await client.register({ redirectUri: "http://a/b" });

    expect(oidcClient.createSigninRequest).toHaveBeenCalledWith({
      state: { returnTo: "http://a/b" },
    });
    const assignedUrl = String(locationAssign.mock.calls[0][0]);
    expect(
      assignedUrl.startsWith(
        "https://auth.test/if/flow/purepixel-enrollment/?next=" +
          encodeURIComponent("/application/o/authorize/"),
      ),
    ).toBe(true);
  });

  it("logout() after an authenticated init clears state and redirects with the previous id token hint", async () => {
    setLocation("http://localhost:3000/");
    const userManager = makeUserManager();
    const user = makeUser({ sub: "u1", exp: now() + 300 });
    userManager.getUser.mockResolvedValue(user);
    const onAuthLogout = vi.fn();
    const client = makeClient(userManager);
    client.onAuthLogout = onAuthLogout;
    await client.init({ onLoad: "check-sso" });

    await client.logout();

    expect(userManager.removeUser).toHaveBeenCalled();
    expect(client.authenticated).toBe(false);
    expect(client.token).toBeUndefined();
    expect(onAuthLogout).toHaveBeenCalled();
    expect(userManager.signoutRedirect).toHaveBeenCalledWith({
      id_token_hint: user.id_token,
      post_logout_redirect_uri: "http://localhost:3000/",
    });
  });

  it("updateToken(5) rejects when not authenticated", async () => {
    const userManager = makeUserManager();
    const client = makeClient(userManager);

    await expect(client.updateToken(5)).rejects.toBeInstanceOf(Error);
  });

  it("updateToken(5) resolves false without refreshing when the token is not near expiry", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 300 }),
    );
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    await expect(client.updateToken(5)).resolves.toBe(false);
    expect(userManager.signinSilent).not.toHaveBeenCalled();
  });

  it("updateToken(5) refreshes and replaces the token when close to expiry", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 3 }),
    );
    const refreshed = makeUser({ sub: "u1", exp: now() + 300 });
    userManager.signinSilent.mockResolvedValue(refreshed);
    const onAuthRefreshSuccess = vi.fn();
    const client = makeClient(userManager);
    client.onAuthRefreshSuccess = onAuthRefreshSuccess;
    await client.init({ onLoad: "check-sso" });

    await expect(client.updateToken(5)).resolves.toBe(true);

    expect(userManager.signinSilent).toHaveBeenCalled();
    expect(client.token).toBe(refreshed.access_token);
    expect(onAuthRefreshSuccess).toHaveBeenCalled();
  });

  it("updateToken(-1) always refreshes regardless of remaining lifetime", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 300 }),
    );
    userManager.signinSilent.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 600 }),
    );
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    await expect(client.updateToken(-1)).resolves.toBe(true);
    expect(userManager.signinSilent).toHaveBeenCalled();
  });

  it("updateToken(5) rejects and calls onAuthRefreshError when signinSilent rejects", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 3 }),
    );
    userManager.signinSilent.mockRejectedValue(new Error("refresh failed"));
    const onAuthRefreshError = vi.fn();
    const client = makeClient(userManager);
    client.onAuthRefreshError = onAuthRefreshError;
    await client.init({ onLoad: "check-sso" });

    await expect(client.updateToken(5)).rejects.toBeInstanceOf(Error);
    expect(onAuthRefreshError).toHaveBeenCalled();
  });

  it("shares a single signinSilent call between two concurrent updateToken(-1) calls", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 300 }),
    );
    userManager.signinSilent.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 600 }),
    );
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    const [first, second] = await Promise.all([
      client.updateToken(-1),
      client.updateToken(-1),
    ]);

    expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
    expect(first).toBe(true);
    expect(second).toBe(true);
  });

  it("hasResourceRole checks the roles on the given resource, defaulting to the client id", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({
        sub: "u1",
        exp: now() + 300,
        resource_access: { purepixel: { roles: ["photographer"] } },
      }),
    );
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    expect(client.hasResourceRole("photographer")).toBe(true);
    expect(client.hasResourceRole("manager")).toBe(false);
    expect(client.hasResourceRole("photographer", "other")).toBe(false);
  });

  it("hasResourceRole returns false when unauthenticated", () => {
    const userManager = makeUserManager();
    const client = makeClient(userManager);

    expect(client.hasResourceRole("x")).toBe(false);
  });

  it("hasRealmRole returns false when there is no realm_access claim", async () => {
    const client = await authenticatedClient(now() + 300);

    expect(client.hasRealmRole("admin")).toBe(false);
  });

  it("isTokenExpired compares exp against now and the optional minValidity", async () => {
    const expiredClient = await authenticatedClient(now() - 1);
    expect(expiredClient.isTokenExpired()).toBe(true);

    const validClient = await authenticatedClient(now() + 100);
    expect(validClient.isTokenExpired()).toBe(false);
    expect(validClient.isTokenExpired(200)).toBe(true);
  });

  it("exposes the configured clientId and the resourceAccess claim after init", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({
        sub: "u1",
        exp: now() + 300,
        resource_access: { purepixel: { roles: ["photographer"] } },
      }),
    );
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    expect(client.clientId).toBe("purepixel");
    expect(client.resourceAccess).toEqual({
      purepixel: { roles: ["photographer"] },
    });
  });

  it("loadUserProfile fetches the userinfo endpoint with a bearer token and maps the claims", async () => {
    const userManager = makeUserManager();
    const user = makeUser({ sub: "u1", exp: now() + 300 });
    userManager.getUser.mockResolvedValue(user);
    userManager.metadataService.getUserInfoEndpoint.mockResolvedValue(
      "https://auth.test/application/o/userinfo/",
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "u1",
        preferred_username: "ann",
        email: "a@x",
        given_name: "Ann",
        family_name: "Le",
        email_verified: true,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = makeClient(userManager);
    await client.init({ onLoad: "check-sso" });

    await expect(client.loadUserProfile()).resolves.toEqual({
      id: "u1",
      username: "ann",
      email: "a@x",
      firstName: "Ann",
      lastName: "Le",
      emailVerified: true,
    });

    const authHeader = "Bea" + "rer " + user.access_token;
    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.test/application/o/userinfo/",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: authHeader }),
      }),
    );
  });

  it("accountManagement() assigns the Authentik user account page", () => {
    const userManager = makeUserManager();
    const client = makeClient(userManager);

    client.accountManagement();

    expect(locationAssign).toHaveBeenCalledWith("https://auth.test/if/user/");
  });

  it("calls onTokenExpired once the access token's exp is reached", async () => {
    vi.useFakeTimers();
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue(
      makeUser({ sub: "u1", exp: now() + 10 }),
    );
    const onTokenExpired = vi.fn();
    const client = makeClient(userManager);
    client.onTokenExpired = onTokenExpired;

    await client.init({ onLoad: "check-sso" });
    await vi.advanceTimersByTimeAsync(10_000);

    expect(onTokenExpired).toHaveBeenCalledTimes(1);
  });

  it("accepts an opaque (non-JWT) access token as authenticated with no parsed claims", async () => {
    const userManager = makeUserManager();
    userManager.getUser.mockResolvedValue({
      access_token: "opaque",
      id_token: jwt({ sub: "u1" }),
      refresh_token: "r1",
      expired: false,
      state: undefined,
    });
    const client = makeClient(userManager);

    await client.init({ onLoad: "check-sso" });

    expect(client.authenticated).toBe(true);
    expect(client.tokenParsed).toBeUndefined();
    expect(client.hasResourceRole("x")).toBe(false);
  });
});
