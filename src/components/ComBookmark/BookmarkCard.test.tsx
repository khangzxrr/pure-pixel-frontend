import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import type { Schema } from "../../apis/types";
import BookmarkCard from "./BookmarkCard";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

// only the fields the card reads
const photo = {
  id: "p1",
  signedUrl: { url: "full.jpg", thumbnail: "thumb.jpg" },
  photographer: { id: "ph1", name: "Trung", avatar: "trung.png" },
} as unknown as Schema<"SignedPhotoDto">;

describe("BookmarkCard", () => {
  beforeEach(() => {
    navigate.mockClear();
    UsePhotographerFilterStore.setState({ namePhotographer: "" });
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
  });

  it("shows the thumbnail and photographer", () => {
    const { container } = renderWithProviders(<BookmarkCard photoBookmark={photo} />);

    const [thumbnail, avatar] = Array.from(container.querySelectorAll("img"));
    expect(thumbnail).toHaveAttribute("src", "thumb.jpg");
    expect(avatar).toHaveAttribute("src", "trung.png");
    expect(screen.getByText("Trung")).toBeInTheDocument();
  });

  it("opens the photographer profile", async () => {
    renderWithProviders(<BookmarkCard photoBookmark={photo} />);

    await userEvent.click(screen.getByText("Trung"));

    expect(navigate).toHaveBeenCalledWith("/user/ph1/photos");
    expect(UsePhotographerFilterStore.getState().namePhotographer).toBe("Trung");
    expect(UseUserOtherStore.getState()).toMatchObject({
      nameUserOther: "Trung",
      userOtherId: "ph1",
    });
  });

  it("forwards photo and share clicks", () => {
    const onClick = vi.fn();
    const onShare = vi.fn();
    const { container } = renderWithProviders(
      <BookmarkCard photoBookmark={photo} onClick={onClick} onShare={onShare} />,
    );

    fireEvent.click(container.querySelector("img") as HTMLImageElement);
    fireEvent.click(container.querySelector("svg") as SVGElement);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
