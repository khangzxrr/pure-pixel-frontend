import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { server } from "../../../test/server";
import BookingReport from "./BookingReport";
import type { ReportSelection } from "./DetailReport";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type Selection = NonNullable<ReportSelection>;

const report = {
  id: "r3",
  content: "Nhiếp ảnh gia không đến",
  reportStatus: "OPEN",
  reportType: "BOOKING",
  referenceId: "b1",
  createdAt: new Date(2026, 8, 15, 9, 5).toISOString(),
  user: { name: "An", avatar: "https://cdn.test/an.jpg" },
} as unknown as Selection;

const photographerReport = {
  ...report,
  reportType: "BOOKING_PHOTOGRAPHER_REPORT_USER",
  user: { name: "Bình", avatar: "https://cdn.test/binh.jpg" },
} as unknown as Selection;

const booking = (overrides: object = {}) => ({
  id: "b1",
  status: "ACCEPTED",
  photoshootPackageHistory: {
    title: "Chụp cưới",
    subtitle: "Ngoài trời",
    price: 500000,
    thumbnail: "https://cdn.test/pkg.jpg",
    description: "",
  },
  originalPhotoshootPackage: {
    user: { name: "Nhiếp ảnh gia Dũng", avatar: "https://cdn.test/dung.jpg" },
  },
  billItems: [
    { id: "i1", title: "Phí gói", price: 500000, type: "INCREASE" },
    { id: "i2", title: "Giảm giá", price: 50000, type: "DECREASE" },
  ],
  totalBillItem: 450000,
  photos: [{ id: "ph1", signedUrl: { url: "https://cdn.test/1.jpg" } }],
  user: { name: "Khách Em", avatar: "https://cdn.test/em.jpg" },
  ...overrides,
});

const setup = (selected: ReportSelection = report, detail = booking()) => {
  const details = mockEndpoint("get", "*/manager/booking/:id", detail);
  const tableRef = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(
    <BookingReport
      selectedData={selected}
      tableRef={tableRef}
      onClose={onClose}
    />,
  );
  return { details, tableRef, onClose };
};

const confirm = async (label: string) => {
  await userEvent.click(screen.getByText(label));
  await userEvent.click(await screen.findByRole("button", { name: "Đồng ý" }));
};

