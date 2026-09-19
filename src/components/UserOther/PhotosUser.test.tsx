import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";
import PhotosUser from "./PhotosUser";

vi.mock("../LoadingSpinner/LoadingSpinner", () => ({
  default: () => <div>loading spinner</div>,
}));

vi.mock("react-masonry-css", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="masonry-grid">{children}</div>
  ),
}));

vi.mock("react-infinite-scroll-component", () => ({
  default: ({
    children,
    next,
    hasMore,
  }: {
    children: React.ReactNode;
    next: () => void;
    hasMore: boolean;
  }) => (
    <div>
      {children}
      {hasMore ? <button onClick={next}>load more photos</button> : null}
    </div>
  ),
}));

vi.mock("../ComModal/ComModal", () => ({
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div>
        <button onClick={onClose}>close share modal</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../ComSharePhoto/ComSharePhoto", () => ({
  default: ({
    photoId,
    userId,
    onClose,
  }: {
    photoId?: string;
    userId?: string;
    onClose: () => void;
  }) => (
    <div>
      <div>share photo {photoId}</div>
      <div>share owner {userId}</div>
      <button onClick={onClose}>done sharing</button>
    </div>
  ),
}));

vi.mock("../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({
    photo,
    onClose,
    onCloseToMap,
  }: {
    photo: { title?: string; id: string };
    onClose: () => void;
    onCloseToMap: () => void;
  }) => (
    <div>
      <div>detail view for {photo.title ?? photo.id}</div>
      <button onClick={onClose}>close detail</button>
      <button onClick={onCloseToMap}>go to map</button>
    </div>
  ),
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    updateToken: vi.fn(),
    forceRefreshToken: vi.fn(),
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

const initialBeforeRouteState = useBeforeRouteDetailPhoto.getState();

const renderPhotosUser = (queryClient = createTestQueryClient()) =>
  renderWithProviders(
    <Routes>
      <Route path="/user/:userId/photos" element={<PhotosUser />} />
      <Route path="/explore/photo-map" element={<div>photo map page</div>} />
    </Routes>,
    {
      route: "/user/u1/photos",
      queryClient,
    },
  );

describe("PhotosUser", () => {
  afterEach(() => {
    useBeforeRouteDetailPhoto.setState(initialBeforeRouteState, true);
  });

  it("loads photos, fetches more pages, opens details, and shares a selected photo", async () => {
    const requestedPages: string[] = [];

    server.use(
      http.get("*/photo/public", async ({ request }) => {
        const url = new URL(request.url);
        requestedPages.push(url.searchParams.get("page") ?? "missing");
        expect(url.searchParams.get("limit")).toBe("20");
        expect(url.searchParams.get("selling")).toBe("false");
        expect(url.searchParams.get("photographerId")).toBe("u1");
        await new Promise((resolve) => setTimeout(resolve, 20));

        if (url.searchParams.get("page") === "0") {
          return HttpResponse.json({
            objects: [
              {
                id: "photo-1",
                title: "Hoàng hôn",
                signedUrl: { thumbnail: "/sunset.jpg" },
                photographer: { id: "photographer-1" },
              },
            ],
            totalPage: 2,
          });
        }

        return HttpResponse.json({
          objects: [
            {
              id: "photo-2",
              title: "",
              signedUrl: { thumbnail: "/forest.jpg" },
              photographer: { id: "photographer-1" },
            },
          ],
          totalPage: 2,
        });
      }),
    );

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["get-photo-by-id"], { id: "seeded-photo" });

    renderPhotosUser(queryClient);

    expect(await screen.findByText("loading spinner")).toBeInTheDocument();
    expect(await screen.findByText("Hoàng hôn")).toBeInTheDocument();
    expect(screen.getByAltText("Photo photo-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "load more photos" }));

    expect(await screen.findByText("Tên tác giả")).toBeInTheDocument();
    expect(requestedPages).toEqual(["0", "1"]);

    await userEvent.click(screen.getByAltText("Photo photo-1"));

    expect(await screen.findByText("detail view for Hoàng hôn")).toBeInTheDocument();
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe("/user/u1/photos");
    await waitFor(() =>
      expect(queryClient.getQueryState(["get-photo-by-id"])?.isInvalidated).toBe(
        true,
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: "close detail" }));
    expect(screen.queryByText("detail view for Hoàng hôn")).toBeNull();

    await userEvent.click(screen.getByAltText("Photo photo-1"));
    await userEvent.click(screen.getByRole("button", { name: "go to map" }));
    expect(await screen.findByText("photo map page")).toBeInTheDocument();

    const secondRender = renderPhotosUser(createTestQueryClient());
    expect(await screen.findByText("Hoàng hôn")).toBeInTheDocument();
    const shareIcons = secondRender.container.querySelectorAll("svg.size-7");
    expect(shareIcons.length).toBeGreaterThan(0);

    await userEvent.click(shareIcons[0] as HTMLElement);

    expect(await screen.findByText("share photo photo-1")).toBeInTheDocument();
    expect(screen.getByText("share owner photographer-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "done sharing" }));
    expect(screen.queryByText("share photo photo-1")).toBeNull();
  });

  it("shows the API error state", async () => {
    server.use(
      http.get("*/photo/public", () => new HttpResponse(null, { status: 500 })),
    );

    renderPhotosUser();

    expect(await screen.findByText(/Lỗi:/)).toBeInTheDocument();
  });

  it("shows the empty state when no public photos are available", async () => {
    server.use(
      http.get("*/photo/public", () =>
        HttpResponse.json({ objects: [], totalPage: 0 }),
      ),
    );

    renderPhotosUser();

    expect(
      await screen.findByText("Không tìm thấy ảnh khả dụng!"),
    ).toBeInTheDocument();
  });
});
