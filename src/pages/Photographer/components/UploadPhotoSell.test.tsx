import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import { http, HttpResponse } from "msw";
import type { RefObject } from "react";
import type { MockInstance } from "vitest";
import type { Schema } from "../../../apis/types";
import PhotoService from "../../../services/PhotoService";
import useSellPhotoStore, {
  type SellPhotoItem,
} from "../../../states/UseSellPhotoState";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import UploadPhotoSell from "./UploadPhotoSell";
import type { UploadPhotoSellFormHandle } from "./UploadPhotoSellInfoBar";

const exifParse = vi.hoisted(() => vi.fn());

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
  useSellPhotoStore.getState().photoArray.find((photo) => photo.file.name === name);

const fileName = (entry: FormDataEntryValue | null) =>
  typeof entry === "string" ? entry : entry?.name ?? "";

const sizes = [
  { width: 6000, height: 4000 },
  { width: 3000, height: 2000 },
];

const respondWithSizes = () =>
  server.use(
    http.get("*/photo/:id/available-resolution", () => HttpResponse.json(sizes)),
  );

const queue = (uid: string, fields: Partial<SellPhotoItem> = {}) => {
  useSellPhotoStore.getState().addPhoto(uid, {
    file: rcFile(uid),
    title: `Ảnh ${uid}`,
    status: "done",
    ...fields,
  });
  if (fields.status !== "uploading") {
    useSellPhotoStore
      .getState()
      .setPhotoUploadResponse(uid, { id: `photo-${uid}` } as Schema<"SignedPhotoDto">);
  }
};

// every percent each queued photo went through, in order, keyed by file name
const recordProgress = () => {
  const seen: Record<string, number[]> = {};
  const unsubscribe = useSellPhotoStore.subscribe((state) =>
    state.photoArray.forEach((photo) => {
      if (photo.percent === undefined) return;
      const history = (seen[photo.file.name] ??= []);
      if (history[history.length - 1] !== photo.percent) history.push(photo.percent);
    }),
  );
  return { seen, unsubscribe };
};

const submitButton = () => {
  const button = screen.getAllByRole("img", { name: /^(upload|loading)$/ })[0]
    .parentElement?.parentElement;
  if (!button) throw new Error("submit button not rendered");
  return button;
};

