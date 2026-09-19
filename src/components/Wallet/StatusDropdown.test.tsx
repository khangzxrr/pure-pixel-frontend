import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatusDropdown from "./StatusDropdown";
import { renderWithProviders } from "../../test/render";

describe("StatusDropdown", () => {
  it("renders every status label and updates the filter", async () => {
    const setStatuses = vi.fn();
    const setPage = vi.fn();
    const { rerender, container } = renderWithProviders(
      <StatusDropdown
        statuses=""
        setStatuses={setStatuses}
        setPage={setPage}
      />,
    );
    const trigger = container.querySelector(".ant-dropdown-trigger");

    expect(screen.getAllByText("Tất cả")[0]).toBeInTheDocument();
    expect(trigger).not.toBeNull();

    const selections: Array<[string, "" | "SUCCESS" | "PENDING" | "CANCEL" | "FAILED" | "EXPIRED"]> =
      [
        ["✓ Thành công", "SUCCESS"],
        ["◔ Đang chờ", "PENDING"],
        ["x Bị hủy", "CANCEL"],
        ["Thất bại", "FAILED"],
        ["Hết hạn", "EXPIRED"],
        ["Tất cả", ""],
      ];

    for (const [label, value] of selections) {
      await userEvent.click(trigger as HTMLElement);
      const options = await screen.findAllByText(label);
      await userEvent.click(options[options.length - 1]);
      expect(setStatuses).toHaveBeenLastCalledWith(value);
      expect(setPage).toHaveBeenLastCalledWith(1);
    }

    const labels: Array<[Parameters<typeof StatusDropdown>[0]["statuses"], string]> =
      [
        ["SUCCESS", "✓ Thành công"],
        ["PENDING", "◔ Đang chờ"],
        ["CANCEL", "x Bị hủy"],
        ["FAILED", "x Thất bại"],
        ["EXPIRED", "Hết hạn"],
      ];

    for (const [status, label] of labels) {
      rerender(
        <StatusDropdown
          statuses={status}
          setStatuses={setStatuses}
          setPage={setPage}
        />,
      );
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    }
  });

  it("falls back to an unknown label for unsupported statuses", () => {
    renderWithProviders(
      <StatusDropdown
        statuses={"UNKNOWN" as never}
        setStatuses={vi.fn()}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Không xác định")).toBeInTheDocument();
  });
});
