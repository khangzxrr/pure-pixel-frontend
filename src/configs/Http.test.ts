import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../test/server";

const auth = vi.hoisted(() => ({
  isLoggedIn: vi.fn(() => false),
  getToken: vi.fn(() => "token-1"),
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
