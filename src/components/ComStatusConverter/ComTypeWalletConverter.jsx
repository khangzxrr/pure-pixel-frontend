import React from "react";

function ComTypeWalletConverter({ children }) {
  const convertStatus = (type) => {
    switch (type) {
      case "UPGRADE_TO_PHOTOGRAPHER":
        return <p className="">Nâng cấp tài khoản</p>;
      case "DEPOSIT":
        return <p className="">Nạp tiền</p>;
      case "IMAGE_BUY":
        return <p className="">Mua ảnh</p>;
      case "IMAGE_SELL":
        return <p className="">Bán ảnh</p>;
      case "WITHDRAWAL":
        return <p className="">Rút tiền</p>;
      default:
        return type; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convertStatus(children);

  return <>{translated}</>;
}

export default ComTypeWalletConverter;
