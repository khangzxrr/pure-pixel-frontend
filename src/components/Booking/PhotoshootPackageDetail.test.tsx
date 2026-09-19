import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { buildPackage, buildUser } from "./bookingTestData";
import PhotoshootPackageDetail from "./PhotoshootPackageDetail";

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  tokenParsed: undefined as { sub?: string } | undefined,
}));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({ keycloak: { login: auth.login }, initialized: true }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => undefined,
    hasRole: () => false,
    getTokenParsed: () => auth.tokenParsed,
  },
}));

const renderDetail = () =>
  renderWithProviders(<PhotoshootPackageDetail />, {
    route: "/explore/booking-package/pkg-1",
    path: "/explore/booking-package/:photoshootPackageId",
  });

describe("PhotoshootPackageDetail", () => {
  afterEach(() => {
    auth.login.mockReset();
    auth.tokenParsed = undefined;
  });

  it("shows the package, its showcases and reviews", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photoshoot-package/:id",
      buildPackage({
        showcases: [{ id: "s-1", photoUrl: "https://cdn.test/s-1.jpg" }],
        reviews: [
          { id: "r-1", star: 5, description: "Rất hài lòng", user: buildUser() },
        ],
      }),
    );
    const { container } = renderDetail();

    expect(container.querySelector(".ant-skeleton")).not.toBeNull();
    expect(await screen.findByText("Rất hài lòng")).toBeInTheDocument();
    expect(screen.getByText("Bộ sưu tập")).toBeInTheDocument();
    expect(requests[0].path).toBe("/photoshoot-package/pkg-1");
  });

  it("asks a visitor to log in before booking", async () => {
    mockEndpoint("get", "*/photoshoot-package/:id", buildPackage());
    renderDetail();

    await userEvent.click(
      await screen.findByRole("button", { name: "Đăng nhập để đặt lịch" }),
    );

    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it("offers booking to a signed-in customer", async () => {
    auth.tokenParsed = { sub: "customer-1" };
    mockEndpoint("get", "*/photoshoot-package/:id", buildPackage());
    renderDetail();

    expect(
      await screen.findByRole("button", { name: "Đặt lịch" }),
    ).toBeInTheDocument();
  });

  it("keeps the skeleton when the package cannot be loaded", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package/:id", () =>
      HttpResponse.json({ message: "No PhotoshootPackage found" }, { status: 404 }),
    );
    const { container } = renderDetail();

    await waitFor(() => expect(requests).toHaveLength(1));
    // let the failed query settle
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container.querySelector(".ant-skeleton")).not.toBeNull();
    expect(screen.queryByText("Bộ sưu tập")).toBeNull();
  });
});
