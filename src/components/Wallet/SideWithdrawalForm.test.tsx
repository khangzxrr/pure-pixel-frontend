import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { HttpResponse } from "msw";
import { message } from "antd";
import SideWithdrawalForm from "./SideWithdrawalForm";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

const option = (text: string) =>
  screen.getByText(
    (_, element) =>
      !!element?.classList.contains("ant-select-item-option-content") &&
      element.textContent === text,
  );

describe("SideWithdrawalForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads banks, submits a withdrawal request, and closes the side form", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const setIsNavVisible = vi.fn();
    const withdrawal = mockEndpoint("post", "*/wallet/withdrawal", {
      transactionId: "t1",
    });
    const banks = mockEndpoint("get", "https://api.vietqr.io/v2/banks", {
      data: [{ name: "Vietcombank" }, { name: "ACB" }],
    });

    const { container } = renderWithProviders(
      <SideWithdrawalForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={setIsNavVisible}
        balance={200000}
      />,
      { queryClient },
    );

    await screen.findByText("Rút tiền");
    expect(banks[0].path).toBe("/v2/banks");

    await userEvent.type(screen.getByPlaceholderText("Nhập giá"), "120000");
    await userEvent.type(
      screen.getByPlaceholderText("Nhập số tài khoản"),
      "0123456789",
    );
    const select = container.querySelector(".ant-select-selector");
    expect(select).not.toBeNull();
    await userEvent.click(select as HTMLElement);
    await userEvent.click(option("Vietcombank"));
    await userEvent.type(
      screen.getByPlaceholderText("Nhập tên người nhận"),
      "NGUYEN VAN A",
    );

    await userEvent.click(screen.getByText("Yêu cầu rút"));
    expect(await screen.findByText("Xác nhận rút tiền?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Rút" }));

    expect(await screen.findByText("Yêu cầu rút tiền thành công")).toBeInTheDocument();
    expect(withdrawal[0].json).toEqual({
      amount: 120000,
      bankNumber: "0123456789",
      bankName: "Vietcombank",
      bankUsername: "NGUYEN VAN A",
    });
    expect(setIsNavVisible).toHaveBeenCalledWith(false);
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });

  it("shows validation errors and keeps outside clicks inside the bank dropdown from closing the form", async () => {
    const setIsNavVisible = vi.fn();
    mockEndpoint("get", "https://api.vietqr.io/v2/banks", {
      data: [{ name: "Vietcombank" }],
    });

    const { container } = renderWithProviders(
      <SideWithdrawalForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={setIsNavVisible}
        balance={50000}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Nhập giá"), "9000");
    await userEvent.type(screen.getByPlaceholderText("Nhập số tài khoản"), "abc");
    await userEvent.tab();
    await userEvent.type(
      screen.getByPlaceholderText("Nhập tên người nhận"),
      "NGUYEN VAN A",
    );

    expect(
      await screen.findByText("Số tiền rút phải lớn hơn 10,000 VND"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Số tài khoản ngân hàng phải là số"),
    ).toBeInTheDocument();

    const select = container.querySelector(".ant-select-selector");
    expect(select).not.toBeNull();
    await userEvent.click(select as HTMLElement);
    const dropdown = option("Vietcombank").closest(".ant-select-dropdown");
    expect(dropdown).not.toBeNull();

    fireEvent.mouseDown(option("Vietcombank"));
    expect(setIsNavVisible).not.toHaveBeenCalled();

    fireEvent.mouseDown(document.body);
    expect(setIsNavVisible).toHaveBeenCalledWith(false);
  });

  it("maps backend withdrawal errors to user-facing notifications", async () => {
    mockEndpoint("get", "https://api.vietqr.io/v2/banks", {
      data: [{ name: "Vietcombank" }],
    });
    mockEndpoint("post", "*/wallet/withdrawal", () =>
      HttpResponse.json(
        { message: "ExistPendingWithdrawalException" },
        { status: 400 },
      ),
    );

    const { container } = renderWithProviders(
      <SideWithdrawalForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={vi.fn()}
        balance={200000}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Nhập giá"), "120000");
    await userEvent.type(
      screen.getByPlaceholderText("Nhập số tài khoản"),
      "0123456789",
    );
    const select = container.querySelector(".ant-select-selector");
    expect(select).not.toBeNull();
    await userEvent.click(select as HTMLElement);
    await userEvent.click(option("Vietcombank"));
    await userEvent.type(
      screen.getByPlaceholderText("Nhập tên người nhận"),
      "NGUYEN VAN A",
    );

    await userEvent.click(screen.getByText("Yêu cầu rút"));
    await userEvent.click(await screen.findByRole("button", { name: "Rút" }));

    expect(
      await screen.findByText("Yêu cầu rút tiền thất bại"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bạn đã có yêu cầu rút tiền đang chờ xử lý"),
    ).toBeInTheDocument();
  });

  it("logs a failed bank list request", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    const success = vi
      .spyOn(message, "success")
      .mockImplementation((() => undefined) as unknown as typeof message.success);

    mockEndpoint("get", "https://api.vietqr.io/v2/banks", () =>
      HttpResponse.json({}, { status: 500 }),
    );

    renderWithProviders(
      <SideWithdrawalForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={vi.fn()}
        balance={200000}
      />,
    );

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith(
        "Error fetching bank list:",
        expect.anything(),
      ),
    );
    expect(success).not.toHaveBeenCalled();
  });
});
