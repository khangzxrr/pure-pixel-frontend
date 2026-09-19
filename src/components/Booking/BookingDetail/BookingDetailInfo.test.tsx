import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { format } from "node:util";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import calculateDateDifference from "../../../utils/calculateDateDifference";
import { FormatDate } from "../../../utils/FormatDate";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { buildBooking } from "../bookingTestData";
import type { BookingItem } from "../BookingRequestState/BookingCard";
import BookingDetailInfo from "./BookingDetailInfo";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

// the bill and the review (another group's component) have their own tests
vi.mock("./BookingDetailBill", () => ({
  default: ({ enableUpdate }: { enableUpdate: boolean }) => (
    <div>bill {enableUpdate ? "editable" : "readonly"}</div>
  ),
}));

vi.mock("../../../pages/UserProfile/Component/ReviewBooking", () => ({
  default: ({
    bookingId,
    userReview,
    role,
  }: {
    bookingId: string;
    userReview?: { description: string };
    role: string;
  }) => (
    <div>
      review {role} {bookingId} {userReview ? userReview.description : "none"}
    </div>
  ),
}));

const day = 24 * 60 * 60 * 1000;
const now = new Date(2026, 8, 15, 10, 0);

const renderInfo = (
  overrides: Partial<BookingItem> = {},
  reportBooking = vi.fn(),
) =>
  renderWithProviders(
    <BookingDetailInfo
      bookingDetail={buildBooking(overrides)}
      reportBooking={reportBooking}
    />,
    {
      route: "/profile/booking-request/booking-1",
      path: "/profile/booking-request/:bookingId",
    },
  );

const notice = (text: string) =>
  screen.findByText(text, { selector: ".ant-notification-notice-message" });

const addDonePhoto = () =>
  useBookingPhotoStore.getState().addPhotoWithId("photo-1", {
    id: "photo-1",
    uid: "photo-1",
    status: "done",
  });

const confirmPaid = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: "Khách đã thanh toán" }),
  );
  await userEvent.click(await screen.findByRole("button", { name: "Có" }));
};

