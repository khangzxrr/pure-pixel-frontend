import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import NewfeedPage from "./NewfeedPage";

vi.mock("../../layouts/NewfeedLayout", () => ({
  default: () => <div>newfeed layout</div>,
}));

describe("NewfeedPage", () => {
  it("renders the newfeed layout", () => {
    renderWithProviders(<NewfeedPage />);
    expect(screen.getByText("newfeed layout")).toBeInTheDocument();
  });
});
