import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import CameraPhoto from "./CameraPhoto";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useParams: () => ({ cameraId: "c1" }),
}));

type DetailedPhotoViewProps = {
  photo: { id: string };
  onClose: () => void;
  onCloseToMap: () => void;
};

vi.mock("../../pages/DetailPhoto/DetailPhoto", () => ({
  default: ({ photo, onClose, onCloseToMap }: DetailedPhotoViewProps) => (
    <div>
      <p data-testid="detail">detail {photo.id}</p>
      <button onClick={onClose}>close</button>
      <button onClick={onCloseToMap}>close to map</button>
    </div>
  ),
}));

type ComSharePhotoProps = { photoId?: string; userId?: string };

vi.mock("../ComSharePhoto/ComSharePhoto", () => ({
  default: ({ photoId, userId }: ComSharePhotoProps) => (
    <p data-testid="share">
      share {photoId} {userId}
    </p>
  ),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const buildPhoto = (id: string) => ({
  id,
  signedUrl: { thumbnail: `${id}.jpg` },
  photographer: { id: `ph-${id}`, name: `Photographer ${id}`, avatar: "a.png" },
});

describe("CameraPhoto", () => {
  it("shows an empty state when there are no photos", async () => {
    mockEndpoint("get", "*/photo/public", { objects: [], totalPage: 0 });

    renderWithProviders(<CameraPhoto nameCamera="EOS R5" />);

    expect(await screen.findByText("Không tìm thấy ảnh khả dụng!")).toBeInTheDocument();
    expect(screen.getByText("EOS R5")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    mockEndpoint("get", "*/photo/public", () => new Response(null, { status: 500 }));

    renderWithProviders(<CameraPhoto />);

    expect(await screen.findByText(/Lỗi:/)).toBeInTheDocument();
  });

  it("opens the detail view for a clicked photo and closes it", async () => {
    mockEndpoint("get", "*/photo/public", {
      objects: [buildPhoto("p1")],
      totalPage: 1,
    });

    renderWithProviders(<CameraPhoto />);

    const img = await screen.findByAltText("Photo p1");
    await userEvent.click(img);

    expect(screen.getByTestId("detail")).toHaveTextContent("detail p1");

    await userEvent.click(screen.getByText("close"));
    expect(screen.queryByTestId("detail")).not.toBeInTheDocument();
  });

  it("opens the share modal for a clicked photo", async () => {
    mockEndpoint("get", "*/photo/public", {
      objects: [buildPhoto("p1")],
      totalPage: 1,
    });

    renderWithProviders(<CameraPhoto />);

    await screen.findByAltText("Photo p1");
    // the share icon is the only <svg> rendered for a photo card
    const shareButton = document.querySelector("svg");
    expect(shareButton).toBeTruthy();
    await userEvent.click(shareButton as Element);

    expect(await screen.findByTestId("share")).toHaveTextContent("share p1 ph-p1");
  });
});
