import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import MyPhotosPage from "./MyPhotosP";

vi.mock("../../layouts/MyPhotosLayout", () => ({
  default: () => <div>my photos layout</div>,
}));

describe("MyPhotosPage", () => {
  it("renders the my photos layout", () => {
    renderWithProviders(<MyPhotosPage />);
    expect(screen.getByText("my photos layout")).toBeInTheDocument();
  });
});
