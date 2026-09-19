import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";
import BookmarkList from "./BookmarkList";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type DetailStubProps = {
  photo: { id: string };
  onClose: () => void;
  onCloseToMap: () => void;
};

vi.mock("../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({ photo, onClose, onCloseToMap }: DetailStubProps) => (
    <div>
      <span>detail {photo.id}</span>
      <button onClick={onClose}>close detail</button>
      <button onClick={onCloseToMap}>close to map</button>
    </div>
  ),
}));

type ShareStubProps = { photoId?: string; userId?: string; onClose: () => void };

vi.mock("../ComSharePhoto/ComSharePhoto", () => ({
  default: ({ photoId, userId, onClose }: ShareStubProps) => (
    <button onClick={onClose}>
      share {photoId} by {userId}
    </button>
  ),
}));

const bookmark = (id: string, photographer: string) => ({
  id,
  signedUrl: { url: `${id}.jpg`, thumbnail: `${id}-thumb.jpg` },
  photographer: { id: `ph-${id}`, name: photographer, avatar: "avatar.png" },
});

const respondWithBookmarks = (totalPage: number) => {
  const searches: string[] = [];
  server.use(
    http.get("*/photo/public", ({ request }) => {
      const search = new URL(request.url).search;
      searches.push(search);
      const page = new URL(request.url).searchParams.get("page");
      return HttpResponse.json({
        totalPage,
        objects:
          page === "0"
            ? [bookmark("p1", "Trung"), bookmark("p2", "Bảo")]
            : [bookmark("p3", "Khang")],
      });
    }),
  );
  return searches;
};

const thumbnailOf = (container: HTMLElement, id: string) =>
  container.querySelector(`img[src="${id}-thumb.jpg"]`) as HTMLImageElement;

describe("BookmarkList", () => {
  beforeEach(() => {
    navigate.mockClear();
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "" });
  });

  it("lists the first page of bookmarked photos", async () => {
    const searches = respondWithBookmarks(1);
    const { container } = renderWithProviders(<BookmarkList />);

    expect(await screen.findByText("Trung")).toBeInTheDocument();
    expect(screen.getByText("Bảo")).toBeInTheDocument();
    expect(searches).toEqual(["?limit=12&page=0&bookmarked=true"]);
    expect(container.querySelector(".ant-pagination")).toBeNull();
  });

  it("renders nothing when the response has no photos", async () => {
    server.use(http.get("*/photo/public", () => HttpResponse.json({})));
    const { container, queryClient } = renderWithProviders(<BookmarkList />);

    await waitFor(() =>
      expect(queryClient.getQueryState(["getAllBookmarks", 1])?.status).toBe(
        "success",
      ),
    );
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("pages through the bookmarks", async () => {
    const searches = respondWithBookmarks(2);
    renderWithProviders(<BookmarkList />);
    await screen.findByText("Trung");

    // choosing the current page does not refetch
    await userEvent.click(screen.getByTitle("1"));
    expect(searches).toHaveLength(1);

    await userEvent.click(screen.getByTitle("2"));

    expect(await screen.findByText("Khang")).toBeInTheDocument();
    expect(searches).toEqual([
      "?limit=12&page=0&bookmarked=true",
      "?limit=12&page=1&bookmarked=true",
    ]);
  });

  it("opens a photo and returns to the bookmarks or the map", async () => {
    respondWithBookmarks(1);
    const { container } = renderWithProviders(<BookmarkList />);
    await screen.findByText("Trung");

    fireEvent.click(thumbnailOf(container, "p2"));

    expect(screen.getByText("detail p2")).toBeInTheDocument();
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe(
      "/profile/bookmark",
    );

    await userEvent.click(screen.getByRole("button", { name: "close detail" }));
    expect(navigate).toHaveBeenCalledWith("/profile/bookmark");
    expect(screen.queryByText("detail p2")).toBeNull();

    fireEvent.click(thumbnailOf(container, "p1"));
    await userEvent.click(screen.getByRole("button", { name: "close to map" }));
    expect(navigate).toHaveBeenCalledWith("/explore/photo-map");
    expect(screen.queryByText("detail p1")).toBeNull();
  });

  it("shares a photo in a modal", async () => {
    respondWithBookmarks(1);
    const { container } = renderWithProviders(<BookmarkList />);
    await screen.findByText("Trung");

    // the thumbnail sits inside BlurhashImage's frame; the share icon lives on the card around it
    const card = thumbnailOf(container, "p1").closest(".group") as HTMLElement;
    fireEvent.click(card.querySelector("svg") as SVGElement);

    const share = await screen.findByRole("button", { name: "share p1 by ph-p1" });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /share p1/ })).toBe(share);

    await userEvent.click(share);

    await waitFor(() => expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible());
  });
});
