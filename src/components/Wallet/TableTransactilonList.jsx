import React, { useEffect, useState } from "react";
import useColumnFilters from "../ComTable/utils";
import {
  ConfigProvider,
  Divider,
  Dropdown,
  Menu,
  Pagination,
  Select,
  Tooltip,
} from "antd";
import ComDateConverter from "../ComDateConverter/ComDateConverter";
import ComTable from "../ComTable/ComTable";
import ComStatusWalletConverter from "./../ComStatusConverter/ComStatusWalletConverter";
import { useQuery } from "@tanstack/react-query";
import { WalletApi } from "../../apis/Wallet";
import { WalletOutlined } from "@ant-design/icons";
import TableSkeleton from "../Skeleton/TableSkeleton";
import ComTypeWalletConverter from "../ComStatusConverter/ComTypeWalletConverter";
import ComNoteWalletConverter from "../ComStatusConverter/ComNoteWalletConventer";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import ComWalletAmountConverter from "../ComStatusConverter/ComAmountConverter";

export default function TableTransactilonList() {
  const limit = 10;
  const [page, setPage] = useState(1);
  const [orderByCreatedAt, setOrderByCreatedAt] = useState("desc");
  const [types, setTypes] = useState("");
  const [statuses, setStatuses] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");

  const {
    data: transaction,
    error,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [
      "transaction-list",
      page,
      types,
      statuses,
      paymentMethods,
      orderByCreatedAt,
    ], // Unique query key for caching
    queryFn: () => {
      return WalletApi.getTransaction({
        limit,
        page: page - 1,
        types,
        statuses,
        paymentMethods,
        orderByCreatedAt,
      });
    },
    keepPreviousData: true,
  });
  const totalPages = transaction ? transaction.totalPage : 0;
  console.log("transaction", transaction);

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const filterTypes = [
    {
      key: "1",
      label: (
        <div
          className={`${
            types === ""
              ? "bg-gray-500 text-white"
              : "hover:bg-gray-400 text-gray-600 hover:text-white"
          } py-1 px-2 -m-1 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("")}
        >
          Xem tất cả
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className={`${
            types === "UPGRADE_TO_PHOTOGRAPHER"
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-400 text-blue-600 hover:text-white"
          } py-1 px-2 -m-1 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("UPGRADE_TO_PHOTOGRAPHER")}
        >
          <p className="text-sm">Nâng cấp tài khoản</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className={`${
            types === "DEPOSIT"
              ? "bg-green-500 text-white"
              : "hover:bg-green-400 text-green-600 hover:text-white"
          } py-1 px-2 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("DEPOSIT")}
        >
          <p className="text-sm">Nạp tiền</p>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          className={`${
            types === "IMAGE_BUY"
              ? "bg-yellow-500 text-white"
              : "hover:bg-yellow-400 text-yellow-600 hover:text-white"
          } py-1 px-2 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("IMAGE_BUY")}
        >
          <p className="text-sm">Mua ảnh</p>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          className={`${
            types === "IMAGE_SELL"
              ? "bg-orange-500 text-white"
              : "hover:bg-orange-400 text-orange-600 hover:text-white"
          } py-1 px-2 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("IMAGE_SELL")}
        >
          <p className="text-sm">Bán ảnh</p>
        </div>
      ),
    },
    {
      key: "6",
      label: (
        <div
          className={`${
            types === "WITHDRAWAL"
              ? "bg-red-500 text-white"
              : "hover:bg-red-400 text-red-600 hover:text-white"
          } py-1 px-2 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("WITHDRAWAL")}
        >
          <p className="text-sm">Rút tiền</p>
        </div>
      ),
    },
    {
      key: "7",
      label: (
        <div
          className={`${
            types === "REFUND_FROM_BUY_IMAGE"
              ? "bg-purple-500 text-white"
              : "hover:bg-purple-400 text-purple-600 hover:text-white"
          } py-1 px-2 rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setTypes("REFUND_FROM_BUY_IMAGE")}
        >
          <p className="text-sm">Hoàn tiền</p>
        </div>
      ),
      value: "REFUND_FROM_BUY_IMAGE",
    },
  ];

  const filterStatus = [
    {
      key: "1",
      label: (
        <div
          className={`${
            status === ""
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded-sm transition-colors duration-300 ease-in-out w-full`}
          onClick={() => setStatuses("")}
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
          onClick={() => setStatuses("SUCCESS")}
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
          onClick={() => setStatuses("PENDING")}
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
          onClick={() => setStatuses("CANCEL")}
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
          onClick={() => setStatuses("FAILED")}
        >
          <p>Thất bại</p>
        </div>
      ),
    },
  ];
  const columns = [
    {
      title: (
        <div className="flex justify-between">
          <p>Số tiền</p>
        </div>
      ),
      width: "15%",
      fixed: "left",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <div>
          <ComWalletAmountConverter
            type={record.type}
            amount={record.amount}
            paymentMethod={record.paymentMethod}
            status={record.status}
            fee={record.fee}
          />
        </div>
      ),
    },
    {
      title: (
        <div className="flex flex-col gap-2">
          <p>Trạng thái</p>
          <Select
            className="w-4/5 text-gray-300 font-light border-[1px] border-gray-500 rounded-md bg-[#1d1f22] hover:bg-opacity-80 transition-all duration-300"
            value={types}
            options={[
              { label: "Tất cả", value: "" },
              { label: "Nâng cấp tài khoản", value: "UPGRADE_TO_PHOTOGRAPHER" },
              { label: "Nạp tiền", value: "DEPOSIT" },
              { label: "Mua ảnh", value: "IMAGE_BUY" },
              { label: "Bán ảnh", value: "IMAGE_SELL" },
              { label: "Rút tiền", value: "WITHDRAWAL" },
              { label: "Hoàn tiền", value: "REFUND_FROM_BUY_IMAGE" },
            ]}
            onChange={(value) => {
              setTypes(value);
            }}
          />
        </div>
      ),
      width: "15%",
      dataIndex: "type",
      key: "type",
      render: (_, record) => (
        <div>
          <ComTypeWalletConverter>{record.type}</ComTypeWalletConverter>
        </div>
      ),
    },
    {
      title: "Ghi chú",
      width: "15%",
      dataIndex: "type",
      key: "type",
      render: (_, record) => (
        <div>
          <ComNoteWalletConverter type={record.type} amount={record.amount} />
        </div>
      ),
    },
    {
      title: "Thanh toán bằng",
      width: "15%",
      dataIndex: "method",
      key: "method",
      render: (_, record) => (
        <div>
          <h1>
            {record.paymentMethod === "SEPAY" ? (
              <div className="flex flex-row justify-start">
                <img
                  src="https://sepay.vn/assets/img/logo/sepay-820x820-blue-icon.png"
                  alt="sepay"
                  className="w-7 h-7"
                />
                <p className="ml-3 font-normal">Sepay</p>
              </div>
            ) : record.paymentMethod === "WALLET" ? (
              <div className="flex flex-row justify-start">
                <WalletOutlined
                  style={{ fontSize: "24px", color: "#2c6acd" }}
                />
                <p className="ml-3 font-normal">Ví</p>
              </div>
            ) : (
              record.paymentMethod
            )}
          </h1>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: "15%",
      dataIndex: "status",
      key: "status",

      render: (_, record) => (
        <div>
          <h1>
            <ComStatusWalletConverter>{record.status}</ComStatusWalletConverter>
          </h1>
        </div>
      ),
    },

    {
      title: (
        <div className="flex justify-between">
          <p className=" py-1"> Ngày cập nhật</p>
          <p
            onClick={() =>
              orderByCreatedAt === "desc"
                ? setOrderByCreatedAt("asc")
                : setOrderByCreatedAt("desc")
            }
            className="cursor-pointer font-light border-[1px] px-2 py-1 rounded-md bg-[#1d1f22] hover:bg-opacity-70"
          >
            {orderByCreatedAt === "desc" ? (
              <Tooltip title="Sắp xếp theo cũ nhất">
                Từ mới đến cũ
                <CaretDownOutlined />
              </Tooltip>
            ) : (
              <Tooltip title="Sắp xếp theo mới nhất">
                Từ cũ đến mới
                <CaretUpOutlined />
              </Tooltip>
            )}
          </p>
        </div>
      ),
      width: "20%",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt, record) => FormatDateTime(updatedAt),
    },
  ];
  return (
    <div>
      {!isFetching && totalPages > 1 && (
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: "#1e1e1e",
              colorText: "#b3b3b3",
              colorPrimary: "white",
              colorBgTextHover: "#333333",
              colorBgTextActive: "#333333",
              colorTextDisabled: "#666666",
            },
          }}
        >
          <Pagination
            current={page}
            total={totalPages * limit}
            onChange={handlePageClick}
            pageSize={limit}
            showSizeChanger={false}
            className="flex justify-end my-2"
          />
        </ConfigProvider>
      )}
      {/* {isLoading && (
        <>
          <TableSkeleton col={5} row={10} isPagination={true} />
        </>
      )} */}
      <>
        <ComTable
          y={"65vh"}
          x
          columns={columns}
          dataSource={
            transaction && transaction.objects.length > 0
              ? transaction?.objects
              : []
          }
          loading={{
            indicator: isLoading ? (
              <TableSkeleton col={6} row={10} isPagination={true} />
            ) : null,
            spinning: isLoading,
          }}
          pagination={false}
        />
      </>
    </div>
  );
}
