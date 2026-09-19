import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs, { type Dayjs } from "dayjs";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { buildPackage } from "../../../components/Booking/bookingTestData";
import BookingModal from "./BookingModal";

type PickerProps = {
  value?: unknown;
  className?: string;
  placeholder?: string[];
  onChange?: (value: unknown) => void;
  onCalendarChange?: (value: unknown) => void;
  disabledDate?: (date: Dayjs) => boolean;
  disabledTime?: (date: Dayjs) => {
    disabledHours?: () => number[];
    disabledMinutes?: () => number[];
  };
};

const navigate = vi.hoisted(() => vi.fn());
// the props the modal passed to the (stubbed) RangePicker on its last render
const picker = vi.hoisted(() => ({ props: {} as PickerProps }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "customer-1",
    hasRole: () => false,
  },
}));

// antd's RangePicker popup is not usable in jsdom; this stub reports what the modal gives it
vi.mock("antd", async (importOriginal) => {
  const antd = await importOriginal<typeof import("antd")>();
  const { forwardRef } = await import("react");
  // react-hook-form hands the field ref to the picker
  const RangePicker = forwardRef<HTMLDivElement, PickerProps>((props, ref) => {
    picker.props = props;
    return (
      <div ref={ref} data-testid="range-picker" className={props.className}>
        {props.placeholder?.join(" / ")}:{" "}
        {Array.isArray(props.value) ? "đã chọn" : "chưa chọn"}
      </div>
    );
  });
  RangePicker.displayName = "RangePicker";
  return { ...antd, DatePicker: { ...antd.DatePicker, RangePicker } };
});

const now = new Date(2026, 8, 15, 10, 30);
const pick = (...dates: Date[]) =>
  act(() => {
    const range = dates.map((date) => dayjs(date));
    picker.props.onCalendarChange?.(range);
    picker.props.onChange?.(range);
  });

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

const renderModal = () => {
  const onClose = vi.fn();
  renderWithProviders(
    <BookingModal photoPackage={buildPackage()} onClose={onClose} />,
  );
  return onClose;
};

const mockRequest = (reply?: () => Response) =>
  mockEndpoint(
    "post",
    "*/customer/booking/photoshoot-package/:packageId/request",
    reply ?? {},
  );

