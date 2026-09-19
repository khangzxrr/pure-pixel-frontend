import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import type { Schema } from "../../../apis/types";
import PhotoService from "../../../services/PhotoService";
import useUploadPhotoStore, {
  type UploadPhotoItem,
} from "../../../states/UploadPhotoState";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import CustomUpload from "./CustomUpload";

const navigate = vi.hoisted(() => vi.fn());
const exifParse = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// exifr needs real camera files; each test decides what the camera wrote
vi.mock("exifr", () => ({ parse: exifParse }));

const noopMessage = (() => {}) as unknown as MessageType;

const jpeg = (name: string) => new File(["jpeg-bytes"], name, { type: "image/jpeg" });

const rcFile = (uid: string) =>
  Object.assign(jpeg(`${uid}.jpg`), { uid, lastModifiedDate: new Date(2026, 8, 15) });

const fileInput = () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("upload input not rendered");
  return input;
};

const item = (name: string) =>
  useUploadPhotoStore.getState().photoArray.find((photo) => photo.file.name === name);

const fileName = (entry: FormDataEntryValue | null) =>
  typeof entry === "string" ? entry : entry?.name ?? "";

// a finished upload waiting for the photographer to publish it
const finished = (uid: string, fields: Partial<UploadPhotoItem> = {}) => {
  const store = useUploadPhotoStore.getState();
  store.addPhoto(uid, {
    file: rcFile(uid),
    title: `Ảnh ${uid}`,
    exif: {},
    watermark: false,
    watermarkContent: "PUREPIXEL",
    visibility: "PUBLIC",
    status: "done",
    ...fields,
  });
  store.setPhotoUploadResponse(uid, { id: `photo-${uid}` } as Schema<"SignedPhotoDto">);
};

const uploadIcon = () => screen.getByRole("img", { name: "upload" });

// every percent each queued photo went through, in order, keyed by file name
const recordProgress = () => {
  const seen: Record<string, number[]> = {};
  const unsubscribe = useUploadPhotoStore.subscribe((state) =>
    state.photoArray.forEach((photo) => {
      if (photo.percent === undefined) return;
      const history = (seen[photo.file.name] ??= []);
      if (history[history.length - 1] !== photo.percent) history.push(photo.percent);
    }),
  );
  return { seen, unsubscribe };
};

