import { render, screen } from "@testing-library/react";
import BlogNav from "./BlogNav";

describe("BlogNav", () => {
  it("shows the active icon and title", () => {
    render(<BlogNav activeIcon={<span>icon</span>} activeTitle="Blog" />);
    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("falls back to # without an icon", () => {
    render(<BlogNav activeTitle="Blog" />);
    expect(screen.getByText("#")).toBeInTheDocument();
  });
});
