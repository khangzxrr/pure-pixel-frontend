import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import PackagesUser from "./PackagesUser";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    updateToken: vi.fn(),
    forceRefreshToken: vi.fn(),
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
};

const renderPackagesUser = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/user/:userId/packages" element={<PackagesUser />} />
        <Route
          path="/user/booking-package/:id"
          element={<div>booking package page</div>}
        />
      </Routes>
      <LocationDisplay />
    </>,
    { route: "/user/u1/packages" },
  );

describe("PackagesUser", () => {
  it("loads photographer packages, formats prices, and opens a package from the card", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photoshoot-package/photographer/u1",
      {
        objects: [
          {
            id: "pkg-1",
            title: "Gói chụp cưới",
            thumbnail: "/wedding.jpg",
            price: 1500000,
          },
        ],
        totalPage: 1,
      },
    );

    renderPackagesUser();

    const title = await screen.findByText("Gói chụp cưới");
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      path: "/photoshoot-package/photographer/u1",
      query: { limit: "10", page: "0" },
    });

    await userEvent.click(title);

    expect(await screen.findByText("booking package page")).toBeInTheDocument();
    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/user/booking-package/pkg-1",
    );
  });

  it("opens a package from the detail shortcut", async () => {
    mockEndpoint("get", "*/photoshoot-package/photographer/u1", {
      objects: [
        {
          id: "pkg-2",
          title: "Gói ngoại cảnh",
          thumbnail: "/outdoor.jpg",
          price: 800000,
        },
      ],
      totalPage: 1,
    });

    renderPackagesUser();

    expect(await screen.findByText("Gói ngoại cảnh")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Xem chi tiết"));

    expect(await screen.findByText("booking package page")).toBeInTheDocument();
    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/user/booking-package/pkg-2",
    );
  });

  it("shows the empty state when the photographer has no packages", async () => {
    mockEndpoint("get", "*/photoshoot-package/photographer/u1", {
      objects: [],
      totalPage: 0,
    });

    renderPackagesUser();

    expect(
      await screen.findByText("Không có gói dịch vụ nào!"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Xem chi tiết")).toBeNull();
  });
});
