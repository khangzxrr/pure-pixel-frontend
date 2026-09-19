import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import BookmarkLayout from "./BookmarkLayout";

vi.mock("../components/ComBookmark/BookmarkList", () => ({
  default: () => <div>bookmark list</div>,
}));

describe("BookmarkLayout", () => {
  it("renders the bookmark list inside its padded container", () => {
    const { container } = renderWithProviders(<BookmarkLayout />);

    expect(screen.getByText("bookmark list")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("p-4");
  });
});
