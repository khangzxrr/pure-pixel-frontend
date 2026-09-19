import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import UpgradeToPtgLayout from "./UpgradeToPtgLayout";

const getCurrentPackageMock = vi.hoisted(() => vi.fn());

vi.mock("../services/Keycloak", () => ({
  default: {
    getToken: () => undefined,
    getTokenParsed: () => undefined,
  },
}));

vi.mock("../apis/upgradePackageApi", () => ({
  default: {
    getCurrentPackage: (...args: unknown[]) => getCurrentPackageMock(...args),
  },
}));

vi.mock("../components/ComUpgrade/UpgradeNav", () => ({
  default: () => <div>upgrade nav</div>,
}));

vi.mock("../components/ComUpgrade/UpgradeIntroduce", () => ({
  default: ({ currentPackage }: { currentPackage?: { name?: string } }) => (
    <div>introduce {currentPackage?.name ?? "none"}</div>
  ),
}));

vi.mock("../components/ComUpgrade/UpgradePackageList", () => ({
  default: ({ currentPackage }: { currentPackage?: { name?: string } }) => (
    <div>packages {currentPackage?.name ?? "none"}</div>
  ),
}));

vi.mock("../components/ComUpgrade/UpgradePaymentModal", () => ({
  default: () => <div>payment modal</div>,
}));

vi.mock("../components/Firework/Firework", () => ({
  Firework: () => <div>firework</div>,
}));

describe("UpgradeToPtgLayout", () => {
  it("loads the current package and passes it to the upgrade sections", async () => {
    getCurrentPackageMock.mockResolvedValue({ name: "Premium" });

    renderWithProviders(<UpgradeToPtgLayout />);

    expect(screen.getByText("firework")).toBeInTheDocument();
    expect(screen.getByText("payment modal")).toBeInTheDocument();
    expect(screen.getByText("upgrade nav")).toBeInTheDocument();
    expect(screen.getByText("introduce none")).toBeInTheDocument();
    expect(await screen.findByText("introduce Premium")).toBeInTheDocument();
    expect(screen.getByText("packages Premium")).toBeInTheDocument();
    expect(getCurrentPackageMock).toHaveBeenCalledTimes(1);
  });
});
