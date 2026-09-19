import { act, render, screen } from "@testing-library/react";
import useSellPhotoStore, {
  type SellPhotoItem,
} from "../../../states/UseSellPhotoState";
import PhotoSellList from "./PhotoSellList";

vi.mock("./PhotoSellCard", () => ({
  default: ({ photo }: { photo: SellPhotoItem }) => (
    <div>card {photo.file.uid}</div>
  ),
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

describe("PhotoSellList", () => {
  const scrollIntoView = vi.fn();

  beforeAll(() => {
    // jsdom does not implement scrolling
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  beforeEach(() => {
    scrollIntoView.mockClear();
    useSellPhotoStore.getState().clearState();
    useSellPhotoStore.getState().addPhoto("a", { file: rcFile("a") });
    useSellPhotoStore.getState().addPhoto("b", { file: rcFile("b") });
  });

  it("renders a card per photo and scrolls the selected one into view", () => {
    render(<PhotoSellList />);
    expect(screen.getByText("card a")).toBeInTheDocument();
    expect(screen.getByText("card b")).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => useSellPhotoStore.getState().setSelectedPhotoByUid("a"));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByText("card a").parentElement,
    );
  });

  it("does not scroll for a selection without a card", () => {
    render(<PhotoSellList />);

    act(() => useSellPhotoStore.getState().setSelectedPhotoByUid("missing"));
    act(() => useSellPhotoStore.setState({ selectedPhoto: { id: "photo-1" } }));

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
