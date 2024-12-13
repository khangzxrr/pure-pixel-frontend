import React, { useEffect, useState } from "react";
import useColumnFilters from "../ComTable/utils";
import { ConfigProvider, Dropdown, Menu, Pagination, Tooltip } from "antd";
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
      key: "3",
      label: (
        <div
          className={`${
            types === "" ? "text-red-400" : ""
          } border-b-[1px] border-gray-300 -mb-3 pb-2`}
        >
          Xem tất cả
        </div>
      ),
      onClick: () => setTypes(""),
    },
    {
      key: "1",
      label: (
        <div
          className={`${
            types === "" ? "text-red-400" : ""
          } border-b-[1px] border-gray-300 -m-3 py-2 p  x-3`}
        >
          Nâng cấp tài khoản{" "}
        </div>
      ),
      onClick: () => setTypes("UPGRADE_TO_PHOTOGRAPHER"),
    },
    {
      key: "2",
      label: "Nạp tiền",
      onClick: () => setTypes("DEPOSIT"),
    },
    {
      key: "3",
      label: "Mua ảnh",
      onClick: () => setTypes("IMAGE_BUY"),
    },
    {
      key: "3",
      label: "Bán ảnh",
      onClick: () => setTypes("IMAGE_SELL"),
    },
    {
      key: "3",
      label: "Rút tiền",
      onClick: () => setTypes("WITHDRAWAL"),
    },
    {
      key: "3",
      label: "Hoàn tiền",
      onClick: () => setTypes("REFUND_FROM_BUY_IMAGE"),
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
        <Dropdown
          overlay={
            <Menu
              items={filterTypes.map((item) => ({
                key: item.key,
                label: <p onClick={item.onClick}>{item.label}</p>,
              }))}
            />
          }
          placement="bottom"
        >
          <p className="cursor-pointer">{types ? types : "Loại"}</p>
        </Dropdown>
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
