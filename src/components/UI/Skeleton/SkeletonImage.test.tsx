import { render } from "@testing-library/react";
import SkeletonImage from "./SkeletonImage";

describe("SkeletonImage", () => {
  it("renders a pulsing image placeholder", () => {
    const { container } = render(<SkeletonImage type="avatar" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
