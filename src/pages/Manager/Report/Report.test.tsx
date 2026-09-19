import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import Report from "./Report";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type ReportDto = Schema<"ReportDto">;

const createdAt = new Date(2026, 8, 15, 9, 5).toISOString();

// only the fields the table and the detail views read
const reports = [
  {
    id: "r1",
    content: "Ảnh phản cảm",
    reportStatus: "OPEN",
    reportType: "PHOTO",
    referenceId: "p1",
    createdAt,
    user: { name: "An", avatar: "https://cdn.test/an.jpg" },
    referencedPhoto: { id: "p1", title: "Hoàng hôn", photographer: {} },
  },
  {
    id: "r2",
    content: "Không đến",
    reportStatus: "OPEN",
    reportType: "BOOKING",
    referenceId: "b1",
    createdAt: new Date(2026, 8, 14, 8, 0).toISOString(),
    user: { name: "Chi", avatar: "" },
    referencedBooking: { photoshootPackageHistory: { title: "Chụp cưới" } },
  },
  {
    id: "r3",
    content: "Khách bùng",
    reportStatus: "CLOSED",
    reportType: "BOOKING_PHOTOGRAPHER_REPORT_USER",
    referenceId: "b2",
    createdAt: new Date(2026, 8, 13, 8, 0).toISOString(),
    user: { name: "Dũng", avatar: "https://cdn.test/dung.jpg" },
    referencedBooking: { photoshootPackageHistory: { title: "Chụp kỷ yếu" } },
  },
] as unknown as ReportDto[];

const mockList = (totalRecord = reports.length) =>
  mockEndpoint("get", "*/manager/report", {
    objects: reports,
    totalPage: 1,
    totalRecord,
  });

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest("tr");
  if (!row) throw new Error(`no row for ${text}`);
  return row;
};

const openDetails = async (rowText: string) => {
  await userEvent.click(
    within(rowOf(rowText)).getByRole("button", { name: "ellipsis" }),
  );
  await userEvent.click(await screen.findByText("Chi tiết"));
  return screen.findByRole("dialog");
};

const pickFilter = async (index: number, labels: string[]) => {
  await userEvent.click(screen.getAllByLabelText("filter")[index]);
  for (const label of labels) {
    await userEvent.click(await screen.findByRole("menuitem", { name: label }));
  }
  const confirms = screen.getAllByRole("button", { name: "Đồng ý" });
  await userEvent.click(confirms[confirms.length - 1]);
};

