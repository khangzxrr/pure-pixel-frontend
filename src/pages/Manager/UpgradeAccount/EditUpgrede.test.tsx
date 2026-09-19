import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import EditUpgrede from "./EditUpgrede";
import type { UpgradeRow } from "./TableUpgrade";

const keycloak = vi.hoisted(() => ({ rejection: undefined as unknown }));

vi.mock("../../../services/Keycloak", () => ({
  default: {
    // the request interceptor asks this first, so throwing rejects the request
    isLoggedIn: () => {
      if (keycloak.rejection) throw keycloak.rejection;
      return false;
    },
    getToken: () => undefined,
  },
}));

const pkg: UpgradeRow = {
  id: "up-1",
  name: "Nhiếp ảnh gia",
  price: 100000,
  description: [],
  descriptions: ["Bán ảnh"],
  summary: "Gói cơ bản",
  status: "DISABLED",
  minOrderMonth: 6,
  maxPhotoQuota: String(10 * 1073741824),
  maxPackageCount: "5",
};

const option = (text: string) =>
  screen.getByText(
    (_, element) =>
      !!element?.classList.contains("ant-select-item-option-content") &&
      element.textContent === text,
  );

const setup = () => {
  const onClose = vi.fn();
  const tableRef = vi.fn();
  renderWithProviders(
    <EditUpgrede selectedUpgrede={pkg} onClose={onClose} tableRef={tableRef} />,
  );
  return { onClose, tableRef };
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Cập nhật" }));

describe("EditUpgrede", () => {
  let consoleLog: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    keycloak.rejection = undefined;
    consoleLog.mockRestore();
  });

  it("shows the package with its quota in GB and saves it enabled", async () => {
    const requests = mockEndpoint("put", "*/manager/upgrade-package/:id", {});
    const { onClose, tableRef } = setup();

    expect(screen.getByPlaceholderText("Tên gói")).toHaveValue("Nhiếp ảnh gia");
    expect(
      screen.getByPlaceholderText("Vui lòng nhập dung lượng upload tối da"),
    ).toHaveValue("10");
    expect(screen.getByRole("spinbutton")).toHaveValue("100000");
    expect(screen.getByTitle("6 tháng")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(option("1 năm"));
    await submit();

    expect(
      await screen.findByText("Đã cập nhật thành công"),
    ).toBeInTheDocument();
    expect(requests[0].path).toBe("/manager/upgrade-package/up-1");
    expect(requests[0].json).toEqual({
      id: "up-1",
      name: "Nhiếp ảnh gia",
      price: 100000,
      description: [],
      descriptions: ["Bán ảnh"],
      summary: "Gói cơ bản",
      status: "ENABLED",
      minOrderMonth: 12,
      maxPhotoQuota: 10 * 1073741824,
      maxPackageCount: 5,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(tableRef).toHaveBeenCalledTimes(1));
  });

  it("adds and removes detail lines", async () => {
    setup();

    expect(screen.getByRole("button", { name: "Xóa" })).toHaveClass("hidden");
    await userEvent.click(
      screen.getByRole("button", { name: "Thêm Chi Tiết Gói" }),
    );
    expect(
      screen.getAllByPlaceholderText("Vui lòng nhập chi tiết"),
    ).toHaveLength(2);

    await userEvent.click(screen.getAllByRole("button", { name: "Xóa" })[0]);
    expect(
      screen.getAllByPlaceholderText("Vui lòng nhập chi tiết"),
    ).toHaveLength(1);
  });

  it("rejects an invalid amount", async () => {
    const requests = mockEndpoint("put", "*/manager/upgrade-package/:id", {});
    setup();

    const price = screen.getByRole("spinbutton");
    await userEvent.clear(price);
    await userEvent.type(price, "10500");
    await submit();

    expect(await screen.findByText("Số tiền không hợp lệ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeDisabled();
    expect(requests).toHaveLength(0);
  });

  it("reports a failed update", async () => {
    mockEndpoint("put", "*/manager/upgrade-package/:id", () =>
      HttpResponse.json({ statusCode: 400 }, { status: 400 }),
    );
    const { onClose, tableRef } = setup();

    await submit();

    expect(await screen.findByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(consoleLog).toHaveBeenCalledWith(
      111,
      expect.objectContaining({ status: 400 }),
    );
    // putData rejects with the axios error, so the 400 check never matches
    expect(screen.queryByText("Tên gói này đã tồn tại")).toBeNull();
    expect(screen.getByRole("button", { name: "Cập nhật" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
    expect(tableRef).not.toHaveBeenCalled();
  });

  it("marks the name as taken when the rejection carries a 400 body", async () => {
    // putData passes on whatever the request rejects with; axios errors never
    // carry `data` at the top level, so only a client-side rejection gets here
    keycloak.rejection = { data: { statusCode: 400 } };
    const { onClose } = setup();

    await submit();

    expect(
      await screen.findByText("Tên gói này đã tồn tại"),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng thử lại")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
