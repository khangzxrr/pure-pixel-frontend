import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import PhotoProfile from "./PhotoProfile";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const userData = {
  email: "an@example.com",
  resource_access: { purepixel: { roles: ["photographer"] } },
} as unknown as import("../../services/authTypes").KeycloakTokenParsed;

describe("PhotoProfile", () => {
  it("shows the profile info, storage bar for photographers, and opens follower/following modals", async () => {
    mockEndpoint("get", "*/me", {
      name: "An",
      avatar: "a.png",
      sellingPhotoCount: 3,
      maxPhotoQuota: 100,
      photoQuotaUsage: 20,
      _count: { photos: 5, followings: 2, followers: 1 },
    });
    mockEndpoint("get", "*/me/current-upgrade-package", {
      upgradePackageHistory: { name: "Pro" },
      expiredAt: "2030-01-01T00:00:00.000Z",
    });
    mockEndpoint("get", "*/follow/me/follower", { objects: [], totalPage: 0 });
    mockEndpoint("get", "*/follow/me/following", { objects: [], totalPage: 0 });

    renderWithProviders(<PhotoProfile userData={userData} />);

    expect(await screen.findByText("An")).toBeInTheDocument();
    expect(screen.getByText("an@example.com")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Người theo dõi:/));
    expect(
      await screen.findByText("Chưa ai theo dõi bạn!"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Đang theo dõi:/));
    expect(
      await screen.findByText("Bạn chưa theo dõi ai cả!"),
    ).toBeInTheDocument();
  });

  it("shows the upgrade prompt for non-photographer users", async () => {
    mockEndpoint("get", "*/me", {
      name: "An",
      _count: { photos: 0, followings: 0, followers: 0 },
    });
    mockEndpoint("get", "*/me/current-upgrade-package", {});

    renderWithProviders(<PhotoProfile userData={{} as never} />);

    await screen.findByText("An");
    expect(screen.getByText(/Không xác định/)).toBeInTheDocument();
  });

  it("shows an error when the profile request fails", async () => {
    mockEndpoint("get", "*/me/current-upgrade-package", {});
    const { http, HttpResponse } = await import("msw");
    const { server } = await import("../../test/server");
    server.use(
      http.get("*/me", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<PhotoProfile userData={userData} />);

    expect(
      await screen.findByText(/Request failed with status code 500/),
    ).toBeInTheDocument();
  });
});
