import { render, screen } from "@testing-library/react";
import DetailUpgrede from "./DetailUpgrede";

describe("DetailUpgrede", () => {
  it("renders its placeholder content", () => {
    render(<DetailUpgrede />);

    expect(screen.getByText("123")).toBeInTheDocument();
  });
});
