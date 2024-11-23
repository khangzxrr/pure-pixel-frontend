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
import { Image, Modal, Tooltip } from "antd";
import { deleteData, getData, patchData, putData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailUpgrede from "./DetailUpgrede";
import EditUpgrede from "./EditReport";
import ComReportTypeConverter from "../../../components/ComReportTypeConverter/ComReportTypeConverter";
import ComReportStatusConverter from "../../../components/ComReportStatusConverter/ComReportStatusConverter";
import ComReportConverter from "../../../components/ComReportConverter/ComReportConverter";
import ComDateConverter from "./../../../components/ComDateConverter/ComDateConverter";
import { Link } from "react-router-dom";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export const TablePhoto = forwardRef((props, ref) => {
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
    getColumnApprox,
  } = useColumnFilters();
  const columns = [
    {
      title: "Người đăng",
      width: 120,
      // fixed: "left",
      dataIndex: "photographer.name",
      key: "photographer.name",
      sorter: (a, b) => a?.user?.name?.localeCompare(b.user?.name),
      ...getColumnSearchProps("photographer.name", "Người báo cáo"),
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
      ...getColumnSearchProps("id", "ID bài "),
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
      sorter: (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt),
      ...getColumnApprox("createdAt"),
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
      ...getColumnSearchProps("title", "Tên bài"),
    },
    {
      title: "Nội dung",
      width: 150,
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a?.description?.localeCompare(b?.description),
      ...getColumnSearchProps("description", "Nội dung"),
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
            extraMenuItems={extraMenuItems}
            excludeDefaultItems={["edit", "delete", "details"]}
          />
        </div>
      ),
    },
  ];
  const extraMenuItems2 = [
    {
      label: "Mở lại báo cáo",
      onClick: (e) => {
        Modal.confirm({
          title: "Xác nhận mở lại báo cáo",
          content: "Bạn có chắc mở lại báo cáo?",
          okText: "Mở lại",
          okType: "primary",
          cancelText: "Hủy",
          onOk: () => {
            patchData(`manager/report`, `${e.id}`, {
              reportStatus: "OPEN",
            })
              .then((e) => {
                console.log("11111", e);
                notificationApi("success", "Thành công", "Đã mở lại báo cáo");

                reloadData();
              })
              .catch((error) => {
                notificationApi("error", "Không thành công", "Lỗi");
                console.log("error", error);
              });
          },
        });
      },
    },
  ];
  const extraMenuItems = [
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
              .then((e) => {
                console.log("11111", e);
                notificationApi("success", "Thành công", "Đã xóa bài viết");

                reloadData();
              })
              .catch((error) => {
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
    getData("/manager/photo?limit=9999&page=0")
      .then((e) => {
        setData(e?.data?.objects);
        console.log("====================================");
        console.log(e?.data);
        console.log("====================================");
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        if (error?.status === 401) {
          reloadData();
        }
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
