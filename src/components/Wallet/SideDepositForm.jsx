import { useMutation } from "@tanstack/react-query";
import { Popconfirm, Spin, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CiLogout } from "react-icons/ci";
import Wallet from "../../pages/UserProfile/Wallet";
import { WalletApi } from "../../apis/Wallet";

const formatNumber = (number) => {
  return new Intl.NumberFormat("de-DE").format(number);
};

export default function SideDepositForm({
  sideNavRef,
  isNavVisible,
  setIsNavVisible,
}) {
  const [deposit, setDeposit] = useState("");
  const [formattedDeposit, setFormattedDeposit] = useState("");
  const [selectDeposit, setSelectDeposit] = useState();
  const [QRCode, setQRCode] = useState();
  const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
  const selectDepositList = [
    10000, 20000, 50000, 70000, 100000, 200000, 500000, 1000000,
  ];

  const handleDepositChange = (e) => {
    const value = e.target.value.replace(/\./g, ""); // Remove existing dots
    const isNumeric = /^\d*$/.test(value);

    if (isNumeric) {
      setDeposit(value);
      setFormattedDeposit(formatNumber(value));
    }
  };

  const handleSelectDeposit = (item, index) => {
    setDeposit(item);
    setFormattedDeposit(formatNumber(item));
    setSelectDeposit(index);
  };

  const confirm = (e) => {
    if (deposit < 10000) {
      return;
    } else {
      createDeposit.mutate(deposit);
    }
  };

  const cancel = (e) => {
    console.log(e);
  };

  const closeNav = () => {
    setIsNavVisible(false);
  };
  const createDeposit = useMutation({
    mutationFn: (amount) => WalletApi.createDeposit({ amount: amount }),
    onSuccess: (data) => {
      console.log(data);
      setQRCode(data.testQRCode);
      setIsQRCodeVisible(true);
      setDeposit("");
      setSelectDeposit("");
    },
    onProgress: () => {
      console.log("Loading...");
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideNavRef.current && !sideNavRef.current.contains(event.target)) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sideNavRef]);
  console.log("SideDepositForm", createDeposit.isLoading, QRCode);

  return (
    <div
      ref={sideNavRef}
      className={`fixed bottom-0 right-0 w-2/3 lg:w-1/3 h-full bg-[#2a2c32] rounded-md shadow-lg transition-transform transform z-50 ${
        isNavVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-5">
        {!isQRCodeVisible ? (
          <div>
            <div className="flex">
              <Tooltip title="Đóng">
                <button onClick={closeNav}>
                  <CiLogout size={24} className="text-red-500" />
                </button>
              </Tooltip>
              <p className="text-[#dddddd] ml-4">Nạp tiền</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-[#dddddd]">Chọn số tiền muốn nạp</p>
            </div>
            <div className="mt-4 flex mb-4">
              <input
                value={formattedDeposit}
                type="text"
                className="w-2/3 bg-[#32353b] p-2 rounded-lg text-[#dddddd]"
                placeholder="Nhập số tiền"
                onChange={handleDepositChange}
              />
              <p className="p-2">VND</p>
            </div>
            {selectDepositList.map((item, index) => (
              <button
                key={index}
                className={`m-2 px-2 py-1 rounded-md bg-blue-100 text-blue-500 ${
                  selectDeposit === index ? "bg-blue-200" : ""
                }`}
                onClick={() => handleSelectDeposit(item, index)}
              >
                {formatNumber(item)}
              </button>
            ))}
            <div className="w-11/12 mt-4 flex justify-end">
              <Popconfirm
                title="Xác nhận nạp tiền?"
                description={`Bạn có chắc muốn nạp ${formattedDeposit} vào ví?`}
                onConfirm={confirm}
                onCancel={cancel}
                okText="Nạp"
                cancelText="Hủy"
                // Render the Popconfirm inside the side nav
                getPopupContainer={() => sideNavRef.current}
              >
                <button className="m-2 px-8 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-400">
                  Nạp vào ví
                </button>
              </Popconfirm>
            </div>
          </div>
        ) : (
          QRCode && (
            <div className="flex flex-col">
              <div className="flex">
                <Tooltip title="Đóng">
                  <button onClick={() => setIsQRCodeVisible(false)}>
                    <CiLogout size={24} className="text-red-500" />
                  </button>
                </Tooltip>
                <p className="text-[#dddddd] ml-4">Nạp tiền</p>
              </div>
              <div className="w-full flex justify-center mt-8">
                <p className="text-[#dddddd]">
                  Quét mã QR để nạp {formattedDeposit}đ vào ví
                </p>
              </div>
              <div className=" w-full flex justify-center mt-4">
                <img src={QRCode} alt="QRCode" className="w-2/3 h-2/3" />
              </div>
            </div>
          )
        )}
        {createDeposit.isLoading && <Spin />}
      </div>
    </div>
  );
}
