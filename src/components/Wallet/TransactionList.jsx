import React, { useEffect, useState } from "react";
import { WalletApi } from "../../apis/Wallet";
import { useMutation, useQuery } from "@tanstack/react-query";
import UserService from "../../services/Keycloak";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import TransactionLine from "./TransactionLine";
import { Button, Dropdown, Pagination, Tooltip } from "antd";
import CustomPagination from "./CustomPagination";
import TableSkeleton from "../Skeleton/TableSkeleton";

const buttonTypes = [
  { key: "", label: "Tất cả" },
  { key: "UPGRADE_TO_PHOTOGRAPHER", label: "Gói nâng cấp" },
  { key: "IMAGE_BUY", label: "Mua ảnh" },
  { key: "IMAGE_SELL", label: "Bán ảnh" },
  { key: "DEPOSIT", label: "Nạp tiền" },
  { key: "WITHDRAWAL", label: "Rút tiền" },
];

const translateStatus = (status) => {
  switch (status) {
    case "":
      return <span className="text-blue-500">Tất cả</span>;
    case "PENDING":
      return <span className="text-yellow-500">Đang chờ</span>;
    case "SUCCESS":
      return <span className="text-green-500">Thành công</span>;
    case "CANCEL":
      return <span className="text-red-500">Đã hủy</span>;
    case "FAILED":
      return <span className="text-gray-200">Thất bại</span>;
    default:
      return <span className="text-gray-200">Không xác định</span>;
  }
};
export default function TransactionList() {
  // Initialize state for the fields
  const [limit, setLimit] = useState(8); // Default limit
  const [page, setPage] = useState(0); // Default page
  const [type, setType] = useState(""); // Default type (empty string for all types)
  const [status, setStatus] = useState(""); // Default status (empty string for all statuses)
  const [orderByAmount, setOrderByAmount] = useState(true); // Default order by amount (ascending)
  const [orderByCreatedAt, setOrderByCreatedAt] = useState(true); // Default order by created at (descending)
  const items = [
    {
      key: "1",
      label: (
        <div
          className={`${
            status === ""
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatus("")}
        >
          <p className=" text-sm">Tất cả</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className={`${
            status === "SUCCESS"
              ? "hover:bg-green-600 bg-green-500 text-white"
              : "hover:bg-green-500 text-green-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatus("SUCCESS")}
        >
          <p className=" text-sm">✓ Thành công</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className={`${
            status === "PENDING"
              ? "hover:bg-yellow-600 bg-yellow-500 text-white"
              : "hover:bg-yellow-500 text-yellow-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatus("PENDING")}
        >
          <p>◔ Đang chờ</p>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          className={`${
            status === "CANCEL"
              ? "hover:bg-red-600 bg-red-500 text-white"
              : "hover:bg-red-500 text-red-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatus("CANCEL")}
        >
          <p>x Đã hủy</p>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          className={`${
            status === "FAILED"
              ? "hover:bg-gray-600 bg-gray-500 text-white"
              : "hover:bg-gray-500 text-gray-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatus("FAILED")}
        >
          <p>Thất bại</p>
        </div>
      ),
    },
  ];
  const preprocessData = (
    limit,
    page,
    type,
    status,
    orderByAmount,
    orderByCreatedAt
  ) => {
    // Example preprocessing: Convert empty strings to null
    const processedType = type === "" ? null : type;
    const processedStatus = status === "" ? null : status;
    const processedOrderByAmount = orderByAmount === true ? "asc" : "desc";
    const processedOrderByCreatedAt =
      orderByCreatedAt === true ? "asc" : "desc";
    // Add any other preprocessing logic here

    return {
      limit,
      page,
      type: processedType,
      status: processedStatus,
      orderByAmount: processedOrderByAmount,
      orderByCreatedAt: processedOrderByCreatedAt,
    };
  };

  const {
    data: transaction,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "transactionList",
      { limit, page, type, status, orderByAmount, orderByCreatedAt },
    ], // Unique query key for caching
    queryFn: () => {
      const processedData = preprocessData(
        limit,
        page,
        type,
        status,
        orderByAmount,
        orderByCreatedAt
      );
      return WalletApi.getTransaction(
        processedData.limit,
        processedData.page,
        processedData.type,
        processedData.status,
        processedData.orderByAmount,
        processedData.orderByCreatedAt
      );
    },
    onSuccess: (data) => {
      console.log("Transaction data fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Error fetching transaction:", error);
    },
  });

  return (
    <div>
      <div className="bg-[#2a2c32] shadow rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            {buttonTypes.map(({ key, label }) => (
              <button
                key={key}
                className={`mr-4 transition-colors duration-300 ease-in-out ${
                  type === key ? "text-blue-500" : "text-[#dddddd]"
                }`}
                onClick={() => setType(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {transaction && (
            <div>
              <CustomPagination
                currentPage={page}
                setPage={setPage}
                totalPage={transaction.totalPage}
              />{" "}
            </div>
          )}
        </div>
      </div>

      {/* transaction list */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto  shadow">
          <thead className="bg-[#32353b]">
            <tr>
              <th className="px-4 py-2 text-[#dddddd] font-normal text-center">
                <button onClick={() => setOrderByAmount(!orderByAmount)}>
                  {orderByAmount ? (
                    <Tooltip title="Sắp xếp giảm dần">
                      Số tiền
                      <CaretDownOutlined />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sắp xếp tăng dần">
                      Số tiền
                      <CaretUpOutlined />
                    </Tooltip>
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-[#dddddd] font-normal text-center">
                Loại
              </th>
              <th className="px-4 py-2 text-[#dddddd] font-normal text-center">
                Phương thức thanh toán
              </th>
              <th className="px-4 py-2 text-[#dddddd] font-normal text-center">
                <Dropdown
                  menu={{
                    items,
                  }}
                  placement="bottom"
                >
                  <button>Trạng thái - {translateStatus(status)}</button>
                </Dropdown>
              </th>
              <th className="px-4 py-2 text-[#dddddd] font-normal text-center">
                <button onClick={() => setOrderByCreatedAt(!orderByCreatedAt)}>
                  {orderByCreatedAt ? (
                    <Tooltip title="Sắp xếp giảm dần">
                      Ngày cập nhật
                      <CaretDownOutlined />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sắp xếp tăng dần">
                      Ngày cập nhật
                      <CaretUpOutlined />
                    </Tooltip>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <tbody className="bg-[#36393f]">
              {transaction && transaction.objects.length > 0 ? (
                transaction.objects?.map((item) => {
                  console.log(item);
                  return <TransactionLine key={item.id} item={item} />;
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center my-9 py-9 text-[#dddddd]"
                  >
                    Không có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
