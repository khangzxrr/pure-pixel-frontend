import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CameraPage from "./CameraPage";

vi.mock("../../components/ComCamera/Camera", () => ({
  default: () => <div>camera component</div>,
}));

describe("CameraPage", () => {
  it("renders the Camera component", () => {
    renderWithProviders(<CameraPage />);
    expect(screen.getByText("camera component")).toBeInTheDocument();
  });
});
