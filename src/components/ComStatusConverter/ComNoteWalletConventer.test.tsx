import { render } from "@testing-library/react";
import ComNoteWalletConverter from "./ComNoteWalletConventer";

describe("ComNoteWalletConverter", () => {
  it.each([
    ["UPGRADE_TO_PHOTOGRAPHER", 100, "Nâng gói"],
    ["UPGRADE_TO_PHOTOGRAPHER", 0, "Chuyển xuống gói thấp hơn"],
    ["IMAGE_SELL", 100, "Nhận được 90% giá trị bức ảnh"],
    ["WITHDRAWAL", 100, "Xử lý trong vòng 3 ngày"],
    [
      "REFUND_FROM_BUY_IMAGE",
      100,
      "Hoàn tiền từ thanh toán thất bại khi mua ảnh bằng thanh toán QR",
    ],
  ] as const)("describes %s (amount %s)", (type, amount, note) => {
    const { container } = render(
      <ComNoteWalletConverter type={type} amount={amount} />,
    );
    expect(container).toHaveTextContent(note);
  });

  it.each(["DEPOSIT", "IMAGE_BUY", undefined] as const)(
    "has no note for %s",
    (type) => {
      const { container } = render(
        <ComNoteWalletConverter type={type} amount={100} />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );
});
