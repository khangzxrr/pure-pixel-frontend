import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import PhotoApi from "../../../apis/PhotoApi";
import type { Schema } from "../../../apis/types";
import useUploadPhotoStore, {
  type UploadPhotoItem,
} from "../../../states/UploadPhotoState";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import PhotoCard from "./PhotoCard";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

const noopMessage = (() => {}) as unknown as MessageType;

// queues a photo and returns the stored item, which the store updates in place
const queue = (uid: string, item: Partial<UploadPhotoItem> = {}) => {
  const store = useUploadPhotoStore.getState();
  store.addPhoto(uid, {
    file: rcFile(uid),
    reviewUrl: `blob:${uid}`,
    title: `Ảnh ${uid}`,
    ...item,
  });
  return useUploadPhotoStore.getState().photoArray[
    useUploadPhotoStore.getState().uidHashmap[uid]
  ];
};

const uploaded = (uid: string) => {
  const photo = queue(uid, { status: "done" });
  useUploadPhotoStore
    .getState()
    .setPhotoUploadResponse(uid, { id: `photo-${uid}` } as Schema<"SignedPhotoDto">);
  return photo;
};

const deleteIcon = () => screen.getByRole("img", { name: "delete" });

describe("PhotoCard", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    useUploadPhotoStore.getState().clearState();
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

  it("shows the upload progress of its own photo", async () => {
    const photo = queue("a", { status: "uploading" });
    const { container } = renderWithProviders(<PhotoCard photo={photo} />);

    // before any progress is reported the card reads as processing
    expect(screen.getByText("Đang xử lý ảnh")).toBeInTheDocument();
    expect(container.querySelector(".bg-gray-500")).not.toBeNull();

    act(() =>
      useUploadPhotoStore.getState().updatePhotoPropertyByUid("a", "percent", 30),
    );
    expect(screen.getByText("Đang tải ảnh lên")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Đang tải ảnh lên"));
    expect(useUploadPhotoStore.getState().selectedPhoto).toBe("a");
    expect(container.querySelector(".bg-gray-300")).not.toBeNull();
    expect(screen.getByAltText("Photo")).toHaveClass("border-red-500");

    act(() =>
      useUploadPhotoStore.getState().updatePhotoPropertyByUid("a", "percent", 90),
    );
    expect(screen.getByText("Đang xử lý ảnh")).toBeInTheDocument();
  });

  it("toggles the watermark and highlights the selected photo", async () => {
    const photo = queue("a", { status: "done", watermark: false });
    renderWithProviders(<PhotoCard photo={photo} />);

    expect(screen.queryByText("PXL")).toBeNull();
    expect(screen.getByAltText("Photo")).not.toHaveClass("border-4");

    await userEvent.click(screen.getByRole("checkbox"));
    expect(photo.watermark).toBe(true);
    expect(screen.getByText("PXL")).toBeInTheDocument();

    await userEvent.click(screen.getByText("PXL"));
    expect(useUploadPhotoStore.getState().selectedPhoto).toBe("a");
    expect(screen.getByAltText("Photo")).toHaveClass("border-white");

    await userEvent.click(screen.getByRole("checkbox"));
    expect(photo.watermark).toBe(false);
  });

  it("explains a duplicated photo", async () => {
    const photo = queue("a", { status: "duplicated" });
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(screen.getByText("Ảnh đã tồn tại trong hệ thống"));
    expect(useUploadPhotoStore.getState().selectedPhoto).toBe("a");
  });

  it("shows no overlay for invalid or over quota photos", () => {
    const invalid = queue("a", { status: "invalid" });
    const overQuota = queue("b", { status: "outQuota" });
    const { rerender } = renderWithProviders(<PhotoCard photo={invalid} />);
    expect(screen.queryByText("Ảnh không hợp lệ")).toBeNull();

    rerender(<PhotoCard photo={overQuota} />);
    expect(screen.queryByText("Thử lại")).toBeNull();
    expect(screen.queryByText("Dung lượng ảnh vượt quá giới hạn")).toBeNull();
  });

  it("uploads a failed photo again", async () => {
    const photo = queue("a", { status: "failed", percent: 20 });
    const names: string[] = [];
    let release = () => {};
    server.use(
      http.post("*/photo/v2/upload", async ({ request }) => {
        const file = (await request.formData()).get("file");
        names.push(typeof file === "string" ? file : file?.name ?? "");
        await new Promise<void>((resolve) => {
          release = () => resolve();
        });
        return HttpResponse.json({ id: "photo-a" });
      }),
    );
    renderWithProviders(<PhotoCard photo={photo} />);

    expect(screen.getByText("Tải ảnh lên thất bại")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Thử lại"));

    // the retry click does not select the photo underneath
    expect(useUploadPhotoStore.getState().selectedPhoto).toBeNull();
    expect(await screen.findByRole("img", { name: "loading" })).toBeInTheDocument();
    await waitFor(() => expect(names).toEqual(["a.jpg"]));

    release();

    await waitFor(() => expect(photo.status).toBe("done"));
    expect(photo.percent).toBe(100);
    expect(photo.response).toEqual({ id: "photo-a" });
    expect(useUploadPhotoStore.getState().photoIdHashmap).toEqual({ "photo-a": 0 });
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
    [
      "UploadPhotoFailedException",
      "failed",
      "Đã xảy ra lỗi khi tải ảnh lên, vui lòng thử lại",
    ],
    ["SomethingElseException", "failed", "Đã xảy ra lỗi không xác định, vui lòng thử lại"],
  ])("a retry rejected with %s marks the photo %s", async (code, status, notice) => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    server.use(
      http.post("*/photo/v2/upload", () =>
        HttpResponse.json({ message: code }, { status: 400 }),
      ),
    );
    const photo = queue("a", { status: "failed" });
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(screen.getByText("Thử lại"));

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(photo.status).toBe(status);
    expect(log).toHaveBeenCalledWith(
      "uploadPhoto error",
      expect.objectContaining({ status: 400 }),
    );
  });

  it("gives up on a retry after ten minutes", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const upload = vi
      .spyOn(PhotoApi, "uploadPhoto")
      .mockReturnValue(new Promise<never>(() => {}));
    const photo = queue("a", { status: "failed" });
    renderWithProviders(<PhotoCard photo={photo} />);

    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getByText("Thử lại"));
      await act(() => vi.advanceTimersByTimeAsync(599_999));

      expect(upload).toHaveBeenCalledWith(photo.file, expect.any(Function));
      expect(screen.getByRole("img", { name: "loading" })).toBeInTheDocument();
      expect(log).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(1));
      // a timeout has no response, so it falls through to the unknown error
      expect(log).toHaveBeenCalledWith("uploadPhoto error", undefined);
      expect(photo.status).toBe("failed");
    } finally {
      vi.useRealTimers();
    }
    expect(
      await screen.findByText("Đã xảy ra lỗi không xác định, vui lòng thử lại"),
    ).toBeInTheDocument();
  });

  it("reports upload progress while retrying", async () => {
    const upload = vi
      .spyOn(PhotoApi, "uploadPhoto")
      .mockImplementation(async (_file, onUploadProgress) => {
        onUploadProgress?.({ loaded: 50, total: 100, bytes: 50, lengthComputable: true });
        return { id: "photo-a" } as Schema<"SignedPhotoDto">;
      });
    const photo = queue("a", { status: "failed" });
    const percents: unknown[] = [];
    const unsubscribe = useUploadPhotoStore.subscribe((state) =>
      percents.push(state.photoArray[0]?.percent),
    );
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(screen.getByText("Thử lại"));

    await waitFor(() => expect(photo.status).toBe("done"));
    unsubscribe();
    expect(upload).toHaveBeenCalledTimes(1);
    // 50% of the bytes counts as 45 of the 90 points reserved for the transfer
    expect(percents).toContain(45);
    expect(photo.percent).toBe(100);
  });

  it("deletes an uploaded photo", async () => {
    const photo = uploaded("a");
    const requests = mockEndpoint("delete", "*/photo/photo-a");
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(deleteIcon());

    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
    await waitFor(() => expect(requests).toHaveLength(1));
  });

  it("puts the photo back when deleting fails", async () => {
    const error = vi.spyOn(message, "error").mockImplementation(() => noopMessage);
    server.use(
      http.delete("*/photo/photo-a", () => HttpResponse.json({}, { status: 500 })),
    );
    const photo = uploaded("a");
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(deleteIcon());

    await waitFor(() => expect(error).toHaveBeenCalledTimes(2));
    expect(error).toHaveBeenCalledWith("Chưa thể xóa ảnh");
    expect(useUploadPhotoStore.getState().photoArray).toEqual([
      expect.objectContaining({ title: "Ảnh a", status: "done" }),
    ]);
  });

  it("ignores another delete while one is running", async () => {
    let release = () => {};
    let calls = 0;
    server.use(
      http.delete("*/photo/photo-a", async () => {
        calls += 1;
        await new Promise<void>((resolve) => {
          release = () => resolve();
        });
        return HttpResponse.json({});
      }),
    );
    const photo = uploaded("a");
    renderWithProviders(<PhotoCard photo={photo} />);

    await userEvent.click(deleteIcon());
    await waitFor(() => expect(calls).toBe(1));
    await userEvent.click(deleteIcon());

    expect(calls).toBe(1);
    release();
    await waitFor(() => expect(screen.getByAltText("Photo")).toBeInTheDocument());
  });

  it("drops a photo that never finished uploading", async () => {
    const pending = queue("a", { status: "uploading" });
    const failed = uploaded("b");
    const { rerender } = renderWithProviders(<PhotoCard photo={pending} />);

    await userEvent.click(deleteIcon());
    expect(useUploadPhotoStore.getState().photoArray).toEqual([failed]);

    // an errored photo is dropped from the queue without asking the server
    failed.status = "error";
    rerender(<PhotoCard photo={failed} />);
    await userEvent.click(deleteIcon());
    expect(useUploadPhotoStore.getState().photoArray).toEqual([]);
  });
});
