import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import UpgradePaymentModal from "./UpgradePaymentModal";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import useModalStore from "../../states/UseModalStore";
import useFireworkStore from "../../states/UseFireworkStore";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const auth = vi.hoisted(() => ({
  keycloak: null as Awaited<ReturnType<typeof import("../../test/keycloak")["createKeycloakMock"]>> | null,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: auth.keycloak ?? createKeycloakMock(),
      initialized: true,
    }),
  };
});

const defaultModalState = useModalStore.getState();
const defaultFireworkState = useFireworkStore.getState();

const selectedPackage = {
  id: "pkg-pro",
  name: "Gói Pro",
  migratePrice: 150000,
  minOrderMonth: 6,
  maxPackageCount: "10",
  maxPhotoQuota: String(20 * 1024 ** 3),
};

const renderModal = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<UpgradePaymentModal />} />
      <Route path="/profile/wallet" element={<div>wallet-page</div>} />
    </Routes>,
  );

const openModal = (
  overrides: Partial<typeof selectedPackage & { transactionId: string; mockQrCode: string }> = {},
) => {
  useModalStore.setState({
    ...defaultModalState,
    isUpgradePaymentModal: true,
    selectedUpgradePackage: {
      ...selectedPackage,
      ...overrides,
    },
  });
};

