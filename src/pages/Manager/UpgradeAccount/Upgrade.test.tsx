import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "antd";
import { act } from "react";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import Upgrade from "./Upgrade";
import type { UpgradeRow } from "./TableUpgrade";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const GB = 1073741824;

const packages: UpgradeRow[] = [
  {
    id: "up-1",
    name: "Nhiếp ảnh gia",
    price: 100000,
    description: [],
    descriptions: ["Bán ảnh", "Nhận lịch chụp"],
    summary: "Gói cơ bản",
    status: "ENABLED",
    minOrderMonth: 6,
    maxPhotoQuota: String(10 * GB),
    maxPackageCount: "5",
  },
  {
    id: "up-2",
    name: "Chuyên gia",
    price: 50000,
    description: [],
    descriptions: ["Không giới hạn"],
    summary: "Gói nâng cao",
    status: "ENABLED",
    minOrderMonth: 12,
    maxPhotoQuota: String(20 * GB),
    maxPackageCount: "2",
  },
];

const mockList = () =>
  mockEndpoint("get", "*/upgrade-package", {
    objects: packages,
    totalPage: 1,
    totalRecord: packages.length,
  });

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest("tr");
  if (!row) throw new Error(`no row for ${text}`);
  return row;
};

const namesInOrder = () =>
  screen
    .getAllByRole("row")
    .map((row) => row.querySelector("td")?.textContent)
    .filter(Boolean);

const chooseAction = async (rowText: string, action: string) => {
  await userEvent.click(
    within(rowOf(rowText)).getByRole("button", { name: "ellipsis" }),
  );
  await userEvent.click(await screen.findByText(action));
};

const option = (text: string) =>
  screen.getByText(
    (_, element) =>
      !!element?.classList.contains("ant-select-item-option-content") &&
      element.textContent === text,
  );

