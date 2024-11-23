import React, { useEffect, useState } from "react";
import useColumnFilters from "../ComTable/utils";
import { ConfigProvider, Pagination, Typography } from "antd";
import ComDateConverter from "../ComDateConverter/ComDateConverter";
import ComTable from "../ComTable/ComTable";
import ComStatusWalletConverter from "./../ComStatusConverter/ComStatusWalletConverter";
import { useQuery } from "@tanstack/react-query";
import { WalletApi } from "../../apis/Wallet";
import { WalletOutlined } from "@ant-design/icons";
import TableSkeleton from "../Skeleton/TableSkeleton";
import ComTypeWalletConverter from "../ComStatusConverter/ComTypeWalletConverter";
import calculateDateDifference from "../../utils/calculateDateDifference";
import ComNoteWalletConverter from "../ComStatusConverter/ComNoteWalletConventer";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export default function TableTransactilonList() {
  const limit = 10;
  const [page, setPage] = useState(1);
  const [orderByAmount, setOrderByAmount] = useState("asc");
  const [orderByCreatedAt, setOrderByCreatedAt] = useState("asc");
  const [type, setType] = useState("");
  const columns = [
    {
      title: "Số tiền",
      width: "10%",
      fixed: "left",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => (
        <div>
          <h1>
            {record.status === "SUCCESS" && record.amount !== 0 ? (
              record.type === "IMAGE_SELL" || record.type === "DEPOSIT" ? (
                <span className="text-green-400">
                  +{formatCurrency(record.amount)}
                </span>
              ) : (
                <span className="text-red-400">
                  -{formatCurrency(record.amount)}
                </span>
              )
            ) : record.status === "PENDING" ? (
              <span className="text-yellow-400">
                {"  "}
                {formatCurrency(record.amount)}
              </span>
            ) : (
              <span className="text-gray-400">
                {"  "}
                {formatCurrency(record.amount)}
              </span>
            )}
          </h1>
        </div>
      ),
    },
    {
      title: "Loại",
      width: "25%",
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
      title: "Thời gian cập nhật",
      width: "15%",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt, record) => (
        <div>{calculateDateDifference(updatedAt)}</div>
      ),
    },
  ];
  const {
    data: transaction,
    error,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["transactionList", page], // Unique query key for caching
    queryFn: () => {
      return WalletApi.getTransaction({
        limit,
        page: page - 1,
        type,
        orderByAmount,
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
          y={"70vh"}
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
