import React from "react";

function ComNoteWalletConverter({ type, amount }) {
  const convertStatus = (type) => {
    switch (type) {
      case "UPGRADE_TO_PHOTOGRAPHER":
        return amount > 0 ? (
          <p className="">Nâng gói</p>
        ) : (
          <p className="">Chuyển xuống gói thấp hơn</p>
        );
      //   case "DEPOSIT":
      //     return <p className="">Nạp tiền</p>;
      //   case "IMAGE_BUY":
      //     return <p className="">Mua ảnh</p>;
      case "IMAGE_SELL":
        return <p className="">Nhận được 90% giá trị bức ảnh</p>;
      case "WITHDRAWAL":
        return <p className="">Xử lý trong vòng 3 ngày</p>;
      default:
        return "";
    }
  };

  const translated = convertStatus(type);

  return <>{translated}</>;
}

export default ComNoteWalletConverter;
