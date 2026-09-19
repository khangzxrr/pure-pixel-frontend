import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import ProductPhotoDetail from "./ProductPhotoDetail";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UseUserProfileStore from "../../states/UseUserProfileStore";

const navigate = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({
  authenticated: true,
  sub: "buyer-1",
  login: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: {
        ...createKeycloakMock({
          authenticated: auth.authenticated,
          sub: auth.sub,
          roles: ["customer"],
        }),
        login: auth.login,
      },
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    default: {
      isLoggedIn: () => auth.authenticated,
      getToken: () =>
        createKeycloakMock({
          authenticated: auth.authenticated,
          sub: auth.sub,
        }).token,
      getTokenParsed: () =>
        createKeycloakMock({
          authenticated: auth.authenticated,
          sub: auth.sub,
        }).tokenParsed,
      updateToken: vi.fn().mockResolvedValue(true),
      forceRefreshToken: vi.fn().mockResolvedValue(false),
    },
  };
});

vi.mock("../../components/CommentPhoto/CommentPhoto", () => ({
  default: ({ id, top }: { id: string; top?: boolean }) => (
    <div data-testid="comment-photo">comments {id} {top ? "top" : "inline"}</div>
  ),
}));

vi.mock("../../components/Photographer/UploadPhoto/ExifList", () => ({
  default: ({ exifData }: { exifData: Record<string, unknown> }) => (
    <div data-testid="exif-list">exif {Object.keys(exifData || {}).join(",")}</div>
  ),
}));

vi.mock("../../components/ComLoginWarning/LoginWarningModal", () => ({
  default: () => <div>login warning modal</div>,
}));

vi.mock("../../components/ComReport/ComReport", () => ({
  default: ({ id, tile }: { id: string; tile: string }) => (
    <div>{tile} {id}</div>
  ),
}));

vi.mock("../DetailUser/DetailUser", () => ({
  default: ({ id }: { id: string }) => <div>detail user {id}</div>,
}));

const basePhoto = {
  id: "photo-1",
  title: "Sương sớm Đà Lạt",
  description: "Ảnh gốc độ phân giải cao",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  signedUrl: {
    url: "https://cdn.test/photo-full.jpg",
    thumbnail: "https://cdn.test/photo-thumb.jpg",
  },
  photographer: {
    id: "photographer-1",
    name: "Alice",
    avatar: "https://cdn.test/alice.jpg",
  },
  exif: { cameraModel: "Canon R6", iso: 100 },
  _count: { comments: 3 },
  photoSellings: [
    {
      id: "sell-1",
      description: "Bản quyền tải ảnh",
      pricetags: [
        {
          id: "tag-1",
          width: 1200,
          height: 800,
          price: 120000,
          preview: "https://cdn.test/preview-1.jpg",
        },
        {
          id: "tag-2",
          width: 2400,
          height: 1600,
          price: 240000,
        },
      ],
      photoSellHistories: [
        {
          width: 1200,
          height: 800,
          photoBuy: [{ buyerId: "buyer-1" }],
        },
      ],
    },
  ],
};

const renderPage = () =>
  renderWithProviders(<ProductPhotoDetail />, {
    route: "/product/photo-1",
    path: "/product/:id",
  });

const mockProductDetail = (photo = basePhoto) =>
  mockEndpoint("get", "*/photo/photo-1", photo);

const mockBoughtDetail = (photoBuys: Array<Record<string, unknown>>) =>
  mockEndpoint("get", "*/photo/photo-1/photo-buy", { photoBuys });

const menuButton = (container: HTMLElement) =>
  container.querySelector("button.hover\\:text-gray-400") as HTMLButtonElement;

const clickSize = async (label: string) => {
  const button = screen
    .getAllByRole("button")
    .find((candidate) => {
      const compact = candidate.textContent?.replace(/\s+/g, "") ?? "";
      return compact.includes(label.replace(/\s+/g, ""));
    });
  if (!button) throw new Error(`Missing size button: ${label}`);
  await userEvent.click(button);
};

