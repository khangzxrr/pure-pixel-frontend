import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { server } from "../../../test/server";
import useBookingPhotoStore, {
  type BookingPhotoItem,
} from "../../../states/UseBookingPhotoStore";
import UploadBookingPhotoCard from "./UploadBookingPhotoCard";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const renderCard = (photo: BookingPhotoItem, isAbleDelete = true) =>
  renderWithProviders(
    <UploadBookingPhotoCard
      photo={photo}
      index={0}
      isAbleDelete={isAbleDelete}
      enableUpdate
    />,
    {
      route: "/profile/booking-request/booking-1",
      path: "/profile/booking-request/:bookingId",
    },
  );

const deliveredPhoto: BookingPhotoItem = {
  id: "photo-1",
  uid: "photo-1",
  thumbnailUrl: "https://cdn.test/photo-1-thumb.jpg",
  status: "done",
};

const deleteIcon = (container: HTMLElement) =>
  container.querySelector(".anticon-delete") as HTMLElement;

describe("UploadBookingPhotoCard", () => {
  // cleared before rendering: a store update on mounted components happens outside act
  beforeEach(() => useBookingPhotoStore.getState().clearState());

  it.each([
    [40, "Đang tải ảnh lên"],
    [85, "Đang xử lý ảnh"],
    [undefined, "Đang xử lý ảnh"],
  ])("shows the progress of an upload at %s%%", async (percent, text) => {
    const { container } = renderCard(
      { uid: "upload-1", status: "uploading", percent },
      false,
    );

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(deleteIcon(container)).toBeNull();

    await userEvent.click(screen.getByText(text));
    expect(useBookingPhotoStore.getState().selectedPhoto).toBe("upload-1");
    expect(screen.getByText(text).parentElement).toHaveClass("bg-gray-300");
  });

  it("selects a delivered photo from its thumbnail", async () => {
    const { container } = renderCard(deliveredPhoto, false);
    const image = screen.getByAltText("Bản Thảo");

    expect(image).toHaveAttribute("src", "https://cdn.test/photo-1-thumb.jpg");
    expect(image).not.toHaveClass("border-4");
    expect(deleteIcon(container)).toBeNull();

    await userEvent.click(image);
    expect(useBookingPhotoStore.getState().selectedPhoto).toBe("photo-1");
    expect(image).toHaveClass("border-4");
  });

  it("deletes a delivered photo once, even when clicked again", async () => {
    useBookingPhotoStore.getState().addPhotoWithId("photo-1", deliveredPhoto);
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
    const { container } = renderCard(deliveredPhoto);

    await userEvent.click(deleteIcon(container));
    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
    await userEvent.click(deleteIcon(container));
    respond();

    await waitFor(() =>
      expect(paths).toEqual(["/photographer/booking/booking-1/photo/photo-1"]),
    );
    expect(useBookingPhotoStore.getState().selectedPhoto).toBeNull();
  });

  it("reports a failed deletion", async () => {
    useBookingPhotoStore.getState().addPhotoWithId("photo-1", deliveredPhoto);
    const requests = mockEndpoint(
      "delete",
      "*/photographer/booking/:id/photo/:photoId",
      () => HttpResponse.json({ message: "boom" }, { status: 500 }),
    );
    const { container } = renderCard(deliveredPhoto);

    await userEvent.click(deleteIcon(container));

    expect(
      await screen.findByText("Xóa ảnh không thành công", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it("removes a photo that was never saved without a request", async () => {
    const localPhoto: BookingPhotoItem = { uid: "upload-1", status: "done" };
    useBookingPhotoStore.getState().addPhoto("upload-1", localPhoto);
    const { container } = renderCard(localPhoto);

    await userEvent.click(deleteIcon(container));

    expect(useBookingPhotoStore.getState().photoArray).toEqual([]);
  });
});
