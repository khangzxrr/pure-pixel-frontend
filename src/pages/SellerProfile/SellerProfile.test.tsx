import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import SellerProfile from "./SellerProfile";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("./DropdownSeller", () => ({
  default: ({
    photo,
    callData,
  }: {
    photo: { id: string };
    callData: () => void;
  }) => (
    <button onClick={callData}>dropdown-{photo.id}</button>
  ),
}));

const profile = {
  cover: "https://cdn.test/cover.jpg",
  avatar: "https://cdn.test/avatar.jpg",
  name: "Seller One",
  mail: "seller@example.com",
};

const photo = {
  id: "photo-1",
  title: "Golden Hour",
  signedUrl: { thumbnail: "https://cdn.test/thumb.jpg" },
  photoSellings: [
    {
      description: "Warm light",
      pricetags: [{ price: 120000 }],
    },
  ],
};

describe("SellerProfile", () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it("renders the profile, the selling photos and opens a photo detail", async () => {
    mockEndpoint("get", "*/me", profile);
    const requests = mockEndpoint("get", "*/photographer/me/photo", {
      objects: [photo],
      totalPage: 1,
    });

    renderWithProviders(<SellerProfile />);

    expect(await screen.findByText("Seller One")).toBeInTheDocument();
    expect(screen.getByText("seller@example.com")).toBeInTheDocument();
    expect(screen.getByText("Golden Hour")).toBeInTheDocument();
    expect(screen.getByText(/^Giá:\s*120\.000\s₫$/)).toBeInTheDocument();

    await userEvent.click(screen.getByText("Golden Hour"));

    expect(navigate).toHaveBeenCalledWith("/profile/product-photo/photo-1");
    expect(requests[0].query).toMatchObject({
      limit: "9",
      page: "0",
      photoType: "RAW",
      selling: "true",
      orderByUpdatedAt: "desc",
    });
  });

  it("searches by title and paginates results", async () => {
    mockEndpoint("get", "*/me", profile);
    const requests = mockEndpoint("get", "*/photographer/me/photo", {
      objects: [photo],
      totalPage: 2,
    });

    renderWithProviders(<SellerProfile />);

    await screen.findByText("Golden Hour");

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() =>
      expect(requests.some((request) => request.query.page === "1")).toBe(true),
    );

    const searchInput = screen.getByPlaceholderText("Tìm kiếm theo tên ảnh...");
    await userEvent.type(searchInput, "Sky");
    await userEvent.keyboard("{Enter}");

    await waitFor(() =>
      expect(
        requests.some(
          (request) => request.query.title === "Sky" && request.query.page === "0",
        ),
      ).toBe(true),
    );
  });

  it("shows the empty state and links to the upload page", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [],
      totalPage: 1,
    });

    renderWithProviders(<SellerProfile />);

    expect(
      await screen.findByText(/Không tìm thấy ảnh trong cửa hàng/),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("tải lên"));
    expect(navigate).toHaveBeenCalledWith("/upload/sell");
  });

  it("shows profile loading feedback before the profile request resolves", async () => {
    server.use(
      http.get("*/me", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(profile);
      }),
      http.get("*/photographer/me/photo", () =>
        HttpResponse.json({ objects: [photo], totalPage: 1 }),
      ),
    );

    renderWithProviders(<SellerProfile />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Seller One")).toBeInTheDocument();
  });

  it("searches when the search icon is clicked", async () => {
    mockEndpoint("get", "*/me", profile);
    const requests = mockEndpoint("get", "*/photographer/me/photo", {
      objects: [photo],
      totalPage: 1,
    });

    renderWithProviders(<SellerProfile />);

    expect(await screen.findByText("Golden Hour")).toBeInTheDocument();
    await userEvent.type(
      screen.getByPlaceholderText("Tìm kiếm theo tên ảnh..."),
      "Cloud",
    );
    await userEvent.click(
      screen.getByPlaceholderText("Tìm kiếm theo tên ảnh...").parentElement!
        .lastElementChild as HTMLElement,
    );

    await waitFor(() =>
      expect(
        requests.some((request) => request.query.title === "Cloud"),
      ).toBe(true),
    );
  });
});
