import { render, screen } from "@testing-library/react";
import LoadingSpinnerPage from "./LoadingSpinnerPage";

describe("LoadingSpinnerPage", () => {
  it("renders a visible oval spinner", () => {
    render(<LoadingSpinnerPage />);

    const spinner = screen.getByLabelText("oval-loading");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toBeVisible();
  });
});
