import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { MockInstance } from "vitest";
import DetailPhoto from "./DetailPhoto";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import usePhotoMapStore from "../../states/UsePhotoMapStore";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";

const navigate = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({
  authenticated: true,
  sub: "viewer-1",
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

vi.mock("@cutting/use-get-parent-size", () => ({
  useParentSize: () => ({ width: 900, height: 600 }),
}));

vi.mock("react-map-gl", () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <div data-testid="detail-map">{children}</div>
  ),
  Marker: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../components/CommentPhoto/CommentPhoto", () => ({
  default: ({ id }: { id: string }) => <div data-testid="comment-photo">comments {id}</div>,
}));

vi.mock("../../components/ComLikeButton/LikeButton", () => ({
  default: ({ photoId, reloadData }: { photoId: string; reloadData: () => void }) => (
    <button onClick={reloadData}>like {photoId}</button>
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

vi.mock("../../components/LoadingSpinner/LoadingOval", () => ({
  default: () => <div>detail loading</div>,
}));

vi.mock("../../components/ComModal/ComModal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children?: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

vi.mock("../../components/ComSharePhoto/ComSharePhoto", () => ({
  default: ({ photoId, userId }: { photoId: string; userId: string }) => (
    <div>share photo {photoId} by {userId}</div>
  ),
}));

vi.mock("../../components/ComReport/ComReport", () => ({
  default: ({ id, tile }: { id: string; tile: string }) => <div>{tile} {id}</div>,
}));

vi.mock("../DetailUser/DetailUser", () => ({
  default: ({ id }: { id: string }) => <div>detail user {id}</div>,
}));

const photoOne = {
  id: "photo-1",
  title: "Hoàng hôn biển",
  description:
    "A".repeat(120) + " mô tả đầy đủ để kiểm tra nút xem thêm trong trang chi tiết.",
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  visibility: "PUBLIC",
  width: 1200,
  height: 800,
  signedUrl: {
    url: "https://cdn.test/photo-1-full.jpg",
    thumbnail: "https://cdn.test/photo-1-thumb.jpg",
    placeholder: "https://cdn.test/photo-1-placeholder.jpg",
  },
  photographer: {
    id: "photographer-1",
    name: "Alice",
    avatar: "https://cdn.test/alice.jpg",
  },
  exif: { latitude: 10.77, longitude: 106.7, iso: 100 },
  camera: { id: "camera-1" },
  _count: { votes: 5, comments: 3 },
};

const photoTwo = {
  ...photoOne,
  id: "photo-2",
  title: "Đêm thành phố",
  signedUrl: {
    url: "https://cdn.test/photo-2-full.jpg",
    thumbnail: "https://cdn.test/photo-2-thumb.jpg",
    placeholder: "https://cdn.test/photo-2-placeholder.jpg",
  },
};

const photoRequests = () => ({
  current: mockEndpoint("get", "*/photo/photo-1", photoOne),
  nextPhoto: mockEndpoint("get", "*/photo/photo-2", photoTwo),
  mapbox: mockEndpoint(
    "get",
    "https://api.mapbox.com/search/geocode/v6/reverse",
    {
      features: [{ properties: { full_address: "Quận 1, Hồ Chí Minh" } }],
    },
  ),
});

const installNextPreviousHandlers = () => {
  server.use(
    http.get("*/photo/public/next", ({ request }) => {
      const url = new URL(request.url);
      const cursor = url.searchParams.get("cursor");
      const forward = url.searchParams.get("forward");
      if (cursor === "photo-1" && forward === "true") {
        return HttpResponse.json({ objects: [photoTwo] });
      }
      if (cursor === "photo-2" && forward === "false") {
        return HttpResponse.json({ objects: [photoOne] });
      }
      return HttpResponse.json({ objects: [] });
    }),
  );
};

const renderPage = (props: Record<string, unknown> = {}) =>
  renderWithProviders(<DetailPhoto {...(props as any)} />, {
    route: "/photo/photo-1",
    path: "/photo/:id",
  });

const menuButton = (container: HTMLElement) =>
  container.querySelector("button.hover\\:text-gray-400") as HTMLButtonElement;
const shareButton = (container: HTMLElement) =>
  container.querySelector("button.hover\\:text-green-500") as HTMLButtonElement;
const messageButton = (container: HTMLElement) =>
  container.querySelector("button.p-2.rounded-full.hover\\:bg-gray-800") as HTMLButtonElement;
const previousButton = (container: HTMLElement) =>
  container.querySelector("button.left-4.transform") as HTMLButtonElement;
const nextButton = (container: HTMLElement) =>
  container.querySelector("button.right-4.transform") as HTMLButtonElement;
const backButton = (container: HTMLElement) =>
  container.querySelector("button.absolute.top-4.left-4") as HTMLButtonElement;
const fullScreenButton = (container: HTMLElement) =>
  container.querySelector("button.absolute.top-4.right-4") as HTMLButtonElement;

const FakeImage = class {
  onload: null | (() => void) = null;
  set src(_value: string) {
    Promise.resolve().then(() => this.onload?.());
  }
};

describe("DetailPhoto", () => {
  let consoleError: MockInstance<typeof console.error>;
  const requestFullscreen = vi.fn();

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.authenticated = true;
    auth.sub = "viewer-1";
    auth.login.mockReset();
    navigate.mockReset();
    vi.stubEnv("VITE_MAPBOX_TOKEN", "pk.test");
    vi.stubGlobal("Image", FakeImage);
    // fullscreen targets the box around the photo, so stub it on every element
    HTMLElement.prototype.requestFullscreen = requestFullscreen;
    requestFullscreen.mockReset();
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
    usePhotoMapStore.setState({
      photoList: [],
      isFromPhotoDetailPage: false,
      selectedPhoto: null,
    });
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "" });
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("renders the detail view, opens share/report, and handles photographer, chat, map, and like interactions", async () => {
    photoRequests();
    installNextPreviousHandlers();
    const onCloseToMap = vi.fn();

    const { container } = renderPage({ onCloseToMap });

    expect(await screen.findByText("detail loading")).toBeInTheDocument();
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();
    expect(screen.getByText(/3 giờ - Công khai/)).toBeInTheDocument();
    expect(screen.getByTestId("comment-photo")).toHaveTextContent("comments photo-1");
    expect(screen.getByRole("button", { name: "like photo-1" })).toBeInTheDocument();
    expect(screen.getByTestId("exif-list")).toHaveTextContent("latitude,longitude,iso");
    expect(await screen.findByText("Quận 1, Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xem thêm/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Xem thêm/i }));
    expect(screen.getByText(photoOne.description)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "like photo-1" }));
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    await userEvent.click(shareButton(container));
    expect(await screen.findByText("share photo photo-1 by photographer-1")).toBeInTheDocument();

    await userEvent.click(menuButton(container));
    await userEvent.click(await screen.findByText("Báo cáo bài viết"));
    expect(await screen.findByText("Báo cáo bài viết photo-1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Alice"));
    expect(UsePhotographerFilterStore.getState().namePhotographer).toBe("Alice");
    expect(UseUserOtherStore.getState().nameUserOther).toBe("Alice");
    expect(UseUserOtherStore.getState().userOtherId).toBe("photographer-1");
    expect(navigate).toHaveBeenCalledWith("/user/photographer-1/photos");

    await userEvent.click(messageButton(container));
    expect(navigate).toHaveBeenCalledWith("/message?to=photographer-1");

    await userEvent.click(screen.getByText("Quận 1, Hồ Chí Minh"));
    expect(usePhotoMapStore.getState().isFromPhotoDetailPage).toBe(true);
    expect(usePhotoMapStore.getState().selectedPhoto).toMatchObject({
      id: "photo-1",
      photo_id: "photo-1",
      photographer_id: "photographer-1",
      title: "Hoàng hôn biển",
      latitude: 10.77,
      longitude: 106.7,
    });
    expect(navigate).toHaveBeenCalledWith("/explore/photo-map");
    expect(onCloseToMap).toHaveBeenCalledTimes(1);
  });

  it("goes back to the stored route, enters fullscreen, and moves between next and previous photos", async () => {
    photoRequests();
    installNextPreviousHandlers();
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "/gallery" });

    const { container } = renderPage();
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    await userEvent.click(fullScreenButton(container));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    // the element going fullscreen is the visible photo frame, not a hidden duplicate image
    const fullscreenTarget = requestFullscreen.mock.contexts[0] as HTMLElement;
    expect(
      fullscreenTarget.querySelector('[data-testid="blurhash-image"] img'),
    ).not.toBeNull();

    await userEvent.click(nextButton(container));
    expect(await screen.findByText("Đêm thành phố")).toBeInTheDocument();

    await userEvent.click(previousButton(container));
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    await userEvent.click(backButton(container));
    expect(navigate).toHaveBeenCalledWith("/gallery");
  }, 15000);

  it("uses the onClose callback instead of navigating back when it is provided", async () => {
    photoRequests();
    installNextPreviousHandlers();
    const onClose = vi.fn();
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "/profile/my-photos" });

    const { container } = renderPage({ onClose });
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    await userEvent.click(backButton(container));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalledWith("/profile/my-photos");
    expect(previousButton(container)).not.toBeInTheDocument();
    expect(nextButton(container)).not.toBeInTheDocument();
  });

  it("shows login warnings for signed-out visitors and opens the login modal from likes, chat, and report", async () => {
    auth.authenticated = false;
    photoRequests();
    installNextPreviousHandlers();

    const { container } = renderPage();
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    const heart = container.querySelector("svg.size-5") as SVGElement;
    await userEvent.click(heart);
    expect(await screen.findByText("login warning modal")).toBeInTheDocument();

    await userEvent.click(messageButton(container));
    expect(screen.getByText("login warning modal")).toBeInTheDocument();

    await userEvent.click(menuButton(container));
    await userEvent.click(await screen.findByText("Báo cáo bài viết"));
    expect(screen.getByText("login warning modal")).toBeInTheDocument();
  });

  it("falls back to the home page when there is no stored previous route", async () => {
    photoRequests();
    installNextPreviousHandlers();

    const { container } = renderPage();
    expect(await screen.findByText("Hoàng hôn biển")).toBeInTheDocument();

    await userEvent.click(backButton(container));
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
