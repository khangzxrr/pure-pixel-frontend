import { render, screen } from "@testing-library/react";
import LoadingOval from "./LoadingOval";

const svgOf = () =>
  screen
    .getByRole("progressbar", { name: "oval-loading" })
    .querySelector("svg");

describe("LoadingOval", () => {
  it("uses the default size and colors", () => {
    render(<LoadingOval />);
    const svg = svgOf();
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
    expect(svg?.outerHTML).toContain("#eee");
    expect(svg?.outerHTML).toContain("#43474e");
  });

  it("applies the given size, colors and stroke width", () => {
    render(
      <LoadingOval
        size="22"
        color="#202225"
        strongWidth={5}
        secondaryColor="#fff"
      />,
    );
    const svg = svgOf();
    expect(svg).toHaveAttribute("width", "22");
    expect(svg?.outerHTML).toContain("#202225");
    expect(svg?.outerHTML).toContain("#fff");
    expect(svg?.outerHTML).toContain('stroke-width="5"');
  });
});
