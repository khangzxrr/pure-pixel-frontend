import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import ChatApi from "./ChatApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ChatApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("auth returns the raw chat token", async () => {
    const requests = mockEndpoint("post", "*/chat/auth", () =>
      HttpResponse.text("signed-token"),
    );

    await expect(ChatApi.auth()).resolves.toBe("signed-token");
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/chat/auth",
        json: undefined,
      }),
    ]);
  });

  it("auth logs failures and resolves with undefined", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    mockEndpoint(
      "post",
      "*/chat/auth",
      () => new HttpResponse(null, { status: 500 }),
    );

    await expect(ChatApi.auth()).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ response: expect.objectContaining({ status: 500 }) }),
    );
  });
});
