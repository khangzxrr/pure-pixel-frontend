import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import ComWalletAmountConverter from "./ComAmountConverter";

type Props = ComponentProps<typeof ComWalletAmountConverter>;

const base: Props = {
  amount: 100000,
  fee: 10000,
  type: "DEPOSIT",
  status: "SUCCESS",
  paymentMethod: "WALLET",
};

const renderAmount = (overrides: Partial<Props>) => {
  const { container } = render(
    <ComWalletAmountConverter {...base} {...overrides} />,
  );
  const span = container.querySelector("h1 > span");
  return { text: span?.textContent?.replace(/\s/g, " "), span };
};

describe("ComWalletAmountConverter", () => {
  it.each(["IMAGE_SELL", "DEPOSIT", "REFUND_FROM_BUY_IMAGE"] as const)(
    "shows successful %s as income minus the fee",
    (type) => {
      const { text, span } = renderAmount({ type });
      expect(text).toBe("+90.000 ₫");
      expect(span).toHaveClass("text-green-400");
    },
  );

  it.each([
    ["WITHDRAWAL", "WALLET"],
    ["IMAGE_BUY", "WALLET"],
    ["UPGRADE_TO_PHOTOGRAPHER", "WALLET"],
  ] as const)("shows successful %s paid by %s as spending", (type, method) => {
    const { text, span } = renderAmount({ type, paymentMethod: method });
    expect(text).toBe("-100.000 ₫");
    expect(span).toHaveClass("text-red-400");
  });

  it.each([
    ["UPGRADE_TO_PHOTOGRAPHER", "SEPAY"],
    ["IMAGE_BUY", "SEPAY"],
  ] as const)("shows %s paid by %s as neutral", (type, method) => {
    const { text, span } = renderAmount({ type, paymentMethod: method });
    expect(text).toBe("  100.000 ₫");
    expect(span).toHaveClass("text-gray-400");
  });

  it("shows zero amounts and failed transactions as neutral", () => {
    expect(renderAmount({ amount: 0 }).span).toHaveClass("text-gray-400");
    expect(renderAmount({ status: "FAILED" }).span).toHaveClass(
      "text-gray-400",
    );
  });

  it("shows pending transactions in yellow", () => {
    const { text, span } = renderAmount({ status: "PENDING" });
    expect(text).toBe("  100.000 ₫");
    expect(span).toHaveClass("text-yellow-400");
  });

  it("leaves non-numeric amounts blank", () => {
    const { text } = renderAmount({
      status: "PENDING",
      amount: "100" as unknown as number,
    });
    expect(text).toBe("  ");
  });
});
