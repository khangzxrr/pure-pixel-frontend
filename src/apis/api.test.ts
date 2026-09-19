import type { AxiosResponse } from "axios";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../test/server";

const auth = vi.hoisted(() => ({
  isLoggedIn: vi.fn(() => false),
  getToken: vi.fn(() => "token-1"),
}));

vi.mock("../services/Keycloak", () => ({ default: auth }));

import { deleteData, getData, patchData, postData, putData } from "./api";

describe("api helpers", () => {
  beforeEach(() => {
    auth.isLoggedIn.mockReturnValue(false);
  });

  describe("getData", () => {
    it("returns the full response and sends params and token", async () => {
      auth.isLoggedIn.mockReturnValue(true);
      let url = "";
      let authorization: string | null = null;
      server.use(
        mswHttp.get("*/items", ({ request }) => {
          url = request.url;
          authorization = request.headers.get("authorization");
          return HttpResponse.json({ objects: [1] });
        }),
      );

      const response = await getData<{ objects: number[] }>("/items", {
        page: 2,
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ objects: [1] });
      expect(new URL(url).searchParams.get("page")).toBe("2");
      expect(authorization).toBe("Bearer token-1");
    });

    it("rejects on errors", async () => {
      server.use(
        mswHttp.get("*/items", () => new HttpResponse(null, { status: 500 })),
      );
      await expect(getData("/items")).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });

  describe("postData", () => {
    it("returns the response body", async () => {
      server.use(
        mswHttp.post("*/items", async ({ request }) =>
          HttpResponse.json({ received: await request.json() }),
        ),
      );
      await expect(postData("/items", { a: 1 })).resolves.toEqual({
        received: { a: 1 },
      });
    });

    it("rejects with the server response", async () => {
      server.use(
        mswHttp.post("*/items", () =>
          HttpResponse.json({ message: "nope" }, { status: 401 }),
        ),
      );
      const rejection = (await postData("/items", {}).catch(
        (e: unknown) => e,
      )) as AxiosResponse;
      expect(rejection.status).toBe(401);
      expect(rejection.data).toEqual({ message: "nope" });
    });

    it("rethrows errors without a response", async () => {
      server.use(mswHttp.post("*/items", () => HttpResponse.error()));
      await expect(postData("/items", {})).rejects.toMatchObject({
        message: "Network Error",
      });
    });
  });

  describe.each([
    ["putData", putData, mswHttp.put],
    ["patchData", patchData, mswHttp.patch],
    ["deleteData", deleteData, mswHttp.delete],
  ] as const)("%s", (_name, helper, method) => {
    it("targets endpoint/id and returns the body", async () => {
      server.use(
        method("*/items/7", async ({ request }) =>
          HttpResponse.json({ body: await request.json() }),
        ),
      );
      await expect(helper("/items", 7, { a: 1 })).resolves.toEqual({
        body: { a: 1 },
      });
    });

    it("resolves with undefined on 401", async () => {
      server.use(
        method("*/items/7", () => new HttpResponse(null, { status: 401 })),
      );
      await expect(helper("/items", 7, {})).resolves.toBeUndefined();
    });

    it("rejects on other errors", async () => {
      server.use(
        method("*/items/7", () => new HttpResponse(null, { status: 403 })),
      );
      await expect(helper("/items", 7, {})).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });
});
