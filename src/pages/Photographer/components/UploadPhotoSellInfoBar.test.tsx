import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import { http, HttpResponse } from "msw";
import { createRef, type ReactNode } from "react";
import type { MockInstance } from "vitest";
import type { Schema } from "../../../apis/types";
import useSellPhotoStore, {
  type SellPhotoItem,
} from "../../../states/UseSellPhotoState";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import UploadPhotoSellInfoBar, {
  type UploadPhotoSellFormHandle,
} from "./UploadPhotoSellInfoBar";

type PointStubProps = { children?: ReactNode; latitude: number; longitude: number };

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

// mapbox-gl cannot render in jsdom: the stub shows where the map points
vi.mock("react-map-gl", () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
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

const noopMessage = (() => {}) as unknown as MessageType;

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

const large = { width: 6000, height: 4000 };
const small = { width: 3000, height: 2000 };

// queues a photo and returns the stored item, which the store updates in place
const queue = (uid: string, fields: Partial<SellPhotoItem> = {}) => {
  const store = useSellPhotoStore.getState();
  store.addPhoto(uid, {
    file: rcFile(uid),
    title: `Ảnh ${uid}`,
    status: "done",
    exif: { Model: "Z6", Make: "Nikon", latitude: 10.8, longitude: 106.7 },
    pricetags: [
      { ...large, price: 0 },
      { ...small, price: 0 },
    ],
    ...fields,
  });
  if (fields.status !== "uploading") {
    store.setPhotoUploadResponse(uid, { id: `photo-${uid}` } as Schema<"SignedPhotoDto">);
  }
  const state = useSellPhotoStore.getState();
  return state.photoArray[state.uidHashmap[uid]];
};

const renderInfoBar = (photo?: SellPhotoItem) => {
  const ref = createRef<UploadPhotoSellFormHandle>();
  const view = renderWithProviders(
    <UploadPhotoSellInfoBar reference={ref} selectedPhoto={photo} />,
  );
  return { ref, ...view };
};

// option content of antd's select dropdown
const option = (text: string) => (_: string, element: Element | null) =>
  !!element?.classList.contains("ant-select-item-option-content") &&
  element.textContent === text;

const titleInput = () => screen.getByPlaceholderText("Nhập tựa đề cho ảnh");
const priceInputs = () => screen.getAllByPlaceholderText("Nhập giá");

describe("UploadPhotoSellInfoBar", () => {
  let consoleError: MockInstance<typeof console.error>;
  // console.error messages a test expects
  let expectedErrors: string[];

  beforeEach(() => {
    expectedErrors = [];
    navigate.mockClear();
    const store = useSellPhotoStore.getState();
    store.clearState();
    store.setIsOpenMapModal(false);
    store.setDisableUpload(false);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([text]) => String(text))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((text) => !text.includes("findDOMNode is deprecated"))
      .filter((text) => !expectedErrors.some((expected) => text.includes(expected)));
    expect(unexpected.join("\n")).toBe("");
    vi.restoreAllMocks();
  });

  it("fills the form from the photo and writes every edit back to the queue", async () => {
    respond();
    const photo = queue("a");
    const { container } = renderInfoBar(photo);

    expect(container.querySelector(".cursor-not-allowed")).toBeNull();
    expect(titleInput()).toHaveValue("Ảnh a");
    await userEvent.type(titleInput(), " đẹp");
    expect(photo.title).toBe("Ảnh a đẹp");

    await userEvent.type(screen.getByPlaceholderText("Nhập mô tả"), "Trên núi");
    expect(photo.description).toBe("Trên núi");

    const [categorySelect, tagSelect] = screen.getAllByRole("combobox");
    await userEvent.click(categorySelect);
    await userEvent.click(await screen.findByText(option("Phong cảnh")));
    expect(photo.categoryIds).toEqual(["cat-1"]);
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

    // one price per available size
    expect(screen.getByText("Chỉnh giá theo kích thước")).toBeInTheDocument();
    expect(screen.getByText("6000 x 4000")).toBeInTheDocument();
    expect(screen.getByText("3000 x 2000")).toBeInTheDocument();
    await userEvent.type(priceInputs()[0], "5000");
    expect(priceInputs()[0]).toHaveValue("5.000 ₫");
    expect(photo.pricetags?.[0].price).toBe(5000);
    expect(photo.pricetags?.[1].price).toBe(0);

    expect(screen.getByTestId("marker")).toHaveTextContent("10.8,106.7");
    expect(
      await screen.findByRole("heading", { name: "Quận 1, TP HCM" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Z6")).toBeInTheDocument();
  });

  it("validates the prices and text fields", async () => {
    respond();
    const { ref } = renderInfoBar(queue("a"));

    await userEvent.type(priceInputs()[0], "500");
    expect(await screen.findByText("Giá phải từ 1,000vnđ trở lên")).toBeInTheDocument();

    await userEvent.clear(priceInputs()[0]);
    await userEvent.type(priceInputs()[0], "200000000");
    expect(
      await screen.findByText("Giá không được vượt quá 100 triệu đồng"),
    ).toBeInTheDocument();

    await userEvent.clear(priceInputs()[0]);
    // an unexpected PATCH would fail the test as an unhandled request
    await act(async () => ref.current?.submitForm());
    expect(
      await screen.findByText("Yêu cầu có giá tiền cho ít nhất một kích cỡ ảnh bán"),
    ).toBeInTheDocument();

    await userEvent.clear(titleInput());
    expect(await screen.findByText("Yêu cầu nhập tiêu đề")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Nhập mô tả"), "Gọi 0912345678");
    expect(
      await screen.findByText("Mô tả không được chứa số điện thoại"),
    ).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("puts every finished photo up for sale", async () => {
    respond();
    const selected = queue("a", {
      description: "Mô tả",
      categoryIds: ["cat-1"],
      photoTags: ["núi"],
      visibility: "PUBLIC",
      pricetags: [
        { ...large, price: 5000 },
        { ...small, price: 0 },
      ],
    });
    queue("b", {
      categoryId: "cat-2",
      gps: { latitude: 10.8, longitude: 106.7 },
      pricetags: [{ ...small, price: 2000 }],
    });
    queue("c", { status: "uploading" });
    // not reachable from the page (its button waits for a price), sent with no prices
    queue("d", { pricetags: undefined, gps: { latitude: "10.8" } });
    const updates = mockEndpoint("patch", "*/photo/:id");
    const sales = mockEndpoint("post", "*/photo/:id/sell");
    const { ref, queryClient } = renderInfoBar(selected);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    act(() => useSellPhotoStore.getState().setDisableUpload(true));

    await act(async () => ref.current?.submitForm());

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/profile/photo-selling"));
    expect(updates).toHaveLength(3);
    expect(updates.map((request) => [request.path, request.json])).toEqual(
      expect.arrayContaining([
        [
          "/photo/photo-a",
          {
            title: "Ảnh a",
            description: "Mô tả",
            categoryIds: ["cat-1"],
            visibility: "PUBLIC",
            photoTags: ["núi"],
          },
        ],
        [
          "/photo/photo-b",
          { title: "Ảnh b", categoryId: "cat-2", gps: { latitude: 10.8, longitude: 106.7 } },
        ],
        ["/photo/photo-d", { title: "Ảnh d" }],
      ]),
    );
    expect(sales.map((request) => [request.path, request.json])).toEqual(
      expect.arrayContaining([
        ["/photo/photo-a/sell", { pricetags: [{ ...large, price: 5000 }] }],
        ["/photo/photo-b/sell", { pricetags: [{ ...small, price: 2000 }] }],
        ["/photo/photo-d/sell", { pricetags: [] }],
      ]),
    );
    expect(invalidate).toHaveBeenCalledWith();
    expect(useSellPhotoStore.getState()).toMatchObject({
      photoArray: [],
      disableUpload: false,
    });
    expect(
      await screen.findByText("Ảnh của bạn đã được đăng tải để bán thành công"),
    ).toBeInTheDocument();
  });

  it("tells the user when saving the photos fails", async () => {
    expectedErrors = ["Error updating photos:"];
    respond();
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    server.use(http.patch("*/photo/:id", () => HttpResponse.json({}, { status: 500 })));
    mockEndpoint("post", "*/photo/:id/sell");
    const { ref } = renderInfoBar(queue("a", { pricetags: [{ ...large, price: 5000 }] }));

    await act(async () => ref.current?.submitForm());

    // `message` was never imported here, so this path threw a ReferenceError instead
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith("Có lỗi xảy ra trong quá trình cập nhật!"),
    );
    expect(consoleError).toHaveBeenCalledWith("Error updating photos:", expect.anything());
    expect(useSellPhotoStore.getState()).toMatchObject({ disableUpload: false });
    expect(useSellPhotoStore.getState().photoArray).toHaveLength(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("tells the user when putting a photo up for sale fails", async () => {
    expectedErrors = ["Error selling photos:", "Error updating photos:"];
    respond();
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    mockEndpoint("patch", "*/photo/:id");
    server.use(
      http.post("*/photo/:id/sell", () => HttpResponse.json({}, { status: 500 })),
    );
    const { ref } = renderInfoBar(queue("a", { pricetags: [{ ...large, price: 5000 }] }));

    await act(async () => ref.current?.submitForm());

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith("Có lỗi xảy ra trong quá trình cập nhật!"),
    );
    expect(consoleError).toHaveBeenCalledWith("Error selling photos:", expect.anything());
  });

  it("reloads the selected photo when the uploader resets the form", async () => {
    respond();
    const photo = queue("a");
    const { ref } = renderInfoBar(photo);

    act(() => useSellPhotoStore.getState().updatePhotoPropertyByUid("a", "title", "Tựa mới"));
    expect(titleInput()).toHaveValue("Ảnh a");

    act(() => ref.current?.resetForm());
    await waitFor(() => expect(titleInput()).toHaveValue("Tựa mới"));
  });

  it("locks the form until the photo has uploaded", async () => {
    respond();
    const photo = queue("a", { status: "uploading", exif: undefined, pricetags: undefined });
    const { container } = renderInfoBar(photo);

    expect(container.querySelector(".cursor-not-allowed")).not.toBeNull();
    expect(screen.queryByPlaceholderText("Nhập mô tả")).toBeNull();
    expect(screen.queryByText("Chỉnh giá theo kích thước")).toBeNull();
    expect(screen.getByText("Không có dữ liệu của tấm ảnh")).toBeInTheDocument();

    await userEvent.type(titleInput(), " mới");
    expect(photo.title).toBe("Ảnh a mới");

    await userEvent.click(
      screen.getByRole("button", { name: /Nhấn để thêm vị trí bức ảnh/ }),
    );
    expect(useSellPhotoStore.getState().isOpenMapModal).toBe(true);
  });

  it("renders without a photo", async () => {
    respond();
    renderInfoBar();

    await userEvent.type(titleInput(), "Tựa");
    expect(titleInput()).toHaveValue("Tựa");
    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
  });

  it("logs failed category and address lookups", async () => {
    expectedErrors = ["Error fetching categories:", "Error fetching address:"];
    server.use(
      http.get("*/category", () => HttpResponse.json({}, { status: 500 })),
      http.get(MAPBOX_REVERSE, () => HttpResponse.json({}, { status: 500 })),
    );
    renderInfoBar(queue("a"));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching categories:", expect.anything()),
    );
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching address:", expect.anything()),
    );
  });
});
