import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import CameraDetail from "./CameraDetail";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useParams: () => ({ cameraId: "c1" }),
}));

type CameraPhotoProps = { nameCamera?: string };

vi.mock("./CameraPhoto", () => ({
  default: ({ nameCamera }: CameraPhotoProps) => <div>photos of {nameCamera}</div>,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CameraDetail", () => {
  it("shows a loading state while fetching", () => {
    server.use(http.get("*/camera/c1", () => new Promise(() => {})));

    renderWithProviders(<CameraDetail />);

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    server.use(http.get("*/camera/c1", () => new HttpResponse(null, { status: 500 })));

    renderWithProviders(<CameraDetail />);

    expect(await screen.findByText(/Lỗi:/)).toBeInTheDocument();
  });

  it("shows the camera details and the photos taken with it", async () => {
    mockEndpoint("get", "*/camera/c1", {
      name: "EOS R5",
      description: "A great mirrorless camera",
      thumbnail: "eos.png",
    });

    renderWithProviders(<CameraDetail />);

    expect(await screen.findByText("EOS R5")).toBeInTheDocument();
    expect(screen.getByText("A great mirrorless camera")).toBeInTheDocument();
    expect(screen.getByAltText("Nikon D3500")).toHaveAttribute("src", "eos.png");
    expect(screen.getByText("photos of EOS R5")).toBeInTheDocument();
  });
});
