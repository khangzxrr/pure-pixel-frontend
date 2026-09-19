import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import UseCategoryStore from "../../../states/UseCategoryStore";
import UsePhotographerFilterStore from "../../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../../states/UseUserOtherStore";
import UseUserProfileStore from "../../../states/UseUserProfileStore";
import useBeforeRouteDetailPhoto from "../../../states/UseBeforeRouteDetailPhoto";
import InspirationPhoto from "./InspirationPhoto";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => ({ sub: "viewer-1" }),
  },
}));

vi.mock("react-infinite-scroll-component", () => ({
  default: ({
    children,
    next,
    hasMore,
  }: {
    children: React.ReactNode;
    next: () => void;
    hasMore?: boolean;
  }) => (
    <div>
      {children}
      {hasMore ? <button onClick={next}>load more</button> : null}
    </div>
  ),
}));

vi.mock("react-masonry-css", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({
    photo,
    onClose,
    onCloseToMap,
  }: {
    photo: { id: string };
    onClose: () => void;
    onCloseToMap: () => void;
  }) => (
    <div>
      <div>detail {photo.id}</div>
      <button onClick={onClose}>close detail</button>
      <button onClick={onCloseToMap}>close to map</button>
    </div>
  ),
}));

vi.mock("../../ComModal/ComModal", () => ({
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
  }) =>
    isOpen ? (
      <div>
        <button onClick={onClose}>close share modal</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../../ComSharePhoto/ComSharePhoto", () => ({
  default: ({
    photoId,
    userId,
  }: {
    photoId?: string;
    userId?: string;
  }) => <div>{`share ${photoId} ${userId}`}</div>,
}));

vi.mock("../../LoadingSpinner/LoadingSpinner", () => ({
  default: () => <div>loading spinner</div>,
}));

vi.mock("react-icons/fi", () => ({
  FiShare2: (props: React.ComponentProps<"button">) => (
    <button type="button" aria-label="share photo" {...props}>
      share
    </button>
  ),
}));

const buildPhoto = (id: string, name: string) => ({
  id,
  signedUrl: { thumbnail: `https://cdn.test/${id}.jpg` },
  photographer: {
    id: `user-${id}`,
    name,
    avatar: `https://cdn.test/${id}-avatar.jpg`,
  },
});

const resetStores = () => {
  UseCategoryStore.setState({
    selectedPhotoCategory: { name: "", param: "" },
    filterByPhotoDate: { name: "Mới nhất", param: "desc" },
    filterByUpVote: { name: "", param: "" },
    isWatermarkChecked: false,
    isForSaleChecked: false,
    inputValue: "",
    searchResult: "",
    searchByPhotoTitle: "",
    searchCategory: {
      name: "Tên ảnh",
      param: "photoName",
      quote: "ảnh",
      icon: "FaRegImage",
    },
    searchByTags: [""],
    filterByIsFollowed: { name: "", param: "" },
  });
  UsePhotographerFilterStore.setState({ namePhotographer: "" });
  UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
  UseUserProfileStore.setState({ activeTitle: "Đang chọn" });
  useBeforeRouteDetailPhoto.setState({ beforeRoute: "" });
};

describe("InspirationPhoto", () => {
  beforeEach(() => {
    resetStores();
  });

  it("shows a loading spinner while the photo query is pending", () => {
    server.use(http.get("*/photo/public", () => new Promise(() => {})));

    renderWithProviders(<InspirationPhoto />, { route: "/explore/inspiration" });

    expect(screen.getByText("loading spinner")).toBeInTheDocument();
  });

  it("loads photos, requests the next page, opens details, shares and opens photographer pages", async () => {
    UseCategoryStore.getState().setSelectedPhotoCategory("Thiên nhiên");
    UseCategoryStore.getState().setFilterByPhotoDate("Cũ nhất", "asc");
    UseCategoryStore.getState().setFilterByUpVote("Giảm dần", "desc");
    UseCategoryStore.getState().setIsWatermarkChecked(true);
    UseCategoryStore.getState().setSearchByPhotoTitle("bình minh");
    UseCategoryStore.getState().setSearchByTags("forest");
    UseCategoryStore.getState().setFilterByIsFollowed("Đã theo dõi", "true");

    const requests: Array<Record<string, string>> = [];
    server.use(
      http.get("*/photo/public", ({ request }) => {
        const url = new URL(request.url);
        requests.push(Object.fromEntries(url.searchParams));
        const page = Number(url.searchParams.get("page") ?? "0");

        return HttpResponse.json(
          page === 0
            ? { objects: [buildPhoto("p1", "Alice")], totalPage: 2 }
            : { objects: [buildPhoto("p2", "Bob")], totalPage: 2 },
        );
      }),
    );

    const { container } = renderWithProviders(<InspirationPhoto />, {
      route: "/explore/inspiration",
    });

    expect(await screen.findByAltText("Photo p1")).toBeInTheDocument();
    expect(requests[0]).toMatchObject({
      limit: "20",
      page: "0",
      categoryName: "Thiên nhiên",
      orderByCreatedAt: "asc",
      orderByUpvote: "desc",
      watermark: "true",
      selling: "false",
      search: "bình minh",
      tags: "forest",
      isFollowed: "true",
    });

    await userEvent.click(screen.getByRole("button", { name: "load more" }));
    expect(await screen.findByAltText("Photo p2")).toBeInTheDocument();
    expect(requests[1]).toMatchObject({ page: "1" });

    await userEvent.click(screen.getByAltText("Photo p1"));
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe(
      "/explore/inspiration",
    );
    expect(screen.getByText("detail p1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "close detail" }));
    expect(screen.queryByText("detail p1")).toBeNull();

    await userEvent.click(screen.getByAltText("Photo p1"));
    await userEvent.click(screen.getByRole("button", { name: "close to map" }));
    expect(screen.queryByText("detail p1")).toBeNull();

    const firstShareButton = screen.getAllByRole("button", {
      name: "share photo",
    })[0];
    await userEvent.click(firstShareButton);
    expect(screen.getByText("share p1 user-p1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "close share modal" }));
    expect(screen.queryByText("share p1 user-p1")).toBeNull();

    const aliceRow = within(container).getByText("Alice");
    await userEvent.click(aliceRow);

    expect(UsePhotographerFilterStore.getState().namePhotographer).toBe("Alice");
    expect(UseUserOtherStore.getState()).toMatchObject({
      nameUserOther: "Alice",
      userOtherId: "user-p1",
    });
    expect(UseUserProfileStore.getState().activeTitle).toBeNull();
  });

  it("shows both the server error and the empty state when loading fails", async () => {
    server.use(
      http.get("*/photo/public", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<InspirationPhoto />, { route: "/explore/inspiration" });

    expect(
      await screen.findByText("Lỗi: Request failed with status code 500"),
    ).toBeInTheDocument();
    expect(screen.getByText("Không tìm thấy ảnh khả dụng!")).toBeInTheDocument();
  });

  it("shows the empty state when no public photos are returned", async () => {
    server.use(
      http.get("*/photo/public", () =>
        HttpResponse.json({ objects: [], totalPage: 0 }),
      ),
    );

    renderWithProviders(<InspirationPhoto />, { route: "/explore/inspiration" });

    expect(
      await screen.findByText("Không tìm thấy ảnh khả dụng!"),
    ).toBeInTheDocument();
  });
});
