import { render, screen } from "@testing-library/react";
import DetailUpgrede from "./DetailUpgrede";

describe("Camera DetailUpgrede", () => {
  it("renders its placeholder", () => {
    render(<DetailUpgrede />);
    expect(screen.getByText("123")).toBeInTheDocument();
  });
});
