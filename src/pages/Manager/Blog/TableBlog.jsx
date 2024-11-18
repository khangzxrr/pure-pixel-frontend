import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { Image, Tooltip } from "antd";
import { getData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailUpgrede from "./DetailUpgrede";
import EditUpgrede from './EditBlog';
  function formatCurrency(number) {
    // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
    if (typeof number === "number") {
      return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    }
  }
export const TableBlog = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const table = useTableState();
  const modal = useModalState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();

  const {
    getColumnSearchProps,
    getColumnPriceRangeProps,
    getUniqueValues,
    getColumnFilterProps,
  } = useColumnFilters();
  const columns = [
    {
      title: "Tên bài viết",
      width: 100,
      fixed: "left",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      ...getColumnSearchProps("title", "Tên bài viết"),
    },

    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 50,
      render: (_, record) => (
        <>
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
            <Image
              wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
              src={record?.thumbnail}
              alt={record?.thumbnail}
              preview={{ mask: "Xem ảnh" }}
            />
          </div>
        </>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: 150,
      ...getColumnSearchProps("content", "Nội dung"),
      render: (_, record) => (
        <>
          <div
            className="uploaded-content line-clamp-3"
            dangerouslySetInnerHTML={{ __html: record.content }}
          />
        </>
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
            showModalDetails={() => {
              modalDetail.handleOpen();
              setSelectedData(record);
            }}
            showModalEdit={() => {
              modalEdit.handleOpen();
              setSelectedData(record);
            }}
            showModalDelete={() => {
              ComConfirmDeleteModal(
                `/blog`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError
              );
            }}
            // extraMenuItems={extraMenuItems}
            excludeDefaultItems={["details"]}
          />
        </div>
      ),
    },
  ];
  const notificationSuccess = () => {
    notificationApi("success", "Thành công", "Đã xóa blog");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };
  useImperativeHandle(ref, () => ({
    reloadData,
  }));
  const reloadData = () => {
    table.handleOpenLoading();
    getData("/blog?limit=9999&page=0&orderByCreatedAt=desc")
      .then((e) => {
        setData(e?.data?.objects);
        console.log("====================================");
        console.log(e?.data);
        console.log("====================================");
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
        x={1020}
        columns={columns}
        dataSource={data}
        loading={table.loading}
      />

      <ComModal
        isOpen={modalDetail?.isModalOpen}
        onClose={modalDetail?.handleClose}
        width={800}
      >
        <DetailUpgrede selectedUpgrede={selectedData} />
      </ComModal>
      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        <EditUpgrede
          selectedUpgrede={selectedData}
          tableRef={reloadData}
          onClose={modalEdit?.handleClose}
        />
      </ComModal>
    </div>
  );
});
