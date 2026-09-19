import { render, screen } from "@testing-library/react";
import HotPhoto from "./HotPhoto";

describe("HotPhoto", () => {
  it("renders the placeholder rows", () => {
    render(<HotPhoto />);
    expect(screen.getAllByText("hotPhoto")).toHaveLength(5);
  });
});
