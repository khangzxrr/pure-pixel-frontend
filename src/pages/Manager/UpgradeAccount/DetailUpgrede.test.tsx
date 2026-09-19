import { render, screen } from "@testing-library/react";
import DetailUpgrede from "./DetailUpgrede";
import type { UpgradeRow } from "./TableUpgrade";

const pkg: UpgradeRow = {
  id: "up-1",
  name: "Nhiếp ảnh gia",
  price: 100000,
  description: [],
  descriptions: ["Bán ảnh", "Nhận lịch chụp"],
  summary: "Gói cơ bản",
  status: "ENABLED",
  minOrderMonth: 3,
  maxPhotoQuota: "10737418240",
  maxPackageCount: "5",
};

const cellAfter = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent;

describe("UpgradeAccount DetailUpgrede", () => {
  it("shows every field of the package", () => {
    render(<DetailUpgrede selectedUpgrede={pkg} />);

    expect(cellAfter("Tên gói:")).toBe("Nhiếp ảnh gia");
    expect(cellAfter("Thời hạn:")).toBe("3 tháng");
    expect(cellAfter("Số tiền:")).toMatch(/^100\.000\s₫$/);
    expect(cellAfter("Số lượng gói dịch vụ tối đa:")).toBe("5");
    expect(cellAfter("Max Photo Quota:")).toBe("10737418240");
    expect(cellAfter("Tóm tắt về gói:")).toBe("Gói cơ bản");
    expect(cellAfter("Chi tiết 1 của gói:")).toBe("Bán ảnh");
    expect(cellAfter("Chi tiết 2 của gói:")).toBe("Nhận lịch chụp");
  });

  it.each([
    [6, "6 tháng"],
    [12, "1 năm"],
  ])("names a %i month duration", (minOrderMonth, text) => {
    render(<DetailUpgrede selectedUpgrede={{ ...pkg, minOrderMonth }} />);
    expect(cellAfter("Thời hạn:")).toBe(text);
  });

  it("renders an empty selection", () => {
    render(<DetailUpgrede selectedUpgrede={{}} />);

    expect(cellAfter("Tên gói:")).toBe("");
    expect(cellAfter("Số tiền:")).toBe("");
    expect(screen.queryByText(/Chi tiết 1/)).toBeNull();
  });
});
