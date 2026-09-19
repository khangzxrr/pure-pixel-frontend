import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import CameraCard from "./CameraCard";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

describe("CameraCard", () => {
  afterEach(() => {
    navigate.mockReset();
  });

  it("shows the camera name and description", () => {
    renderWithProviders(<CameraCard />);

    expect(screen.getByText("Nikon D3500")).toBeInTheDocument();
    expect(screen.getByAltText("Nikon D3500")).toBeInTheDocument();
  });

  it("navigates to the hardcoded camera model on click", async () => {
    renderWithProviders(<CameraCard />);

    await userEvent.click(screen.getByText("Nikon D3500"));

    expect(navigate).toHaveBeenCalledWith("/camera/nikon-d3500");
  });
});
