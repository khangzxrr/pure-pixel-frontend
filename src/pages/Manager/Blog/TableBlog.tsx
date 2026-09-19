import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { Image, type TableProps } from "antd";
import { getData } from "../../../apis/api";
import type { ResponseOf, Schema } from "../../../apis/types";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailUpgrede from "./DetailUpgrede";
import EditUpgrede from "./EditBlog";

type Blog = Schema<"BlogDto">;
type BlogList = ResponseOf<"BlogController_findAll">;

export type TableBlogHandle = {
  reloadData: () => void;
};

export const TableBlog = forwardRef<TableBlogHandle, object>((_props, ref) => {
  const [data, setData] = useState<Blog[]>([]);
  const [selectedData, setSelectedData] = useState<Blog | null>(null);
  const table = useTableState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();

  const { getColumnSearchProps } = useColumnFilters();
  const columns: TableProps<Blog>["columns"] = [
    {
      title: "Id",
      width: 70,
      fixed: "left",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a?.id?.localeCompare(b?.id),
      ...getColumnSearchProps<Blog>("id", "Id"),
    },
    {
      title: "Tên bài viết",
      width: 100,
      fixed: "left",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      ...getColumnSearchProps<Blog>("title", "Tên bài viết"),
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
      ...getColumnSearchProps<Blog>("content", "Nội dung"),
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
                notificationError,
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
    getData<BlogList>("/blog?limit=9999&page=0&orderByCreatedAt=desc")
      .then((e) => {
        setData(e?.data?.objects);
        // console.log("====================================");
        // console.log(e?.data);
        // console.log("====================================");
        table.handleCloseLoading();
      })
      .catch((error: unknown) => {
        console.error("Error fetching items:", error);
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
        isOpen={modalDetail?.isModalOpen}
        onClose={modalDetail?.handleClose}
        width={800}
      >
        <DetailUpgrede />
      </ComModal>
      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        {selectedData && (
          <EditUpgrede
            selectedUpgrede={selectedData}
            tableRef={reloadData}
            onClose={modalEdit?.handleClose}
          />
        )}
      </ComModal>
    </div>
  );
});

TableBlog.displayName = "TableBlog";
