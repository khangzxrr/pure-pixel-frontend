import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { http, HttpResponse } from "msw";
import SideDepositForm from "./SideDepositForm";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

describe("SideDepositForm", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("validates the amount and does not create a deposit outside the allowed range", async () => {
    const created = mockEndpoint("post", "*/wallet/deposit", {
      transactionId: "t1",
      paymentUrl: "https://pay.test/qr.png",
    });

    renderWithProviders(
      <SideDepositForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Nhập số tiền"), "9000");
    expect(
      screen.getByText("Số tiền nạp phải từ 10,000 đến 1,000,000 VND."),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    await userEvent.click(await screen.findByRole("button", { name: "Nạp" }));

    expect(created).toHaveLength(0);
    expect(
      screen.getByText("Số tiền nạp phải từ 10,000 đến 1,000,000 VND."),
    ).toBeInTheDocument();
  });

  it("creates a deposit, shows the QR code, polls the transaction, and can close the popconfirm", async () => {
    const createDeposit = mockEndpoint("post", "*/wallet/deposit", {
      transactionId: "t1",
      paymentUrl: "https://pay.test/qr.png",
    });
    const requests = mockEndpoint("get", "*/payment/transaction/t1", {
      id: "t1",
      status: "PENDING",
    });
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const user = userEvent.setup();

    const { container } = renderWithProviders(
      <SideDepositForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={vi.fn()}
      />,
    );

    await user.click(screen.getByText("50.000"));
    await user.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    expect(await screen.findByText("Xác nhận nạp tiền?")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn có chắc muốn nạp 50.000đ vào ví?"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(log).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    await user.click(await screen.findByRole("button", { name: "Nạp" }));

    expect(await screen.findByAltText("QRCode")).toHaveAttribute(
      "src",
      "https://pay.test/qr.png",
    );
    expect(
      screen.getByText("Quét mã QR để nạp 50.000đ vào ví"),
    ).toBeInTheDocument();
    expect(screen.getByText("Thời gian hiệu lực còn: 05:00")).toBeInTheDocument();
    expect(createDeposit[0].json).toEqual({ amount: 50000 });
    expect(requests[0].path).toBe("/payment/transaction/t1");

    const closeButton = container.querySelector("button");
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton as HTMLButtonElement);
    expect(screen.getByPlaceholderText("Nhập số tiền")).toBeInTheDocument();
  });

  it("shows a success notification and resets after a successful payment", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const setIsNavVisible = vi.fn();
    const user = userEvent.setup();

    mockEndpoint("post", "*/wallet/deposit", {
      transactionId: "t2",
      paymentUrl: "https://pay.test/success.png",
    });
    mockEndpoint("get", "*/payment/transaction/t2", {
      id: "t2",
      status: "SUCCESS",
    });

    renderWithProviders(
      <SideDepositForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={setIsNavVisible}
      />,
      { queryClient },
    );

    await user.click(screen.getByText("100.000"));
    await user.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    await user.click(await screen.findByRole("button", { name: "Nạp" }));

    expect(await screen.findByText("Thanh toán thành công!")).toBeInTheDocument();
    expect(await screen.findByText("Nạp tiền thành công")).toBeInTheDocument();
    expect(
      screen.getByText("Nạp thành công, vui lòng kiểm tra ví của bạn"),
    ).toBeInTheDocument();

    await waitFor(() => expect(setIsNavVisible).toHaveBeenCalledWith(false), {
      timeout: 4000,
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(4);
    expect(screen.queryByAltText("QRCode")).toBeNull();
  }, 8000);

  it("handles expired and failed deposit flows", async () => {
    const setIsNavVisible = vi.fn();
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    mockEndpoint("post", "*/wallet/deposit", {
      transactionId: "t3",
      paymentUrl: "https://pay.test/expired.png",
    });
    mockEndpoint("get", "*/payment/transaction/t3", {
      id: "t3",
      status: "EXPIRED",
    });

    renderWithProviders(
      <SideDepositForm
        sideNavRef={createRef<HTMLDivElement>()}
        isNavVisible
        setIsNavVisible={setIsNavVisible}
      />,
    );

    await user.click(screen.getByText("20.000"));
    await user.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    await user.click(await screen.findByRole("button", { name: "Nạp" }));

    expect(await screen.findByText("Mã QR quá hạn, vui lòng thử lại.")).toBeInTheDocument();
    expect(await screen.findByText("Mã QR hết hiệu lực")).toBeInTheDocument();
    expect(setIsNavVisible).toHaveBeenCalledWith(false);

    server.use(
      http.post("*/wallet/deposit", () => new HttpResponse(null, { status: 500 })),
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    await user.click(screen.getByText("10.000"));
    await user.click(screen.getByRole("button", { name: "Nạp vào ví" }));
    await user.click(await screen.findByRole("button", { name: "Nạp" }));

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith(
        "Error posting comment:",
        expect.anything(),
      ),
    );
  });
});
