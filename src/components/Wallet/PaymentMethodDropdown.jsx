import { Dropdown } from "antd";
import React from "react";
const getMethodLabel = (status) => {
  switch (status) {
    case "":
      return <p className="text-sm text-white">Tất cả</p>;
    case "SEPAY":
      return <p className="text-sm text-blue-500">SEPAY</p>;
    case "WALLET":
      return <p className="text-sm text-blue-500">Ví</p>;
    default:
      return <p className="text-sm">Không xác định</p>;
  }
};

export default function PaymentMethodDropdown({
  paymentMethods,
  setPaymentMethods,
  setPage,
}) {
  const filterMethod = [
    {
      key: "1",
      label: (
        <div
          className={`${
            paymentMethods === ""
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setPaymentMethods("");
            setPage(1);
          }}
        >
          <p className="text-sm">Tất cả</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className={`${
            paymentMethods === "SEPAY"
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setPaymentMethods("SEPAY");
            setPage(1);
          }}
        >
          <p className="text-sm">SEPAY</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className={`${
            paymentMethods === "WALLET"
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setPaymentMethods("WALLET");
            setPage(1);
          }}
        >
          <p>Ví</p>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
      <p className="py-1">Thanh toán bằng</p>
      <Dropdown
        className="hover:cursor-pointer"
        trigger={["click"]}
        menu={{ items: filterMethod }}
      >
        <div className="border-[1px] px-2 py-1 rounded-md hover:bg-opacity-70 bg-[#1d1f22]">
          <div className="rounded transition-colors duration-300 ease-in-out w-full">
            {getMethodLabel(paymentMethods)}
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
