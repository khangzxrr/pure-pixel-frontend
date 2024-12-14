import React from "react";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
function ComWalletAmountConverter({
  amount,
  type,
  status,
  paymentMethod,
  fee,
}) {
  return (
    <h1>
      {status === "SUCCESS" &&
      amount !== 0 &&
      (type !== "UPGRADE_TO_PHOTOGRAPHER" || paymentMethod !== "SEPAY") &&
      (type !== "IMAGE_BUY" || paymentMethod === "WALLET") ? (
        type === "IMAGE_SELL" ||
        type === "DEPOSIT" ||
        type === "REFUND_FROM_BUY_IMAGE" ? (
          <span className="text-green-400">
            +{formatCurrency(amount - fee)}
          </span>
        ) : (
          <span className="text-red-400">-{formatCurrency(amount)}</span>
        )
      ) : status === "PENDING" ? (
        <span className="text-yellow-400">
          {"  "}
          {formatCurrency(amount)}
        </span>
      ) : (
        <span className="text-gray-400">
          {"  "}
          {formatCurrency(amount)}
        </span>
      )}
    </h1>
  );
}

export default ComWalletAmountConverter;
