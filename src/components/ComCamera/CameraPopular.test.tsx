import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseCameraStore from "../../states/UseCameraStore";
import CameraPopular from "./CameraPopular";

describe("CameraPopular", () => {
  afterEach(() => {
    UseCameraStore.setState({
      brandCamera: "",
      nameCamera: "",
      listTopCameraByBrand: [],
    });
  });

  it("shows only the top 5 cameras of the current brand", () => {
    UseCameraStore.setState({
      brandCamera: "Canon",
      listTopCameraByBrand: Array.from({ length: 7 }, (_, i) => ({
        id: `c${i}`,
        name: `Camera ${i}`,
        thumbnail: `thumb${i}.png`,
      })) as never,
    });

    renderWithProviders(<CameraPopular />);

    expect(screen.getByText("Canon", { exact: false })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(screen.getByText("Camera 0")).toBeInTheDocument();
    expect(screen.queryByText("Camera 5")).not.toBeInTheDocument();
  });

  it("sets the selected camera name in the store on click", async () => {
    UseCameraStore.setState({
      brandCamera: "Canon",
      listTopCameraByBrand: [
        { id: "c1", name: "EOS R5", thumbnail: "thumb.png" },
      ] as never,
    });

    renderWithProviders(<CameraPopular />);

    await userEvent.click(screen.getByText("EOS R5"));

    expect(UseCameraStore.getState().nameCamera).toBe("EOS R5");
  });

  it("renders nothing when there are no top cameras", () => {
    renderWithProviders(<CameraPopular />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
