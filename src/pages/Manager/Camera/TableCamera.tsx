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
import EditCamera from "./EditCamera";
import RefreshButton from "../../../components/ComButton/RefreshButton";

// the manager list also returns usage counts, which CameraDto does not declare
export type CameraRow = Schema<"CameraDto"> & {
  userCount: number;
  photoCount: number;
};

type CameraList = ResponseOf<"ManageCameraController_findAll"> & {
  objects: CameraRow[];
};

export type TableCameraHandle = {
  reloadData: () => void;
};

export const TableCamera = forwardRef<TableCameraHandle, object>(
  (_props, ref) => {
    const [data, setData] = useState<CameraRow[]>([]);
    const [selectedData, setSelectedData] = useState<Partial<CameraRow>>({});
    const table = useTableState();
    const modalDetail = useModalState();
    const modalEdit = useModalState();
    const { notificationApi } = useNotification();

    const { getColumnSearchProps } = useColumnFilters();
    const columns: TableProps<CameraRow>["columns"] = [
      // {
      //   title: "Id",
      //   width: 100,
      //   fixed: "left",
      //   dataIndex: "id",
      //   key: "id",
      //   sorter: (a, b) => a?.id?.localeCompare(b?.id),
      //   ...getColumnSearchProps("id", "Id"),
      // },
      {
        title: "Tên",
        width: 100,
        fixed: "left",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps<CameraRow>("name", "Tên"),
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
                src={record.thumbnail}
                alt={record.thumbnail}
                preview={{ mask: "Xem ảnh" }}
              />
            </div>
          </>
        ),
      },
      {
        title: "Nội dung",
        dataIndex: "description",
        key: "description",
        width: 150,
        ...getColumnSearchProps<CameraRow>("description", "Nội dung"),
        render: (_, record) => (
          <>
            <div
              className="uploaded-content line-clamp-3"
              dangerouslySetInnerHTML={{ __html: record.description }}
            />
          </>
        ),
      },
      {
        title: "Số người sử dụng",
        dataIndex: "userCount",
        width: 60,
        sorter: (a, b) => a.userCount - b.userCount,
      },
      {
        title: "Tổng số ảnh",
        dataIndex: "photoCount",
        width: 50,
        sorter: (a, b) => a.photoCount - b.photoCount,
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
                  `/manager/camera`,
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
      getData<CameraList>(
        "/manager/camera?limit=9999&page=0&orderByCreatedAt=desc",
      )
        .then((e) => {
          setData(e.data.objects);
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
        <div className="flex items-center justify-end mb-2">
          <RefreshButton onClick={reloadData} />
        </div>

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
          <EditCamera
            selectedUpgrede={selectedData}
            tableRef={reloadData}
            onClose={modalEdit?.handleClose}
          />
        </ComModal>
      </div>
    );
  },
);

TableCamera.displayName = "TableCamera";
