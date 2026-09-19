import { render, screen } from "@testing-library/react";
import SkeletonLine from "./SkeletonLine";

describe("SkeletonLine", () => {
  it("renders a loading status with placeholder lines", () => {
    render(<SkeletonLine />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("animate-pulse");
    expect(status).toHaveTextContent("Loading...");
  });
});
