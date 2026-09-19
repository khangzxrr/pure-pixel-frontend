import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { buildPackage } from "./bookingTestData";
import PhotoshootPackageList from "./PhotoshootPackageList";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "user-1",
    hasRole: () => false,
  },
}));

const packages = [
  buildPackage(),
  buildPackage({ id: "pkg-2", title: "Gói kỷ yếu" }),
];

describe("PhotoshootPackageList", () => {
  afterEach(() => navigate.mockReset());

  it("loads the newest packages and opens one", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package", {
      objects: packages,
      totalPage: 1,
      totalRecord: 2,
    });
    const { container } = renderWithProviders(<PhotoshootPackageList />);

    expect(container.querySelectorAll(".ant-skeleton")).toHaveLength(4);
    expect(await screen.findByText("Gói kỷ yếu")).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "12",
      page: "0",
      orderByCreateAt: "desc",
    });
    expect(container.querySelector(".ant-pagination")).toBeNull();

    await userEvent.click(screen.getByText("Gói kỷ yếu"));
    expect(navigate).toHaveBeenCalledWith("pkg-2");
  });

  it("requests another page from the pagination", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package", {
      objects: packages,
      totalPage: 3,
      totalRecord: 30,
    });
    renderWithProviders(<PhotoshootPackageList />);
    await screen.findByText("Gói kỷ yếu");

    // the current page does not refetch
    await userEvent.click(screen.getByTitle("1"));
    expect(requests).toHaveLength(1);

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query.page).toBe("1");
  });

  it("renders no package when the request fails", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package", () =>
      HttpResponse.json({ message: "boom" }, { status: 500 }),
    );
    const { container } = renderWithProviders(<PhotoshootPackageList />);

    await waitFor(() =>
      expect(container.querySelector(".ant-skeleton")).toBeNull(),
    );
    expect(requests).toHaveLength(1);
    expect(screen.queryByText("Gói cưới")).toBeNull();
  });
});
