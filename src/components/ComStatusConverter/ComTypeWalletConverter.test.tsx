import { render } from "@testing-library/react";
import ComTypeWalletConverter from "./ComTypeWalletConverter";

describe("ComTypeWalletConverter", () => {
  it.each([
    ["UPGRADE_TO_PHOTOGRAPHER", "Nâng cấp tài khoản"],
    ["DEPOSIT", "Nạp tiền"],
    ["IMAGE_BUY", "Mua ảnh"],
    ["IMAGE_SELL", "Bán ảnh"],
    ["WITHDRAWAL", "Rút tiền"],
    ["REFUND_FROM_BUY_IMAGE", "Hoàn tiền"],
  ] as const)("translates %s", (type, label) => {
    const { container } = render(
      <ComTypeWalletConverter>{type}</ComTypeWalletConverter>,
    );
    expect(container.querySelector("p")).toHaveTextContent(label);
  });

  it("shows unknown types as they are", () => {
    const { container } = render(
      <ComTypeWalletConverter>
        {"GIFT" as unknown as "DEPOSIT"}
      </ComTypeWalletConverter>,
    );
    expect(container).toHaveTextContent("GIFT");
  });
});
