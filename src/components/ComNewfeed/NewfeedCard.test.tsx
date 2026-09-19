import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Schema } from "../../apis/types";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";
import NewfeedCard from "./NewfeedCard";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type DetailStubProps = {
  photo?: { id: string };
  onClose: () => void;
  onCloseToMap: () => void;
};

vi.mock("../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({ photo, onClose, onCloseToMap }: DetailStubProps) => (
    <div>
      <span>detail {photo?.id}</span>
      <button onClick={onClose}>close detail</button>
      <button onClick={onCloseToMap}>close to map</button>
    </div>
  ),
}));

const photo = (id: string): Schema<"SignedPhotoDto"> =>
  ({
    id,
    signedUrl: { url: `${id}.jpg`, thumbnail: `${id}-thumb.jpg` },
  }) as Schema<"SignedPhotoDto">;

const renderCard = (options: {
  createdAt: string;
  photos: Schema<"SignedPhotoDto">[];
  userId?: string;
}) =>
  renderWithProviders(
    <NewfeedCard
      userId={options.userId ?? "owner-1"}
      userName="Alice"
      avatar="author.png"
      title="A beautiful post"
      createdAt={options.createdAt}
      commentCount={4}
      likeCount={9}
      photo={options.photos}
    />,
    { route: "/home/newfeed", path: "/home/newfeed" },
  );

describe("NewfeedCard", () => {
  beforeEach(() => {
    navigate.mockReset();
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "" });
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-09-19T13:36:26.892Z").getTime(),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows owner actions, truncates long comments, and opens the detail view from a single photo", async () => {
    mockEndpoint("get", "*/me", {
      id: "owner-1",
      avatar: "me.png",
      name: "Owner",
    });
    const { container } = renderCard({
      createdAt: "2026-09-19T13:35:56.892Z",
      photos: [photo("p1")],
    });

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("30 giây trước")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Bình luận ở đây")).toBeInTheDocument();
    expect(screen.getByText(/long cmt long cmtlong cmt/)).toHaveTextContent("...");

    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Chỉnh sửa bài viết")).toBeInTheDocument();
    expect(screen.getByText("Xóa bài viết")).toBeInTheDocument();

    fireEvent.click(container.querySelector('img[src="p1-thumb.jpg"]') as HTMLImageElement);
    expect(await screen.findByText("detail p1")).toBeInTheDocument();
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe("/home/newfeed");

    await userEvent.click(screen.getByRole("button", { name: "close detail" }));
    expect(navigate).toHaveBeenCalledWith("/home/newfeed");

    fireEvent.click(container.querySelector('img[src="p1-thumb.jpg"]') as HTMLImageElement);
    await userEvent.click(screen.getByRole("button", { name: "close to map" }));
    expect(navigate).toHaveBeenCalledWith("/explore/photo-map");
  });

  it("shows the two-photo layout and report action for other users", async () => {
    mockEndpoint("get", "*/me", {
      id: "viewer-1",
      avatar: "me.png",
      name: "Viewer",
    });
    const { container } = renderCard({
      createdAt: "2026-09-19T13:31:26.892Z",
      photos: [photo("p1"), photo("p2")],
      userId: "owner-2",
    });

    expect(await screen.findByText("5 phút trước")).toBeInTheDocument();
    expect(container.querySelectorAll('img[src$="-thumb.jpg"]')).toHaveLength(2);

    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Báo cáo bài viết")).toBeInTheDocument();
    expect(screen.queryByText("Chỉnh sửa bài viết")).toBeNull();
  });

  it("shows the three-photo layout and hour-based timestamp", async () => {
    mockEndpoint("get", "*/me", {
      id: "viewer-1",
      avatar: "me.png",
      name: "Viewer",
    });
    const { container } = renderCard({
      createdAt: "2026-09-19T11:36:26.892Z",
      photos: [photo("p1"), photo("p2"), photo("p3")],
      userId: "owner-2",
    });

    expect(await screen.findByText("2 giờ trước")).toBeInTheDocument();
    expect(container.querySelector('img[src="p1-thumb.jpg"]')?.className).toContain("col-span-2");
    expect(container.querySelector('img[src="p2-thumb.jpg"]')?.className).toContain("h-[150px]");
    expect(container.querySelector('img[src="p3-thumb.jpg"]')?.className).toContain("h-[150px]");
  });

  it("shows the 4+ photo layout, including the extra-photo overlay, and day-based timestamp", async () => {
    mockEndpoint("get", "*/me", {
      id: "viewer-1",
      avatar: "me.png",
      name: "Viewer",
    });
    const { container } = renderCard({
      createdAt: "2026-09-17T13:36:26.892Z",
      photos: [photo("p1"), photo("p2"), photo("p3"), photo("p4"), photo("p5")],
      userId: "owner-2",
    });

    expect(await screen.findByText("2 ngày trước")).toBeInTheDocument();
    expect(container.querySelector('img[src="p1-thumb.jpg"]')?.className).toContain("row-span-2");
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
