import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import DetailReport, { type ReportSelection } from "./DetailReport";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type Selection = NonNullable<ReportSelection>;

// only the fields the view reads
const photoReport = {
  id: "r1",
  content: "Ảnh phản cảm",
  reportStatus: "OPEN",
  reportType: "PHOTO",
  referenceId: "p1",
  createdAt: new Date(2026, 8, 15, 9, 5).toISOString(),
  user: { name: "An", avatar: "https://cdn.test/an.jpg" },
  referencedPhoto: {
    id: "p1",
    title: "Hoàng hôn",
    photographer: { name: "Bình", avatar: "https://cdn.test/binh.jpg" },
    signedUrl: { url: "https://cdn.test/p1.jpg", thumbnail: "" },
  },
} as unknown as Selection;

const userReport = {
  ...photoReport,
  id: "r2",
  reportType: "USER",
  referenceId: "u2",
  referencedPhoto: null,
  referencedUser: {
    id: "u2",
    name: "Cường",
    avatar: "https://cdn.test/cuong.jpg",
    quote: "Chụp cho vui",
    mail: "cuong@test.vn",
    phonenumber: "0900000000",
    location: "Huế",
  },
} as unknown as Selection;

const setup = (selected: ReportSelection) => {
  const tableRef = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(
    <DetailReport selected={selected} tableRef={tableRef} onClose={onClose} />,
  );
  return { tableRef, onClose };
};

const click = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

const failure = () => HttpResponse.json({}, { status: 500 });

