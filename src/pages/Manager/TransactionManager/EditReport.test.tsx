import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import { mockEndpoint } from "../../../test/mockEndpoint";
import EditReport, { type UpgradeReport } from "./EditReport";

const keycloak = vi.hoisted(() => ({ isLoggedIn: vi.fn(() => false) }));

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: keycloak.isLoggedIn, getToken: () => undefined },
}));

const report = (overrides: Partial<UpgradeReport> = {}): UpgradeReport => ({
  id: "up1",
  name: "Gói Pro",
  summary: "Cho nhiếp ảnh gia",
  minOrderMonth: 6,
  maxPhotoQuota: 500,
  maxPackageCount: 10,
  price: "200000",
  descriptions: ["Không giới hạn ảnh"],
  maxBookingPhotoQuota: "30",
  maxBookingVideoQuota: "2",
  ...overrides,
});

const setup = (selectedReport?: UpgradeReport) => {
  const onClose = vi.fn();
  const tableRef = vi.fn();
  const view = renderWithProviders(
    <EditReport
      selectedReport={selectedReport}
      onClose={onClose}
      tableRef={tableRef}
    />,
  );
  return { ...view, onClose, tableRef };
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

describe("EditReport (upgrade package form)", () => {
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    // the failure handler logs the error
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it("updates the package with the parsed price and refreshes the table", async () => {
    const requests = mockEndpoint("put", "*/upgrade-package/up1", {});
    const { onClose, tableRef } = setup(report());

    expect(screen.getByPlaceholderText("Tên gói")).toHaveValue("Gói Pro");
    expect(screen.getByPlaceholderText("Vui lòng nhập số tiền")).toHaveValue(
      "200000",
    );
    await submit();

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PUT");
    expect(requests[0].path).toBe("/upgrade-package/up1");
    expect(requests[0].json).toEqual({
      id: "up1",
      name: "Gói Pro",
      summary: "Cho nhiếp ảnh gia",
      minOrderMonth: 6,
      maxPhotoQuota: 500,
      maxPackageCount: 10,
      price: 200000,
      descriptions: ["Không giới hạn ảnh"],
      maxBookingPhotoQuota: "30",
      maxBookingVideoQuota: "2",
      status: "ENABLED",
    });
  });

  it("sends the duration picked in the select", async () => {
    const requests = mockEndpoint("put", "*/upgrade-package/up1", {});
    setup(report());

    await userEvent.click(screen.getByRole("combobox"));
    const options = await screen.findAllByText("1 năm");
    await userEvent.click(options[options.length - 1]);
    await submit();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].json).toMatchObject({ minOrderMonth: 12 });
  });

  it("rejects a price that is not a whole thousand", async () => {
    setup(report({ price: "200050" }));

    await submit();

    expect(await screen.findByText("Số tiền không hợp lệ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeDisabled();
  });

  it("rejects a price under 1,000 VND", async () => {
    setup(report({ price: "500" }));

    await submit();

    expect(
      await screen.findByText("Số tiền không được nhỏ hơn 1,000 VND"),
    ).toBeInTheDocument();
  });

  it("requires the name and the package quota", async () => {
    setup(report());

    await userEvent.clear(screen.getByPlaceholderText("Tên gói"));
    await userEvent.clear(
      screen.getByPlaceholderText("Vui lòng nhập số lượng gói dịch vụ tối đa"),
    );
    await submit();

    expect(await screen.findByText("Vui lòng nhập tên gói")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn thời hạn")).toBeInTheDocument();
  });

  it("keeps only digits in the quota fields", async () => {
    const requests = mockEndpoint("put", "*/upgrade-package/up1", {});
    setup(report());

    const quota = screen.getByPlaceholderText(
      "Vui lòng nhập số lượng ảnh maxBookingVideoQuota",
    );
    await userEvent.clear(quota);
    await userEvent.type(quota, "4a5");
    expect(quota).toHaveValue("45");
    await submit();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].json).toMatchObject({ maxBookingVideoQuota: "45" });
  });

  it("adds and removes description rows and validates them", async () => {
    setup(report());

    expect(screen.getByRole("button", { name: "Xóa" })).toHaveClass("hidden");
    await userEvent.click(
      screen.getByRole("button", { name: "Thêm Chi Tiết Gói" }),
    );
    expect(screen.getAllByPlaceholderText("Vui lòng nhập chi tiết")).toHaveLength(
      2,
    );
    expect(screen.getAllByRole("button", { name: "Xóa" })[0]).not.toHaveClass(
      "hidden",
    );

    await submit();
    expect(
      await screen.findByText("Vui lòng nhập chi tiết gói nâng cấp"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "Xóa" })[1]);
    expect(screen.getAllByPlaceholderText("Vui lòng nhập chi tiết")).toHaveLength(
      1,
    );
  });

  it("reports a failed update and lets the manager retry", async () => {
    server.use(
      http.put(
        "*/upgrade-package/up1",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const { onClose, tableRef } = setup(report());

    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleLog).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
    expect(tableRef).not.toHaveBeenCalled();
    expect(screen.queryByText("Tên gói này đã tồn tại")).toBeNull();
  });

  it("marks the name as taken when the rejection carries status code 400", async () => {
    // the api client passes an error thrown by its request interceptor through unchanged
    keycloak.isLoggedIn.mockImplementationOnce(() => {
      throw { data: { statusCode: 400 } };
    });
    const { onClose } = setup(report());

    await submit();

    expect(await screen.findByText("Tên gói này đã tồn tại")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tên gói")).toHaveFocus();
    expect(screen.getByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders an empty form when no package is given", async () => {
    setup();

    expect(screen.getByText("Cập nhật gói Nâng cấp")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tên gói")).toHaveValue("");
    await submit();

    expect(await screen.findByText("Vui lòng nhập tên gói")).toBeInTheDocument();
  });
});
