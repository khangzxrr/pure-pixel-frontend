import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import useNotificationStore from "../../states/UseNotificationStore";
import CustomerBookingDetail from "./CustomerBookingDetail";

type Booking = Schema<"BookingDto"> & {
  createdAt?: string;
  updatedAt?: string;
  reviews?: Array<Schema<"PhotoshootPackageReviewDto"> & { userId?: string }>;
};
type Photo = Schema<"SignedPhotoDto">;
type CountdownStubProps = {
  date: number;
  renderer: (props: { days: number; completed: boolean }) => ReactNode;
};

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// renders the countdown once for the current (faked) time instead of ticking every second
vi.mock("react-countdown", () => ({
  default: ({ date, renderer }: CountdownStubProps) => {
    const remaining = date - Date.now();
    return (
      <>
        {renderer({
          days: Math.floor(remaining / (24 * 60 * 60 * 1000)),
          completed: remaining <= 0,
        })}
      </>
    );
  },
}));

const DETAIL_URL = "*/customer/booking/:id";
const BILL_URL = "*/customer/booking/:id/bill-item";
const DOWNLOAD_URL = "*/customer/booking/:id/download-all";
const NOW = new Date(2026, 8, 15, 12);
const DAY = 24 * 60 * 60 * 1000;

const person = (id: string, name: string): Schema<"UserDto"> => ({
  id,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  roles: [],
  enabled: true,
  username: id,
  cover: "",
  location: "",
  mail: "",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: `https://cdn.test/${id}.jpg`,
  name,
  quote: "",
});

const photo = (id: string, title: string): Photo =>
  ({
    id,
    title,
    signedUrl: {
      url: `https://cdn.test/${id}.jpg`,
      thumbnail: `https://cdn.test/${id}-thumb.jpg`,
    },
  }) as Photo;

const customer = person("c1", "Khách A");

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: "b1",
  startDate: new Date(2026, 8, 1, 8).toISOString(),
  endDate: new Date(2026, 8, 1, 17).toISOString(),
  successedAt: null,
  status: "SUCCESSED",
  description: "Chụp ngoài trời",
  photoshootPackageHistory: {
    title: "Gói cưới",
    subtitle: "",
    price: 2000000,
    thumbnail: "https://cdn.test/thumb.jpg",
    description: "",
  },
  originalPhotoshootPackage: {
    id: "pk1",
    title: "Gói cưới",
    subtitle: "",
    price: 2000000,
    thumbnail: "",
    description: "",
    status: "ENABLED",
    user: person("ptg-1", "Nhiếp Ảnh"),
    reviews: [],
    showcases: [],
  },
  photos: [photo("p1", "Ảnh 1"), photo("p2", "Ảnh 2"), photo("p3", "")],
  billItems: [],
  totalBillItem: 1900000,
  user: customer,
  reviews: [
    {
      id: "r0",
      star: 2,
      description: "Của người khác",
      user: person("x", "Người khác"),
      userId: "x",
    },
    { id: "r1", star: 5, description: "Tuyệt vời lắm", user: customer, userId: "c1" },
  ],
  createdAt: new Date(NOW.getTime() - 20 * DAY).toISOString(),
  updatedAt: new Date(NOW.getTime() - 5 * DAY).toISOString(),
  ...overrides,
});

const billItems = {
  objects: [
    { id: "i1", title: "Gói chụp", price: 2000000, type: "INCREASE" },
    { id: "i2", title: "Giảm giá", price: 100000, type: "DECREASE" },
  ],
};

const serve = (detail: Booking = booking()) => ({
  details: mockEndpoint("get", DETAIL_URL, detail),
  bills: mockEndpoint("get", BILL_URL, billItems),
});

const renderDetail = () =>
  renderWithProviders(<CustomerBookingDetail />, {
    route: "/profile/customer-booking/b1",
    path: "/profile/customer-booking/:bookingId",
  });

const mainPhoto = () => screen.getByAltText("Selected Photo");

