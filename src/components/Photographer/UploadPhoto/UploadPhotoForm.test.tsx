import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { MockInstance } from "vitest";
import useUploadPhotoStore, {
  type UploadPhotoItem,
} from "../../../states/UploadPhotoState";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import UploadPhotoForm from "./UploadPhotoForm";

type PointStubProps = { children?: ReactNode; latitude: number; longitude: number };

// mapbox-gl cannot render in jsdom: the stub shows where the map points
vi.mock("react-map-gl", () => ({
  default: ({
    children,
    latitude,
    longitude,
    zoom,
  }: PointStubProps & { zoom: number }) => (
    <div>
      <p data-testid="view">{`${latitude},${longitude},${zoom}`}</p>
      {children}
    </div>
  ),
  Marker: ({ children, latitude, longitude }: PointStubProps) => (
    <div data-testid="marker">
      {`${latitude},${longitude}`}
      {children}
    </div>
  ),
  Popup: ({ children }: PointStubProps) => <div>{children}</div>,
}));

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const MAPBOX_REVERSE = "https://api.mapbox.com/search/geocode/v6/reverse";

const respond = () =>
  server.use(
    http.get("*/category", () =>
      HttpResponse.json([
        { id: "cat-1", name: "Phong cảnh" },
        { id: "cat-2", name: "Chân dung" },
      ]),
    ),
    http.get(MAPBOX_REVERSE, () =>
      HttpResponse.json({ features: [{ properties: { full_address: "Quận 1, TP HCM" } }] }),
    ),
  );

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

// queues a photo and returns the stored item, which the store updates in place
const queue = (uid: string, fields: Partial<UploadPhotoItem> = {}) => {
  useUploadPhotoStore.getState().addPhoto(uid, {
    file: rcFile(uid),
    title: "Hoàng hôn",
    visibility: "PUBLIC",
    watermark: false,
    watermarkContent: "PUREPIXEL",
    status: "done",
    exif: { Model: "Z6", Make: "Nikon", latitude: 10.8, longitude: 106.7 },
    ...fields,
  });
  const state = useUploadPhotoStore.getState();
  return state.photoArray[state.uidHashmap[uid]];
};

// option content of antd's select dropdown
const option = (text: string) => (_: string, element: Element | null) =>
  !!element?.classList.contains("ant-select-item-option-content") &&
  element.textContent === text;

const titleInput = () => screen.getByPlaceholderText("Nhập tựa đề cho ảnh");

