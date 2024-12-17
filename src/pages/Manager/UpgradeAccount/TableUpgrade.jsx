import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTableState } from "./../../../hooks/useTableState";
import { useModalState } from "./../../../hooks/useModalState";
import ComTable from "./../../../components/ComTable/ComTable";
import useColumnFilters from "./../../../components/ComTable/utils";
import { Image, Tooltip } from "antd";
import { getData } from "./../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailUpgrede from "./DetailUpgrede";
import EditUpgrede from "./EditUpgrede";
import RefreshButton from "../../../components/ComButton/RefreshButton";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export const TableUpgrade = forwardRef((props, ref) => {
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
    // {
    //   title: "Id",
    //   width: 150,
    //   fixed: "left",
    //   dataIndex: "id",
    //   key: "id",
    //   sorter: (a, b) => a?.id?.localeCompare(b?.id),
    //   ...getColumnSearchProps("id", "Id"),
    // },
    {
      title: "Tên gói",
      width: "10%",
      fixed: "left",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a?.name?.localeCompare(b?.name),
      ...getColumnSearchProps("name", "Tên gói"),
    },
    {
      title: "Giá Tiền",
      width: 100,
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      ...getColumnPriceRangeProps("price", "Giá Tiền"),
      render: (_, record) => (
        <div>
          <h1>{formatCurrency(record.price)}</h1>
        </div>
      ),
    },
    {
      title: "Dung lượng upload tối da",
      width: 120,
      dataIndex: "maxPhotoQuota",
      key: "maxPhotoQuota",
      sorter: (a, b) => a.maxPhotoQuota - b.maxPhotoQuota,
      // ...getColumnSearchProps("maxPhotoQuota", "Dung lượng"),
      render: (descriptions) => <div>{descriptions / 1073741824}GB</div>,
    },
    {
      title: "Số lượng gói dịch vụ tối đa",
      width: 120,
      dataIndex: "maxPackageCount",
      key: "maxPackageCount",
      sorter: (a, b) => a.maxPackageCount - b.maxPackageCount,
      ...getColumnSearchProps("maxPackageCount", "Số lượng"),
    },
    // {
    //   title: "Số lượng đã đăng ký",
    //   width: 120,
    //   dataIndex: "totalOrder",
    //   key: "totalOrder",
    //   sorter: (a, b) => a.totalOrder - b.totalOrder,
    //   // ...getColumnPriceRangeProps("price", "Giá Tiền"),
    // },

    {
      title: "Thông tin tóm tắt",
      width: 120,
      dataIndex: "summary",
      key: "summary",
      sorter: (a, b) => a.maxPackageCount - b.maxPackageCount,
      ...getColumnSearchProps("summary", "Tóm tắt"),
    },
    {
      title: "Thông tin bổ sung",
      dataIndex: "descriptions",
      key: "descriptions",
      width: 300,
      ...getColumnSearchProps("descriptions", "chi tiết"),
      ellipsis: {
        showTitle: false,
      },
      render: (descriptions) => (
        <Tooltip
          placement="topLeft"
          title={descriptions.map((desc, index) => (
            <div key={index}>{desc}</div> // Hiển thị từng mô tả trong tooltip
          ))}
        >
          {/* Hiển thị từng phần tử trên giao diện */}
          {descriptions.map((desc, index) => (
            <div key={index}>{desc}</div>
          ))}
        </Tooltip>
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
                `/manager/upgrade-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError
              );
            }}
            // extraMenuItems={extraMenuItems}
            // excludeDefaultItems={["details"]}
          />
        </div>
      ),
    },
  ];
  const notificationSuccess = () => {
    notificationApi("success", "thành công", "Đã thành công");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };
  useImperativeHandle(ref, () => ({
    reloadData,
  }));
  const reloadData = () => {
    table.handleOpenLoading();
    getData("/upgrade-package?limit=9999&page=0")
      .then((e) => {
        setData(e?.data?.objects);
        // console.log("====================================");
        // console.log(e?.data);
        // console.log("====================================");
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
      <div className="flex items-center justify-end mb-2">
        <RefreshButton onClick={reloadData} />
      </div>
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
