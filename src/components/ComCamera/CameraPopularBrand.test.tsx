import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseCameraStore from "../../states/UseCameraStore";
import CameraPopularBrand from "./CameraPopularBrand";

describe("CameraPopularBrand", () => {
  afterEach(() => {
    UseCameraStore.setState({
      listTopBrandCamera: [],
      brandCamera: "",
      nameCamera: "",
      idCamera: null,
    });
  });

  it("shows the top 5 brands with their top 3 camera models", () => {
    UseCameraStore.setState({
      listTopBrandCamera: [
        {
          maker: {
            id: "m1",
            name: "Canon",
            thumbnail: "canon.png",
            cameras: [
              { id: "c1", name: "EOS R5" },
              { id: "c2", name: "EOS R6" },
              { id: "c3", name: "EOS 90D" },
              { id: "c4", name: "EOS M50" },
            ],
          },
        },
      ] as never,
    });

    renderWithProviders(<CameraPopularBrand />);

    expect(screen.getByText("Canon")).toBeInTheDocument();
    expect(screen.getByText("EOS R5")).toBeInTheDocument();
    expect(screen.getByText("EOS R6")).toBeInTheDocument();
    expect(screen.getByText("EOS 90D")).toBeInTheDocument();
    expect(screen.queryByText("EOS M50")).not.toBeInTheDocument();
  });

  it("sets the brand, name and id in the store when a model is clicked", async () => {
    UseCameraStore.setState({
      listTopBrandCamera: [
        {
          maker: {
            id: "m1",
            name: "Canon",
            thumbnail: "canon.png",
            cameras: [{ id: "c1", name: "EOS R5" }],
          },
        },
      ] as never,
    });

    renderWithProviders(<CameraPopularBrand />);

    await userEvent.click(screen.getByText("EOS R5"));

    expect(UseCameraStore.getState().brandCamera).toBe("Canon");
    expect(UseCameraStore.getState().nameCamera).toBe("EOS R5");
    expect(UseCameraStore.getState().idCamera).toBe("c1");
  });

  it("clears the camera name and id when the brand link is clicked", async () => {
    UseCameraStore.setState({
      listTopBrandCamera: [
        {
          maker: {
            id: "m1",
            name: "Canon",
            thumbnail: "canon.png",
            cameras: [],
          },
        },
      ] as never,
    });

    renderWithProviders(<CameraPopularBrand />);

    await userEvent.click(screen.getByRole("link", { name: "Canon Canon" }));

    expect(UseCameraStore.getState().brandCamera).toBe("Canon");
    expect(UseCameraStore.getState().nameCamera).toBe("");
    expect(UseCameraStore.getState().idCamera).toBeNull();
  });

  it("shows a fallback name when the maker has none", () => {
    UseCameraStore.setState({
      listTopBrandCamera: [
        { maker: { id: "m1", name: "", thumbnail: "", cameras: [] } },
      ] as never,
    });

    renderWithProviders(<CameraPopularBrand />);

    expect(screen.getByText("Unknown brand")).toBeInTheDocument();
  });
});