describe("Upgrade", () => {
  let consoleError: MockInstance<typeof console.error>;
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => Modal.destroyAll());
    // antd warns about the deprecated Dropdown/Menu APIs the shared menu uses
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter(
        (message) =>
          !message.includes("deprecated") &&
          !message.includes("Error fetching items:"),
      );
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });

  it("lists the packages with price, quota and details", async () => {
    const requests = mockList();
    renderWithProviders(<Upgrade />);

    expect(await screen.findByText("Nhiếp ảnh gia")).toBeInTheDocument();
    expect(requests[0].query).toEqual({ limit: "9999", page: "0" });
    const row = rowOf("Nhiếp ảnh gia");
    expect(within(row).getByText(/^100\.000\s₫$/)).toBeInTheDocument();
    expect(within(row).getByText("10GB")).toBeInTheDocument();
    expect(within(row).getByText("5")).toBeInTheDocument();
    expect(within(row).getByText("Gói cơ bản")).toBeInTheDocument();
    expect(within(row).getByText("Bán ảnh")).toBeInTheDocument();
    expect(within(row).getByText("Nhận lịch chụp")).toBeInTheDocument();
  });

  it("sorts by each sortable column", async () => {
    mockList();
    renderWithProviders(<Upgrade />);
    await screen.findByText("Nhiếp ảnh gia");

    await userEvent.click(screen.getByText("Tên gói"));
    expect(namesInOrder()).toEqual(["Chuyên gia", "Nhiếp ảnh gia"]);
    await userEvent.click(screen.getByText("Dung lượng upload tối da"));
    expect(namesInOrder()).toEqual(["Nhiếp ảnh gia", "Chuyên gia"]);
    await userEvent.click(screen.getByText("Giá Tiền"));
    expect(namesInOrder()).toEqual(["Chuyên gia", "Nhiếp ảnh gia"]);
    await userEvent.click(screen.getByText("Số lượng gói dịch vụ tối đa"));
    expect(namesInOrder()).toEqual(["Chuyên gia", "Nhiếp ảnh gia"]);
    await userEvent.click(screen.getByText("Thông tin tóm tắt"));
    expect(namesInOrder()).toEqual(["Chuyên gia", "Nhiếp ảnh gia"]);
  });

  it("reloads on refresh and logs a failed load", async () => {
    const requests = mockList();
    renderWithProviders(<Upgrade />);
    await screen.findByText("Nhiếp ảnh gia");

    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() => expect(requests).toHaveLength(2));

    mockEndpoint("get", "*/upgrade-package", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    await userEvent.click(screen.getByTitle("Làm mới"));
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching items:",
        expect.anything(),
      ),
    );
  });

  it("shows the details of a package", async () => {
    mockList();
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await chooseAction("Chuyên gia", "Chi tiết");
    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText("Chi tiết gói Nâng cấp"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("1 năm")).toBeInTheDocument();
    expect(within(dialog).getByText("Không giới hạn")).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("edits a package and reloads the list", async () => {
    const requests = mockList();
    const updated = mockEndpoint("put", "*/manager/upgrade-package/:id", {});
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await chooseAction("Chuyên gia", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByPlaceholderText("Tên gói")).toHaveValue(
      "Chuyên gia",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cập nhật" }),
    );

    expect(
      await screen.findByText("Đã cập nhật thành công"),
    ).toBeInTheDocument();
    expect(updated[0].path).toBe("/manager/upgrade-package/up-2");
    expect(updated[0].json).toMatchObject({
      maxPhotoQuota: 20 * GB,
      status: "ENABLED",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("closes the edit modal", async () => {
    mockList();
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await chooseAction("Chuyên gia", "Cập nhật chỉnh sửa");
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("deletes a package after confirmation", async () => {
    const requests = mockList();
    const deleted = mockEndpoint("delete", "*/manager/upgrade-package/:id", {});
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await chooseAction("Chuyên gia", "Xóa");
    expect(
      await screen.findByText("Bạn có chắc chắn muốn xóa?"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Đã thành công")).toBeInTheDocument();
    expect(deleted[0].path).toBe("/manager/upgrade-package/up-2");
    await waitFor(() => expect(requests).toHaveLength(2));
  });

  it("reports a failed deletion", async () => {
    const requests = mockList();
    mockEndpoint("delete", "*/manager/upgrade-package/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await chooseAction("Chuyên gia", "Xóa");
    await userEvent.click(await screen.findByRole("button", { name: "Xóa" }));

    expect(
      await screen.findByText("Lỗi", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it("creates a package from the modal and reloads the list", async () => {
    const requests = mockList();
    const created = mockEndpoint("post", "*/manager/upgrade-package", {});
    renderWithProviders(<Upgrade />);
    await screen.findByText("Chuyên gia");

    await userEvent.click(
      screen.getByRole("button", { name: "+ Tạo mới gói" }),
    );
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(
      within(dialog).getByPlaceholderText("Tên gói"),
      "Studio",
    );
    await userEvent.click(within(dialog).getByRole("combobox"));
    await userEvent.click(option("3 tháng"));
    await userEvent.type(within(dialog).getByRole("spinbutton"), "300000");
    await userEvent.type(
      within(dialog).getByPlaceholderText(
        "Vui lòng nhập dung lượng upload tối da",
      ),
      "50",
    );
    await userEvent.type(
      within(dialog).getByPlaceholderText(
        "Vui lòng nhập số lượng gói dịch vụ tối đa",
      ),
      "10",
    );
    await userEvent.type(
      within(dialog).getByPlaceholderText("Vui lòng nhập bản tóm tắt"),
      "Cho studio",
    );
    const detail = within(dialog).getByPlaceholderText(
      "Vui lòng nhập chi tiết",
    );
    await userEvent.clear(detail);
    await userEvent.type(detail, "Tất cả");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Tạo mới" }),
    );

    expect(await screen.findByText("Đã tạo thành công")).toBeInTheDocument();
    expect(created[0].json).toMatchObject({
      name: "Studio",
      minOrderMonth: 3,
      maxPhotoQuota: 50 * GB,
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(requests).toHaveLength(2));
    // fills the whole modal form; slower than the default 5s when the suite runs in parallel
  }, 15000);
});
