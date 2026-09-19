import { render, screen } from "@testing-library/react";
import StorageBar from "./StorageBar";

describe("StorageBar", () => {
  it("shows the storage used, total and percentage in GB", () => {
    render(
      <StorageBar used={String(2 * 1024 ** 3)} total={String(10 * 1024 ** 3)} />,
    );

    expect(screen.getByText("2.000 GB")).toBeInTheDocument();
    expect(screen.getByText(/10\.000 GB/)).toBeInTheDocument();
    expect(screen.getByText("20.00%")).toBeInTheDocument();
    expect(screen.getByText("Còn lại: 8.00 GB")).toBeInTheDocument();
  });

  it("shows the package name, expiry and remaining days when a package is active", () => {
    render(
      <StorageBar
        used="0"
        total={String(5 * 1024 ** 3)}
        nameCurrentPackage="Premium"
        expiredAt="2025-01-01"
        remainingDays={10}
      />,
    );

    expect(screen.getByText("Gói Premium")).toBeInTheDocument();
    expect(screen.getByText("Ngày hết hạn: 2025-01-01")).toBeInTheDocument();
    expect(screen.getByText("(Còn lại 10 ngày)")).toBeInTheDocument();
  });

  it("hides the package header when there is no active package", () => {
    render(<StorageBar used="0" total="0" />);

    expect(screen.queryByText(/^Gói/)).not.toBeInTheDocument();
  });

  it("treats a zero total as 0% used instead of dividing by zero", () => {
    render(<StorageBar used="100" total="0" />);

    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });
});
