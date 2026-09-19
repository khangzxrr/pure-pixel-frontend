import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import BlogList from "./BlogList";

describe("BlogList", () => {
  it("renders the featured heading and every blog post card with a working read more link", () => {
    renderWithProviders(<BlogList />);

    expect(screen.getByText("Featured Blog Posts")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The Art of Minimalist Design in Modern Web Development",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("10 Must-Know JavaScript Tricks for 2023"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Future of AI in Web Design: Trends to Watch"),
    ).toBeInTheDocument();

    const readMoreLinks = screen.getAllByRole("link", { name: /Read More/i });
    expect(readMoreLinks).toHaveLength(3);
    readMoreLinks.forEach((link) =>
      expect(link).toHaveAttribute("href", "/explore/blog/123"),
    );
  });
});
