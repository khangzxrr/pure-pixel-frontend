import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UseCameraStore from "../../states/UseCameraStore";
import CameraByBrand from "./CameraByBrand";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useParams: () => ({ cameraId: "canon" }),
}));

vi.mock("./CameraPopular", () => ({ default: () => <div>popular</div> }));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CameraByBrand", () => {
  afterEach(() => {
    UseCameraStore.setState({ brandCamera: "", nameCamera: "" });
  });

  it("shows a loading state while fetching", () => {
    server.use(
      http.get("*/camera/brand/canon/top", () => new Promise(() => {})),
    );

    renderWithProviders(<CameraByBrand />);

    expect(screen.getByText("popular")).toBeInTheDocument();
  });

  it("lists the top cameras for the brand and links to their detail page", async () => {
    UseCameraStore.setState({ brandCamera: "Canon" });
    mockEndpoint("get", "*/camera/brand/canon/top", [
      { id: "c1", name: "EOS R5", _count: { photos: 12, cameraOnUsers: 3 } },
    ]);

    renderWithProviders(<CameraByBrand />);

    expect(await screen.findByText("EOS R5")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EOS R5" })).toHaveAttribute(
      "href",
      "/explore/camera-model/c1",
    );

    await userEvent.click(screen.getByRole("link", { name: "EOS R5" }));
    expect(UseCameraStore.getState().nameCamera).toBe("EOS R5");
  });

  it("shows an error message when the request fails", async () => {
    server.use(
      http.get("*/camera/brand/canon/top", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<CameraByBrand />);

    expect(await screen.findByText(/Lỗi:/)).toBeInTheDocument();
  });
});
