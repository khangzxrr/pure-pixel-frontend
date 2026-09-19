import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import { AxiosError, type AxiosResponse } from "axios";
import { HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import PhotoService from "../../../services/PhotoService";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { buildBooking, buildSignedPhoto } from "../bookingTestData";
import type { BookingItem } from "../BookingRequestState/BookingCard";
import UploadBookingPhoto from "./BookingDetailUpload";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const day = 24 * 60 * 60 * 1000;

const renderUpload = (overrides: Partial<BookingItem> = {}) =>
  renderWithProviders(
    <UploadBookingPhoto
      bookingDetail={buildBooking({ status: "ACCEPTED", ...overrides })}
    />,
    {
      route: "/profile/booking-request/booking-1",
      path: "/profile/booking-request/:bookingId",
    },
  );

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;

const image = (name = "photo.png") =>
  new File(["image"], name, { type: "image/png" });

const quotaError = () =>
  new AxiosError("quota", "ERR_BAD_REQUEST", undefined, undefined, {
    data: { message: "RunOutPhotoQuotaException" },
    status: 400,
  } as AxiosResponse);

const quotaText =
  "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ";

describe("UploadBookingPhoto", () => {
  const scrollIntoView = vi.fn();
  // the accept attribute is checked by the component itself
  const user = userEvent.setup({ applyAccept: false });

  beforeEach(() => {
    // cleared before rendering: a store update on mounted components happens outside act
    useBookingPhotoStore.getState().clearState();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(async () => {
    // antd's static messages outlive the rendered component and re-render their own root
    await act(async () => {
      message.destroy();
    });
    scrollIntoView.mockReset();
    vi.restoreAllMocks();
  });

  it("invites the first upload of an accepted booking", () => {
    const { container } = renderUpload();

    expect(
      screen.getByText("Nhấp hoặc kéo tệp vào khu vực này để tải lên"),
    ).toBeInTheDocument();
    expect(fileInput(container)).toHaveAttribute("accept", ".jpg,.jpeg,.png");
    expect(container.querySelector(".ant-upload-wrapper")?.parentElement).not.toHaveClass(
      "hidden",
    );
  });

  it("uploads a photo, previews it and stores the saved photo", async () => {
    const requests = mockEndpoint(
      "put",
      "*/photographer/booking/:id/upload/v2",
      buildSignedPhoto("photo-9"),
    );
    const { container } = renderUpload();

    await user.upload(fileInput(container), image());

    await waitFor(() =>
      expect(useBookingPhotoStore.getState().photoArray[0]).toMatchObject({
        id: "photo-9",
        status: "done",
        reviewUrl: "https://cdn.test/photo-9.jpg",
        thumbnailUrl: "https://cdn.test/photo-9-thumb.jpg",
        visibility: "PRIVATE",
      }),
    );
    expect(requests[0].path).toBe("/photographer/booking/booking-1/upload/v2");
    expect(requests[0].form?.get("file")).toMatchObject({ name: "photo.png" });
    expect(await screen.findByAltText("Bản Thảo")).toHaveAttribute(
      "src",
      "https://cdn.test/photo-9-thumb.jpg",
    );
    expect(screen.getByText("Tải thêm ảnh")).toBeInTheDocument();
    const { selectedPhoto, photoArray } = useBookingPhotoStore.getState();
    expect(selectedPhoto).toBe(photoArray[0].uid);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("rejects files that are not jpeg or png", async () => {
    const requests = mockEndpoint("put", "*/photographer/booking/:id/upload/v2", {});
    const { container } = renderUpload();

    await user.upload(
      fileInput(container),
      new File(["text"], "notes.txt", { type: "text/plain" }),
    );

    expect(
      await screen.findByText("Chỉ hỗ trợ đuôi ảnh jpeg, jpg"),
    ).toBeInTheDocument();
    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
    expect(requests).toHaveLength(0);
  });

  it("rejects photos of 150MB or more", async () => {
    const { container } = renderUpload();
    const big = image("big.png");
    Object.defineProperty(big, "size", { value: 150 * 1024 * 1024 });

    await user.upload(fileInput(container), big);

    expect(await screen.findByText("Ảnh phải nhỏ hơn 150")).toBeInTheDocument();
    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
  });

  it("explains a quota error while preparing the preview", async () => {
    vi.spyOn(PhotoService, "convertArrayBufferToObjectUrl").mockRejectedValueOnce(
      quotaError(),
    );
    const { container } = renderUpload();

    await user.upload(fileInput(container), image());

    expect(await screen.findByText(quotaText)).toBeInTheDocument();
    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
  });

  it("silently skips a photo whose preview cannot be read", async () => {
    const preview = vi
      .spyOn(PhotoService, "convertArrayBufferToObjectUrl")
      .mockRejectedValueOnce(new Error("read failed"));
    const { container } = renderUpload();

    await user.upload(fileInput(container), image());

    await waitFor(() => expect(preview).toHaveBeenCalled());
    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
    expect(screen.queryByText(quotaText)).toBeNull();
    expect(
      screen.queryByText("Lỗi không xác định, vui lòng thử lại"),
    ).toBeNull();
  });

  it.each([
    [{ message: "RunOutPhotoQuotaException" }, 400, quotaText],
    [{}, 500, "Lỗi không xác định, vui lòng thử lại"],
  ])("reports a rejected upload (%j)", async (body, status, text) => {
    mockEndpoint("put", "*/photographer/booking/:id/upload/v2", () =>
      HttpResponse.json(body, { status }),
    );
    const { container } = renderUpload();

    await user.upload(fileInput(container), image());

    expect(await screen.findByText(text)).toBeInTheDocument();
    // the preview stays in the grid as an unfinished upload
    expect(useBookingPhotoStore.getState().photoArray[0]).toMatchObject({
      status: "uploading",
    });
  });

  it.each([
    ["an old finished", "SUCCESSED", 31 * day, true],
    ["a recent finished", "SUCCESSED", day, false],
    ["a requested", "REQUESTED", 31 * day, false],
  ] as const)("hides uploads for %s booking", (_, status, age, canDelete) => {
    useBookingPhotoStore.getState().addPhotoWithId("photo-1", {
      id: "photo-1",
      uid: "photo-1",
      thumbnailUrl: "https://cdn.test/photo-1-thumb.jpg",
      status: "done",
    });
    const { container } = renderUpload({
      status,
      updatedAt: new Date(Date.now() - age).toISOString(),
    });

    expect(
      container.querySelector(".ant-upload-wrapper")?.parentElement,
    ).toHaveClass("hidden");
    expect(screen.getByText("Tải thêm ảnh")).toBeInTheDocument();
    expect(container.querySelector(".anticon-delete") !== null).toBe(canDelete);
  });

  it("keeps the photos of a finished booking without an update date", () => {
    useBookingPhotoStore.getState().addPhotoWithId("photo-1", {
      id: "photo-1",
      uid: "photo-1",
      status: "done",
    });
    const { container } = renderUpload({
      status: "SUCCESSED",
      updatedAt: undefined,
    });

    expect(screen.getByAltText("Bản Thảo")).toBeInTheDocument();
    expect(container.querySelector(".anticon-delete")).toBeNull();
  });
});