describe("UploadPhotoForm", () => {
  let consoleError: MockInstance<typeof console.error>;
  // console.error messages a test expects
  let expectedErrors: string[];

  beforeEach(() => {
    expectedErrors = [];
    useUploadPhotoStore.getState().clearState();
    useUploadPhotoStore.getState().setIsOpenMapModal(false);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([text]) => String(text))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((text) => !text.includes("findDOMNode is deprecated"))
      .filter((text) => !expectedErrors.some((expected) => text.includes(expected)));
    expect(unexpected.join("\n")).toBe("");
    consoleError.mockRestore();
  });

  it("fills the form from the photo and writes every edit back to the queue", async () => {
    respond();
    const photo = queue("a");
    renderWithProviders(<UploadPhotoForm selectedPhoto={photo} />);

    expect(titleInput()).toHaveValue("Hoàng hôn");
    await userEvent.type(titleInput(), " đỏ");
    expect(photo.title).toBe("Hoàng hôn đỏ");

    await userEvent.type(screen.getByPlaceholderText("Nhập mô tả"), "Trên núi");
    expect(photo.description).toBe("Trên núi");

    const [categorySelect, tagSelect, visibilitySelect] = screen.getAllByRole("combobox");
    await userEvent.click(categorySelect);
    await userEvent.click(await screen.findByText(option("Phong cảnh")));
    expect(photo.categoryIds).toEqual(["cat-1"]);

    // the chosen category shows as a removable tag
    await userEvent.click(screen.getByText("×"));
    expect(photo.categoryIds).toEqual([]);

    await userEvent.type(categorySelect, "chân");
    expect(await screen.findByText(option("Chân dung"))).toBeInTheDocument();
    expect(screen.queryByText(option("Phong cảnh"))).toBeNull();
    await userEvent.keyboard("{Escape}");

    await userEvent.type(tagSelect, "núi");
    // rc-select reads the legacy `which` code, which user-event does not set
    fireEvent.keyDown(tagSelect, { key: "Enter", keyCode: 13, which: 13 });
    expect(photo.photoTags).toEqual(["núi"]);

    await userEvent.click(visibilitySelect);
    await userEvent.click(await screen.findByText(option("Riêng tư")));
    expect(photo.visibility).toBe("PRIVATE");

    await userEvent.click(screen.getByRole("checkbox"));
    expect(photo.watermark).toBe(true);
    expect(screen.getByRole("checkbox")).toBeChecked();

    expect(screen.getByTestId("view")).toHaveTextContent("10.8,106.7,14");
    expect(screen.getByTestId("marker")).toHaveTextContent("10.8,106.7");
    expect(
      await screen.findByRole("heading", { name: "Quận 1, TP HCM" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Z6")).toBeInTheDocument();
  });

  it("shows validation errors and opens the map for a photo without a location", async () => {
    expectedErrors = ["Geolocation is not supported by this browser."];
    respond();
    const photo = queue("a", { visibility: undefined, exif: { Model: "Z6" } });
    renderWithProviders(<UploadPhotoForm selectedPhoto={photo} />);

    expect(consoleError).toHaveBeenCalledWith(
      "Geolocation is not supported by this browser.",
    );

    // the location button sits inside the form, so it submits it too
    await userEvent.click(
      screen.getByRole("button", { name: /Nhấn để thêm vị trí bức ảnh/ }),
    );
    expect(useUploadPhotoStore.getState().isOpenMapModal).toBe(true);
    expect(
      await screen.findByText("Yêu cầu chọn chế độ công khai"),
    ).toBeInTheDocument();

    await userEvent.clear(titleInput());
    expect(await screen.findByText("Yêu cầu nhập tiêu đề")).toBeInTheDocument();
    expect(photo.title).toBe("");

    await userEvent.type(screen.getByPlaceholderText("Nhập mô tả"), "Gọi 0912345678");
    expect(
      await screen.findByText("Mô tả không được chứa số điện thoại"),
    ).toBeInTheDocument();
  });

  it("renders without a photo", async () => {
    expectedErrors = ["Geolocation is not supported by this browser."];
    respond();
    renderWithProviders(<UploadPhotoForm />);

    expect(screen.getByText("Không có dữ liệu của tấm ảnh")).toBeInTheDocument();
    await userEvent.type(titleInput(), "Tựa");
    expect(titleInput()).toHaveValue("Tựa");
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
    await waitFor(() => expect(screen.getAllByRole("combobox")).toHaveLength(3));
  });

  it("reloads the fields when another photo is selected", async () => {
    respond();
    const first = queue("a");
    const second = queue("b", {
      title: "Bình minh",
      watermark: true,
      exif: { latitude: 16.05, longitude: 108.2 },
    });
    const { rerender } = renderWithProviders(<UploadPhotoForm selectedPhoto={first} />);

    rerender(<UploadPhotoForm selectedPhoto={second} />);

    await waitFor(() => expect(titleInput()).toHaveValue("Bình minh"));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByTestId("view")).toHaveTextContent("16.05,108.2,14");
  });

  it("logs failed category and address lookups", async () => {
    expectedErrors = ["Error fetching categories:", "Error fetching address:"];
    server.use(
      http.get("*/category", () => HttpResponse.json({}, { status: 500 })),
      http.get(MAPBOX_REVERSE, () => HttpResponse.json({}, { status: 500 })),
    );
    renderWithProviders(<UploadPhotoForm selectedPhoto={queue("a")} />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching categories:", expect.anything()),
    );
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching address:", expect.anything()),
    );
  });
});
