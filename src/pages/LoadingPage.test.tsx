import { render, screen } from "@testing-library/react";
import LoadingPage from "./LoadingPage";

describe("LoadingPage", () => {
  it("renders the loading spinner inside the full screen wrapper", () => {
    const { container } = render(<LoadingPage />);

    expect(container.firstElementChild).toHaveClass("h-screen");
    expect(screen.getByLabelText("oval-loading")).toBeInTheDocument();
  });
});
