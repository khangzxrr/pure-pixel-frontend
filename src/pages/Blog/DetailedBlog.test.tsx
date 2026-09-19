import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import DetailedBlog from "./DetailedBlog";

describe("DetailedBlog", () => {
  it("renders the article content, footer actions and the blog list below it", () => {
    renderWithProviders(<DetailedBlog />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The Art of Minimalist Design in Modern Web Development",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Alex Johnson").length).toBeGreaterThan(0);
    expect(screen.getByText("1.2k Likes")).toBeInTheDocument();
    expect(screen.getByText("56 Comments")).toBeInTheDocument();

    // BlogList is rendered underneath the article
    expect(screen.getByText("Featured Blog Posts")).toBeInTheDocument();
  });
});