describe("Report", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // antd warns about the deprecated Dropdown/Menu APIs the shared menu uses
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          // BookingReport nests its status <p> inside another <p>
          !message.includes("validateDOMNesting") &&
          !message.includes("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("loads the newest reports and maps each column", async () => {
    const requests = mockList();
    renderWithProviders(<Report />);

    expect(await screen.findByText("Hoàng hôn")).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "7",
      page: "0",
      orderByCreatedAt: "desc",
    });
    const photoRow = rowOf("Hoàng hôn");
    expect(within(photoRow).getByAltText("Avatar")).toHaveAttribute(
      "src",
      "https://cdn.test/an.jpg",
    );
    expect(within(photoRow).getByText("An")).toBeInTheDocument();
    expect(
      within(photoRow).getByText("09:05 / 15-09-2026"),
    ).toBeInTheDocument();
    expect(within(photoRow).getByText("Chưa phản hồi")).toBeInTheDocument();
    expect(within(photoRow).getByText("Hình ảnh")).toBeInTheDocument();

    const bookingRow = rowOf("Chụp cưới");
    expect(within(bookingRow).queryByAltText("Avatar")).toBeNull();
    expect(
      within(bookingRow).getByText("Gói chụp ảnh từ khách"),
    ).toBeInTheDocument();
    const closedRow = rowOf("Chụp kỷ yếu");
    expect(within(closedRow).getByText("Đóng")).toBeInTheDocument();
    expect(
      within(closedRow).getByText("Gói chụp ảnh từ nhiếp ảnh gia"),
    ).toBeInTheDocument();
  });

  it("requests the picked page", async () => {
    const requests = mockList(20);
    renderWithProviders(<Report />);
    await screen.findByText("Hoàng hôn");

    await userEvent.click(screen.getByTitle("2"));

    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "7",
        page: "1",
        orderByCreatedAt: "desc",
      }),
    );
  });

  it("sends the status and type filters", async () => {
    const requests = mockList();
    renderWithProviders(<Report />);
    await screen.findByText("Hoàng hôn");

    await pickFilter(0, ["Đóng"]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "7",
        page: "0",
        reportStatuses: "CLOSED",
        orderByCreatedAt: "desc",
      }),
    );
    await waitFor(() => expect(screen.queryByText("Hoàng hôn")).toBeNull());

    await pickFilter(1, [
      "Gói chụp ảnh từ khách",
      "Gói chụp ảnh từ nhiếp ảnh gia",
    ]);
    await waitFor(() =>
      expect(requests.at(-1)?.query).toMatchObject({
        reportStatuses: "CLOSED",
        reportTypes: "BOOKING,BOOKING_PHOTOGRAPHER_REPORT_USER",
      }),
    );
    expect(screen.getByText("Chụp kỷ yếu")).toBeInTheDocument();
  });

  it("sorts by report time", async () => {
    const requests = mockList();
    renderWithProviders(<Report />);
    await screen.findByText("Hoàng hôn");

    await userEvent.click(screen.getByText("Thời gian báo cáo"));
    await waitFor(() =>
      expect(requests.at(-1)?.query.orderByCreatedAt).toBe("asc"),
    );
    const firstCells = screen
      .getAllByRole("row")
      .map((row) => row.querySelector("td")?.textContent)
      .filter(Boolean);
    expect(firstCells).toEqual(["Dũng", "Chi", "An"]);

    await userEvent.click(screen.getByText("Thời gian báo cáo"));
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2].query.orderByCreatedAt).toBe("desc");
  });

  it("reloads on refresh and logs a failed load", async () => {
    const requests = mockList();
    renderWithProviders(<Report />);
    await screen.findByText("Hoàng hôn");

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(2));

    mockEndpoint("get", "*/manager/report", () =>
      HttpResponse.json({}, { status: 401 }),
    );
    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
  });

  it("closes a photo report from its details and reloads", async () => {
    const requests = mockList();
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    renderWithProviders(<Report />);
    await screen.findByText("Hoàng hôn");

    const dialog = await openDetails("Hoàng hôn");
    expect(within(dialog).getByText("Chi tiết báo cáo")).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Hình ảnh hợp lệ" }),
    );

    expect(await screen.findByText("Đã đóng báo cáo")).toBeInTheDocument();
    expect(closes[0].path).toBe("/manager/report/r1");
    await waitFor(() => expect(requests).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes a booking report from its details and reloads", async () => {
    const requests = mockList();
    mockEndpoint("get", "*/manager/booking/:id", {
      id: "b1",
      status: "ACCEPTED",
      billItems: [],
      totalBillItem: 0,
      photoshootPackageHistory: { title: "Gói b1", price: 1 },
    });
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    renderWithProviders(<Report />);
    await screen.findByText("Chụp cưới");

    const dialog = await openDetails("Chụp cưới");
    expect(await within(dialog).findByText("Gói b1")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByText("Đóng báo cáo"));
    await userEvent.click(
      await screen.findByRole("button", { name: "Đồng ý" }),
    );

    await waitFor(() => expect(closes).toHaveLength(1));
    expect(closes[0].path).toBe("/manager/report/r2");
    await waitFor(() => expect(requests).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("opens a photographer's booking report", async () => {
    mockList();
    mockEndpoint("get", "*/manager/booking/:id", {
      id: "b2",
      status: "SUCCESSED",
      billItems: [],
      totalBillItem: 0,
    });
    renderWithProviders(<Report />);
    await screen.findByText("Chụp kỷ yếu");

    const dialog = await openDetails("Chụp kỷ yếu");

    expect(
      within(dialog).getByText("Báo cáo của nhiếp ảnh gia cho khách"),
    ).toBeInTheDocument();
    expect(
      await within(dialog).findByText("Đã hoàn thành"),
    ).toBeInTheDocument();
  });
});
