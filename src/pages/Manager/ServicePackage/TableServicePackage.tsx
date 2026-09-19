import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import type { TableProps } from "antd";
import { getData } from "../../../apis/api";
import type { ResponseOf, Schema } from "../../../apis/types";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailServicePackage from "./DetailServicePackage";
import EditUpgrede from "./EditBlog";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import RefreshButton from "../../../components/ComButton/RefreshButton";

// the manager list also sends createdAt, which PhotoshootPackageDto does not declare
export type ServicePackageRow = Schema<"PhotoshootPackageDto"> & {
  createdAt: string;
};

type ServicePackageList =
  ResponseOf<"ManagerPhotoShootPackageController_findAllPhotoshootPackage"> & {
    objects: ServicePackageRow[];
  };

export type TableServicePackageHandle = {
  reloadData: () => void;
};

function formatCurrency(number: unknown) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export const TableServicePackage = forwardRef<
  TableServicePackageHandle,
  object
>((_props, ref) => {
  const [data, setData] = useState<ServicePackageRow[]>([]);
  const [selectedData, setSelectedData] = useState<ServicePackageRow | null>(
    null,
  );
  const table = useTableState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();

  const { getColumnSearchProps, getColumnPriceRangeProps, getColumnApprox } =
    useColumnFilters();
  const columns: TableProps<ServicePackageRow>["columns"] = [
    // {
    //   title: "Id",
    //   width: 100,
    //   fixed: "left",
    //   dataIndex: "id",
    //   key: "id",
    //   // sorter: (a, b) => a?.id?.localeCompare(b?.id),
    //   ...getColumnSearchProps("id", "Id"),
    // },
    {
      title: "Tên gói chụp",
      width: 100,
      fixed: "left",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      ...getColumnSearchProps<ServicePackageRow>("title", "Tên gói chụp"),
    },

    // {
    //   title: "Hình ảnh",
    //   dataIndex: "thumbnail",
    //   key: "thumbnail",
    //   width: 80,
    //   render: (_, record) => (
    //     <>
    //       <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
    //         <Image
    //           wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
    //           src={record?.thumbnail}
    //           alt={record?.thumbnail}
    //           preview={{ mask: "Xem ảnh" }}
    //         />
    //       </div>
    //     </>
    //   ),
    // },
    {
      title: "Giá Tiền",
      width: 100,
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      ...getColumnPriceRangeProps<ServicePackageRow>("price", "Giá Tiền"),
      render: (_, record) => (
        <div>
          <h1>{formatCurrency(record.price)}</h1>
        </div>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "description",
      key: "description",
      width: 150,
      ...getColumnSearchProps<ServicePackageRow>("description", "Nội dung"),
      render: (_, record) => (
        <>
          <div
            className="uploaded-description line-clamp-3"
            dangerouslySetInnerHTML={{ __html: record.description }}
          />
        </>
      ),
    },
    {
      title: "Người sở hữu",
      width: 120,
      dataIndex: "user.name",
      key: "user.name",
      sorter: (a, b) => a?.user?.name?.localeCompare(b.user?.name),
      ...getColumnSearchProps<ServicePackageRow>("user.name", "Người báo cáo"),
      render: (_, record) => (
        <div className="flex gap-2 items-center ">
          {record?.user?.avatar && (
            <div className="size-10 flex items-center justify-center rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover bg-[#eee]"
                src={record?.user?.avatar}
                alt={record?.user?.avatar}
              />
            </div>
          )}
          <p>{record?.user?.name}</p>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      width: 120,
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),
      ...getColumnApprox<ServicePackageRow>("createdAt"),
      render: (_, render) => (
        <div>
          {/* {render?.contract?.signingDate} */}
          <ComDateConverter time>{render?.createdAt}</ComDateConverter>
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
                `/manager/photoshoot-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError,
              );
            }}
            // extraMenuItems={extraMenuItems}
            excludeDefaultItems={["edit", "delete"]}
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
  useImperativeHandle(ref, () => ({
    reloadData,
  }));
  const reloadData = () => {
    table.handleOpenLoading();
    getData<ServicePackageList>(
      "manager/photoshoot-package?limit=9999&page=0&orderByCreatedAt=desc",
    )
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
        {selectedData && (
          <DetailServicePackage selected={selectedData} reload={reloadData} />
        )}
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

TableServicePackage.displayName = "TableServicePackage";
