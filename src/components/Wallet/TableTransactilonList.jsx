import React, { useEffect, useState } from "react";
import useColumnFilters from "../ComTable/utils";
import { useTableState } from "./../../hooks/useTableState";
import { Typography } from "antd";
import ComBillStatusConverter from "./../ComStatusConverter/ComBillStatusConverter";
import ComDateConverter from "../ComDateConverter/ComDateConverter";
import ComTable from "../ComTable/ComTable";
import { getData } from "../../apis/api";
import ComMenuButonTable from "../ComMenuButonTable/ComMenuButonTable";
import ComTypeWalletConverter from "../ComStatusConverter/ComTypeWalletConverter";
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
  const [data, setData] = useState([]);
  const { getColumnSearchProps, getColumnApprox, getColumnPriceRangeProps } =
    useColumnFilters();
  const table = useTableState();
  const columns = [
    {
      title: "Số tiền",
      width: 100,
      fixed: "left",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      ...getColumnPriceRangeProps("amount", "Số Tiền"),
      render: (_, record) => (
        <div>
          <h1>{formatCurrency(record.amount)}</h1>
        </div>
      ),
    },
    {
      title: "Loại",
      width: 100,
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Nâng cấp tài khoản", value: "UPGRADE_TO_PHOTOGRAPHER" },
        { text: "Nạp tiền", value: "DEPOSIT" },
        { text: "Mua ảnh", value: "IMAGE_BUY" },
        { text: "Rút tiền", value: "WITHDRAWAL" },
      ],
      onFilter: (value, record) => record.type === value,
      sorter: (a, b) => a?.type?.localeCompare(b?.type),
      render: (_, record) => (
        <div>
          <h1>{record.type}</h1>
        </div>
      ),
    },
    {
      title: "Thanh toán bằng",
      width: 100,
      dataIndex: "method",
      key: "method",
      filters: [
        { text: "SEPAY", value: "SEPAY" },
        { text: "Tiền mặt", value: "Cash" },
        { text: "Momo", value: "Momo" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
      sorter: (a, b) => a?.paymentMethod?.localeCompare(b?.paymentMethod),
      // ...getColumnSearchProps("paymentMethod", "Thanh toán bằng"),
      render: (_, record) => (
        <div>
          <h1>
            {record.paymentMethod === "SEPAY" ? (
              <div className="flex flex-row justify-center">
                <img
                  src="https://sepay.vn/assets/img/logo/sepay-820x820-blue-icon.png"
                  alt="sepay"
                  className="w-8 h-8"
                />
                <p className="ml-3 font-normal">Sepay</p>
              </div>
            ) : record.method === "None" ? (
              "Chưa thanh toán"
            ) : (
              record.method
            )}
          </h1>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: 100,
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Chưa thanh toán", value: "UnPaid" },
        { text: "Đã hủy", value: "Faied" },
        { text: "Hết hạn", value: "OverDue" },
      ],
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a?.status?.localeCompare(b?.status),
      // ...getColumnSearchProps("method", "Thanh toán bằng"),
      render: (_, record) => (
        <div>
          <h1>
            <ComTypeWalletConverter>{record.status}</ComTypeWalletConverter>
          </h1>
        </div>
      ),
    },

    {
      title: "Thời gian cập nhật",
      width: 100,
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      ...getColumnApprox("updatedAt", "Thời gian thanh toán"),
      render: (updatedAt, record) => (
        <div>
          <ComDateConverter>{updatedAt}</ComDateConverter>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 50,
      render: (_, record) => (
        <div className="flex items-center flex-col">
          <ComMenuButonTable
            record={record}
            //    showModalDetails={() => showModal(record)}
            //    showModalEdit={showModalEdit}
            // extraMenuItems={extraMenuItems}
            excludeDefaultItems={["delete", "edit"]}
            // order={order}
          />
        </div>
      ),
    },
  ];
  const reloadData = () => {
    getData(
      "/wallet/transaction?limit=9999&page=0&orderByPaymentMethod=asc&orderByAmount=asc&orderByType=asc&orderByCreatedAt=asc"
    )
      .then((e) => {
        setData(e?.data?.objects);
        console.log("====================================");
        console.log(1111, e);
        console.log("====================================");
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        reloadData();
      });
  };
  useEffect(() => {
    reloadData();
  }, []);
  return (
    <div>
      <ComTable
        y={"70vh"}
        x
        columns={columns}
        dataSource={data}
        loading={table.loading}
      />
    </div>
  );
}
