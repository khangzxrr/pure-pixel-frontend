import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../test/server";

const auth = vi.hoisted(() => ({
  isLoggedIn: vi.fn(() => true),
  getToken: vi.fn(() => "token-1"),
  updateToken: vi.fn(async (): Promise<boolean | undefined> => false),
  forceRefreshToken: vi.fn(async (): Promise<boolean | undefined> => true),
}));

vi.mock("./Keycloak", () => ({ default: auth }));

import {
  attachTokenRefresh,
  authorizeRequest,
  refreshAndRetry,
  resetTokenRefreshState,
} from "./tokenRefresh";

const makeConfig = () =>
  ({ headers: new AxiosHeaders() }) as InternalAxiosRequestConfig;

const secureEndpoint = (validToken = "Bearer token-2") => {
  const seen: (string | null)[] = [];
  server.use(
    mswHttp.get("http://api.test/secure", ({ request }) => {
      const authorization = request.headers.get("authorization");
      seen.push(authorization);
      return authorization === validToken
        ? HttpResponse.json({ ok: true })
        : new HttpResponse(null, { status: 401 });
    }),
  );
  return seen;
};

describe("tokenRefresh", () => {
  beforeEach(() => {
    resetTokenRefreshState();
    auth.isLoggedIn.mockReturnValue(true);
    auth.getToken.mockReturnValue("token-1");
    auth.updateToken.mockReset().mockResolvedValue(false);
    auth.forceRefreshToken.mockReset().mockImplementation(async () => {
      auth.getToken.mockReturnValue("token-2");
      return true;
    });
  });

  describe("authorizeRequest", () => {
    it("leaves the config untouched and skips refreshing when signed out", async () => {
      auth.isLoggedIn.mockReturnValue(false);
      const result = await authorizeRequest(makeConfig());
      expect(result.headers.Authorization).toBeUndefined();
      expect(auth.updateToken).not.toHaveBeenCalled();
    });

    it("refreshes a soon-to-expire token and sends the fresh one", async () => {
      auth.updateToken.mockImplementation(async () => {
        auth.getToken.mockReturnValue("token-fresh");
        return true;
      });
      const result = await authorizeRequest(makeConfig());
      expect(auth.updateToken).toHaveBeenCalledTimes(1);
      expect(result.headers.Authorization).toBe("Bearer token-fresh");
    });

    it("still sends the current token when no refresh was needed", async () => {
      const result = await authorizeRequest(makeConfig());
      expect(result.headers.Authorization).toBe("Bearer token-1");
    });
  });

  describe("refreshAndRetry", () => {
    it("rejects non-axios errors unchanged", async () => {
      const error = new Error("boom");
      await expect(refreshAndRetry(axios.create())(error)).rejects.toBe(error);
      expect(auth.forceRefreshToken).not.toHaveBeenCalled();
    });

    it("rejects non-401 axios errors unchanged", async () => {
      const client = axios.create();
      server.use(
        mswHttp.get("http://api.test/forbidden", () =>
          new HttpResponse(null, { status: 403 }),
        ),
      );
      const error = await client
        .get("http://api.test/forbidden")
        .catch((e: unknown) => e);
      await expect(refreshAndRetry(client)(error)).rejects.toBe(error);
      expect(auth.forceRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("attachTokenRefresh", () => {
    it("returns the same instance", () => {
      const client = axios.create();
      expect(attachTokenRefresh(client)).toBe(client);
    });

    it("refreshes and retries a 401 exactly once", async () => {
      const client = attachTokenRefresh(axios.create());
      const seen = secureEndpoint();

      const response = await client.get("http://api.test/secure");

      expect(response.data).toEqual({ ok: true });
      expect(seen).toEqual(["Bearer token-1", "Bearer token-2"]);
      expect(auth.forceRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("gives up after one retry when the server keeps answering 401", async () => {
      const client = attachTokenRefresh(axios.create());
      const seen = secureEndpoint("Bearer never-valid");

      await expect(client.get("http://api.test/secure")).rejects.toMatchObject(
        { response: { status: 401 } },
      );
      expect(seen).toHaveLength(2);
      expect(auth.forceRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("does not retry when the refresh fails", async () => {
      auth.forceRefreshToken.mockResolvedValue(undefined);
      const client = attachTokenRefresh(axios.create());
      const seen = secureEndpoint();

      await expect(client.get("http://api.test/secure")).rejects.toMatchObject(
        { response: { status: 401 } },
      );
      expect(seen).toEqual(["Bearer token-1"]);
    });

    it("does not refresh when signed out", async () => {
      auth.isLoggedIn.mockReturnValue(false);
      const client = attachTokenRefresh(axios.create());
      const seen = secureEndpoint();

      await expect(client.get("http://api.test/secure")).rejects.toMatchObject(
        { response: { status: 401 } },
      );
      expect(seen).toEqual([null]);
      expect(auth.forceRefreshToken).not.toHaveBeenCalled();
    });

    it("shares one refresh between concurrent 401s", async () => {
      let release: (value: boolean) => void = () => undefined;
      auth.forceRefreshToken.mockImplementation(
        () =>
          new Promise<boolean>((resolve) => {
            release = (value) => {
              auth.getToken.mockReturnValue("token-2");
              resolve(value);
            };
          }),
      );
      const client = attachTokenRefresh(axios.create());
      const seen = secureEndpoint();

      const requests = Promise.all([
        client.get("http://api.test/secure"),
        client.get("http://api.test/secure"),
        client.get("http://api.test/secure"),
      ]);
      await vi.waitFor(() =>
        expect(seen.filter((a) => a === "Bearer token-1")).toHaveLength(3),
      );
      await vi.waitFor(() =>
        expect(auth.forceRefreshToken).toHaveBeenCalledTimes(1),
      );
      release(true);

      const responses = await requests;
      expect(responses.map((r) => r.data)).toEqual([
        { ok: true },
        { ok: true },
        { ok: true },
      ]);
      expect(auth.forceRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("starts a new refresh once the previous one has settled", async () => {
      const client = attachTokenRefresh(axios.create());
      secureEndpoint();

      await client.get("http://api.test/secure");
      auth.getToken.mockReturnValue("token-1");
      await client.get("http://api.test/secure");

      expect(auth.forceRefreshToken).toHaveBeenCalledTimes(2);
    });
  });
});
