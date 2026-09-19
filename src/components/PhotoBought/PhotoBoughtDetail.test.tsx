import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import PhotoBoughtDetail from "./PhotoBoughtDetail";

const getPhotoBoughtDetailMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/PhotoExchange", () => ({
  default: {
    getPhotoBoughtDetail: (...args: unknown[]) =>
      getPhotoBoughtDetailMock(...args),
  },
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("./PhotoBoughtPreviewComponent", () => ({
  default: ({
    photoData,
    photoBoughtId,
  }: {
    photoData: unknown;
    photoBoughtId: string;
  }) => (
    <div>
      preview {photoBoughtId} {JSON.stringify(photoData)}
    </div>
  ),
}));

describe("PhotoBoughtDetail", () => {
  beforeEach(() => {
    getPhotoBoughtDetailMock.mockReset();
  });

  it("shows a loading message while the bought photo detail is being fetched", () => {
    getPhotoBoughtDetailMock.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<PhotoBoughtDetail />, {
      route: "/profile/photo-bought/bought-1",
      path: "/profile/photo-bought/:boughtId",
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches the bought photo detail by the route id and renders the preview", async () => {
    getPhotoBoughtDetailMock.mockResolvedValue({ photo: { title: "Sunset" } });

    renderWithProviders(<PhotoBoughtDetail />, {
      route: "/profile/photo-bought/bought-1",
      path: "/profile/photo-bought/:boughtId",
    });

    expect(getPhotoBoughtDetailMock).toHaveBeenCalledWith("bought-1");
    expect(await screen.findByText(/preview bought-1/)).toBeInTheDocument();
  });
});
