import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders the three dots loader", () => {
    render(<LoadingSpinner />);
    const loader = screen.getByRole("progressbar", {
      name: "three-dots-loading",
    });
    expect(loader.querySelector("svg")).toHaveAttribute("height", "80");
  });
});