describe("UpgradePaymentModal", () => {
  beforeEach(async () => {
    const { createKeycloakMock } = await import("../../test/keycloak");
    auth.keycloak = createKeycloakMock();
    useModalStore.setState({
      ...defaultModalState,
      isUpgradePaymentModal: false,
      selectedUpgradePackage: {},
      setIsUpgradePaymentModal: defaultModalState.setIsUpgradePaymentModal,
      setSelectedUpgradePackage: defaultModalState.setSelectedUpgradePackage,
    });
    useFireworkStore.setState(defaultFireworkState);
    vi.useRealTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    useModalStore.setState({
      ...defaultModalState,
      setIsUpgradePaymentModal: defaultModalState.setIsUpgradePaymentModal,
      setSelectedUpgradePackage: defaultModalState.setSelectedUpgradePackage,
    });
    useFireworkStore.setState(defaultFireworkState);
  });

  it("does not render when the modal is closed", () => {
    renderModal();

    expect(screen.queryByText("Hóa đơn")).toBeNull();
  });

  it("submits wallet payments and navigates after success", async () => {
    openModal();
    const requests = mockEndpoint("post", "*/upgrade-order", {
      serviceTransaction: { transaction: { id: "tx-wallet" } },
    });

    renderModal();

    expect(await screen.findByText("Hóa đơn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Thanh toán bằng ví/i }));
    const confirmButton = screen.getByRole("button", { name: "Xác nhận thanh toán" });
    await userEvent.click(confirmButton);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].json).toEqual({
      paymentMethod: "WALLET",
      acceptTransfer: true,
      acceptRemovePendingUpgradeOrder: true,
      upgradePackageId: "pkg-pro",
      totalMonths: 6,
    });

    expect(await screen.findByText("wallet-page", {}, { timeout: 4000 })).toBeInTheDocument();
    expect(auth.keycloak?.updateToken).toHaveBeenCalled();
  }, 7000);

  it("toggles payment methods and renders the QR code flow for SEPAY", async () => {
    openModal();
    mockEndpoint("post", "*/upgrade-order", {
      paymentUrl: "https://img.test/qr-code.png",
      serviceTransaction: { transaction: { id: "tx-sepay" } },
    });
    mockEndpoint("get", "*/payment/transaction/:id", {
      id: "tx-sepay",
      paymentPayload: {},
      paymentMethod: "SEPAY",
      type: "UPGRADE_TO_PHOTOGRAPHER",
      status: "PENDING",
      amount: 150000,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
    });

    renderModal();

    expect(await screen.findByText("Chọn phương thức thanh toán:")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Thanh toán bằng mã QR/i }));
    expect(screen.getByRole("button", { name: "Lấy mã QR" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Lấy mã QR" }));

    expect(await screen.findByAltText("QR Code")).toHaveAttribute(
      "src",
      "https://img.test/qr-code.png",
    );
    expect(screen.getByText("Đang chờ thanh toán...")).toBeInTheDocument();
    expect(screen.getByText(/Thời gian hiệu lực còn:/)).toBeInTheDocument();
  });

  it.each([
    ["UserHasActivatedUpgradePackage", "Hiện tại bạn đã có gói nâng cấp đang hoạt động."],
    ["NotEnoughBalanceException", "Số dư không đủ để thực hiện giao dịch."],
    ["CannotTransferToTheSameUpgradePackage", "Không thể chuyển thành gói nâng cấp hiện tại."],
    ["CannotDowngradeOrderException", "Không thể xuống thành gói nâng cấp thấp hơn."],
    ["UnknownError", "Đã xảy ra lỗi, vui lòng thử lại sau."],
  ])(
    "shows the mapped error notification for %s",
    async (messageCode, expectedMessage) => {
      openModal();
      mockEndpoint("post", "*/upgrade-order", () =>
        HttpResponse.json({ message: messageCode }, { status: 400 }),
      );

      renderModal();

      await userEvent.click(await screen.findByRole("button", { name: /Thanh toán bằng ví/i }));
      const confirmButton = screen.getByRole("button", { name: "Xác nhận thanh toán" });
      await userEvent.click(confirmButton);

      expect(
        await screen.findByText("Nâng cấp gói thất bại", {
          selector: ".ant-notification-notice-message",
        }),
      ).toBeInTheDocument();
      expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
      await waitFor(() => expect(confirmButton).not.toBeDisabled());
    },
  );

  it("renders the failed transaction message", async () => {
    openModal({ transactionId: "tx-failed", mockQrCode: "https://img.test/failed-qr.png" });
    mockEndpoint("get", "*/payment/transaction/:id", {
      id: "tx-failed",
      paymentPayload: {},
      paymentMethod: "SEPAY",
      type: "UPGRADE_TO_PHOTOGRAPHER",
      status: "FAILED",
      amount: 150000,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
    });

    renderModal();

    expect(
      await screen.findByText("Thanh toán thất bại, vui lòng thử lại."),
    ).toBeInTheDocument();
  });

  it("renders the success transaction message and refreshes the token on polling", async () => {
    openModal({ transactionId: "tx-success", mockQrCode: "https://img.test/success-qr.png" });
    mockEndpoint("get", "*/payment/transaction/:id", {
      id: "tx-success",
      paymentPayload: {},
      paymentMethod: "SEPAY",
      type: "UPGRADE_TO_PHOTOGRAPHER",
      status: "SUCCESS",
      amount: 150000,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
    });

    renderModal();

    expect(await screen.findByText("Thanh toán thành công!")).toBeInTheDocument();
    await waitFor(() => expect(auth.keycloak?.updateToken).toHaveBeenCalled(), {
      timeout: 4000,
    });
  }, 7000);

  it("renders the expired transaction message and shows the expiration notification", async () => {
    const closeSpy = vi.fn();
    openModal({ transactionId: "tx-expired", mockQrCode: "https://img.test/expired-qr.png" });
    useModalStore.setState({ setIsUpgradePaymentModal: closeSpy });
    mockEndpoint("get", "*/payment/transaction/*", {
      id: "tx-expired",
      paymentPayload: {},
      paymentMethod: "SEPAY",
      type: "UPGRADE_TO_PHOTOGRAPHER",
      status: "EXPIRED",
      amount: 150000,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
    });

    renderModal();

    expect(await screen.findByText("Mã QR quá hạn, vui lòng thử lại.")).toBeInTheDocument();
    expect(await screen.findByText("Mã QR hết hiệu lực")).toBeInTheDocument();
    expect(closeSpy).toHaveBeenCalledWith(false);
  });
});
