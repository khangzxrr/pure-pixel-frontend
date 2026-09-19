import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CameraNav from "./CameraNav";

describe("CameraNav", () => {
  it("shows the active icon and title when provided", () => {
    renderWithProviders(<CameraNav activeIcon={<span>icon</span>} activeTitle="Máy ảnh" />);

    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.getByText("Máy ảnh")).toBeInTheDocument();
  });

  it("falls back to a placeholder icon when none is given", () => {
    renderWithProviders(<CameraNav />);

    expect(screen.getByText("#")).toBeInTheDocument();
  });
});