describe("CustomerBookingDetail", () => {
  let consoleError: MockInstance<typeof console.error>;
  let clicks: string[];

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    // jsdom neither scrolls nor navigates; record what the page asked for instead
    Element.prototype.scrollIntoView = vi.fn();
    clicks = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push(this.getAttribute("download") ?? "");
    });
    useNotificationStore.setState({ socket: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(HTMLAnchorElement.prototype.click).mockRestore();
    // antd's tooltips fall back to the deprecated findDOMNode around the icons,
    // and the page calls antd's static message API, which cannot read the theme context
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.includes("Static function can not consume context"),
      );
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("shows the finished booking with its bill, review and photos", async () => {
    const { details, bills } = serve();

    renderDetail();

    expect(screen.getByText("Đang tải thông tin lịch hẹn...")).toBeInTheDocument();
    expect(await screen.findByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("2.000.000đ")).toBeInTheDocument();
    expect(screen.getByText("Nhiếp Ảnh")).toBeInTheDocument();
    expect(screen.getByText("Chụp ngoài trời")).toBeInTheDocument();
    expect(screen.getByText("20 ngày trước")).toBeInTheDocument();
    expect(screen.getByText("25 ngày")).toBeInTheDocument();
    expect(screen.getByText(/Hoàn thành vào lúc/)).toBeInTheDocument();
    expect(await screen.findByText("Giảm giá")).toBeInTheDocument();
    expect(screen.getByText("+2.000.000đ")).toHaveClass("text-green-500");
    expect(screen.getByText("-100.000đ")).toHaveClass("text-red-500");
    expect(screen.getByText("1.900.000đ")).toBeInTheDocument();
    // the customer's own review is shown, not the other one
    expect(screen.getByText("Tuyệt vời lắm")).toBeInTheDocument();
    expect(screen.queryByText("Của người khác")).toBeNull();

    // the newest photo is selected and scrolled to; thumbnails are newest first
    await waitFor(() =>
      expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p3.jpg"),
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(
      screen.getAllByAltText("Bản Thảo").map((img) => img.getAttribute("src")),
    ).toEqual([
      "https://cdn.test/p3-thumb.jpg",
      "https://cdn.test/p2-thumb.jpg",
      "https://cdn.test/p1-thumb.jpg",
    ]);
    expect(details[0].path).toMatch(/\/customer\/booking\/b1$/);
    expect(bills[0].query).toEqual({ limit: "10", page: "0" });
  });

  it("moves between photos", async () => {
    serve();
    renderDetail();
    await waitFor(() =>
      expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p3.jpg"),
    );
    const previous = document.querySelector(".anticon-arrow-left")?.parentElement as HTMLElement;
    const next = document.querySelector(".anticon-arrow-right")?.parentElement as HTMLElement;

    await userEvent.click(previous);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p1.jpg");
    await userEvent.click(previous);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p2.jpg");
    await userEvent.click(next);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p1.jpg");
    await userEvent.click(next);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p3.jpg");
    await userEvent.click(next);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p2.jpg");

    await userEvent.click(screen.getAllByAltText("Bản Thảo")[2]);
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p1.jpg");
    expect(screen.getAllByAltText("Bản Thảo")[2]).toHaveClass("border-4");
  });

  it("downloads every photo as a zip", async () => {
    serve();
    const downloads = mockEndpoint(
      "get",
      DOWNLOAD_URL,
      () => new HttpResponse(new Blob(["zip"]), { headers: { "Content-Type": "application/zip" } }),
    );
    renderDetail();

    await userEvent.click(await screen.findByText("Nhấn để tải ảnh"));

    expect(await screen.findByText("Tải ảnh thành công")).toBeInTheDocument();
    expect(clicks).toEqual(["Gói cưới-Nhiếp Ảnh(Thợ chụp).zip"]);
    expect(downloads).toHaveLength(1);
    expect(screen.getByText("Nhấn để tải ảnh")).toBeInTheDocument();
  });

  it("names the zip generically when the package details are missing", async () => {
    serve(booking({ photoshootPackageHistory: undefined }));
    let answer: () => void = () => {};
    const answered = new Promise<void>((resolve) => {
      answer = resolve;
    });
    server.use(
      http.get(DOWNLOAD_URL, async () => {
        await answered;
        return new HttpResponse(new Blob(["zip"]));
      }),
    );
    renderDetail();

    await userEvent.click(await screen.findByText("Nhấn để tải ảnh"));
    expect(screen.getByText("Ảnh đang được tải về...")).toBeInTheDocument();
    answer();

    expect(await screen.findByText("Tải ảnh thành công")).toBeInTheDocument();
    expect(clicks).toEqual(["Thư mục ảnh chụp của tôi.zip"]);
  });

  it("notifies when the zip cannot be downloaded", async () => {
    serve();
    server.use(http.get(DOWNLOAD_URL, () => new HttpResponse(null, { status: 500 })));
    renderDetail();

    await userEvent.click(await screen.findByText("Nhấn để tải ảnh"));

    expect(await screen.findByText("Lỗi khi tải ảnh")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error:",
      expect.objectContaining({ name: "AxiosError" }),
    );
    consoleError.mockClear();
    expect(clicks).toEqual([]);
    expect(await screen.findByText("Nhấn để tải ảnh")).toBeInTheDocument();
  });

  it("notifies when the downloaded zip cannot be saved", async () => {
    serve();
    mockEndpoint("get", DOWNLOAD_URL, () => new HttpResponse(new Blob(["zip"])));
    const objectUrl = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      throw new Error("no url");
    });
    renderDetail();

    await userEvent.click(await screen.findByText("Nhấn để tải ảnh"));

    expect(await screen.findByText("Lỗi khi tải ảnh")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error downloading file:",
      expect.objectContaining({ message: "no url" }),
    );
    consoleError.mockClear();
    objectUrl.mockRestore();
  });

  it("downloads a single photo", async () => {
    serve();
    server.use(
      http.get("https://cdn.test/:file", () => new HttpResponse(new Blob(["jpg"]))),
    );
    renderDetail();
    await screen.findByText("Gói cưới");
    const [newest, middle] = document.querySelectorAll<HTMLElement>(".anticon-download");

    await userEvent.click(middle);
    await waitFor(() => expect(clicks).toEqual(["Ảnh 2.jpg"]));
    // downloading does not change the selected photo
    expect(mainPhoto()).toHaveAttribute("src", "https://cdn.test/p3.jpg");

    await userEvent.click(newest);
    await waitFor(() => expect(clicks).toEqual(["Ảnh 2.jpg", "download.jpg"]));
  });

  it("shows an error when a photo cannot be fetched", async () => {
    serve();
    server.use(
      http.get("https://cdn.test/:file", () => new HttpResponse(null, { status: 404 })),
    );
    renderDetail();
    await screen.findByText("Gói cưới");

    await userEvent.click(document.querySelectorAll<HTMLElement>(".anticon-download")[0]);

    expect(
      await screen.findByText("Đã xảy ra lỗi khi tải ảnh. Vui lòng thử lại sau."),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Error downloading file:",
      expect.objectContaining({ message: "Failed to fetch the image" }),
    );
    consoleError.mockClear();
  });

  it("refuses to download a photo without a link", async () => {
    const unsigned = { ...photo("p9", "Ảnh 9"), signedUrl: { url: "", thumbnail: "" } };
    serve(booking({ photos: [unsigned] }));
    renderDetail();
    await screen.findByText("Gói cưới");
    // a single photo has no navigation arrows
    expect(document.querySelector(".anticon-arrow-left")).toBeNull();

    await userEvent.click(document.querySelector<HTMLElement>(".anticon-download") as HTMLElement);

    expect(
      await screen.findByText("Vui lòng chọn một ảnh hợp lệ trước khi tải xuống."),
    ).toBeInTheDocument();
    expect(clicks).toEqual([]);
  });

  it("tells the customer when the photographer may delete the photos", async () => {
    serve(booking({ updatedAt: new Date(NOW.getTime() - 40 * DAY).toISOString() }));

    renderDetail();

    expect(
      await screen.findByText("Nhiếp ảnh gia đã có thể xoá ảnh"),
    ).toBeInTheDocument();
  });

  it.each([
    ["REQUESTED", "Đang yêu cầu"],
    ["ACCEPTED", "Đang thực hiện"],
    ["DENIED", "Yêu cầu đã bị từ chối"],
    ["FAILED", "Yêu cầu đã bị hủy"],
    ["PAUSED", "PAUSED"],
  ])("shows a %s booking without downloads or reviews", async (status, label) => {
    serve(
      booking({
        status: status as Booking["status"],
        photos: [],
        description: "",
        reviews: undefined,
      }),
    );

    renderDetail();

    expect(await screen.findByText(label)).toBeInTheDocument();
    expect(screen.getByText("Không có")).toBeInTheDocument();
    expect(
      screen.getByText(/Ảnh của bạn đang được xử lý/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nhấn để tải ảnh")).toBeNull();
    expect(screen.queryByText(/Hoàn thành vào lúc/)).toBeNull();
    expect(screen.queryByText("Gửi đánh giá")).toBeNull();
  });

  it("treats a booking without photos, customer or package as still processing", async () => {
    serve(
      booking({
        status: "SUCCESSED",
        photos: undefined,
        user: undefined,
        originalPhotoshootPackage: undefined,
        updatedAt: undefined,
      }),
    );

    renderDetail();

    expect(await screen.findByText(/Ảnh của bạn đang được xử lý/)).toBeInTheDocument();
    // without a matching review the customer can write one
    expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeInTheDocument();
  });

  it("keeps showing the loading text when the booking cannot be loaded", async () => {
    let answered = false;
    server.use(
      http.get(DETAIL_URL, () => {
        answered = true;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    mockEndpoint("get", BILL_URL, billItems);

    renderDetail();

    await waitFor(() => expect(answered).toBe(true));
    expect(screen.getByText("Đang tải thông tin lịch hẹn...")).toBeInTheDocument();
  });

  it("reports the booking", async () => {
    serve();
    renderDetail();
    await screen.findByText("Gói cưới");

    const reportIcon = document.querySelector('svg[class*="cursor-pointer"][class*="hover:opacity-80"]');
    await userEvent.click(reportIcon as unknown as HTMLElement);

    expect(await screen.findByText("Cảnh báo")).toBeInTheDocument();
  });

  it("reloads when a booking notification arrives", async () => {
    const handlers = new Map<string, (data?: { referenceType?: string }) => Promise<void>>();
    const socket = {
      connected: true,
      on: vi.fn((event: string, handler: (data?: { referenceType?: string }) => Promise<void>) => {
        handlers.set(event, handler);
      }),
      off: vi.fn(),
    };
    useNotificationStore.setState({ socket: socket as unknown as Socket });
    const { details, bills } = serve();
    const { unmount } = renderDetail();
    await screen.findByText("Gói cưới");
    await waitFor(() => expect(bills).toHaveLength(1));

    const handler = handlers.get("notification-event");
    await handler?.({ referenceType: "PHOTO" });
    await handler?.();
    expect(details).toHaveLength(1);

    await handler?.({ referenceType: "BOOKING" });
    await waitFor(() => expect(details).toHaveLength(2));
    expect(bills).toHaveLength(2);

    unmount();
    expect(socket.off).toHaveBeenCalledWith("notification-event", handler);
  });

  it("does not listen on a disconnected socket", async () => {
    const socket = { connected: false, on: vi.fn(), off: vi.fn() };
    useNotificationStore.setState({ socket: socket as unknown as Socket });
    serve();
    const { unmount } = renderDetail();
    await screen.findByText("Gói cưới");

    unmount();

    expect(socket.on).not.toHaveBeenCalled();
    expect(socket.off).toHaveBeenCalledTimes(1);
  });
});
