import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import useModalStore from "../../states/UseModalStore";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UpdatePhotoModal from "./UpdatePhotoModal";

type MapStubProps = { children?: ReactNode; latitude: number; longitude: number };

// mapbox-gl cannot render in jsdom
vi.mock("react-map-gl", () => ({
  default: ({ children, latitude, longitude }: MapStubProps) => (
    <div data-testid="update-map">
      {`${latitude},${longitude}`}
      {children}
    </div>
  ),
  Marker: ({ children }: MapStubProps) => <div>{children}</div>,
  Popup: ({ children }: MapStubProps) => <div>{children}</div>,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const basePhoto = {
  id: "p1",
  title: "Hoàng hôn",
  description: "Mô tả",
  visibility: "PUBLIC",
  watermark: false,
  categoryIds: ["cat1"],
  photoTags: ["sunset"],
  originalPhotoUrl: "orig.jpg",
  thumbnailPhotoUrl: "thumb.jpg",
  exif: {},
};

const openModal = (photo: Partial<typeof basePhoto> = {}) => {
  useModalStore.setState({
    isUpdatePhotoModal: true,
    selectedUpdatePhoto: { ...basePhoto, ...photo },
  } as never);
};

describe("UpdatePhotoModal", () => {
  afterEach(() => {
    // unmount before resetting the store: UpdatePhotoModal subscribes to it directly
    cleanup();
    useModalStore.setState({
      isUpdatePhotoModal: false,
      selectedUpdatePhoto: {},
    } as never);
  });

  it("loads categories and submits an update with the current form values", async () => {
    mockEndpoint("get", "*/category", [
      { id: "cat1", name: "Phong cảnh" },
      { id: "cat2", name: "Chân dung" },
    ]);
    server.use(
      http.get(
        "https://api.mapbox.com/search/geocode/v6/reverse",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const updateRequests = mockEndpoint("patch", "*/photo/p1", { id: "p1" });

    openModal();
    renderWithProviders(<UpdatePhotoModal />);

    expect(await screen.findByDisplayValue("Hoàng hôn")).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText("Tựa đề của ảnh");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Bình minh");

    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => expect(updateRequests).toHaveLength(1));
    expect(updateRequests[0].json).toMatchObject({ title: "Bình minh" });
    expect(
      await screen.findByText("Thông tin ảnh đã được cập nhật."),
    ).toBeInTheDocument();
    expect(useModalStore.getState().isUpdatePhotoModal).toBe(false);
  });

  it("requires a title before submitting", async () => {
    mockEndpoint("get", "*/category", []);
    server.use(
      http.get(
        "https://api.mapbox.com/search/geocode/v6/reverse",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const updateRequests = mockEndpoint("patch", "*/photo/p1", { id: "p1" });

    openModal({ title: "" });
    renderWithProviders(<UpdatePhotoModal />);

    await screen.findByPlaceholderText("Tựa đề của ảnh");
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(await screen.findByText("Yêu cầu nhập tiêu đề")).toBeInTheDocument();
    expect(updateRequests).toHaveLength(0);
  });

  it("shows an error notification when the update fails", async () => {
    mockEndpoint("get", "*/category", []);
    server.use(
      http.get(
        "https://api.mapbox.com/search/geocode/v6/reverse",
        () => new HttpResponse(null, { status: 500 }),
      ),
      http.patch("*/photo/p1", () => new HttpResponse(null, { status: 500 })),
    );

    openModal();
    renderWithProviders(<UpdatePhotoModal />);

    await screen.findByDisplayValue("Hoàng hôn");
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

    expect(await screen.findByText("Vui lòng thử lại sau.")).toBeInTheDocument();
    expect(useModalStore.getState().isUpdatePhotoModal).toBe(true);
  });

  it("shows the map for a photo that already has coordinates", async () => {
    mockEndpoint("get", "*/category", []);
    const addressRequests = mockEndpoint(
      "get",
      "https://api.mapbox.com/search/geocode/v6/reverse",
      { features: [{ properties: { full_address: "Quận 1, TP HCM" } }] },
    );

    openModal({ exif: { latitude: 10.77, longitude: 106.7 } });
    renderWithProviders(<UpdatePhotoModal />);

    expect(await screen.findByTestId("update-map")).toHaveTextContent(
      "10.77,106.7",
    );
    await waitFor(() => expect(addressRequests).toHaveLength(1));
    expect(await screen.findByText("Quận 1, TP HCM")).toBeInTheDocument();
    expect(
      screen.queryByText("Nhấn để thêm vị trí bức ảnh"),
    ).not.toBeInTheDocument();
  });

  it("opens the map picker for a photo without coordinates", async () => {
    mockEndpoint("get", "*/category", []);
    server.use(
      http.get(
        "https://api.mapbox.com/search/geocode/v6/reverse",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    openModal();
    renderWithProviders(<UpdatePhotoModal />);

    await userEvent.click(
      await screen.findByText("Nhấn để thêm vị trí bức ảnh"),
    );

    expect(useModalStore.getState().isUpdateOpenMapModal).toBe(true);
    expect(useModalStore.getState().isUpdatePhotoModal).toBe(false);
  });

  it("toggles the watermark checkbox", async () => {
    mockEndpoint("get", "*/category", []);
    server.use(
      http.get(
        "https://api.mapbox.com/search/geocode/v6/reverse",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    openModal();
    renderWithProviders(<UpdatePhotoModal />);

    await screen.findByDisplayValue("Hoàng hôn");
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(useModalStore.getState().selectedUpdatePhoto.watermark).toBe(true);
  });
});
