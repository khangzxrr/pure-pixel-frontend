import React, { useEffect, useState } from "react";
import { useTableState } from "./../../../hooks/useTableState";
import { useModalState } from "./../../../hooks/useModalState";
import ComTable from "./../../../components/ComTable/ComTable";
import useColumnFilters from "./../../../components/ComTable/utils";
import { Image, Tooltip } from "antd";
import { getData } from './../../../apis/api';

export default function TableUpgrade() {
  const [data, setData] = useState([]);
  const table = useTableState();
  const modal = useModalState();
  const {
    getColumnSearchProps,
    getColumnPriceRangeProps,
    getUniqueValues,
    getColumnFilterProps,
  } = useColumnFilters();
  const columns = [
    {
      title: "Tên gói",
      width: 150,
      fixed: "left",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a?.name?.localeCompare(b?.name),
      ...getColumnSearchProps("name", "Tên gói"),
    },
    {
      title: "Giá Tiền",
      width: 150,
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      ...getColumnPriceRangeProps("price", "Giá Tiền"),
      render: (_, record) => (
        <div>{/* <h1>{formatCurrency(record.price)}</h1> */}</div>
      ),
    },
    {
      title: "Số lượng đã đăng ký",
      width: 120,
      dataIndex: "totalOrder",
      key: "totalOrder",
      sorter: (a, b) => a.totalOrder - b.totalOrder,
      // ...getColumnPriceRangeProps("price", "Giá Tiền"),
    },
    {
      title: "Thông tin bổ sung",
      dataIndex: "description",
      key: "description",
      width: 300,
      ...getColumnSearchProps("description", "chi tiết"),

      ellipsis: {
        showTitle: false,
      },
      render: (record) => (
        <Tooltip placement="topLeft" title={record}>
          {record}
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center flex-col">
          {/* <ComMenuButonTable
            record={record}
            showModalDetails={() => {
              modalDetailService.handleOpen();
              setSelectedData(record);
            }}
            showModalEdit={() => {
              modalDetail.handleOpen();
              setSelectedData(record);
            }}
            showModalDelete={() => {
              ComConfirmDeleteModal(
                `/service-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError,
                "put"
              );
            }}
            // extraMenuItems={extraMenuItems}
            // excludeDefaultItems={["details"]}
          /> */}
        </div>
      ),
    },
  ];
  const reloadData = () => {
    table.handleOpenLoading();
    getData("/upgrade")
      .then((e) => {
        setData(e?.data);
        console.log('====================================');
        console.log(e?.data);
        console.log('====================================');
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  };
  useEffect(() => {
    reloadData();
  }, []);
  return (
    <div>
      <ComTable
        y={"50vh"}
        columns={columns}
        dataSource={data}
        loading={table.loading}
      />
    </div>
  );
}
