import { act, render, screen } from "@testing-library/react";
import useUploadPhotoStore, {
  type UploadPhotoItem,
} from "../../../states/UploadPhotoState";
import ScrollingBar from "./ScrollingBar";

vi.mock("./PhotoCard", () => ({
  default: ({ photo }: { photo: UploadPhotoItem }) => (
    <div>card {photo.file.uid}</div>
  ),
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

describe("ScrollingBar", () => {
  const scrollIntoView = vi.fn();

  beforeAll(() => {
    // jsdom does not implement scrolling
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  beforeEach(() => {
    scrollIntoView.mockClear();
    useUploadPhotoStore.getState().clearState();
    useUploadPhotoStore.getState().addPhoto("a", { file: rcFile("a") });
    useUploadPhotoStore.getState().addPhoto("b", { file: rcFile("b") });
  });

  it("renders a card per photo and scrolls the selected one into view", () => {
    render(<ScrollingBar />);
    expect(screen.getByText("card a")).toBeInTheDocument();
    expect(screen.getByText("card b")).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => useUploadPhotoStore.getState().setSelectedPhotoByUid("b"));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByText("card b").parentElement,
    );
  });

  it("does not scroll for a selection without a card", () => {
    render(<ScrollingBar />);

    act(() => useUploadPhotoStore.getState().setSelectedPhotoByUid("missing"));
    act(() => useUploadPhotoStore.setState({ selectedPhoto: { id: "photo-1" } }));

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
