import { forwardRef, useEffect, useState } from "react";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { Image, Modal, type TableProps } from "antd";
import { isAxiosError } from "axios";
import { deleteData, getData } from "../../../apis/api";
import type { ResponseOf, Schema } from "../../../apis/types";
import ComMenuButonTable, {
  type ExtraMenuItem,
} from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailUpgrede from "./DetailUpgrede";
import EditUpgrede from "./EditReport";
import ComDateConverter from "./../../../components/ComDateConverter/ComDateConverter";

// SignedPhotoDto has no `user`, but the uploader column sorts by it
type ManagerPhoto = Schema<"SignedPhotoDto"> & { user?: { name?: string } };
type PhotoList = ResponseOf<"ManagePhotoController_findAllPhotos">;

// the ref is not attached to anything
export const TablePhoto = forwardRef<unknown, object>((_props, _ref) => {
  const [data, setData] = useState<ManagerPhoto[]>([]);
  // set by the (hidden) details and edit actions, not read
  const [, setSelectedData] = useState<ManagerPhoto | null>(null);
  const table = useTableState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();

  const { getColumnSearchProps, getColumnApprox } = useColumnFilters();
  const columns: TableProps<ManagerPhoto>["columns"] = [
    {
      title: "Người đăng",
      width: 120,
      // fixed: "left",
      dataIndex: "photographer.name",
      key: "photographer.name",
      sorter: (a, b) =>
        a?.user?.name?.localeCompare(String(b.user?.name)) ?? 0,
      ...getColumnSearchProps<ManagerPhoto>("photographer.name", "Người báo cáo"),
      render: (_, record) => (
        <div className=" gap-2 items-center ">
          {record?.photographer?.avatar && (
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <Image
                wrapperClassName=" w-20 h-20 object-cover object-center flex items-center justify-center "
                src={record?.photographer?.avatar}
                alt={record?.photographer?.avatar}
                preview={{ mask: "Xem ảnh" }}
              />
            </div>
          )}
          <p>{record?.photographer?.name}</p>
        </div>
      ),
    },
    {
      title: "ID bài  ",
      width: 150,
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a?.id?.localeCompare(b?.id),
      ...getColumnSearchProps<ManagerPhoto>("id", "ID bài "),
    },
    {
      title: "Hình ảnh",
      width: 120,
      dataIndex: "maxPackageCount",
      key: "maxPackageCount",
      render: (_, record) => (
        <div>
          {record?.signedUrl?.url && (
            <div className=" flex items-center justify-center overflow-hidden gap-3">
              <Image
                wrapperClassName=" w-20 h-20 object-cover object-center flex items-center justify-center "
                src={record?.signedUrl?.url}
                alt={record?.signedUrl?.url}
                preview={{ mask: "Xem ảnh" }}
              />
              <a
                href={`/photo/${record.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bài viết
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ngày đăng",
      width: 120,
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),
      ...getColumnApprox<ManagerPhoto>("createdAt"),
      render: (_, render) => (
        <div>
          {/* {render?.contract?.signingDate} */}
          <ComDateConverter time>{render?.createdAt}</ComDateConverter>
        </div>
      ),
    },
    // {
    //   title: "Thể loại báo cáo",
    //   width: 100,
    //   dataIndex: "reportType",
    //   key: "reportType",
    //   filters: [
    //     { text: "Hình ảnh", value: "PHOTO" },
    //     { text: "Người dùng", value: "USER" },
    //     { text: "Dịch vụ", value: "BOOKING" },
    //     { text: "Bình luận", value: "COMMENT" },
    //   ],
    //   onFilter: (value, record) => record.reportType === value,
    //   sorter: (a, b) => a?.reportType?.localeCompare(b?.reportType),
    //   render: (_, record) => (
    //     <div>
    //       <ComReportTypeConverter>{record?.reportType}</ComReportTypeConverter>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Trạng thái",
    //   width: 120,
    //   dataIndex: "reportStatus",
    //   key: "reportStatus",
    //   filters: [
    //     { text: "Chưa phản hồi", value: "OPEN" },
    //     // { text: "WAITING_FEEDBACK", value: "WAITING_FEEDBACK" },
    //     // { text: "Đã trả lời", value: "RESPONSED" },
    //     { text: "Đóng ", value: "CLOSED" },
    //   ],
    //   onFilter: (value, record) => record.reportStatus === value,
    //   sorter: (a, b) => a?.reportStatus?.localeCompare(b?.reportStatus),
    //   render: (_, record) => (
    //     <div>
    //       <ComReportStatusConverter>
    //         {record?.reportStatus}
    //       </ComReportStatusConverter>
    //     </div>
    //   ),
    // },
    {
      title: "Tên bài ",
      width: 150,
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      ...getColumnSearchProps<ManagerPhoto>("title", "Tên bài"),
    },
    {
      title: "Nội dung",
      width: 150,
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a?.description?.localeCompare(b?.description),
      ...getColumnSearchProps<ManagerPhoto>("description", "Nội dung"),
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
                `/upgrade-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError,
              );
            }}
            extraMenuItems={extraMenuItems}
            excludeDefaultItems={["edit", "delete", "details"]}
          />
        </div>
      ),
    },
  ];
  const extraMenuItems: ExtraMenuItem<ManagerPhoto>[] = [
    {
      label: "Xóa bài viết",
      onClick: (e) => {
        Modal.confirm({
          title: "Xác nhận xóa bài viết",
          content: "Bạn có chắc xóa bài viết?",
          okText: "Xóa bài",
          okType: "primary",
          cancelText: "Hủy",
          onOk: () => {
            deleteData(`manager/photo`, `${e.id}`)
              .then(() => {
                // console.log("11111", e);
                notificationApi("success", "Thành công", "Đã xóa bài viết");

                reloadData();
              })
              .catch((error: unknown) => {
                notificationApi("error", "Không thành công", "Lỗi");
                console.log("error", error);
              });
          },
        });
      },
    },
  ];

  const notificationSuccess = () => {
    notificationApi("success", "thành công", "Đã thành công");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };

  const reloadData = () => {
    table.handleOpenLoading();
    getData<PhotoList>("/manager/photo?limit=9999&page=0")
      .then((e) => {
        setData(e?.data?.objects);
        // console.log("====================================");
        // console.log(e?.data);
        // console.log("====================================");
        table.handleCloseLoading();
      })
      .catch((error: unknown) => {
        console.error("Error fetching items:", error);
        if (isAxiosError(error) && error.status === 401) {
          reloadData();
        }
      });
  };
  useEffect(() => {
    setTimeout(() => {
      reloadData();
    }, 500);
  }, []);

  // console.log("====================================");
  // console.log(data);
  // console.log("====================================");
  return (
    <div>
      <ComTable
        y={"65vh"}
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
        <EditUpgrede tableRef={reloadData} onClose={modalEdit?.handleClose} />
      </ComModal>
    </div>
  );
});

TablePhoto.displayName = "TablePhoto";
