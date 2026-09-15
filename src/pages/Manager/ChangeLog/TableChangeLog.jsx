import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Tag } from "antd";
import dayjs from "dayjs";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { getData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import ChangeLogForm from "./ChangeLogForm";

export const TableChangeLog = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const table = useTableState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();
  const { getColumnSearchProps } = useColumnFilters();

  const columns = [
    {
      title: "Phiên bản",
      width: 60,
      fixed: "left",
      dataIndex: "version",
      key: "version",
      sorter: (a, b) => a?.version?.localeCompare(b?.version),
      ...getColumnSearchProps("version", "Phiên bản"),
    },
    {
      title: "Tiêu đề",
      width: 120,
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      ...getColumnSearchProps("title", "Tiêu đề"),
    },
    {
      title: "Trạng thái",
      width: 60,
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Công khai", value: "PUBLISHED" },
        { text: "Bản nháp", value: "DRAFT" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) =>
        status === "PUBLISHED" ? (
          <Tag color="green">Công khai</Tag>
        ) : (
          <Tag>Bản nháp</Tag>
        ),
    },
    {
      title: "Ngày công khai",
      width: 70,
      dataIndex: "publishedAt",
      key: "publishedAt",
      sorter: (a, b) =>
        new Date(a?.publishedAt || 0) - new Date(b?.publishedAt || 0),
      render: (publishedAt) =>
        publishedAt ? dayjs(publishedAt).format("DD/MM/YYYY HH:mm") : "—",
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: 150,
      ...getColumnSearchProps("content", "Nội dung"),
      render: (_, record) => (
        <div
          className="uploaded-content line-clamp-3"
          dangerouslySetInnerHTML={{ __html: record.content }}
        />
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
            showModalEdit={() => {
              setSelectedData(record);
              modalEdit.handleOpen();
            }}
            showModalDelete={() => {
              ComConfirmDeleteModal(
                `/changelog`,
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
    notificationApi("success", "Thành công", "Đã xóa bản cập nhật");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };

  useImperativeHandle(ref, () => ({
    reloadData,
  }));

  const reloadData = () => {
    table.handleOpenLoading();
    getData("/changelog/manage?limit=9999&page=0")
      .then((e) => {
        setData(e?.data?.objects);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      })
      .finally(() => {
        table.handleCloseLoading();
      });
  };

  useEffect(() => {
    reloadData();
  }, []);

  return (
    <div>
      <ComTable
        y={"65vh"}
        x={1020}
        columns={columns}
        dataSource={data}
        loading={table.loading}
      />

      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        {selectedData && (
          // remount per entry so the form picks up that entry's values
          <ChangeLogForm
            key={selectedData.id}
            selectedChangeLog={selectedData}
            onClose={modalEdit?.handleClose}
            onSaved={reloadData}
          />
        )}
      </ComModal>
    </div>
  );
});