describe("BookingModal", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(now);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    navigate.mockReset();
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      // the modal still uses antd's deprecated `visible` prop
      .filter((message) => !message.includes("`visible` is deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("shows the package and requires a date range", async () => {
    const requests = mockRequest();
    renderModal();

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("Ngoại cảnh")).toBeInTheDocument();
    expect(screen.getByText("Chụp cả ngày")).toBeInTheDocument();
    expect(screen.getByTestId("range-picker")).toHaveTextContent(
      "Chọn giờ & ngày bắt đầu / Chọn giờ & ngày kết thúc: chưa chọn",
    );

    await submit();

    expect(
      await screen.findByText("Khoảng thời gian là bắt buộc"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("range-picker")).toHaveClass("border-red-500");
    expect(requests).toHaveLength(0);
  });

  it("requires the start to be more than 24 hours away", async () => {
    const requests = mockRequest();
    renderModal();

    pick(new Date(2026, 8, 16, 9, 0), new Date(2026, 8, 16, 14, 0));
    expect(screen.getByTestId("range-picker")).toHaveTextContent("đã chọn");
    await submit();

    expect(
      await screen.findByText(
        "Ngày bắt đầu phải sau ngày hiện tại phải trên 24 giờ trở đi",
      ),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("requires the end at least 3 hours after the start", async () => {
    const requests = mockRequest();
    renderModal();

    pick(new Date(2026, 8, 17, 9, 0), new Date(2026, 8, 17, 11, 0));
    await submit();

    expect(
      await screen.findByText(
        "Ngày kết thúc phải sau ngày bắt đầu ít nhất 3 giờ",
      ),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("limits the description length", async () => {
    renderModal();

    const textarea = screen.getByPlaceholderText("Nhập kỳ vọng của bạn");
    fireEvent.change(textarea, { target: { value: "a".repeat(1001) } });
    await submit();

    expect(
      await screen.findByText("Mô tả của gói quá dài"),
    ).toBeInTheDocument();
    expect(textarea).toHaveClass("border-red-500");
  });

  it("requests the booking and opens the customer's bookings", async () => {
    const requests = mockRequest();
    const onClose = renderModal();
    const start = new Date(2026, 8, 17, 9, 0);
    const end = new Date(2026, 8, 17, 13, 0);

    pick(start, end);
    await userEvent.type(
      screen.getByPlaceholderText("Nhập kỳ vọng của bạn"),
      "Chụp ngoài trời",
    );
    await submit();

    expect(
      await screen.findByText("Đã gửi yêu cầu đặt lịch", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      path: "/customer/booking/photoshoot-package/pkg-1/request",
      json: {
        startDate: dayjs(start).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        endDate: dayjs(end).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        description: "Chụp ngoài trời",
      },
    });
    expect(navigate).toHaveBeenCalledWith("/profile/customer-booking");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "CannotBookOwnedPhotoshootPackageException",
      "Bạn không thể đặt lịch gói chụp ảnh của chính mình.",
    ],
    [
      "ExistBookingWithSelectedDateException",
      "Bạn đã có gói chụp cho khoảng thời gian này.",
    ],
    ["Gói đã đủ lịch", "Gói đã đủ lịch"],
  ])("explains a rejected booking (%s)", async (code, text) => {
    mockRequest(() => HttpResponse.json({ message: code }, { status: 400 }));
    const onClose = renderModal();

    pick(new Date(2026, 8, 17, 9, 0), new Date(2026, 8, 17, 13, 0));
    await submit();

    expect(
      await screen.findByText(text, {
        selector: ".ant-notification-notice-description",
      }),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("falls back to a generic error without a message", async () => {
    mockRequest(() => HttpResponse.json({}, { status: 500 }));
    renderModal();

    pick(new Date(2026, 8, 17, 9, 0), new Date(2026, 8, 17, 13, 0));
    await submit();

    expect(
      await screen.findByText("Đã có lỗi xảy ra", {
        selector: ".ant-notification-notice-description",
      }),
    ).toBeInTheDocument();
  });

  it.each([
    [
      "PhotoshootPackageDisabledException",
      "Gói chụp này đã bị vô hiệu hóa (nhấn vào đây để xem các gói chụp khác)",
    ],
    [
      "No PhotoshootPackage found",
      "Gói chụp này đã bị xóa (nhấn vào đây để xem các gói chụp khác)",
    ],
  ])("links an unavailable package to the other packages (%s)", async (code, text) => {
    mockRequest(() => HttpResponse.json({ message: code }, { status: 400 }));
    renderModal();

    pick(new Date(2026, 8, 17, 9, 0), new Date(2026, 8, 17, 13, 0));
    await submit();

    await userEvent.click(await screen.findByText(text));
    expect(navigate).toHaveBeenCalledWith("/explore/booking-package");
  });

  it("logs a picked range that is not a start and end pair", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const requests = mockRequest();
    renderModal();

    pick(
      new Date(2026, 8, 17, 9, 0),
      new Date(2026, 8, 17, 13, 0),
      new Date(2026, 8, 17, 15, 0),
    );
    expect(screen.getByTestId("range-picker")).toHaveTextContent("chưa chọn");
    await submit();

    await waitFor(() =>
      expect(log).toHaveBeenCalledWith("Date range is not properly selected."),
    );
    expect(requests).toHaveLength(0);
    log.mockRestore();
  });

  it("closes on cancel", async () => {
    const onClose = renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps calendar changes without a start date", () => {
    renderModal();

    act(() => {
      picker.props.onCalendarChange?.(null);
      picker.props.onCalendarChange?.([null, dayjs(new Date(2026, 8, 17, 13, 0))]);
    });

    expect(screen.getByTestId("range-picker")).toHaveTextContent("chưa chọn");
  });

  it("only allows start dates from tomorrow up to three months ahead", () => {
    renderModal();
    const disabledDate = picker.props.disabledDate as (date: Dayjs) => boolean;

    expect(disabledDate(dayjs(new Date(2026, 8, 15, 23, 0)))).toBe(true);
    expect(disabledDate(dayjs(new Date(2026, 8, 16, 0, 0)))).toBe(false);
    expect(disabledDate(dayjs(new Date(2026, 11, 15, 23, 0)))).toBe(false);
    expect(disabledDate(dayjs(new Date(2026, 11, 16, 0, 1)))).toBe(true);
  });

  it("disables the hours before now on tomorrow's date", () => {
    renderModal();
    const { disabledTime } = picker.props;

    expect(
      disabledTime?.(dayjs(new Date(2026, 8, 16, 8, 0))).disabledHours?.(),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(disabledTime?.(dayjs(new Date(2026, 8, 20, 8, 0)))).toEqual({});
  });

  it("disables the minutes before now when tomorrow starts at midnight", () => {
    vi.setSystemTime(new Date(2026, 8, 15, 0, 30));
    renderModal();
    const { disabledTime } = picker.props;

    expect(
      disabledTime?.(dayjs(new Date(2026, 8, 16, 0, 0))).disabledMinutes?.(),
    ).toEqual(Array.from({ length: 30 }, (_, minute) => minute));
    expect(disabledTime?.(dayjs(new Date(2026, 8, 16, 5, 0)))).toEqual({});
  });
});
