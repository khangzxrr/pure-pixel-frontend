import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TypesDropdown from "./TypesDropdown";
import { renderWithProviders } from "../../test/render";

describe("TypesDropdown", () => {
  it("renders every type label and updates the filter", async () => {
    const setTypes = vi.fn();
    const setPage = vi.fn();
    const { rerender, container } = renderWithProviders(
      <TypesDropdown types="" setTypes={setTypes} setPage={setPage} />,
    );
    const trigger = container.querySelector(".ant-dropdown-trigger");

    expect(screen.getAllByText("Tất cả")[0]).toBeInTheDocument();
    expect(trigger).not.toBeNull();

    const selections: Array<
      [string, "" | "UPGRADE_TO_PHOTOGRAPHER" | "DEPOSIT" | "IMAGE_BUY" | "IMAGE_SELL" | "WITHDRAWAL" | "REFUND_FROM_BUY_IMAGE"]
    > = [
      ["Nâng cấp tài khoản", "UPGRADE_TO_PHOTOGRAPHER"],
      ["Nạp tiền", "DEPOSIT"],
      ["Mua ảnh", "IMAGE_BUY"],
      ["Bán ảnh", "IMAGE_SELL"],
      ["Rút tiền", "WITHDRAWAL"],
      ["Hoàn tiền", "REFUND_FROM_BUY_IMAGE"],
      ["Xem tất cả", ""],
    ];

    for (const [label, value] of selections) {
      await userEvent.click(trigger as HTMLElement);
      const options = await screen.findAllByText(label);
      await userEvent.click(options[options.length - 1]);
      expect(setTypes).toHaveBeenLastCalledWith(value);
      expect(setPage).toHaveBeenLastCalledWith(1);
    }

    const labels: Array<[Parameters<typeof TypesDropdown>[0]["types"], string]> =
      [
        ["UPGRADE_TO_PHOTOGRAPHER", "Nâng cấp tài khoản"],
        ["DEPOSIT", "Nạp tiền"],
        ["IMAGE_BUY", "Mua ảnh"],
        ["IMAGE_SELL", "Bán ảnh"],
        ["WITHDRAWAL", "Rút tiền"],
        ["REFUND_FROM_BUY_IMAGE", "Hoàn tiền"],
      ];

    for (const [type, label] of labels) {
      rerender(
        <TypesDropdown types={type} setTypes={setTypes} setPage={setPage} />,
      );
      expect(screen.getAllByText(label)[0]).toBeInTheDocument();
    }
  });

  it("falls back to an unknown label for unsupported types", () => {
    renderWithProviders(
      <TypesDropdown
        types={"UNKNOWN" as never}
        setTypes={vi.fn()}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Không xác định")).toBeInTheDocument();
  });
});
