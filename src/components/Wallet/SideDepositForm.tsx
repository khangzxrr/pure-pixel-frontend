import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Popconfirm, Spin, Tooltip } from "antd";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import { CiLogout } from "react-icons/ci";
import { WalletApi } from "../../apis/Wallet";
import { TransactionApi } from "../../apis/TransactionApi";
import { notificationApi } from "../../Notification/Notification";
import CountdownTimer from "../ComUpgrade/CountdownTimer";

const formatNumber = (number: number | bigint) => {
  return new Intl.NumberFormat("de-DE").format(number);
};

type SideDepositFormProps = {
  sideNavRef: RefObject<HTMLDivElement>;
  isNavVisible: boolean;
  setIsNavVisible: Dispatch<SetStateAction<boolean>>;
};

export default function SideDepositForm({
  sideNavRef,
  isNavVisible,
  setIsNavVisible,
}: SideDepositFormProps) {
  const queryClient = useQueryClient();
  // the deposit is only compared and sent, so starting at 0 behaves like the empty string it was
  const [deposit, setDeposit] = useState(0);
  const [formattedDeposit, setFormattedDeposit] = useState("");
  const [selectDeposit, setSelectDeposit] = useState<number | "">();
  const [QRCode, setQRCode] = useState<string | null>();
  const [transactionId, setTransactionId] = useState<string | null>();
  const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  const selectDepositList = [
    10000, 20000, 50000, 70000, 100000, 200000, 500000, 1000000,
  ];

  const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, ""); // Remove existing dots
    const isNumeric = /^\d*$/.test(value);

    if (isNumeric) {
      const numericValue = parseInt(value);

      // Check if the value is between 10000 and 1000000
      if (numericValue < 10000 || numericValue > 1000000) {
        setErrorMessage("Số tiền nạp phải từ 10,000 đến 1,000,000 VND.");
      } else {
        setErrorMessage(""); // Clear error message if value is valid
      }

      setDeposit(numericValue);
      // the digits are formatted exactly, as Intl does with a numeric string ("" formats as 0)
      setFormattedDeposit(formatNumber(BigInt(value)));
    }
  };

  const handleSelectDeposit = (item: number, index: number) => {
    setDeposit(item);
    setFormattedDeposit(formatNumber(item));
    setSelectDeposit(index);
    setErrorMessage(""); // Clear error message when selecting predefined values
  };

  // Fetch transaction details based on selected transaction ID
  const { data: transactionDetail, refetch } = useQuery({
    queryKey: ["getTransactionById", transactionId],
    // refetch ignores `enabled`, and the id was concatenated into the URL as is
    queryFn: () => TransactionApi.getTransactionById(String(transactionId)),
    enabled: !!transactionId, // Only fetch if ID is available
  });

  const confirm = () => {
    if (deposit < 10000 || deposit > 1000000) {
      setErrorMessage("Số tiền nạp phải từ 10,000 đến 1,000,000 VND.");
      return;
    } else {
      createDeposit.mutate(deposit);
    }
  };

  const cancel = (e?: MouseEvent<HTMLElement>) => {
    console.log(e);
  };

  const closeNav = () => {
    setIsNavVisible(false);
  };

  const createDeposit = useMutation({
    mutationFn: (amount: number) => WalletApi.createDeposit({ amount: amount }),
    onSuccess: (data) => {
      // console.log(data);
      // the string keys were read as empty filters, which invalidate every query
      queryClient.invalidateQueries(); // Invalidate the wallet query to refetch the data
      queryClient.invalidateQueries(); // Invalidate the wallet query to refetch the data
      setTransactionId(data.transactionId);
      // setQRCode(data.testQRCode); // For testing purposes
      setQRCode(data.paymentUrl); // Use this for production

      setIsQRCodeVisible(true);
      setDeposit(0);
      setSelectDeposit(0);
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    },
  });
  // react-query v5 mutations have no isLoading (it is isPending), so this flag has always been undefined
  const isLoadingCreateDeposit = undefined;

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        sideNavRef.current &&
        event.target instanceof Node &&
        !sideNavRef.current.contains(event.target)
      ) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sideNavRef]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    // Polling logic
    if (isNavVisible && transactionDetail) {
      interval = setInterval(() => {
        refetch();
      }, 3000);
    }

    // Success and expiration logic
    if (transactionDetail) {
      if (transactionDetail.status === "SUCCESS") {
        notificationApi?.(
          "success",
          "Nạp tiền thành công",
          "Nạp thành công, vui lòng kiểm tra ví của bạn",
        );
        setTimeout(() => {
          setIsNavVisible(false);
          setDeposit(0);
          setSelectDeposit("");
          setQRCode(null);
          setTransactionId(null);
          queryClient.invalidateQueries();
          queryClient.invalidateQueries();
        }, 3000);
      }

      if (transactionDetail.status === "EXPIRED") {
        setIsNavVisible(false);
        notificationApi?.(
          "error",
          "Mã QR hết hiệu lực",
          "Mã QR hết hiệu lực, bạn vui lòng thử lại sau",
        );
      }
    }

    // Cleanup function to stop polling when modal closes or component unmounts
    return () => clearInterval(interval);
  }, [isNavVisible, transactionDetail]);

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
            {errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p> // Display error message
            )}
            <div className="w-11/12 mt-4 flex justify-end">
              <Popconfirm
                title="Xác nhận nạp tiền?"
                description={`Bạn có chắc muốn nạp ${formattedDeposit}đ vào ví?`}
                onConfirm={confirm}
                onCancel={cancel}
                okText="Nạp"
                cancelText="Hủy"
                // Render the Popconfirm inside the side nav (mounted whenever the popup opens)
                getPopupContainer={() => sideNavRef.current ?? document.body}
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
              {transactionDetail && transactionDetail.status === "PENDING" && (
                <CountdownTimer />
              )}
              {transactionDetail && transactionDetail?.status === "SUCCESS" && (
                <div className="p-4 text-center text-green-500 text-lg">
                  Thanh toán thành công!
                </div>
              )}
              {transactionDetail && transactionDetail.status === "EXPIRED" && (
                <div className="p-4 text-center text-red-500 text-lg">
                  Mã QR quá hạn, vui lòng thử lại.
                </div>
              )}
            </div>
          )
        )}
        {isLoadingCreateDeposit && <Spin />}
      </div>
    </div>
  );
}
