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
import EditUpgrede from "./EditReport";
import ComReportTypeConverter from "../../../components/ComReportTypeConverter/ComReportTypeConverter";
import ComReportStatusConverter from "../../../components/ComReportStatusConverter/ComReportStatusConverter";
import ComReportConverter from "../../../components/ComReportConverter/ComReportConverter";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export const TableReport = forwardRef((props, ref) => {
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
      title: "Người báo cáo",
      width: 100,
      fixed: "left",
      dataIndex: "user.name",
      key: "user.name",
      sorter: (a, b) => a?.user?.name?.localeCompare(b.user?.name),
      ...getColumnSearchProps("user.name", "Người báo cáo"),
      render: (_, record) => (
        <div className="flex gap-2 items-center ">
          {record?.user?.avatar && (
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <Image
                wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
                src={record?.user?.avatar}
                alt={record?.user?.avatar}
                preview={{ mask: "Xem ảnh" }}
              />
            </div>
          )}
          <p>{record?.user?.name}</p>
        </div>
      ),
    },
    {
      title: "Thể loại báo cáo",
      width: 100,
      dataIndex: "reportType",
      key: "reportType",
      filters: [
        { text: "Hình ảnh", value: "PHOTO" },
        { text: "Người dùng", value: "USER" },
        { text: "Dịch vụ", value: "BOOKING" },
        { text: "Bình luận", value: "COMMENT" },
      ],
      onFilter: (value, record) => record.reportType === value,
      sorter: (a, b) => a?.reportType?.localeCompare(b?.reportType),
      render: (_, record) => (
        <div>
          <ComReportTypeConverter>{record?.reportType}</ComReportTypeConverter>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: 120,
      dataIndex: "reportStatus",
      key: "reportStatus",
      filters: [
        { text: "Chưa phản hồi", value: "OPEN" },
        { text: "WAITING_FEEDBACK", value: "WAITING_FEEDBACK" },
        { text: "Đã trả lời", value: "RESPONSED" },
        { text: "Đóng ", value: "CLOSED" },
      ],
      onFilter: (value, record) => record.reportStatus === value,
      sorter: (a, b) => a?.reportStatus?.localeCompare(b?.reportStatus),
      render: (_, record) => (
        <div>
          <ComReportStatusConverter>
            {record?.reportStatus}
          </ComReportStatusConverter>
        </div>
      ),
    },

    {
      title: "Nội dung",
      width: 150,
      dataIndex: "content",
      key: "content",
      sorter: (a, b) => a?.content?.localeCompare(b?.content),
      ...getColumnSearchProps("content", "Nội dung"),
    },

    {
      title: "Bài báo cáo",
      width: 120,
      dataIndex: "maxPackageCount",
      key: "maxPackageCount",
      render: (_, record) => (
        <div>
          <ComReportConverter>{record}</ComReportConverter>
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
                `/upgrade-package`,
                record.id,
                `Bạn có chắc chắn muốn xóa?`,
                reloadData,
                notificationSuccess,
                notificationError
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
    notificationApi("success", "thành công", "Đã thành công");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };

  const reloadData = () => {
    table.handleOpenLoading();
    getData("/manager/report?limit=9999&page=0")
      .then((e) => {
        setData(e?.data?.objects);
        console.log("====================================");
        console.log(e?.data);
        console.log("====================================");
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        table.handleCloseLoading();
        // if (error?.status === 401) {
        //   reloadData()
        // }
      });
  };
  useEffect(() => {
    setTimeout(() => {
      reloadData();
    }, 500);
  }, []);

  console.log("====================================");
  console.log(data);
  console.log("====================================");
  return (
    <div>
      <ComTable
        y={"50vh"}
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