describe("UploadPhotoSell", () => {
  let consoleError: MockInstance<typeof console.error>;
  let form: { submitForm: ReturnType<typeof vi.fn>; resetForm: ReturnType<typeof vi.fn> };
  let formRef: RefObject<UploadPhotoSellFormHandle>;

  beforeAll(() => {
    // jsdom does not implement scrolling; the queue scrolls to the selected photo
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    const store = useSellPhotoStore.getState();
    store.clearState();
    store.setDisableUpload(false);
    exifParse.mockReset();
    exifParse.mockResolvedValue({ Make: "Nikon", Model: "Z6" });
    form = { submitForm: vi.fn(), resetForm: vi.fn() };
    formRef = { current: form };
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((text) => !text.includes("findDOMNode is deprecated"));
    expect(unexpected.join("\n")).toBe("");
    vi.restoreAllMocks();
  });

  it("uploads several photos at once and prepares each one for sale", async () => {
    respondWithSizes();
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
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);
    const progress = recordProgress();

    await userEvent.upload(fileInput(), [jpeg("a.jpg"), jpeg("broken.jpg"), jpeg("c.jpg")]);

    await waitFor(() => expect(releases.size).toBe(3));
    expect(item("a.jpg")).toMatchObject({
      title: "a",
      reviewUrl: "blob:mock",
      exif: { Make: "Nikon", Model: "Z6" },
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
        pricetags: sizes.map((size) => ({ ...size, price: 0 })),
      }),
    );
    expect(useSellPhotoStore.getState().selectedPhoto).toBe(item("c.jpg")?.file.uid);
    expect(form.resetForm).toHaveBeenCalledTimes(1);
    expect(item("a.jpg")?.status).toBe("uploading");

    releases.get("broken.jpg")?.();
    expect(
      await screen.findByText("Đã xảy ra lỗi khi tải ảnh lên, vui lòng thử lại"),
    ).toBeInTheDocument();
    expect(item("broken.jpg")?.status).toBe("failed");
    expect(item("a.jpg")?.status).toBe("uploading");

    releases.get("a.jpg")?.();
    await waitFor(() =>
      expect(item("a.jpg")).toMatchObject({
        status: "done",
        percent: 100,
        response: { id: "photo-a.jpg" },
      }),
    );
    await waitFor(() => expect(form.resetForm).toHaveBeenCalledTimes(2));
    expect(item("broken.jpg")?.response).toBeUndefined();
    expect(screen.getAllByText("Ảnh chưa có giá bán")).toHaveLength(2);
    // each photo went through its own progress: 90% for the transfer, 100% once stored
    progress.unsubscribe();
    expect(progress.seen).toEqual({
      "c.jpg": [90, 100],
      "broken.jpg": [90],
      "a.jpg": [90, 100],
    });
  });

  it("marks only the photo whose connection dropped as failed", async () => {
    respondWithSizes();
    server.use(
      http.post("*/photo/v2/upload", async ({ request }) =>
        fileName((await request.formData()).get("file")) === "offline.jpg"
          ? HttpResponse.error()
          : HttpResponse.json({ id: "photo-ok" }),
      ),
    );
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.upload(fileInput(), [jpeg("ok.jpg"), jpeg("offline.jpg")]);

    expect(
      await screen.findByText("Đã xảy ra lỗi không xác định, vui lòng thử lại"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(item("ok.jpg")).toMatchObject({ status: "done", response: { id: "photo-ok" } }),
    );
    expect(item("offline.jpg")?.status).toBe("failed");
  });

  it("keeps an uploaded photo without sizes when they cannot be loaded", async () => {
    server.use(
      http.post("*/photo/v2/upload", () => HttpResponse.json({ id: "photo-a" })),
      http.get("*/photo/:id/available-resolution", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    await waitFor(() => expect(item("a.jpg")?.status).toBe("done"));
    expect(item("a.jpg")?.pricetags).toBeUndefined();
    expect(form.resetForm).not.toHaveBeenCalled();
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
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

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
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.setup({ applyAccept: false }).upload(fileInput(), makeFile());

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
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
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
  });

  it("reports a photo it cannot preview", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const failure = new Error("read failed");
    vi.spyOn(PhotoService, "convertArrayBufferToObjectUrl").mockRejectedValue(failure);
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    expect(
      await screen.findByText("Đã xảy ra lỗi không xác định, vui lòng thử lại"),
    ).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith("beforeUpload error", failure);
    expect(useSellPhotoStore.getState().photoArray).toEqual([]);
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
          useSellPhotoStore.getState().updatePhotoPropertyByUid(uid, "uid", uid);
          return HttpResponse.json({ message: code }, { status: 400 });
        }),
      );
      renderWithProviders(<UploadPhotoSell formRef={formRef} />);

      await userEvent.upload(fileInput(), jpeg("a.jpg"));

      await waitFor(() => expect(error).toHaveBeenCalledWith(text));
    },
  );

  it("lets antd finish an upload it can match", async () => {
    respondWithSizes();
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    server.use(
      http.post("*/photo/v2/upload", () => {
        const uid = item("a.jpg")?.file.uid ?? "";
        useSellPhotoStore.getState().updatePhotoPropertyByUid(uid, "uid", uid);
        return HttpResponse.json({ id: "photo-a" });
      }),
    );
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    await userEvent.upload(fileInput(), jpeg("a.jpg"));

    await waitFor(() => expect(form.resetForm).toHaveBeenCalled());
    expect(error).not.toHaveBeenCalled();
  });

  it("submits through the form once a finished photo has a price", async () => {
    queue("a", { pricetags: [{ ...sizes[0], price: 999 }] });
    renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    // below 1.000 ₫ the button stays disabled
    expect(submitButton()).toHaveClass("cursor-not-allowed");
    await userEvent.click(submitButton());
    expect(form.submitForm).not.toHaveBeenCalled();

    act(() => useSellPhotoStore.getState().setPriceByUidAndPricetagIndex("a", 0, 1000));
    expect(submitButton()).toHaveClass("cursor-pointer");

    await userEvent.click(submitButton());
    expect(form.submitForm).toHaveBeenCalledTimes(1);
    expect(useSellPhotoStore.getState().disableUpload).toBe(true);
    expect(screen.getByRole("img", { name: "loading" })).toBeInTheDocument();

    // a second click while submitting does nothing
    await userEvent.click(submitButton());
    expect(form.submitForm).toHaveBeenCalledTimes(1);
  });

  it("does not submit while uploads run or nothing has finished", async () => {
    queue("a", { status: "uploading" });
    const { rerender } = renderWithProviders(<UploadPhotoSell formRef={formRef} />);

    expect(screen.getByRole("img", { name: "loading" })).toBeInTheDocument();
    await userEvent.click(submitButton());
    expect(form.submitForm).not.toHaveBeenCalled();

    act(() => useSellPhotoStore.getState().updatePhotoPropertyByUid("a", "status", "failed"));
    rerender(<UploadPhotoSell formRef={formRef} />);
    await userEvent.click(submitButton());
    expect(form.submitForm).not.toHaveBeenCalled();
  });
});
