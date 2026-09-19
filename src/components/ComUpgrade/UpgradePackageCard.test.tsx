import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import UpgradePackageCard, {
  type CurrentUpgradePackage,
  type UpgradePackageItem,
} from "./UpgradePackageCard";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import useModalStore from "../../states/UseModalStore";

const auth = vi.hoisted(() => ({
  userData: undefined as Record<string, unknown> | undefined,
  login: vi.fn(),
}));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: { login: auth.login },
    initialized: true,
  }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => auth.userData,
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const defaultModalState = useModalStore.getState();

const basePackage: UpgradePackageItem = {
  id: "pkg-pro",
  name: "Gói Pro",
  price: 100000,
  description: [],
  descriptions: ["Không giới hạn ảnh"],
  summary: "Gói nâng cấp",
  status: "ENABLED",
  minOrderMonth: 6,
  maxPackageCount: "10",
  maxPhotoQuota: String(20 * 1024 ** 3),
  totalMonths: 6,
};

const makeCurrentPackage = (
  overrides: Partial<CurrentUpgradePackage> = {},
): CurrentUpgradePackage => ({
  id: "order-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiredAt: new Date().toISOString(),
  status: "ACTIVE",
  serviceTransaction: {
    id: "service-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transaction: {
      id: "transaction-1",
      paymentPayload: {},
      paymentMethod: "WALLET",
      type: "UPGRADE_TO_PHOTOGRAPHER",
      status: "SUCCESS",
      amount: 0,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
    },
  },
  upgradePackageHistory: {
    id: "history-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: "Current",
    price: 50000,
    minOrderMonth: 6,
    maxPhotoQuota: String(5 * 1024 ** 3),
    maxPackageCount: "2",
    summary: "Current package",
    descriptions: ["Current"],
    originalUpgradePackage: {
      id: "pkg-current",
      name: "Current",
      price: 50000,
      description: [],
      summary: "Current",
      status: "ENABLED",
      minOrderMonth: 6,
      maxPhotoQuota: String(5 * 1024 ** 3),
      maxPackageCount: "2",
    },
    originalUpgradePackageId: "pkg-current",
  },
  ...overrides,
});

describe("UpgradePackageCard", () => {
  beforeEach(() => {
    auth.userData = undefined;
    auth.login.mockReset();
    useModalStore.setState({
      ...defaultModalState,
      isUpgradePaymentModal: false,
      selectedUpgradePackage: {},
    });
  });

  afterEach(() => {
    useModalStore.setState(defaultModalState);
  });

  it("asks unauthenticated users to log in and shows a free transfer", async () => {
    mockEndpoint("get", "*/upgrade-order/upgrade-package/:id/fee", {
      remainPrice: 0,
    });
    renderWithProviders(<UpgradePackageCard packageItem={basePackage} />);

    expect(await screen.findByText("Miễn phí")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập để sử dụng gói" }));

    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it("marks the current package", async () => {
    auth.userData = { sub: "user-1" };
    mockEndpoint("get", "*/upgrade-order/upgrade-package/:id/fee", {
      remainPrice: 0,
    });
    renderWithProviders(
      <UpgradePackageCard
        packageItem={basePackage}
        currentPackage={makeCurrentPackage({
          upgradePackageHistory: {
            ...makeCurrentPackage().upgradePackageHistory,
            originalUpgradePackageId: "pkg-pro",
            price: 100000,
          },
        })}
      />,
    );

    expect(await screen.findByText("Gói hiện tại của bạn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nâng cấp" })).toBeNull();
  });

  it("shows transfer pricing, the discount strikethrough, and opens the payment modal", async () => {
    auth.userData = { sub: "user-1" };
    mockEndpoint("get", "*/upgrade-order/upgrade-package/:id/fee", {
      remainPrice: 120000,
    });
    const currentPackage = makeCurrentPackage();

    const { container } = renderWithProviders(
      <UpgradePackageCard
        packageItem={basePackage}
        currentPackage={currentPackage}
        popularPackageId="pkg-pro"
      />,
    );

    expect(await screen.findByText("Phổ biến nhất")).toBeInTheDocument();
    await waitFor(() => expect(container).toHaveTextContent("120.000đ"));
    expect(container.querySelector("s")).toHaveTextContent("600.000đ");

    await userEvent.click(screen.getByRole("button", { name: "Nâng cấp" }));

    await waitFor(() => {
      const modalState = useModalStore.getState();
      expect(modalState.isUpgradePaymentModal).toBe(true);
      expect(modalState.selectedUpgradePackage).toMatchObject({
        id: "pkg-pro",
        name: "Gói Pro",
        migratePrice: 120000,
        minOrderMonth: 6,
        maxPackageCount: "10",
        maxPhotoQuota: String(20 * 1024 ** 3),
      });
    });
  });

  it("hides the upgrade action for lower-or-equal packages", async () => {
    auth.userData = { sub: "user-1" };
    mockEndpoint("get", "*/upgrade-order/upgrade-package/:id/fee", {
      remainPrice: 0,
    });
    renderWithProviders(
      <UpgradePackageCard
        packageItem={basePackage}
        currentPackage={makeCurrentPackage({
          upgradePackageHistory: {
            ...makeCurrentPackage().upgradePackageHistory,
            originalUpgradePackageId: "pkg-other",
            price: 200000,
          },
        })}
      />,
    );

    await screen.findByText("Miễn phí");
    expect(screen.queryByRole("button", { name: "Nâng cấp" })).toBeNull();
  });
});