describe("BookingReport", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          // the status <p> is nested inside another <p>
          !message.includes("validateDOMNesting") &&
          !message.startsWith("Error closing report:") &&
          !message.startsWith("Error updating booking status:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("shows a customer's report with the booking bill and photos", async () => {
    const { details } = setup();

    expect(await screen.findByText("Chụp cưới")).toBeInTheDocument();
    expect(details[0].path).toBe("/manager/booking/b1");
    expect(
      screen.getByText("Báo cáo của khách cho nhiếp ảnh gia"),
    ).toBeInTheDocument();
    expect(screen.getByText("ID báo cáo: r3")).toBeInTheDocument();
    expect(screen.getByText("09:05 / 15-09-2026")).toBeInTheDocument();
    expect(screen.getByText("Chưa phản hồi")).toBeInTheDocument();
    expect(screen.getByText("Đang thực hiện")).toBeInTheDocument();
    expect(screen.getByText("500,000 vnd")).toBeInTheDocument();
    expect(screen.getByText("Ngoài trời")).toBeInTheDocument();
    // the reporter is the customer, the photographer is reported
    expect(screen.getAllByText("Khách hàng")).toHaveLength(2);
    expect(screen.getByText("Nhiếp ảnh gia Dũng")).toBeInTheDocument();
    expect(screen.getByText("+500,000 VND")).toBeInTheDocument();
    expect(screen.getByText("-50,000 VND")).toBeInTheDocument();
    expect(screen.getByText("450,000 VND")).toBeInTheDocument();
    expect(screen.queryByText("Chưa có ảnh trong gói chụp")).toBeNull();
    expect(
      document.querySelector('[style*="https://cdn.test/1.jpg"]'),
    ).not.toBeNull();
    expect(screen.getByText("Kết thúc gói")).toBeInTheDocument();
  });

  it("shows a photographer's report about the customer", async () => {
    setup(photographerReport, booking({ photos: [] }));

    expect(await screen.findByText("Khách Em")).toBeInTheDocument();
    expect(
      screen.getByText("Báo cáo của nhiếp ảnh gia cho khách"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nhiếp ảnh gia")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Chưa có ảnh trong gói chụp")).toBeInTheDocument();
    expect(screen.getByText("Hủy gói")).toBeInTheDocument();
    expect(screen.queryByText("Kết thúc gói")).toBeNull();
  });

  it.each([
    ["REQUESTED", "Đang yêu cầu"],
    ["SUCCESSED", "Đã hoàn thành"],
    ["DENIED", "Bị từ chối yêu cầu"],
    ["FAILED", "Đã bị hủy yêu cầu"],
    ["UNKNOWN", "UNKNOWN"],
  ])("names the %s booking status", async (status, text) => {
    setup(report, booking({ status }));
    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it("closes the report after confirmation", async () => {
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    const { tableRef, onClose } = setup();
    await screen.findByText("Chụp cưới");

    await confirm("Đóng báo cáo");

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(tableRef).toHaveBeenCalledTimes(1);
    expect(closes[0].path).toBe("/manager/report/r3");
    expect(closes[0].json).toEqual({
      content: "Đã xử lý báo cáo",
      reportStatus: "CLOSED",
      reportType: "BOOKING",
      referenceId: "b1",
    });
  });

  it.each([
    ["Hủy gói", "FAILED"],
    ["Kết thúc gói", "SUCCESSED"],
  ])(
    "%s marks the booking %s, then closes the report",
    async (label, status) => {
      const updates = mockEndpoint("patch", "*/manager/booking/:id", {});
      const closes = mockEndpoint("patch", "*/manager/report/:id", {});
      const { onClose } = setup();
      await screen.findByText("Chụp cưới");

      await confirm(label);

      expect(
        await screen.findByText("Cập nhật gói chụp ảnh thành công"),
      ).toBeInTheDocument();
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(updates[0].path).toBe("/manager/booking/b1");
      expect(updates[0].json).toEqual({ status });
      expect(closes[0].json).toMatchObject({ reportStatus: "CLOSED" });
    },
  );

  it("disables the actions while a request is pending", async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.patch("*/manager/booking/:id", async () => {
        await pending;
        return HttpResponse.json({});
      }),
    );
    mockEndpoint("patch", "*/manager/report/:id", {});
    const { onClose } = setup();
    await screen.findByText("Chụp cưới");

    await confirm("Hủy gói");

    await waitFor(() =>
      expect(screen.getByText("Đóng báo cáo")).toHaveClass("bg-gray-500"),
    );
    expect(screen.getByText("Hủy gói")).toHaveClass("cursor-not-allowed");
    expect(screen.getByText("Kết thúc gói")).toHaveClass("bg-gray-500");
    release();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByText("Kết thúc gói")).toHaveClass("bg-green-500"),
    );
  });

  it("reports a failed booking update and keeps the report open", async () => {
    mockEndpoint("patch", "*/manager/booking/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    const { onClose } = setup();
    await screen.findByText("Chụp cưới");

    await confirm("Kết thúc gói");

    expect(await screen.findByText("Vui lòng thử lại!")).toBeInTheDocument();
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error closing report:",
        expect.anything(),
      ),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Error updating booking status:",
      expect.anything(),
    );
    expect(closes).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("logs a failed close", async () => {
    mockEndpoint("patch", "*/manager/report/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    const { tableRef, onClose } = setup();
    await screen.findByText("Chụp cưới");

    await confirm("Đóng báo cáo");

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error closing report:",
        expect.anything(),
      ),
    );
    expect(tableRef).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([
    ["CLOSED", "Đóng"],
    ["actioned", "Action Taken"],
  ] as const)(
    "shows a %s report without actions",
    async (reportStatus, text) => {
      setup({ ...report, reportStatus });

      expect(await screen.findByText("Chụp cưới")).toBeInTheDocument();
      expect(screen.getByText(text)).toBeInTheDocument();
      expect(screen.queryByText("Đóng báo cáo")).toBeNull();
    },
  );
});
