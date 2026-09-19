import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEndpoint } from "../../test/mockEndpoint";
import { renderWithProviders } from "../../test/render";
import UseSellingPhotoStore from "../../states/UseSellingPhotoStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import SellingPhotoList from "./SellingPhotoList";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const resetStores = () => {
  UseSellingPhotoStore.setState({
    page: 1,
    searchResult: "",
    searchByPhotoTitle: "",
  });
  UseUserOtherStore.setState({ nameUserOther: "", userOtherId: undefined });
};

const photo = (overrides: Record<string, unknown> = {}) => ({
  id: "photo-1",
  title: "Sunset",
  signedUrl: { thumbnail: "/thumb.jpg" },
  photographer: { id: "ph-1", name: "Photographer A", avatar: "/avatar.jpg" },
  photoSellings: [{ pricetags: [{ price: 10000 }, { price: 50000 }] }],
  ...overrides,
});

describe("SellingPhotoList", () => {
  beforeEach(() => {
    resetStores();
    navigateMock.mockReset();
  });

  afterEach(() => {
    resetStores();
  });

  it("shows an empty state when there are no photos for sale", async () => {
    mockEndpoint("get", "*/photo/public", { objects: [], totalPage: 1 });

    renderWithProviders(<SellingPhotoList />);

    expect(
      await screen.findByText("Không tìm thấy ảnh khả dụng!"),
    ).toBeInTheDocument();
  });

  it("renders photos with a price range and navigates to the product page", async () => {
    mockEndpoint("get", "*/photo/public", {
      objects: [photo()],
      totalPage: 1,
    });

    renderWithProviders(<SellingPhotoList />);

    expect(await screen.findByText("Sunset")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "SPAN" &&
          el.textContent?.replace(/\s+/g, " ").trim() === "10.000đ 50.000đ",
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByAltText("Sunset"));
    expect(navigateMock).toHaveBeenCalledWith(
      "/explore/product-photo/photo-1",
    );
  });

  it("shows a single price when the lowest and highest match, and clicking the photographer navigates and sets the store", async () => {
    mockEndpoint("get", "*/photo/public", {
      objects: [
        photo({
          id: "photo-2",
          title: "Same price",
          photoSellings: [{ pricetags: [{ price: 20000 }] }],
        }),
      ],
      totalPage: 1,
    });

    renderWithProviders(<SellingPhotoList />);

    expect(await screen.findByText("Same price")).toBeInTheDocument();
    expect(screen.getByText("20.000đ")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Photographer A"));
    expect(navigateMock).toHaveBeenCalledWith("/user/ph-1");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Photographer A");
    expect(UseUserOtherStore.getState().userOtherId).toBe("ph-1");
  });

  it("shows 'Chưa có giá' when a photo has no pricetags", async () => {
    mockEndpoint("get", "*/photo/public", {
      objects: [photo({ id: "photo-3", title: "No price", photoSellings: [] })],
      totalPage: 1,
    });

    renderWithProviders(<SellingPhotoList />);

    expect(await screen.findByText("No price")).toBeInTheDocument();
    expect(screen.getByText("Chưa có giá")).toBeInTheDocument();
  });

  it("paginates using the selling photo store's page state", async () => {
    const requests = mockEndpoint("get", "*/photo/public", {
      objects: [photo()],
      totalPage: 3,
    });

    const { unmount } = renderWithProviders(<SellingPhotoList />);

    await screen.findByText("Sunset");
    const pagination = document.querySelector(".ant-pagination");
    expect(pagination).toBeInTheDocument();

    await userEvent.click(within(pagination as HTMLElement).getByTitle("2"));

    await waitFor(() => expect(UseSellingPhotoStore.getState().page).toBe(2));
    await waitFor(() =>
      expect(requests[requests.length - 1].query.page).toBe("1"),
    );
    // let the page-2 fetch settle before the handler is torn down
    await waitFor(() =>
      expect(screen.queryAllByRole("img").length).toBeGreaterThan(0),
    );
    unmount();
  });
});
