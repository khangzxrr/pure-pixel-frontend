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
      //   case "IMAGE_SELL":
      //     return <p className="">Bán ảnh</p>;
      //   case "WITHDRAWAL":
      //     return <p className="">Rút tiền</p>;
      default:
        return "";
    }
  };

  const translated = convertStatus(type);

  return <>{translated}</>;
}

export default ComNoteWalletConverter;
