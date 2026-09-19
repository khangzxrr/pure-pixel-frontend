import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";
import MyPhotoP from "./MyPhotoP";

// avoid a background refetch-on-focus firing after a test has already unmounted
const testQueryClient = () => {
  const client = createTestQueryClient();
  client.setDefaultOptions({
    queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
  });
  return client;
};

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      Detail view
      <button onClick={onClose}>close-detail</button>
    </div>
  ),
}));

vi.mock("./FilterModel", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      Filter modal
      <button onClick={onClose}>close-filter</button>
    </div>
  ),
}));

vi.mock("./UpdateDropdown", () => ({
  default: () => <div>update-dropdown</div>,
}));

const resetFilterStore = () => {
  UseMyPhotoFilter.setState({
    inputValue: "",
    searchResult: "",
    isBanned: false,
    isWatermarkChecked: false,
    isForSaleChecked: false,
    filterByPhotoDate: { name: "", param: "" },
    filterByUpVote: { name: "", param: "" },
  } as never);
};

describe("MyPhotoP", () => {
  const setPage = vi.fn();

  afterEach(() => {
    // unmount before touching the shared filter store: MyPhotoP subscribes to it
    // directly, and mutating it while still mounted can trigger a stray refetch
    cleanup();
    navigate.mockReset();
    setPage.mockReset();
    resetFilterStore();
  });

  it("shows an empty state and lets the user navigate to upload", async () => {
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [],
      totalPage: 0,
      totalRecord: 0,
    });

    renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );

    expect(
      await screen.findByText(/Chưa có bức ảnh nào được tìm thấy/),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("tải lên"));
    expect(navigate).toHaveBeenCalledWith("/upload/public");
  });

  it("renders photos, opens the detail view, and closes it", async () => {
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [
        {
          id: "p1",
          title: "Sunset",
          visibility: "PUBLIC",
          status: "ACTIVE",
          signedUrl: { thumbnail: "thumb.jpg", url: "orig.jpg" },
        },
      ],
      totalPage: 1,
      totalRecord: 1,
    });

    const { queryClient } = renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );

    const image = await screen.findByAltText("Sunset");
    await userEvent.click(image);

    expect(await screen.findByText("Detail view")).toBeInTheDocument();
    await userEvent.click(screen.getByText("close-detail"));
    expect(navigate).toHaveBeenCalledWith("/profile/my-photos");
    // let any background refetch settle while the mock is still registered
    await vi.waitFor(() => expect(queryClient.isFetching()).toBe(0));
  });

  it("shows a banned badge for photos with BAN status", async () => {
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [
        {
          id: "p1",
          title: "Banned photo",
          visibility: "PRIVATE",
          status: "BAN",
          signedUrl: { thumbnail: "thumb.jpg", url: "orig.jpg" },
        },
      ],
      totalPage: 1,
      totalRecord: 1,
    });

    renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );

    await screen.findByAltText("Banned photo");
    expect(screen.getByText("Ảnh này đã bị cấm!")).toBeInTheDocument();
    expect(screen.getByText("Riêng tư")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    const { http, HttpResponse } = await import("msw");
    const { server } = await import("../../test/server");
    server.use(
      http.get(
        "*/photographer/me/photo",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );

    expect(await screen.findByText(/status/)).toBeInTheDocument();
  });

  it("searches by title, opens the filter modal, and resets active filters", async () => {
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [],
      totalPage: 0,
      totalRecord: 0,
    });

    renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );
    await screen.findByText(/Chưa có bức ảnh nào được tìm thấy/);

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh...",
    );
    await userEvent.type(input, "sunset{enter}");

    expect(UseMyPhotoFilter.getState().searchResult).toBe("sunset");
    expect(setPage).toHaveBeenCalledWith(1);

    await userEvent.click(screen.getByText("Bộ lọc ảnh"));
    expect(await screen.findByText("Filter modal")).toBeInTheDocument();
    await userEvent.click(screen.getByText("close-filter"));
    expect(screen.queryByText("Filter modal")).not.toBeInTheDocument();

    UseMyPhotoFilter.setState({
      isForSaleChecked: true,
      isWatermarkChecked: true,
      filterByUpVote: { name: "Nhiều lượt thích nhất", param: "desc" },
    } as never);

    expect(await screen.findByText("Ảnh đang bán")).toBeInTheDocument();
    expect(screen.getByText("Ảnh watermark")).toBeInTheDocument();
    expect(screen.getByText("Nhiều lượt thích nhất")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Xóa bộ lọc"));

    expect(UseMyPhotoFilter.getState().isForSaleChecked).toBe(false);
    expect(UseMyPhotoFilter.getState().isWatermarkChecked).toBe(false);
    expect(UseMyPhotoFilter.getState().filterByUpVote.param).toBe("");
  });

  it("shows pagination controls when there is more than one page", async () => {
    mockEndpoint("get", "*/photographer/me/photo", {
      objects: [],
      totalPage: 3,
      totalRecord: 0,
    });

    const { queryClient } = renderWithProviders(
      <MyPhotoP page={1} setPage={setPage} itemsPerPage={12} />,
      { queryClient: testQueryClient() },
    );

    const page2 = await screen.findByTitle("2");
    await userEvent.click(page2);
    expect(setPage).toHaveBeenCalledWith(2);
    await vi.waitFor(() => expect(queryClient.isFetching()).toBe(0));
  });
});
