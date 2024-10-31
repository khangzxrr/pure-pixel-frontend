import React, { useEffect, useState } from "react";
import { useTableState } from "../../hooks/useTableState";
import { Typography, message } from "antd";
import useColumnFilters from "../../components/ComTable/utils";
import ComTable from "./../../components/ComTable/ComTable";
import ComDateConverter from "../../components/ComDateConverter/ComDateConverter";
import { getData } from "../../apis/api";
import ComMenuButonTable from "../../components/ComMenuButonTable/ComMenuButonTable";
import ComButton from "../../components/ComButton/ComButton";
import { useModalState } from "../../hooks/useModalState";
import ComModal from "../../components/ComModal/ComModal";
import CreatePhotoshootPackage from "./CreatePhotoshootPackage";
import ComConfirmDeleteModal from "../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import { useNotification } from "../../Notification/Notification";
import EditPhotoshootPackage from "./EditPhotoshootPackage";

function formatCurrency(number) {
  // Định dạng số thành tiền tệ Việt Nam
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else if (typeof number === "string" && !isNaN(Number(number))) {
    return Number(number).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else {
    return number;
  }
}

export default function PhotoshootPackageManagement() {
  const modal = useModalState();
  const { notificationApi } = useNotification();
  const modalEdit = useModalState();
  const [data, setData] = useState([]);
  const { getColumnSearchProps, getColumnApprox, getColumnPriceRangeProps } =
    useColumnFilters();
  const table = useTableState();
  const [selectedData, setSelectedData] = useState({});

  const columns = [
    {
      title: "Tên gói",
      dataIndex: "title",
      key: "title",
      width: 150,
      fixed: "left",
      ...getColumnSearchProps("title", "Tên gói"),
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 100,
      render: (text, record) => (
        <img
          src={record.thumbnail}
          alt={record.name}
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 120,
      sorter: (a, b) => a.price - b.price,
      ...getColumnPriceRangeProps("price", "Giá tiền"),
      render: (text, record) => <>{formatCurrency(record.price)}</>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      ...getColumnSearchProps("description", "Description"),
      render: (text, record) => <>{record.description}</>,
    },
    {
      title: "Subtitle",
      dataIndex: "subtitle",
      key: "subtitle",
      width: 150,
      ...getColumnSearchProps("subtitle", "Subtitle"),
      render: (text, record) => <>{record.subtitle}</>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      ...getColumnApprox("createdAt", "Ngày tạo"),
      render: (text, record) => (
        <ComDateConverter>{record.createdAt}</ComDateConverter>
      ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center flex-col">
          <ComMenuButonTable
            record={record}
            // Bạn có thể thêm các chức năng chỉnh sửa và xóa tại đây
            showModalEdit={() => {
              modalEdit.handleOpen();
              setSelectedData(record);
            }}
            showModalDelete={() => {
              ComConfirmDeleteModal(
                `/photoshoot-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError
              );
            }}
            excludeDefaultItems={["details"]}
          />
        </div>
      ),
    },
  ];
  const notificationSuccess = () => {
    notificationApi("success", "Thành công", "Đã xóa gói chụp");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };
  const reloadData = () => {
    getData("/photoshoot-package/me?limit=9999&page=0")
      .then((response) => {
        setData(response?.data?.objects || []);
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        message.error("Lỗi khi tải dữ liệu");
        table.handleCloseLoading();
      });
  };

  useEffect(() => {
    reloadData();
  }, []);

  return (
    <div className="p-4 h-screen">
      <div className="flex justify-end pb-2">
        <div>
          <ComButton onClick={modal.handleOpen}>Tạo gói chụp</ComButton>
        </div>
      </div>
      <ComModal
        width={800}
        isOpen={modal?.isModalOpen}
        onClose={modal?.handleClose}
      >
        <CreatePhotoshootPackage
          onClose={modal?.handleClose}
          tableRef={reloadData}
        />
      </ComModal>
      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        <EditPhotoshootPackage
          selectedPackage={selectedData}
          tableRef={reloadData}
          onClose={modalEdit?.handleClose}
        />
      </ComModal>
      <ComTable
        y={"70vh"}
        x={1500}
        columns={columns}
        dataSource={data}
        loading={table.loading}
        scroll={{ x: 1500, y: 500 }}
      />
    </div>
  );
}