describe("BookingDetailInfo", () => {
  let consoleError: MockInstance<typeof console.error>;
  let downloads: string[];

  beforeEach(() => {
    // cleared before rendering: a store update on mounted components happens outside act
    useBookingPhotoStore.getState().clearState();
    // only the clock is faked: faked timeouts would run antd and react-query updates outside act
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    // the component logs its form errors on every render
    vi.spyOn(console, "log").mockImplementation(() => {});
    downloads = [];
    // jsdom cannot navigate to the downloaded blob
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function (this: HTMLAnchorElement) {
        downloads.push(this.download);
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    navigate.mockReset();
    const unexpected = consoleError.mock.calls
      .map((args) => format(...args))
      .filter(
        (message) =>
          // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
          !message.includes("findDOMNode is deprecated") &&
          !message.startsWith("Error downloading file:") &&
          !message.startsWith("Error:"),
      );
    vi.restoreAllMocks();
    expect(unexpected).toEqual([]);
  });

  it.each([
    ["REQUESTED", "Đang yêu cầu"],
    ["DENIED", "Yêu cầu đã bị từ chối"],
    ["FAILED", "Yêu cầu đã bị hủy"],
  ] as const)("shows a %s booking read-only", (status, label) => {
    const { container } = renderInfo({ status });

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("bill readonly")).toBeInTheDocument();
    expect(container.querySelector(".lucide-pencil")).toBeNull();
    expect(
      container.querySelector('svg[class*="hover:opacity-80"]'),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Khách đã thanh toán" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^review/)).toBeNull();
  });

  it("shows an unknown status as it is", () => {
    renderInfo({ status: "ARCHIVED" as BookingItem["status"] });

    expect(screen.getByText("ARCHIVED")).toBeInTheDocument();
  });

  it("shows an accepted booking with its details and actions", async () => {
    const reportBooking = vi.fn();
    const booking = buildBooking({ status: "ACCEPTED" });
    const { container } = renderInfo({ status: "ACCEPTED" }, reportBooking);

    expect(screen.getByText("Đang thực hiện")).toBeInTheDocument();
    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("Khách Hàng")).toBeInTheDocument();
    expect(screen.getByText("Chụp ở hồ Gươm")).toBeInTheDocument();
    expect(screen.getByText(FormatDateTime(booking.startDate))).toBeInTheDocument();
    expect(screen.getByText(FormatDateTime(booking.endDate))).toBeInTheDocument();
    expect(
      screen.getByText(calculateDateDifference(booking.createdAt)),
    ).toBeInTheDocument();
    expect(screen.getByText("bill editable")).toBeInTheDocument();

    await userEvent.click(
      container.querySelector('svg[class*="hover:opacity-80"]') as SVGElement,
    );
    expect(reportBooking).toHaveBeenCalledTimes(1);

    await userEvent.click(
      container.querySelector(".lucide-message-circle-more") as SVGElement,
    );
    expect(navigate).toHaveBeenCalledWith("/message?to=customer-1");
  });

  it("edits the note of an accepted booking", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/booking/:id",
      buildBooking({ status: "ACCEPTED" }),
    );
    const { container } = renderInfo({ status: "ACCEPTED", description: "" });
    expect(screen.getByText("Không có")).toBeInTheDocument();

    // cancelling leaves the note untouched
    await userEvent.click(container.querySelector(".lucide-pencil") as SVGElement);
    await userEvent.click(container.querySelector(".lucide-x") as SVGElement);
    expect(screen.queryByPlaceholderText("Nhập dịch vụ thêm")).toBeNull();

    await userEvent.click(container.querySelector(".lucide-pencil") as SVGElement);
    const textarea = screen.getByPlaceholderText("Nhập dịch vụ thêm");
    await userEvent.type(textarea, "Mang theo áo dài");
    await userEvent.click(
      container.querySelector('button[type="submit"]') as HTMLButtonElement,
    );

    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Nhập dịch vụ thêm")).toBeNull(),
    );
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      method: "PATCH",
      path: "/photographer/booking/booking-1",
      json: { description: "Mang theo áo dài" },
    });
  });

  it("rejects a note that is too long", async () => {
    const requests = mockEndpoint("patch", "*/photographer/booking/:id", {});
    const { container } = renderInfo({ status: "ACCEPTED" });

    await userEvent.click(container.querySelector(".lucide-pencil") as SVGElement);
    const textarea = screen.getByPlaceholderText("Nhập dịch vụ thêm");
    fireEvent.change(textarea, { target: { value: "a".repeat(1001) } });
    await userEvent.click(
      container.querySelector('button[type="submit"]') as HTMLButtonElement,
    );

    expect(await screen.findByText("Mô tả của gói quá dài")).toBeInTheDocument();
    expect(textarea).toHaveClass("border-red-500");
    expect(requests).toHaveLength(0);
  });

  it("warns that the note being edited is lost when marking as paid", async () => {
    const { container } = renderInfo({ status: "ACCEPTED" });

    await userEvent.click(container.querySelector(".lucide-pencil") as SVGElement);
    await userEvent.click(
      screen.getByRole("button", { name: "Khách đã thanh toán" }),
    );

    expect(
      await screen.findByText("Thông tin gói chụp đang chỉnh sửa"),
    ).toBeInTheDocument();
  });

  it("marks the booking as paid once a photo was delivered", async () => {
    addDonePhoto();
    const requests = mockEndpoint(
      "patch",
      "*/photographer/booking/:id/paid",
      buildBooking({ status: "SUCCESSED" }),
    );
    renderInfo({ status: "ACCEPTED" });

    await userEvent.click(
      screen.getByRole("button", { name: "Khách đã thanh toán" }),
    );
    expect(await screen.findByText('"Xác nhận thanh toán"')).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Có" }));

    expect(await notice("Thành công")).toBeInTheDocument();
    expect(requests[0]).toMatchObject({
      method: "PATCH",
      path: "/photographer/booking/booking-1/paid",
    });
  });

  it("refuses to mark as paid before any photo was delivered", async () => {
    const requests = mockEndpoint("patch", "*/photographer/booking/:id/paid", {});
    useBookingPhotoStore.getState().addPhoto("upload-1", {
      uid: "upload-1",
      status: "uploading",
    });
    renderInfo({ status: "ACCEPTED" });

    await confirmPaid();

    expect(await notice("Thao tác thất bại")).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("shows a finished booking with its review and deletion date", () => {
    const updatedAt = new Date(now.getTime() - 10 * day).toISOString();
    renderInfo({
      status: "SUCCESSED",
      updatedAt,
      reviews: [
        { id: "r-1", star: 5, description: "Ảnh đẹp", user: buildBooking().user! },
      ],
    });

    const expiredAt = new Date(updatedAt);
    expiredAt.setDate(expiredAt.getDate() + 30);
    expect(
      screen.getByText(`Bạn sẽ được xoá ảnh vào: ${FormatDate(expiredAt)} (`, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(FormatDateTime(updatedAt))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Khách đã thanh toán" })).toBeNull();
    expect(screen.getByText("Khách đã thanh toán")).toBeInTheDocument();
    expect(screen.getByText("Nhấn để tải ảnh")).toBeInTheDocument();
    expect(
      screen.getByText("review photographer undefined Ảnh đẹp"),
    ).toBeInTheDocument();
  });

  it.each([
    ["days", 20 * day + 12 * 60 * 60 * 1000, "Còn 20 ngày"],
    ["hours", day + 5.5 * 60 * 60 * 1000, "Còn 5 giờ"],
    ["minutes", 70.5 * 60 * 1000, "Còn 10 phút"],
    ["seconds", 30 * 1000, "Sắp hết hạn"],
    ["nothing", -day, "Bạn đã có thể xoá được ảnh"],
  ])("counts down the %s left before photos can be deleted", (_, left, text) => {
    renderInfo({
      status: "SUCCESSED",
      updatedAt: new Date(now.getTime() - 30 * day + left).toISOString(),
    });

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("renders a finished booking with missing optional data", () => {
    renderInfo({
      status: "SUCCESSED",
      photoshootPackageHistory: undefined,
      user: undefined,
      updatedAt: undefined,
      reviews: undefined,
    });

    expect(screen.getByText("review photographer undefined none")).toBeInTheDocument();
    expect(screen.getByText("Invalid Date")).toBeInTheDocument();
  });

  it("downloads every photo as a zip named after the package and customer", async () => {
    const paths: string[] = [];
    let respond: () => void = () => {};
    server.use(
      http.get("*/customer/booking/:id/download-all", async ({ request }) => {
        paths.push(new URL(request.url).pathname);
        await new Promise<void>((resolve) => {
          respond = resolve;
        });
        return new HttpResponse(new Blob(["zip"]), {
          headers: { "Content-Type": "application/zip" },
        });
      }),
    );
    renderInfo({ status: "SUCCESSED" });

    await userEvent.click(screen.getByText("Nhấn để tải ảnh"));

    expect(screen.getByText("Ảnh đang được tải về...")).toBeInTheDocument();
    await waitFor(() =>
      expect(paths).toEqual(["/customer/booking/booking-1/download-all"]),
    );
    respond();
    expect(await notice("Tải ảnh thành công")).toBeInTheDocument();
    expect(downloads).toEqual(["Gói cưới-Khách Hàng(Khách).zip"]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
    expect(screen.getByText("Nhấn để tải ảnh")).toBeInTheDocument();
  });

  it("uses a generic zip name without a package title", async () => {
    mockEndpoint("get", "*/customer/booking/:id/download-all", () =>
      new HttpResponse(new Blob(["zip"])),
    );
    renderInfo({
      status: "SUCCESSED",
      photoshootPackageHistory: {
        title: "",
        subtitle: "",
        price: 0,
        thumbnail: "",
        description: "",
      },
    });

    await userEvent.click(screen.getByText("Nhấn để tải ảnh"));

    expect(await notice("Tải ảnh thành công")).toBeInTheDocument();
    expect(downloads).toEqual(["Thư mục ảnh chụp khách.zip"]);
  });

  it("reports a download that cannot be saved", async () => {
    mockEndpoint("get", "*/customer/booking/:id/download-all", () =>
      new HttpResponse(new Blob(["zip"])),
    );
    vi.mocked(URL.createObjectURL).mockImplementationOnce(() => {
      throw new Error("no blob url");
    });
    renderInfo({ status: "SUCCESSED" });

    await userEvent.click(screen.getByText("Nhấn để tải ảnh"));

    expect(await notice("Lỗi khi tải ảnh")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error downloading file:",
      expect.any(Error),
    );
    expect(downloads).toEqual([]);
    expect(screen.getByText("Nhấn để tải ảnh")).toBeInTheDocument();
  });

  it("reports a failed download request", async () => {
    mockEndpoint("get", "*/customer/booking/:id/download-all", () =>
      HttpResponse.json({ message: "boom" }, { status: 500 }),
    );
    renderInfo({ status: "SUCCESSED" });

    await userEvent.click(screen.getByText("Nhấn để tải ảnh"));

    expect(await notice("Lỗi khi tải ảnh")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith("Error:", expect.anything());
    expect(await screen.findByText("Nhấn để tải ảnh")).toBeInTheDocument();
  });
});
