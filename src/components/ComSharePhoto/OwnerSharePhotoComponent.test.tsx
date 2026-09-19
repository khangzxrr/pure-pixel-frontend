import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import OwnerSharePhotoComponent from "./OwnerSharePhotoComponent";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const SHARE_URL = "https://purepixel.io.vn/share/abc";

const respondWithResolutions = () =>
  server.use(
    http.get("*/photo/:id/available-resolution", ({ params }) =>
      HttpResponse.json(
        params.id === "p1"
          ? [
              { width: 1920, height: 1080 },
              { width: 960, height: 540 },
            ]
          : [],
      ),
    ),
  );

const captureShare = () => {
  const bodies: unknown[] = [];
  server.use(
    http.post("*/photo/share", async ({ request }) => {
      const body = await request.json();
      bodies.push(body);
      return HttpResponse.json({ size: { width: 960, height: 540 }, shareUrl: SHARE_URL });
    }),
  );
  return bodies;
};

describe("OwnerSharePhotoComponent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const chooseResolution = async (
    user: ReturnType<typeof userEvent.setup>,
    label: string,
  ) => {
    await user.click(await screen.findByRole("combobox"));
    await user.click(await screen.findByTitle(label));
  };

  it("shows a loading state until the resolutions arrive", async () => {
    respondWithResolutions();
    renderWithProviders(<OwnerSharePhotoComponent photoId="p1" onClose={vi.fn()} />);

    expect(screen.getByText("loading...")).toBeInTheDocument();
    expect(await screen.findByText("Chia sẻ hình ảnh")).toBeInTheDocument();
    expect(screen.getByText("Chất lượng")).toBeInTheDocument();
  });

  it("keeps loading without a photo id and requests nothing", () => {
    renderWithProviders(<OwnerSharePhotoComponent onClose={vi.fn()} />);

    expect(screen.getByText("loading...")).toBeInTheDocument();
  });

  it("creates a share link for the chosen resolution and copies it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    respondWithResolutions();
    const bodies = captureShare();
    renderWithProviders(<OwnerSharePhotoComponent photoId="p1" onClose={vi.fn()} />);

    await chooseResolution(user, "960x540");

    expect(await screen.findByText("Đã sao chép liên kết")).toBeInTheDocument();
    expect(bodies).toEqual([{ photoId: "p1", size: { width: 960, height: 540 } }]);
    expect(writeText).toHaveBeenCalledWith(SHARE_URL);
  });

  it("logs when the clipboard refuses", async () => {
    const user = userEvent.setup();
    const failure = new Error("denied");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(failure);
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    respondWithResolutions();
    captureShare();
    renderWithProviders(<OwnerSharePhotoComponent photoId="p1" onClose={vi.fn()} />);

    await chooseResolution(user, "1920x1080");

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith("Failed to copy link: ", failure),
    );
    expect(screen.queryByText("Đã sao chép liên kết")).toBeNull();
  });

  it("closes when done", async () => {
    const onClose = vi.fn();
    respondWithResolutions();
    renderWithProviders(<OwnerSharePhotoComponent photoId="p1" onClose={onClose} />);

    await userEvent.click(await screen.findByRole("button", { name: "Xong" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
