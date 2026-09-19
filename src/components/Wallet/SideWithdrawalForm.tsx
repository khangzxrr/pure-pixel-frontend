import { Input, Popconfirm, message, Tooltip, Select } from "antd";
import {
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { CiLogout } from "react-icons/ci";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { WalletApi } from "../../apis/Wallet";
import type { BodyOf } from "../../apis/types";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { notificationApi } from "../../Notification/Notification";
import { NumericFormat } from "react-number-format";

type WithdrawalRequest = BodyOf<"WalletController_createWithdrawal">;

// the amount input holds the typed digits; yup turns them into the number that is submitted
type WithdrawalFormValues = Omit<WithdrawalRequest, "amount"> & {
  amount: number | string;
};

type BankOption = { label: string; value: string };

type SideWithdrawalFormProps = {
  sideNavRef: RefObject<HTMLDivElement>;
  isNavVisible: boolean;
  setIsNavVisible: Dispatch<SetStateAction<boolean>>;
  balance: number;
};

export default function SideWithdrawalForm({
  sideNavRef,
  isNavVisible,
  setIsNavVisible,
  balance,
}: SideWithdrawalFormProps) {
  // Validation schema using Yup
  const withdrawalSchema = yup.object().shape({
    amount: yup
      .number()
      .typeError("Vui lòng nhập số tiền hợp lệ")
      .min(10000, "Số tiền rút phải lớn hơn 10,000 VND")
      .max(balance, "Số dư không đủ để thực hiện giao dịch") // Maximum price validation
      .transform((value: number, originalValue: unknown) => {
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
  const [bankList, setBankList] = useState<BankOption[]>([]);
  const queryClient = useQueryClient(); // Get the QueryClient instance

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    watch,
    reset,
  } = useForm<WithdrawalFormValues, unknown, WithdrawalRequest>({
    // yupResolver types the form with the schema's output (a numeric amount)
    resolver: yupResolver(withdrawalSchema) as Resolver<WithdrawalFormValues>,
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
        data.data.map((bank) => ({ label: bank.name, value: bank.name })),
      );
    },
    onError: (error) => {
      console.error("Error fetching bank list:", error);
    },
  });

  const createWithdrawal = useMutation({
    mutationFn: (data: WithdrawalRequest) => WalletApi.createWithdrawal(data),
    onSuccess: () => {
      // console.log(data);
      message.success("Yêu cầu rút tiền thành công");
      // the string keys were read as empty filters, which invalidate every query
      queryClient.invalidateQueries(); // Invalidate the wallet query to refetch the data
      queryClient.invalidateQueries(); // Invalidate the wallet query to refetch the data
      reset();
      closeNav();
    },
    onError: (error) => {
      const errorMessage = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      let message;
      switch (errorMessage) {
        case "NotEnoughBalanceException":
          message = "Số dư không đủ để thực hiện giao dịch";
          break;
        case "ExistPendingWithdrawalException":
          message = "Bạn đã có yêu cầu rút tiền đang chờ xử lý";
          break;
        default:
          message = "Yêu cầu rút tiền thất bại, thử lại sau";
          break;
      }
      notificationApi?.(
        "error",
        "Yêu cầu rút tiền thất bại",
        message,
        "",
        0,
        "withdrawal-form",
      );
      console.error("Error posting comment:", errorMessage);
    },
  });

  const confirm = (data: WithdrawalRequest) => {
    if (data.amount < 10000) {
      message.error("Số tiền rút phải lớn hơn 10,000 VND");
    } else if (data.amount > balance) {
      message.error("Số dư không đủ để thực hiện giao dịch");
    } else {
      createWithdrawal.mutate(data);
      // console.log(data);
    }
  };

  useEffect(() => {
    getBankList.mutate();
  }, [isNavVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sideNavRef.current &&
        event.target instanceof Element &&
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

  const onSubmit = (data: WithdrawalRequest) => {
    confirm(data); // Confirm the form submission with valid data
  };
  // console.log("errors", errors);
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
                      // the side nav is mounted whenever the dropdown opens
                      getPopupContainer={() =>
                        sideNavRef.current ?? document.body
                      }
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
                description={`Bạn có chắc muốn rút ${watch(
                  "amount",
                )} vào tài khoản ${getValues(
                  "bankNumber",
                )} tại ngân hàng ${getValues("bankName")} ?`}
                onConfirm={handleSubmit(onSubmit)}
                onCancel={() => console.log("Cancelled")}
                okText="Rút"
                cancelText="Hủy"
                getPopupContainer={() => sideNavRef.current ?? document.body}
                disabled={!isValid}
              >
                <p
                  className={`m-2 px-8 py-1 rounded-md  ${
                    isValid
                      ? "bg-blue-500 text-white hover:bg-blue-400 cursor-pointer"
                      : "bg-gray-500 text-white  cursor-not-allowed"
                  }`}
                >
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
