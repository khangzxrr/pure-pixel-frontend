import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import UpgradeToPtgPage from "./UpgradeToPtgPage";

vi.mock("./../../layouts/UpgradeToPtgLayout", () => ({
  default: () => <div>upgrade to ptg layout</div>,
}));

describe("UpgradeToPtgPage", () => {
  it("renders the upgrade to photographer layout", () => {
    renderWithProviders(<UpgradeToPtgPage />);
    expect(screen.getByText("upgrade to ptg layout")).toBeInTheDocument();
  });
});
