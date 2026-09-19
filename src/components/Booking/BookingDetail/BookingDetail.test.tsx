import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { buildBooking, buildSignedPhoto } from "../bookingTestData";
import BookingDetail from "./BookingDetail";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

// the info column and the upload grid have their own tests
vi.mock("./BookingDetailInfo", () => ({
  default: ({
    bookingDetail,
    reportBooking,
  }: {
    bookingDetail: { id: string };
    reportBooking: () => void;
  }) => <button onClick={reportBooking}>info {bookingDetail.id}</button>,
}));

vi.mock("./BookingDetailUpload", () => ({
  default: ({ bookingDetail }: { bookingDetail: { id: string } }) => (
    <div>upload {bookingDetail.id}</div>
  ),
}));

const renderDetail = () =>
  renderWithProviders(<BookingDetail />, {
    route: "/profile/booking-request/booking-1",
    path: "/profile/booking-request/:bookingId",
  });

const selectedImage = () => screen.getByAltText("Selected Photo");

describe("BookingDetail", () => {
  // cleared before rendering: a store update on mounted components happens outside act
  beforeEach(() => useBookingPhotoStore.getState().clearState());

  it("loads the booking and its photos, selecting the last one", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photographer/booking/:id",
      buildBooking({
        status: "ACCEPTED",
        photos: [buildSignedPhoto("photo-1"), buildSignedPhoto("photo-2")],
      }),
    );
    renderDetail();

    expect(
      screen.getByText("Đang tải thông tin lịch hẹn..."),
    ).toBeInTheDocument();
    expect(await screen.findByText("info booking-1")).toBeInTheDocument();
    expect(screen.getByText("upload booking-1")).toBeInTheDocument();
    expect(requests[0].path).toBe("/photographer/booking/booking-1");

    await waitFor(() =>
      expect(selectedImage()).toHaveAttribute(
        "src",
        "https://cdn.test/photo-2.jpg",
      ),
    );
    expect(useBookingPhotoStore.getState().photoArray).toEqual([
      {
        id: "photo-1",
        uid: "photo-1",
        reviewUrl: "https://cdn.test/photo-1.jpg",
        thumbnailUrl: "https://cdn.test/photo-1-thumb.jpg",
        visibility: "PRIVATE",
        status: "done",
      },
      expect.objectContaining({ id: "photo-2", status: "done" }),
    ]);
  });

  it("moves between photos with the arrows", async () => {
    mockEndpoint(
      "get",
      "*/photographer/booking/:id",
      buildBooking({
        photos: ["photo-1", "photo-2", "photo-3"].map((id) =>
          buildSignedPhoto(id),
        ),
      }),
    );
    const { container } = renderDetail();
    await waitFor(() =>
      expect(selectedImage()).toHaveAttribute("src", "https://cdn.test/photo-3.jpg"),
    );

    const left = container.querySelector(".anticon-arrow-left")
      ?.parentElement as HTMLElement;
    const right = container.querySelector(".anticon-arrow-right")
      ?.parentElement as HTMLElement;

    await userEvent.click(left);
    expect(selectedImage()).toHaveAttribute("src", "https://cdn.test/photo-1.jpg");

    await userEvent.click(right);
    expect(selectedImage()).toHaveAttribute("src", "https://cdn.test/photo-3.jpg");
  });

  it("shows a single photo without arrows", async () => {
    mockEndpoint(
      "get",
      "*/photographer/booking/:id",
      buildBooking({ photos: [buildSignedPhoto("photo-1")] }),
    );
    const { container } = renderDetail();

    await waitFor(() =>
      expect(selectedImage()).toHaveAttribute("src", "https://cdn.test/photo-1.jpg"),
    );
    expect(container.querySelector(".anticon-arrow-left")).toBeNull();
    expect(selectedImage().parentElement).not.toHaveClass("hidden");
  });

  it("hides the viewer for a booking without photos", async () => {
    mockEndpoint(
      "get",
      "*/photographer/booking/:id",
      buildBooking({ photos: undefined }),
    );
    renderDetail();

    await screen.findByText("info booking-1");
    expect(selectedImage().parentElement).toHaveClass("hidden");
    expect(selectedImage()).not.toHaveAttribute("src");
    expect(screen.getByText("upload booking-1").parentElement).toHaveClass(
      "h-full",
    );
  });

  it("opens and closes the report form", async () => {
    mockEndpoint("get", "*/photographer/booking/:id", buildBooking());
    renderDetail();

    await userEvent.click(await screen.findByText("info booking-1"));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Cảnh báo")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Cảnh báo")).toBeNull());
  });

  it("keeps waiting when the booking cannot be loaded", async () => {
    const requests = mockEndpoint("get", "*/photographer/booking/:id", () =>
      HttpResponse.json({ message: "NotFound" }, { status: 404 }),
    );
    renderDetail();

    await waitFor(() => expect(requests).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(
      screen.getByText("Đang tải thông tin lịch hẹn..."),
    ).toBeInTheDocument();
  });
});
