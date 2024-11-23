import React, { useEffect, useRef, useState } from "react";
import { WalletApi } from "../../apis/Wallet";
import { useMutation, useQuery } from "@tanstack/react-query";
import UserService from "../../services/Keycloak";
import TransactionList from "../../components/Wallet/TransactionList";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import SideDepositForm from "../../components/Wallet/SideDepositForm";
import SideWithdralForm from "../../components/Wallet/SideWithdrawalForm";
import { IoIosLogOut } from "react-icons/io";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import TableTransactilonList from "../../components/Wallet/TableTransactilonList";

export default function Wallet() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false); // State for visibility
  const isLoggedIn = UserService.isLoggedIn();

  const [isNavDrawalVisible, setIsNavDrawalVisible] = useState(false);
  const sideNavDrawalRef = useRef();

  const toggleNavDrawal = () => {
    setIsNavDrawalVisible(!isNavDrawalVisible);
  };

  const closeNavDrawal = () => {
    setIsNavDrawalVisible(false);
  };

  useEffect(() => {
    const handleClickOutsideDrawal = (event) => {
      if (
        sideNavDrawalRef.current &&
        !sideNavDrawalRef.current.contains(event.target)
      ) {
        closeNavDrawal();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDrawal);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDrawal);
    };
  }, [sideNavDrawalRef]);

  const [isNavVisible, setIsNavVisible] = useState(false);
  const sideNavRef = useRef();

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const closeNav = () => {
    setIsNavVisible(false);
  };

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

  const {
    data: wallet,
    error,
    isLoading,
  } = useQuery({
    queryKey: "wallet", // Unique query key
    queryFn: () => WalletApi.getWallet(), // Query function
  });

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <>
      <div className="relative">
        {/* The Main Content */}
        <div
          className={`px-8 py-2 text-gray-500 transition-opacity duration-300 ${
            isNavVisible || isNavDrawalVisible
              ? "opacity-60 pointer-events-none"
              : "opacity-100"
          }`}
        >
          {/* Phần Thu nhập */}
          <div className="grid grid-cols-10 mb-4">
            <div className="col-start-1 col-span-3 bg-[#2a2c32] shadow rounded-lg p-3 flex flex-col">
              <p className="text-lg text-[#b9b3b3]">Số tiền hiện tại</p>
              <div className="flex items-center justify-between w-full cursor-pointer text-[#dddddd] hover:text-white p-2">
                {isBalanceVisible ? (
                  <div
                    className="w-full flex flex-row justify-between"
                    onClick={toggleBalanceVisibility}
                  >
                    <div className="w-5/6">
                      {wallet
                        ? Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(wallet.walletBalance)
                        : 0}
                    </div>
                    <div className="w-1/6">
                      <Tooltip title="Ẩn số dư">
                        <EyeInvisibleOutlined />
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full flex flex-row justify-between"
                    onClick={toggleBalanceVisibility}
                  >
                    <div className="w-5/6">******</div>
                    <div className="w-1/6">
                      <Tooltip title="Hiện số dư">
                        <EyeOutlined />
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-start-9 col-span-2 bg-[#2a2c32] shadow rounded-lg p-3 flex flex-row justify-between">
              <div className="bg-[#3F4146C2] w-[45%] flex justify-center rounded-lg p-2">
                <button
                  onClick={toggleNav}
                  className=" text-green-500  mr-1 hover:text-green-400 py-1 rounded menu-button"
                >
                  <Tooltip title="Nạp tiền" placement="bottom" color="green">
                    <PlusSquareOutlined style={{ fontSize: "29px" }} />
                    <p className="text-[10px]">Nạp tiền</p>
                  </Tooltip>
                </button>
              </div>
              <div className="bg-[#3F4146C2] w-[45%] flex justify-center rounded-lg p-2">
                <button
                  onClick={toggleNavDrawal}
                  className=" text-red-500 ml-1 hover:text-red-400 py-1 rounded menu-button"
                >
                  <Tooltip title="Rút tiền" placement="bottom" color="red">
                    <IoIosLogOut size={27} />
                    <p className="text-[10px]">Rút tiền</p>
                  </Tooltip>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <TableTransactilonList />
          </div>
          {/* Phần Gửi ảnh */}
        </div>

        <SideDepositForm
          sideNavRef={sideNavRef}
          setIsNavVisible={setIsNavVisible}
          isNavVisible={isNavVisible}
        />
        <SideWithdralForm
          sideNavRef={sideNavDrawalRef}
          setIsNavVisible={setIsNavDrawalVisible}
          isNavVisible={isNavDrawalVisible}
          balance={wallet ? wallet.walletBalance : 0}
        />
      </div>
    </>
  );
}
