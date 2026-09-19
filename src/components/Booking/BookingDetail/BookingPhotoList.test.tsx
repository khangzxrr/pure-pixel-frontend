import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { server } from "../../../test/server";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import BookingPhotoList from "./BookingPhotoList";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const renderList = (enableUpdate = true) =>
  renderWithProviders(<BookingPhotoList enableUpdate={enableUpdate} />, {
    route: "/profile/booking-request/booking-1",
    path: "/profile/booking-request/:bookingId",
  });

const addDelivered = (id: string) =>
  useBookingPhotoStore.getState().addPhotoWithId(id, {
    id,
    uid: id,
    reviewUrl: `https://cdn.test/${id}.jpg`,
    status: "done",
  });

describe("BookingPhotoList", () => {
  // cleared before rendering: a store update on mounted components happens outside act
  beforeEach(() => useBookingPhotoStore.getState().clearState());

  it("shows uploads in progress and selects photos", async () => {
    const store = useBookingPhotoStore.getState();
    store.addPhoto("upload-1", { uid: "upload-1", status: "uploading", percent: 20 });
    store.addPhoto("upload-2", { uid: "upload-2", status: "uploading", percent: 90 });
    store.addPhoto("upload-3", { uid: "upload-3", status: "uploading" });
    const { container } = renderList();

    expect(screen.getByText("Đang tải ảnh lên")).toBeInTheDocument();
    expect(screen.getAllByText("Đang xử lý ảnh")).toHaveLength(2);
    expect(container.querySelector(".anticon-delete")).toBeNull();

    await userEvent.click(screen.getByText("Đang tải ảnh lên"));
    expect(useBookingPhotoStore.getState().selectedPhoto).toBe("upload-1");
    expect(screen.getByText("Đang tải ảnh lên").parentElement).toHaveClass(
      "bg-gray-300",
    );

    await userEvent.click(screen.getAllByAltText("Bản Thảo")[1]);
    expect(useBookingPhotoStore.getState().selectedPhoto).toBe("upload-2");
    expect(screen.getAllByAltText("Bản Thảo")[1]).toHaveClass("border-4");
  });

  it("hides deletion when the booking cannot be updated", () => {
    addDelivered("photo-1");
    const { container } = renderList(false);

    expect(screen.getByAltText("Bản Thảo")).toHaveAttribute(
      "src",
      "https://cdn.test/photo-1.jpg",
    );
    expect(container.querySelector(".anticon-delete")).toBeNull();
  });

  it("deletes a delivered photo and ignores clicks while deleting", async () => {
    addDelivered("photo-1");
    addDelivered("photo-2");
    const paths: string[] = [];
    let respond: () => void = () => {};
    server.use(
      http.delete("*/photographer/booking/:id/photo/:photoId", async ({ request }) => {
        paths.push(new URL(request.url).pathname);
        await new Promise<void>((resolve) => {
          respond = resolve;
        });
        return HttpResponse.json({});
      }),
    );
    const { container } = renderList();

    await userEvent.click(container.querySelectorAll(".anticon-delete")[0]);
    expect(useBookingPhotoStore.getState().photoArray.map((p) => p.id)).toEqual([
      "photo-2",
    ]);
    // the remaining photo cannot be deleted until the first deletion finishes
    await userEvent.click(container.querySelectorAll(".anticon-delete")[0]);
    expect(useBookingPhotoStore.getState().photoArray).toHaveLength(1);
    respond();

    await waitFor(() =>
      expect(paths).toEqual(["/photographer/booking/booking-1/photo/photo-1"]),
    );
  });

  it("reports a failed deletion", async () => {
    addDelivered("photo-1");
    mockEndpoint("delete", "*/photographer/booking/:id/photo/:photoId", () =>
      HttpResponse.json({ message: "boom" }, { status: 500 }),
    );
    const { container } = renderList();

    await userEvent.click(container.querySelector(".anticon-delete") as HTMLElement);

    expect(
      await screen.findByText("Xóa ảnh không thành công", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
  });

  it("removes a photo that was never saved", async () => {
    useBookingPhotoStore.getState().addPhoto("upload-1", {
      uid: "upload-1",
      status: "done",
    });
    const { container } = renderList();

    await userEvent.click(container.querySelector(".anticon-delete") as HTMLElement);

    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
  });
});
