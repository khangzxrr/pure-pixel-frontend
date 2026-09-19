import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../test/server";

const auth = vi.hoisted(() => ({
  isLoggedIn: vi.fn(() => false),
  getToken: vi.fn(() => "token-1"),
  updateToken: vi.fn(async (): Promise<boolean | undefined> => false),
  forceRefreshToken: vi.fn(async (): Promise<boolean | undefined> => true),
}));

vi.mock("../services/Keycloak", () => ({ default: auth }));

import http, {
  authorizeRequest,
  externalHttp,
  logRequestError,
  timeoutHttpClient,
} from "./Http";

const captureAuthorization = () => {
  const seen: (string | null)[] = [];
  server.use(
    mswHttp.get("http://api.test/ping", ({ request }) => {
      seen.push(request.headers.get("authorization"));
      return HttpResponse.json({ ok: true });
    }),
  );
  return seen;
};

describe("Http clients", () => {
  beforeEach(() => {
    auth.isLoggedIn.mockReturnValue(false);
  });

  it("sends the bearer token when signed in", async () => {
    auth.isLoggedIn.mockReturnValue(true);
    const seen = captureAuthorization();

    await http.get("http://api.test/ping");

    expect(seen).toEqual(["Bearer token-1"]);
  });

  it("sends no token when signed out", async () => {
    const seen = captureAuthorization();

    await timeoutHttpClient().get("http://api.test/ping");

    expect(seen).toEqual([null]);
  });

  it("timeoutHttpClient also attaches the token", async () => {
    auth.isLoggedIn.mockReturnValue(true);
    const seen = captureAuthorization();

    await timeoutHttpClient(1000).get("http://api.test/ping");

    expect(seen).toEqual(["Bearer token-1"]);
  });

  it("uses a 30 second timeout unless told otherwise", () => {
    expect(http.defaults.timeout).toBe(30000);
    expect(timeoutHttpClient().defaults.timeout).toBe(30000);
    expect(timeoutHttpClient(600000).defaults.timeout).toBe(600000);
  });

  it("externalHttp never attaches the token", async () => {
    auth.isLoggedIn.mockReturnValue(true);
    const seen = captureAuthorization();

    await externalHttp.get("http://api.test/ping");

    expect(seen).toEqual([null]);
  });

  it("authorizeRequest leaves the config untouched when signed out", async () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    const result = await authorizeRequest(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("logRequestError logs and rejects with the same error", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = new Error("bad config");

    await expect(logRequestError("HTTP error: ")(error)).rejects.toBe(error);
    expect(log).toHaveBeenCalledWith("HTTP error: ", error);
    log.mockRestore();
  });
});

describe("Http clients token refresh", () => {
  beforeEach(() => {
    auth.isLoggedIn.mockReturnValue(true);
    auth.getToken.mockReturnValue("token-1");
    auth.updateToken.mockReset().mockResolvedValue(false);
    auth.forceRefreshToken.mockReset();
  });

  const unauthorizedUntilRefreshed = () => {
    const seen: (string | null)[] = [];
    server.use(
      mswHttp.get("http://api.test/secure", ({ request }) => {
        const authorization = request.headers.get("authorization");
        seen.push(authorization);
        return authorization === "Bearer token-2"
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 });
      }),
    );
    return seen;
  };

  it.each([
    ["http", () => http],
    ["timeoutHttpClient", () => timeoutHttpClient(1000)],
  ])("%s refreshes and retries once on 401", async (_name, client) => {
    auth.forceRefreshToken.mockImplementation(async () => {
      auth.getToken.mockReturnValue("token-2");
      return true;
    });
    const seen = unauthorizedUntilRefreshed();

    const response = await client().get("http://api.test/secure");

    expect(response.data).toEqual({ ok: true });
    expect(seen).toEqual(["Bearer token-1", "Bearer token-2"]);
    expect(auth.forceRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("refreshes a token that is about to expire before sending", async () => {
    auth.updateToken.mockImplementation(async () => {
      auth.getToken.mockReturnValue("token-2");
      return true;
    });
    const seen = unauthorizedUntilRefreshed();

    await http.get("http://api.test/secure");

    expect(seen).toEqual(["Bearer token-2"]);
    expect(auth.forceRefreshToken).not.toHaveBeenCalled();
  });

  it("externalHttp does not refresh on 401", async () => {
    unauthorizedUntilRefreshed();
    await expect(
      externalHttp.get("http://api.test/secure"),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(auth.forceRefreshToken).not.toHaveBeenCalled();
    expect(auth.updateToken).not.toHaveBeenCalled();
  });
});
