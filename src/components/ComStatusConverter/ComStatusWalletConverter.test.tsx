import { render } from "@testing-library/react";
import ComStatusWalletConverter from "./ComStatusWalletConverter";

describe("ComStatusWalletConverter", () => {
  it.each([
    ["SUCCESS", "✓ Thành công", "text-green-500"],
    ["PENDING", "◔ Đang chờ", "text-yellow-600"],
    ["CANCEL", "x Đã hủy", "text-red-600"],
    ["FAILED", "x Thất bại", "text-red-500"],
    ["EXPIRED", "Hết hạn", "text-gray-100"],
  ] as const)("translates %s", (status, label, className) => {
    const { container } = render(
      <ComStatusWalletConverter>{status}</ComStatusWalletConverter>,
    );
    expect(container.querySelector("p")).toHaveTextContent(label);
    expect(container.querySelector("p")).toHaveClass(className);
  });

  it("shows unknown statuses as they are", () => {
    const { container, rerender } = render(
      <ComStatusWalletConverter>
        {"REVERSED" as unknown as "SUCCESS"}
      </ComStatusWalletConverter>,
    );
    expect(container).toHaveTextContent("REVERSED");

    rerender(<ComStatusWalletConverter />);
    expect(container).toBeEmptyDOMElement();
  });
});