describe("DetailReport", () => {
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it("shows a photo report", () => {
    setup(photoReport);

    expect(screen.getByText("ID báo cáo: r1")).toBeInTheDocument();
    expect(screen.getByText("Báo cáo hình ảnh")).toBeInTheDocument();
    expect(screen.getByText("An")).toBeInTheDocument();
    expect(screen.getByText("09:05 / 15-09-2026")).toBeInTheDocument();
    expect(screen.getByText("Chưa phản hồi")).toBeInTheDocument();
    expect(screen.getByText("Bình")).toBeInTheDocument();
    expect(screen.getByText("Tên ảnh: Hoàng hôn")).toBeInTheDocument();
    expect(screen.getByAltText("Reported post image")).toHaveAttribute(
      "src",
      "https://cdn.test/p1.jpg",
    );
    expect(screen.getByText("Ảnh phản cảm")).toBeInTheDocument();
  });

  it("closes a valid photo report", async () => {
    const requests = mockEndpoint("patch", "*/manager/report/:id", {});
    const { tableRef, onClose } = setup(photoReport);

    await click("Hình ảnh hợp lệ");

    expect(await screen.findByText("Đã đóng báo cáo")).toBeInTheDocument();
    expect(requests[0].path).toBe("/manager/report/r1");
    expect(requests[0].json).toEqual({ reportStatus: "CLOSED" });
    expect(tableRef).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a failed close", async () => {
    mockEndpoint("patch", "*/manager/report/:id", failure);
    const { tableRef } = setup(photoReport);

    await click("Hình ảnh hợp lệ");

    expect(await screen.findByText("Lỗi")).toBeInTheDocument();
    expect(consoleLog).toHaveBeenCalledWith("error", expect.anything());
    expect(tableRef).not.toHaveBeenCalled();
  });

  it("bans the photo, then closes the report", async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const bans: string[] = [];
    server.use(
      http.post("*/manager/photo/:id/ban", async ({ request }) => {
        bans.push(new URL(request.url).pathname);
        await pending;
        return HttpResponse.json(true);
      }),
    );
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    const { tableRef, onClose } = setup(photoReport);

    await click("Khóa hình ảnh");

    // shown right away; notifications share one key, so the next one replaces it
    expect(await screen.findByText("Chưa có api")).toBeInTheDocument();
    release();
    expect(await screen.findByText("Đã đóng báo cáo")).toBeInTheDocument();
    expect(bans).toEqual(["/manager/photo/p1/ban"]);
    expect(closes[0].json).toEqual({ reportStatus: "CLOSED" });
    expect(consoleLog).toHaveBeenCalledWith("11111", {});
    expect(tableRef).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a failed photo ban", async () => {
    mockEndpoint("post", "*/manager/photo/:id/ban", failure);
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    setup(photoReport);

    await click("Khóa hình ảnh");

    expect(await screen.findByText("Lỗi khóa hình ảnh")).toBeInTheDocument();
    expect(closes).toHaveLength(0);
  });

  it("reports a failed close after banning the photo", async () => {
    mockEndpoint("post", "*/manager/photo/:id/ban", true);
    mockEndpoint("patch", "*/manager/report/:id", failure);
    const { tableRef } = setup(photoReport);

    await click("Khóa hình ảnh");

    expect(await screen.findByText("Lỗi")).toBeInTheDocument();
    expect(tableRef).not.toHaveBeenCalled();
  });

  it("shows a user report", () => {
    setup(userReport);

    expect(screen.getByText("Báo cáo người dùng")).toBeInTheDocument();
    expect(screen.getByText("Người bị báo cáo")).toBeInTheDocument();
    expect(screen.getByText("Cường")).toBeInTheDocument();
    expect(screen.getByText("Chụp cho vui")).toBeInTheDocument();
    expect(screen.getByText("Email: cuong@test.vn")).toBeInTheDocument();
    expect(screen.getByText("Số điện thoại: 0900000000")).toBeInTheDocument();
    expect(screen.getByText("Địa chỉ: Huế")).toBeInTheDocument();
  });

  it("closes a valid user report", async () => {
    const requests = mockEndpoint("patch", "*/manager/report/:id", {});
    const { onClose } = setup(userReport);

    await click("Tài khoản hợp lệ");

    expect(await screen.findByText("Đã đóng báo cáo")).toBeInTheDocument();
    expect(requests[0].path).toBe("/manager/report/r2");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("bans the user, then closes the report", async () => {
    const bans = mockEndpoint(
      "post",
      "*/user/:id/ban",
      () => new HttpResponse(null, { status: 201 }),
    );
    const closes = mockEndpoint("patch", "*/manager/report/:id", {});
    const { tableRef, onClose } = setup(userReport);

    await click("Khóa tài khoản");

    expect(await screen.findByText("Đã đóng báo cáo")).toBeInTheDocument();
    expect(bans[0].path).toBe("/user/u2/ban");
    expect(closes[0].path).toBe("/manager/report/r2");
    expect(tableRef).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a failed user ban", async () => {
    mockEndpoint("post", "*/user/:id/ban", failure);
    setup(userReport);

    await click("Khóa tài khoản");

    expect(await screen.findByText("Lỗi khóa tài khoản")).toBeInTheDocument();
    expect(consoleLog).toHaveBeenCalled();
  });

  it("reports a failed close after banning the user", async () => {
    mockEndpoint("post", "*/user/:id/ban", {});
    mockEndpoint("patch", "*/manager/report/:id", failure);
    const { onClose } = setup(userReport);

    await click("Khóa tài khoản");

    expect(await screen.findByText("Lỗi")).toBeInTheDocument();
    await waitFor(() =>
      expect(consoleLog).toHaveBeenCalledWith("error", expect.anything()),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([
    ["CLOSED", "Đóng"],
    ["actioned", "Action Taken"],
  ] as const)("shows a %s report without actions", (reportStatus, text) => {
    setup({ ...photoReport, reportStatus });

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText("Chưa phản hồi")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders an empty selection", () => {
    setup({});

    expect(screen.getByText("ID báo cáo:")).toBeInTheDocument();
    expect(screen.getByText("Báo cáo người dùng")).toBeInTheDocument();
    expect(screen.getByText("Không có")).toBeInTheDocument();
  });
});