describe("ProductPhotoDetail", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.authenticated = true;
    auth.sub = "buyer-1";
    auth.login.mockReset();
    navigate.mockReset();
    UsePhotographerFilterStore.setState({
      inputValue: "",
      searchResult: "",
      filterByVote: { name: "", param: "" },
      namePhotographer: "",
    });
    UseUserOtherStore.setState({
      isSidebarOpen: false,
      activeItem: null,
      activeIcon: null,
      activeTitle: null,
      hoveredItem: null,
      isForSaleChecked: true,
      nameUserOther: "",
      userOtherId: null,
    });
    UseUserProfileStore.setState({
      isSidebarOpen: false,
      activeItem: null,
      activeIcon: null,
      activeTitle: null,
      hoveredItem: null,
    });
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.useRealTimers();
  });

  it("renders a bought size, lets the visitor switch sizes, open the report modal, and navigate to the photographer", async () => {
    mockProductDetail();
    mockBoughtDetail([
      { photoSellHistory: { width: 1200, height: 800 } },
    ]);

    const { container } = renderPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Sương sớm Đà Lạt")).toBeInTheDocument();
    expect(screen.getByText("Bản quyền tải ảnh")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "120,000Đ"),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 giờ/)).toBeInTheDocument();
    expect(screen.getByTestId("exif-list")).toHaveTextContent("cameraModel,iso");
    expect(screen.getByText("Bạn đã mua kích thước này")).toBeInTheDocument();
    expect(screen.getByTestId("comment-photo")).toHaveTextContent("comments photo-1 top");

    await clickSize("2400 x 1600");
    expect(
      screen.getByText((_, element) => element?.textContent === "240,000Đ"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mua ngay" })).toBeInTheDocument();

    await userEvent.click(menuButton(container));
    await userEvent.click(await screen.findByText("Báo cáo ảnh"));
    expect(await screen.findByText("Báo cáo ảnh bán photo-1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Alice"));
    expect(UsePhotographerFilterStore.getState().namePhotographer).toBe("Alice");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Alice");
    expect(UseUserOtherStore.getState().userOtherId).toBe("photographer-1");
    expect(navigate).toHaveBeenCalledWith("/user/photographer-1/photos");
  });

  it("asks signed-out visitors to log in and shows the login warning from the report menu", async () => {
    auth.authenticated = false;
    mockProductDetail();
    server.use(
      http.get("*/photo/photo-1/photo-buy", () => new HttpResponse(null, { status: 401 })),
    );

    const { container } = renderPage();

    expect(await screen.findByRole("button", { name: "Đăng nhập để mua ngay" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập để mua ngay" }));
    expect(auth.login).toHaveBeenCalledTimes(1);

    await userEvent.click(menuButton(container));
    await userEvent.click(await screen.findByText("Báo cáo ảnh"));
    expect(await screen.findByText("login warning modal")).toBeInTheDocument();
  });

  it("buys with the wallet and redirects after confirmation", async () => {
    mockProductDetail({
      ...basePhoto,
      photoSellings: [
        { ...basePhoto.photoSellings[0], photoSellHistories: [] },
      ],
    });
    mockBoughtDetail([]);
    const purchaseRequests = mockEndpoint(
      "post",
      "*/photo/photo-1/photo-sell/sell-1/price-tag/tag-1/buy",
      {},
    );

    renderPage();
    await screen.findByText("Sương sớm Đà Lạt");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Mua ngay" }));
    expect(await screen.findByText("Hóa đơn")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thanh toán bằng ví" }));
    await user.click(screen.getByRole("button", { name: "Xác nhận thanh toán" }));

    expect(purchaseRequests[0].json).toEqual({ paymentMethod: "WALLET" });

    await waitFor(
      () => expect(navigate).toHaveBeenCalledWith("/profile/photos-bought"),
      { timeout: 2500 },
    );
    expect(screen.queryByText("Hóa đơn")).toBeNull();
  }, 10000);

  it("shows the QR flow, polls the transaction status, and redirects on payment success", async () => {
    mockProductDetail({
      ...basePhoto,
      photoSellings: [
        { ...basePhoto.photoSellings[0], photoSellHistories: [] },
      ],
    });
    mockBoughtDetail([]);
    mockEndpoint(
      "post",
      "*/photo/photo-1/photo-sell/sell-1/price-tag/tag-1/buy",
      {
        paymentUrl: "https://cdn.test/qr.png",
        userToUserTransaction: {
          fromUserTransaction: { id: "txn-1" },
        },
      },
    );
    const transactionRequests: string[] = [];
    server.use(
      http.get("*/payment/transaction/txn-1", () => {
        transactionRequests.push("txn-1");
        return HttpResponse.json({ status: "SUCCESS" });
      }),
    );
    renderPage();
    await screen.findByText("Sương sớm Đà Lạt");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Mua ngay" }));
    await user.click(screen.getByRole("button", { name: "Lấy mã QR" }));

    expect(await screen.findByAltText("QR Code")).toHaveAttribute(
      "src",
      "https://cdn.test/qr.png",
    );
    expect(screen.getByText("Đang chờ thanh toán...")).toBeInTheDocument();
    expect(screen.getByText(/Thời gian hiệu lực còn: 05:00/)).toBeInTheDocument();

    expect(
      await screen.findByText("Thanh toán thành công!", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(transactionRequests).toEqual(["txn-1"]);

    await waitFor(
      () => expect(navigate).toHaveBeenCalledWith("/profile/photos-bought"),
      { timeout: 2500 },
    );
  }, 10000);

  it("shows an error notification when the wallet balance is insufficient", async () => {
    mockProductDetail({
      ...basePhoto,
      photoSellings: [
        { ...basePhoto.photoSellings[0], photoSellHistories: [] },
      ],
    });
    mockBoughtDetail([]);
    server.use(
      http.post("*/photo/photo-1/photo-sell/sell-1/price-tag/tag-1/buy", () =>
        HttpResponse.json(
          { message: "NotEnoughBalanceException" },
          { status: 400 },
        ),
      ),
    );

    renderPage();
    await screen.findByText("Sương sớm Đà Lạt");

    await userEvent.click(screen.getByRole("button", { name: "Mua ngay" }));
    await userEvent.click(screen.getByRole("button", { name: "Thanh toán bằng ví" }));
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận thanh toán" }));

    expect(
      await screen.findByText("Số dư của bạn không đủ. Vui lòng nạp thêm tiền"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mua ảnh thất bại")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn")).toBeInTheDocument();
  });
});