describe("CustomUpload", () => {
  let consoleError: MockInstance<typeof console.error>;
  // console.error messages a test expects
  let expectedErrors: string[];

  beforeAll(() => {
    // jsdom does not implement scrolling; the queue scrolls to the selected photo
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    expectedErrors = [];
    navigate.mockClear();
    useUploadPhotoStore.getState().clearState();
    exifParse.mockReset();
    exifParse.mockResolvedValue({ Make: "Nikon", Model: "Z6" });
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

  it("uploads several photos at once and tracks each one separately", async () => {
    const releases = new Map<string, () => void>();
    server.use(
      http.post("*/photo/v2/upload", async ({ request }) => {
        const name = fileName((await request.formData()).get("file"));
        await new Promise<void>((resolve) => releases.set(name, () => resolve()));
        return name === "broken.jpg"
          ? HttpResponse.json({ message: "UploadPhotoFailedException" }, { status: 500 })
          : HttpResponse.json({ id: `photo-${name}` });
      }),
    );
    renderWithProviders(<CustomUpload />);
    const progress = recordProgress();

    await userEvent.upload(fileInput(), [jpeg("a.jpg"), jpeg("broken.jpg"), jpeg("c.jpg")]);

    // every photo is queued with its preview and exif, then sent on its own request
    await waitFor(() => expect(releases.size).toBe(3));
    expect(useUploadPhotoStore.getState().photoArray).toHaveLength(3);
    expect(item("a.jpg")).toMatchObject({
      title: "a",
      reviewUrl: "blob:mock",
      exif: { Make: "Nikon", Model: "Z6" },
      watermark: false,
      watermarkContent: "PUREPIXEL",
      visibility: "PUBLIC",
    });
    // while the server holds the requests every photo is still uploading
    ["a.jpg", "broken.jpg", "c.jpg"].forEach((name) =>
      expect(item(name)?.status).toBe("uploading"),
    );
    expect(screen.getAllByText("Đang xử lý ảnh")).toHaveLength(3);

    releases.get("c.jpg")?.();
    await waitFor(() =>
      expect(item("c.jpg")).toMatchObject({
        status: "done",
        percent: 100,
        response: { id: "photo-c.jpg" },
      }),
    );
    // the others keep waiting for their own responses
    expect(item("a.jpg")?.status).toBe("uploading");
    expect(item("a.jpg")?.response).toBeUndefined();

    releases.get("broken.jpg")?.();
    expect(
      await screen.findByText("Đã xảy ra lỗi khi tải ảnh lên, vui lòng thử lại"),
    ).toBeInTheDocument();
    expect(item("broken.jpg")?.status).toBe("failed");
    expect(item("broken.jpg")?.response).toBeUndefined();
    expect(item("a.jpg")?.status).toBe("uploading");

    releases.get("a.jpg")?.();
    await waitFor(() =>
      expect(item("a.jpg")).toMatchObject({
        status: "done",
        percent: 100,
        response: { id: "photo-a.jpg" },
      }),
    );
    expect(Object.keys(useUploadPhotoStore.getState().photoIdHashmap).sort()).toEqual([
      "photo-a.jpg",
      "photo-c.jpg",
    ]);
    expect(screen.getByText("Thử lại")).toBeInTheDocument();
    // each photo went through its own progress: 90% for the transfer, 100% once stored
    progress.unsubscribe();
    expect(progress.seen).toEqual({
      "c.jpg": [90, 100],
      "broken.jpg": [90],
      "a.jpg": [90, 100],
    });
  });

  it("marks only the photo whose connection dropped as failed", async () => {
    server.use(
      http.post("*/photo/v2/upload", async ({ request }) =>
        fileName((await request.formData()).get("file")) === "offline.jpg"
          ? HttpResponse.error()
          : HttpResponse.json({ id: "photo-ok" }),
      ),
    );
    renderWithProviders(<CustomUpload />);

    await userEvent.upload(fileInput(), [jpeg("ok.jpg"), jpeg("offline.jpg")]);

    // a network error has no response to read the error code from
    expect(
      await screen.findByText("Đã xảy ra lỗi không xác định, vui lòng thử lại"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(item("ok.jpg")).toMatchObject({ status: "done", response: { id: "photo-ok" } }),
    );
    expect(item("offline.jpg")?.status).toBe("failed");
  });

  it.each([
    [
      "RunOutPhotoQuotaException",
      "outQuota",
      "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
    ],
    [
      "FailToPerformOnDuplicatedPhotoException",
      "duplicated",
      "Ảnh bạn tải lên đã tồn tại trong hệ thống, vui lòng kiểm tra lại",
    ],
    [
      "FileIsNotValidException",
      "invalid",
      "Tệp tải lên không hợp lệ, vui lòng chọn tệp hình ảnh hợp lệ",
    ],
    [
      "ExifNotFoundException",
      "invalid",
      "Không tìm thấy dữ liệu EXIF trong ảnh, vui lòng chọn ảnh có dữ liệu EXIF",
    ],
    [
      "MissingMakeExifException",
      "invalid",
      "Dữ liệu EXIF thiếu thông tin nhà sản xuất (Make), vui lòng kiểm tra lại",
    ],
    [
      "MissingModelExifException",
      "invalid",
      "Dữ liệu EXIF thiếu thông tin mẫu máy (Model), vui lòng kiểm tra lại",
    ],
  ])("an upload rejected with %s marks the photo %s", async (code, status, notice) => {
    server.use(
      http.post("*/photo/v2/upload", () =>
        HttpResponse.json({ message: code }, { status: 400 }),
      ),
    );
    renderWithProviders(<CustomUpload />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(item("a.jpg")?.status).toBe(status);
  });

  it.each([
    [
      "a file that is not a jpeg or png",
      () => new File(["gif"], "anim.gif", { type: "image/gif" }),
      "Chỉ hỗ trợ đuôi ảnh jpeg, jpg",
    ],
    [
      "a file of 150MB or more",
      () => Object.defineProperty(jpeg("huge.jpg"), "size", { value: 150 * 1024 * 1024 }),
      "Ảnh phải nhỏ hơn 150MB",
    ],
  ])("rejects %s", async (_label, makeFile, notice) => {
    renderWithProviders(<CustomUpload />);

    await userEvent.setup({ applyAccept: false }).upload(fileInput(), makeFile());

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
  });

  it.each([
    ["no exif at all", () => exifParse.mockResolvedValue(undefined), "Ảnh bạn chọn không phải ảnh gốc hợp lệ"],
    // an unreadable file yields null, which used to throw instead of warning
    [
      "unreadable exif",
      () => exifParse.mockRejectedValue(new Error("corrupt segment")),
      "Ảnh bạn chọn thiếu thông tin loại máy chụp (Model)",
    ],
    [
      "no camera model",
      () => exifParse.mockResolvedValue({ Make: "Nikon" }),
      "Ảnh bạn chọn thiếu thông tin loại máy chụp (Model)",
    ],
    [
      "no camera maker",
      () => exifParse.mockResolvedValue({ Model: "Z6" }),
      "Ảnh bạn chọn thiếu thông tin nhà sản xuất (Make)",
    ],
  ])("rejects a photo with %s", async (_label, arrange, notice) => {
    arrange();
    renderWithProviders(<CustomUpload />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
  });

  it("reports a photo it cannot preview", async () => {
    vi.spyOn(PhotoService, "convertArrayBufferToObjectUrl").mockRejectedValue(
      new Error("read failed"),
    );
    renderWithProviders(<CustomUpload />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    expect(
      await screen.findByText("Đã xảy ra lỗi không xác định, vui lòng thử lại"),
    ).toBeInTheDocument();
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
  });

  it.each([
    ["RunOutPhotoQuotaException", "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ"],
    ["UploadPhotoFailedException", "Lỗi không xác định, vui lòng thử lại"],
  ])(
    "also shows antd's error message for %s once antd can match the queue item",
    async (code, text) => {
      const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
      server.use(
        http.post("*/photo/v2/upload", () => {
          // antd only reports upload results for list items whose uid it knows
          const uid = item("a.jpg")?.file.uid ?? "";
          useUploadPhotoStore.getState().updatePhotoPropertyByUid(uid, "uid", uid);
          return HttpResponse.json({ message: code }, { status: 400 });
        }),
      );
      renderWithProviders(<CustomUpload />);

      await userEvent.upload(fileInput(), jpeg("a.jpg"));

      await waitFor(() => expect(error).toHaveBeenCalledWith(text));
    },
  );

  it("lets antd finish an upload it can match", async () => {
    server.use(
      http.post("*/photo/v2/upload", () => {
        const uid = item("a.jpg")?.file.uid ?? "";
        useUploadPhotoStore.getState().updatePhotoPropertyByUid(uid, "uid", uid);
        return HttpResponse.json({ id: "photo-a" });
      }),
    );
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    renderWithProviders(<CustomUpload />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    await waitFor(() => expect(item("a.jpg")?.status).toBe("done"));
    expect(error).not.toHaveBeenCalled();
  });

  it("labels every photo at once and follows changes to single photos", async () => {
    finished("a");
    finished("b");
    renderWithProviders(<CustomUpload />);

    expect(screen.getByText("Gắn nhãn toàn bộ ảnh")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch"));
    expect(
      useUploadPhotoStore.getState().photoArray.map((photo) => photo.watermark),
    ).toEqual([true, true]);
    expect(screen.getByText("Gỡ nhãn toàn bộ ảnh")).toBeInTheDocument();

    const store = useUploadPhotoStore.getState();
    act(() => store.updatePhotoPropertyByUid("a", "watermark", false));
    // a mixed queue leaves the switch as it was
    expect(screen.getByText("Gỡ nhãn toàn bộ ảnh")).toBeInTheDocument();
    act(() => store.updatePhotoPropertyByUid("b", "watermark", false));
    expect(screen.getByText("Gắn nhãn toàn bộ ảnh")).toBeInTheDocument();
    act(() => {
      store.updatePhotoPropertyByUid("a", "watermark", true);
      store.updatePhotoPropertyByUid("b", "watermark", true);
    });
    expect(screen.getByText("Gỡ nhãn toàn bộ ảnh")).toBeInTheDocument();
  });

  it("publishes every finished photo and adds the requested watermarks", async () => {
    finished("a", {
      watermark: true,
      description: "Hoàng hôn trên núi",
      categoryIds: ["cat-1"],
      photoTags: ["núi"],
      exif: { latitude: 10.8, longitude: 106.7 },
    });
    finished("b", { categoryIds: [1], photoTags: "núi" });
    useUploadPhotoStore
      .getState()
      .addPhoto("c", { file: rcFile("c"), title: "Ảnh c", status: "failed" });
    const updates = mockEndpoint("patch", "*/photo/:id");
    const watermarks = mockEndpoint("post", "*/photo/:id/watermark");
    const { queryClient } = renderWithProviders(<CustomUpload />);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await userEvent.click(uploadIcon());

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/profile/my-photos"));
    expect(updates).toHaveLength(2);
    expect(updates.map((request) => [request.path, request.json])).toEqual(
      expect.arrayContaining([
        [
          "/photo/photo-a",
          {
            title: "Ảnh a",
            watermark: true,
            description: "Hoàng hôn trên núi",
            categoryIds: ["cat-1"],
            visibility: "PUBLIC",
            photoTags: ["núi"],
            gps: { longitude: 106.7, latitude: 10.8 },
          },
        ],
        ["/photo/photo-b", { title: "Ảnh b", watermark: false, visibility: "PUBLIC" }],
      ]),
    );
    expect(watermarks.map((request) => [request.path, request.json])).toEqual([
      ["/photo/photo-a/watermark", { text: "PUREPIXEL" }],
    ]);
    expect(invalidate).toHaveBeenCalledWith();
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
    expect(
      await screen.findByText("Ảnh của bạn đã được đăng tải thành công"),
    ).toBeInTheDocument();
  });

  it("does not publish while a photo has no title", async () => {
    finished("a", { title: "" });
    renderWithProviders(<CustomUpload />);

    // an unexpected PATCH would fail the test as an unhandled request
    await userEvent.click(uploadIcon());

    expect(navigate).not.toHaveBeenCalled();
    expect(useUploadPhotoStore.getState().photoArray).toHaveLength(1);
  });

  it("keeps the photos when publishing fails", async () => {
    expectedErrors = ["Error updating photos:"];
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    let release = () => {};
    server.use(
      http.patch("*/photo/:id", async () => {
        await new Promise<void>((resolve) => {
          release = () => resolve();
        });
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    finished("a");
    renderWithProviders(<CustomUpload />);

    await userEvent.click(uploadIcon());
    expect(await screen.findByRole("img", { name: "loading" })).toBeInTheDocument();
    release();

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith("Có lỗi xảy ra trong quá trình cập nhật!"),
    );
    expect(consoleError).toHaveBeenCalledWith("Error updating photos:", expect.anything());
    expect(useUploadPhotoStore.getState().photoArray).toHaveLength(1);
    expect(uploadIcon()).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
