import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import CreateUpgrade from "./CreateUpgrade";
import type { TableUpgradeHandle } from "./TableUpgrade";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const option = (text: string) =>
  screen.getByText(
    (_, element) =>
      !!element?.classList.contains("ant-select-item-option-content") &&
      element.textContent === text,
  );

const fillPackage = async ({ price = "200000" } = {}) => {
  await userEvent.type(
    screen.getByPlaceholderText("Tên gói"),
    " Chuyên nghiệp ",
  );
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.click(option("6 tháng"));
  // the amount input starts at its display default of 10,000
  await userEvent.clear(screen.getByRole("spinbutton"));
  await userEvent.type(screen.getByRole("spinbutton"), price);
  await userEvent.type(
    screen.getByPlaceholderText("Vui lòng nhập dung lượng upload tối da"),
    "5",
  );
  await userEvent.type(
    screen.getByPlaceholderText("Vui lòng nhập số lượng gói dịch vụ tối đa"),
    "3",
  );
  await userEvent.type(
    screen.getByPlaceholderText("Vui lòng nhập bản tóm tắt"),
    "Gói cho studio",
  );
  const [firstDetail] = screen.getAllByPlaceholderText(
    "Vui lòng nhập chi tiết",
  );
  await userEvent.clear(firstDetail);
  await userEvent.type(firstDetail, "Bán ảnh");
};

const setup = (
  current: TableUpgradeHandle | null = { reloadData: vi.fn() },
) => {
  const onClose = vi.fn();
  const tableRef = { current };
  renderWithProviders(<CreateUpgrade onClose={onClose} tableRef={tableRef} />);
  return { onClose, tableRef };
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Tạo mới" }));

describe("CreateUpgrade", () => {
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it("creates an enabled package with its quota in bytes", async () => {
    const requests = mockEndpoint("post", "*/manager/upgrade-package", {});
    const reloadData = vi.fn();
    const { onClose } = setup({ reloadData });

    await fillPackage();
    await userEvent.click(
      screen.getByRole("button", { name: "Thêm Chi Tiết Gói" }),
    );
    const details = screen.getAllByPlaceholderText("Vui lòng nhập chi tiết");
    expect(details).toHaveLength(2);
    await userEvent.clear(details[1]);
    await userEvent.type(details[1], "Nhận lịch chụp");
    await submit();

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(requests[0].json).toEqual({
      name: "Chuyên nghiệp",
      minOrderMonth: 6,
      price: 200000,
      maxPhotoQuota: 5 * 1073741824,
      maxPackageCount: 3,
      summary: "Gói cho studio",
      descriptions: ["Bán ảnh", "Nhận lịch chụp"],
      status: "ENABLED",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(reloadData).toHaveBeenCalledTimes(1));
  });

  it("removes a detail line", async () => {
    setup();

    await userEvent.click(
      screen.getByRole("button", { name: "Thêm Chi Tiết Gói" }),
    );
    const removeButtons = screen.getAllByRole("button", { name: "Xóa" });
    expect(removeButtons[0]).not.toHaveClass("hidden");
    await userEvent.click(removeButtons[1]);

    expect(
      screen.getAllByPlaceholderText("Vui lòng nhập chi tiết"),
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Xóa" })).toHaveClass("hidden");
  });

  it("skips the reload when the table is not mounted", async () => {
    mockEndpoint("post", "*/manager/upgrade-package", {});
    const { onClose, tableRef } = setup(null);

    await fillPackage();
    await submit();

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(tableRef.current).toBeNull();
  });

  it("shows the validation errors", async () => {
    const requests = mockEndpoint("post", "*/manager/upgrade-package", {});
    setup();

    await submit();

    expect(
      await screen.findByText("Vui lòng nhập tên gói"),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập bản tóm tắt")).toBeInTheDocument();
    expect(screen.getAllByText("Vui lòng chọn thời hạn")).toHaveLength(3);
    expect(
      screen.getByText("Vui lòng nhập chi tiết gói nâng cấp"),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("rejects an invalid amount and keeps the button disabled", async () => {
    const requests = mockEndpoint("post", "*/manager/upgrade-package", {});
    setup();

    await fillPackage({ price: "10500" });
    await submit();

    expect(await screen.findByText("Số tiền không hợp lệ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeDisabled();
    expect(requests).toHaveLength(0);
  });

  it("marks the name as taken on a 400 answer", async () => {
    mockEndpoint("post", "*/manager/upgrade-package", () =>
      HttpResponse.json({ statusCode: 400 }, { status: 400 }),
    );
    const { onClose } = setup();

    await fillPackage();
    await submit();

    expect(
      await screen.findByText("Tên gói này đã tồn tại"),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeEnabled();
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400 }),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("only reports other failures", async () => {
    mockEndpoint("post", "*/manager/upgrade-package", () =>
      HttpResponse.json({ statusCode: 500 }, { status: 500 }),
    );
    setup();

    await fillPackage();
    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(screen.queryByText("Tên gói này đã tồn tại")).toBeNull();
  });
});
