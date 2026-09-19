import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import PhotoSellingPage from "./PhotoSellingPage";

vi.mock("../../components/SellingPhoto/SellingPhotoList", () => ({
  default: () => <div>selling photo list</div>,
}));

describe("PhotoSellingPage", () => {
  it("renders the selling photo list inside a full height wrapper", () => {
    const { container } = renderWithProviders(<PhotoSellingPage />);
    expect(screen.getByText("selling photo list")).toBeInTheDocument();
    expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
  });
});
