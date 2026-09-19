import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import UpgradePackageList from "./UpgradePackageList";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({ authenticated: false }),
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => undefined,
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const packages = [
  {
    id: "pkg-basic",
    name: "Cơ bản",
    price: 10000,
    description: [],
    descriptions: ["2 gói dịch vụ"],
    summary: "Gói cơ bản",
    status: "ENABLED",
    minOrderMonth: 3,
    maxPhotoQuota: String(5 * 1024 ** 3),
    maxPackageCount: "2",
    _count: { upgradePackageHistories: 1 },
  },
  {
    id: "pkg-pro",
    name: "Pro",
    price: 20000,
    description: [],
    descriptions: ["10 gói dịch vụ"],
    summary: "Gói phổ biến",
    status: "ENABLED",
    minOrderMonth: 6,
    maxPhotoQuota: String(10 * 1024 ** 3),
    maxPackageCount: "10",
    _count: { upgradePackageHistories: 7 },
  },
  {
    id: "pkg-max",
    name: "Tối đa",
    price: 30000,
    description: [],
    descriptions: ["Không giới hạn"],
    summary: "Gói cao cấp",
    status: "ENABLED",
    minOrderMonth: 12,
    maxPhotoQuota: String(20 * 1024 ** 3),
    maxPackageCount: "20",
    _count: { upgradePackageHistories: 3 },
  },
];

describe("UpgradePackageList", () => {
  it("renders multiple package cards and highlights the most popular package", async () => {
    server.use(
      http.get("*/upgrade-package", () =>
        HttpResponse.json({
          objects: packages,
          totalPage: 1,
          totalRecord: packages.length,
        }),
      ),
      http.get("*/upgrade-order/upgrade-package/:id/fee", () =>
        HttpResponse.json({ remainPrice: 0 }),
      ),
    );

    renderWithProviders(<UpgradePackageList currentPackage={null} />);

    expect(await screen.findByText("Cơ bản")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Tối đa")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Đăng nhập để sử dụng gói" })).toHaveLength(3);

    const popularLabel = screen.getByText("Phổ biến nhất");
    const popularCard = popularLabel.closest("div.flex.flex-col");
    expect(popularCard).not.toBeNull();
    expect(within(popularCard! as HTMLElement).getByText("Pro")).toBeInTheDocument();
    expect(screen.getAllByText("10 gói dịch vụ").length).toBeGreaterThan(0);
    expect(screen.getByText("Không giới hạn")).toBeInTheDocument();
  });
});
