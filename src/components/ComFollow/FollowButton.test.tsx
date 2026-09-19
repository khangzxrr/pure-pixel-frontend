import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import FollowButton, { type FollowablePhotographer } from "./FollowButton";

const auth = vi.hoisted(() => ({ authenticated: true }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({ authenticated: auth.authenticated }),
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const LOGIN_WARNING = "Bạn cần đăng nhập tài khoản để sử dụng được tính năng này";

const captureFollow = (method: "post" | "delete", status = 200) => {
  const followed: string[] = [];
  const handler = method === "post" ? http.post : http.delete;
  server.use(
    handler("*/follow/me/following/:id", ({ params }) => {
      followed.push(String(params.id));
      return status < 400
        ? HttpResponse.json({})
        : new HttpResponse(null, { status });
    }),
  );
  return followed;
};

// queries the button invalidates on success, so their staleness can be observed
const seededClient = () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(["followings-me"], []);
  queryClient.setQueryData(["me"], { id: "user-1" });
  return queryClient;
};

const isInvalidated = (
  queryClient: ReturnType<typeof createTestQueryClient>,
  key: string,
) => queryClient.getQueryState([key])?.isInvalidated;

describe("FollowButton", () => {
  beforeEach(() => {
    auth.authenticated = true;
    // the component still passes antd's deprecated `visible` prop; hide only that warning
    const realError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (String(args[0]).includes("`visible` is deprecated")) {
        return;
      }
      realError(...args);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("signed out", () => {
    beforeEach(() => {
      auth.authenticated = false;
    });

    it("asks the visitor to sign in instead of following", async () => {
      renderWithProviders(<FollowButton photographer={{ id: "ph1" }} />);
      expect(screen.queryByText(LOGIN_WARNING)).toBeNull();

      await userEvent.click(screen.getByRole("button", { name: "Theo dõi" }));

      await waitFor(() => expect(screen.getByText(LOGIN_WARNING)).toBeVisible());

      await userEvent.click(screen.getByRole("button", { name: "Close" }));

      await waitFor(() => expect(screen.getByText(LOGIN_WARNING)).not.toBeVisible());
    });

    it("shows follow even for followed photographers", () => {
      renderWithProviders(
        <FollowButton photographer={{ id: "ph1", isFollowed: true }} />,
      );
      expect(screen.getByRole("button", { name: "Theo dõi" })).toBeInTheDocument();
    });
  });

  it("follows a photographer and refreshes the follow lists", async () => {
    const followed = captureFollow("post");
    const queryClient = seededClient();
    const photographer: FollowablePhotographer = { id: "ph1", isFollowed: false };
    renderWithProviders(<FollowButton photographer={photographer} />, {
      queryClient,
    });
    const button = screen.getByRole("button", { name: "Theo dõi" });
    expect(button.parentElement).toHaveClass("bg-[#6b7280]");

    await userEvent.click(button);

    const following = await screen.findByRole("button", { name: "Đang theo dõi" });
    expect(following.parentElement).toHaveClass("bg-[#4e78cb]");
    expect(followed).toEqual(["ph1"]);
    expect(photographer.isFollowed).toBe(true);
    expect(isInvalidated(queryClient, "followings-me")).toBe(true);
    expect(isInvalidated(queryClient, "me")).toBe(true);
  });

  it("unfollows a followed photographer and refreshes the follow lists", async () => {
    const unfollowed = captureFollow("delete");
    const queryClient = seededClient();
    const photographer: FollowablePhotographer = { id: "ph2", isFollowed: true };
    renderWithProviders(<FollowButton photographer={photographer} />, {
      queryClient,
    });

    await userEvent.click(screen.getByRole("button", { name: "Đang theo dõi" }));

    expect(await screen.findByRole("button", { name: "Theo dõi" })).toBeInTheDocument();
    expect(unfollowed).toEqual(["ph2"]);
    expect(photographer.isFollowed).toBe(false);
    expect(isInvalidated(queryClient, "followings-me")).toBe(true);
    expect(isInvalidated(queryClient, "me")).toBe(true);
  });

  it("logs a failed follow and keeps the state", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    captureFollow("post", 500);
    const queryClient = seededClient();
    const photographer: FollowablePhotographer = { id: "ph1" };
    renderWithProviders(<FollowButton photographer={photographer} />, {
      queryClient,
    });

    await userEvent.click(screen.getByRole("button", { name: "Theo dõi" }));

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith("Follow error:", expect.any(Error)),
    );
    expect(photographer.isFollowed).toBeUndefined();
    expect(screen.getByRole("button", { name: "Theo dõi" })).toBeInTheDocument();
    expect(isInvalidated(queryClient, "me")).toBe(false);
  });

  it("logs a failed unfollow and keeps the state", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    captureFollow("delete", 500);
    const photographer: FollowablePhotographer = { id: "ph2", isFollowed: true };
    renderWithProviders(<FollowButton photographer={photographer} />);

    await userEvent.click(screen.getByRole("button", { name: "Đang theo dõi" }));

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith("Unfollow error:", expect.any(Error)),
    );
    expect(photographer.isFollowed).toBe(true);
    expect(screen.getByRole("button", { name: "Đang theo dõi" })).toBeInTheDocument();
  });
});
