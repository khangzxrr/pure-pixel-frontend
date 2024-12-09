import { Input, Popconfirm, message, Tooltip, Select } from "antd";
import React, { useEffect, useState } from "react";
import { CiLogout } from "react-icons/ci";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletApi } from "../../apis/Wallet";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { notificationApi } from "../../Notification/Notification";
import { NumericFormat } from "react-number-format";

const formatNumber = (number) => {
  return new Intl.NumberFormat("de-DE").format(number);
};

export default function SideWithdrawalForm({
  sideNavRef,
  isNavVisible,
  setIsNavVisible,
  balance,
}) {
  // Validation schema using Yup
  const withdrawalSchema = yup.object().shape({
    amount: yup
      .number()
      .typeError("Vui lòng nhập số tiền hợp lệ")
      .min(10000, "Số tiền rút phải lớn hơn 10,000 VND")
      .max(balance, "Số dư không đủ để thực hiện giao dịch") // Maximum price validation
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          // Convert the value to a number
          const parsedValue = parseInt(originalValue.replace(/\./g, ""), 10);
          return isNaN(parsedValue) ? undefined : parsedValue;
        }
        return value;
      })
      .required("Số tiền không được để trống"),
    bankNumber: yup
      .string()
      .required("Số tài khoản ngân hàng không được để trống")
      .matches(/^\d+$/, "Số tài khoản ngân hàng phải là số"),
    bankName: yup.string().required("Tên ngân hàng không được để trống"),
    bankUsername: yup.string().required("Tên người nhận không được để trống"),
  });
  const [bankList, setBankList] = useState([]);
  const queryClient = useQueryClient(); // Get the QueryClient instance

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(withdrawalSchema),
    mode: "onChange", // Validate on change (input process)
    reValidateMode: "onChange", // Revalidate on change
    defaultValues: {
      amount: "",
      bankNumber: "",
      bankName: "",
      bankUsername: "",
    },
  });

  const closeNav = () => {
    setIsNavVisible(false);
  };

  const getBankList = useMutation({
    mutationFn: () => WalletApi.bankList(),
    onSuccess: (data) => {
      setBankList(
        data.data.map((bank) => ({ label: bank.name, value: bank.name }))
      );
    },
    onError: (error) => {
      console.error("Error fetching bank list:", error);
    },
  });

  const createWithdrawal = useMutation({
    mutationFn: (data) => WalletApi.createWithdrawal(data),
    onSuccess: (data) => {
      console.log(data);
      message.success("Yêu cầu rút tiền thành công");
      queryClient.invalidateQueries("transactionList"); // Invalidate the wallet query to refetch the data
      queryClient.invalidateQueries("wallet"); // Invalidate the wallet query to refetch the data
      reset();
      closeNav();
    },
    onProgress: () => {
      console.log("Loading...");
    },
    onError: (error) => {
      let message;
      switch (error.response.data.message) {
        case "NotEnoughBalanceException":
          message = "Số dư không đủ để thực hiện giao dịch";
          break;

        default:
          message = "Yêu cầu rút tiền thất bại, thử lại sau";
          break;
      }
      notificationApi(
        "error",
        "Yêu cầu rút tiền thất bại",
        message,
        "",
        0,
        "withdrawal-form"
      );
      console.error("Error posting comment:", error.response.data.message);
    },
  });

  const confirm = (data) => {
    if (data.amount < 10000) {
      message.error("Số tiền rút phải lớn hơn 10,000 VND");
    } else if (data.amount > balance) {
      message.error("Số dư không đủ để thực hiện giao dịch");
    } else {
      createWithdrawal.mutate(data);
      console.log(data);
    }
  };

  useEffect(() => {
    getBankList.mutate();
  }, [isNavVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sideNavRef.current &&
        !sideNavRef.current.contains(event.target) &&
        event.target.closest(".ant-select-dropdown") === null // Ensure clicks inside the dropdown don't trigger this
      ) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sideNavRef]);

  const onSubmit = (data) => {
    confirm(data); // Confirm the form submission with valid data
  };

  return (
    <div
      ref={sideNavRef}
      className={`fixed bottom-0 right-0 w-2/3 lg:w-1/3 h-full bg-[#2a2c32] rounded-md shadow-lg transition-transform transform z-50 ${
        isNavVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-5">
        <div>
          <div className="flex">
            <Tooltip title="Đóng">
              <button onClick={closeNav}>
                <CiLogout size={24} className="text-red-500" />
              </button>
            </Tooltip>
            <p className="text-[#dddddd] ml-4">Rút tiền</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <div className="mt-4">
              <label className="text-[#dddddd]">Số tiền bạn muốn rút</label>
              <div>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix=" ₫"
                      className={`w-5/6 mx-9 my-2 bg-[#dddddd] p-2 rounded-lg text-[#2a2c32] ${
                        errors.amount ? "border-red-500" : ""
                      }`}
                      placeholder="Nhập giá"
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  )}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="text-[#dddddd]">Số tài khoản ngân hàng</label>
              <div>
                <Controller
                  name="bankNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className={`w-5/6 mx-9 my-2 bg-[#dddddd] h-full p-2 rounded-lg text-[#2a2c32] ${
                        errors.bankNumber ? "border-red-500" : ""
                      }`}
                      placeholder="Nhập số tài khoản"
                    />
                  )}
                />
              </div>
              {errors.bankNumber && (
                <p className="text-red-500">{errors.bankNumber.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="text-[#dddddd]">Tên ngân hàng</label>
              <div>
                <Controller
                  name="bankName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={bankList} // Here we pass the bankList as options to the Select component
                      className={`w-5/6 mx-9 my-2 ${
                        errors.bankName ? "border-red-500" : ""
                      }`}
                      placeholder="Chọn ngân hàng"
                      getPopupContainer={() => sideNavRef.current}
                    />
                  )}
                />
              </div>
              {errors.bankName && (
                <p className="text-red-500">{errors.bankName.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="text-[#dddddd]">Tên người nhận</label>
              <div>
                <Controller
                  name="bankUsername"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className={`w-5/6 mx-9 my-2 bg-[#dddddd] p-2 rounded-lg text-[#2a2c32] ${
                        errors.bankUsername ? "border-red-500" : ""
                      }`}
                      placeholder="Nhập tên người nhận"
                    />
                  )}
                />
              </div>
              {errors.bankUsername && (
                <p className="text-red-500">{errors.bankUsername.message}</p>
              )}
            </div>

            <div className="w-11/12 flex justify-end mt-4">
              <Popconfirm
                title="Xác nhận rút tiền?"
                description={`Bạn có chắc muốn rút ${formatNumber(
                  getValues("amount")
                )} vào tài khoản ${getValues(
                  "bankNumber"
                )} tại ngân hàng ${getValues("bankName")} ?`}
                onConfirm={handleSubmit(onSubmit)}
                onCancel={() => console.log("Cancelled")}
                okText="Rút"
                cancelText="Hủy"
                getPopupContainer={() => sideNavRef.current}
                disabled={!isValid}
              >
                <p className="m-2 px-8 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-400 cursor-pointer">
                  Yêu cầu rút
                </p>
              </Popconfirm>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
