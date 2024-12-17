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
import ComTypeWalletConverter from "../../../components/ComStatusConverter/ComTypeWalletConverter";
import { FaWallet } from "react-icons/fa";
import ComStatusWalletConverter from "../../../components/ComStatusConverter/ComStatusWalletConverter";
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
export const TableTransaction = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const table = useTableState();
  const modal = useModalState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const { notificationApi } = useNotification();
  const [totalRecord, setTotalRecord] = useState(0);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState(null);
  const {
    getColumnSearchProps,
    getColumnPriceRangeProps,
    getUniqueValues,
    getColumnFilterProps,
    getColumnApprox,
  } = useColumnFilters();
  const columns = [
    // {
    //   title: "ID giao dịch",
    //   width: 150,
    //   dataIndex: "id",
    //   key: "id",
    //   // sorter: (a, b) => a?.id?.localeCompare(b?.id),
    //   ...getColumnSearchProps("id", "ID giao dịch"),
    // },
    {
      title: "Người giao dịch",
      width: 120,
      // fixed: "left",
      dataIndex: "user.name",
      key: "search",
      // sorter: (a, b) => a?.user?.name?.localeCompare(b.user?.name),
      ...getColumnSearchProps("user.name", "Người giao dịch"),
      render: (_, record) => (
        <div className=" flex gap-2 items-center ">
          {record?.user?.avatar && (
            <div className="size-10 flex items-center justify-center overflow-hidden rounded-full">
              <Image
                wrapperClassName=" w-10 bg-[#eee] h-10 object-cover object-center flex items-center justify-center "
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
      title: "Loại",
      width: 100,
      dataIndex: "types",
      key: "types",
      filters: [
        { text: "Nâng cấp tài khoản", value: "UPGRADE_TO_PHOTOGRAPHER" },
        { text: "Nạp tiền", value: "DEPOSIT" },
        { text: "HOÀN TIỀN", value: "REFUND_FROM_BUY_IMAGE" },
        { text: "Mua ảnh", value: "IMAGE_BUY" },
        { text: "Bán ảnh", value: "IMAGE_SELL" },
        { text: "Rút tiền", value: "WITHDRAWAL" },
      ],
      onFilter: (value, record) => record.type === value,
      // sorter: (a, b) => a?.type?.localeCompare(b?.type),
      render: (_, record) => (
        <div>
          <ComTypeWalletConverter>{record.type}</ComTypeWalletConverter>
        </div>
      ),
    },

    {
      title: "Số tiền",
      width: 100,
      dataIndex: "orderByAmount",
      key: "orderByAmount",
      sorter: (a, b) => a.amount - b.amount,
      // ...getColumnPriceRangeProps("amount", "Giá Tiền"),
      render: (_, record) => (
        <div>
          {record.type === "IMAGE_SELL"
            ? ` ${formatCurrency(record.fee)}/`
            : ""}
          {formatCurrency(record.amount)}
        </div>
      ),
    },
    {
      title: "Thời gian",
      width: 120,
      dataIndex: "orderByCreatedAt",
      key: "orderByCreatedAt",
      sorter: (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt),
      // ...getColumnApprox("createdAt"),
      render: (_, render) => (
        <div>
          {/* {render?.contract?.signingDate} */}
          <ComDateConverter time>{render?.createdAt}</ComDateConverter>
        </div>
      ),
    },
    {
      title: "Hình thức thanh toán ",
      width: 100,
      dataIndex: "paymentMethods",
      key: "paymentMethods",
      filters: [
        { text: "SEPAY", value: "SEPAY" },
        { text: "Ví", value: "WALLET" },
        // { text: "Momo", value: "Momo" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
      // sorter: (a, b) => a?.paymentMethod?.localeCompare(b?.paymentMethod),
      // ...getColumnSearchProps("paymentMethod", "Thanh toán bằng"),
      render: (_, record) => (
        <div>
          <h1>
            {record.paymentMethod === "SEPAY" && (
              <div className="flex ">
                <img
                  src="https://sepay.vn/assets/img/logo/sepay-820x820-blue-icon.png"
                  alt="sepay"
                  className="w-8 h-8"
                />
                <p className="ml-3 font-normal">Sepay</p>
              </div>
            )}
            {record.paymentMethod === "WALLET" && (
              <div className="flex ">
                <FaWallet className="text-3xl" />
                <p className="ml-3 font-normal">Ví</p>
              </div>
            )}
          </h1>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: 100,
      dataIndex: "statuses",
      key: "statuses",
      filters: [
        { text: "Thành công", value: "SUCCESS" },
        { text: "Thất bại", value: "FAILED" },
        { text: "Chưa giải quyết", value: "PENDING" },
        { text: "Hủy bỏ", value: "CANCEL" },
        { text: "Hết hạn", value: "EXPIRED" },
      ],
      onFilter: (value, record) => record.status === value,
      // sorter: (a, b) => a?.status?.localeCompare(b?.status),
      // ...getColumnSearchProps("method", "Thanh toán bằng"),
      render: (_, record) => (
        <div>
          <h1>
            <ComStatusWalletConverter>{record.status}</ComStatusWalletConverter>
          </h1>
        </div>
      ),
    },
    // {
    //   title: "Thao tác",
    //   key: "operation",
    //   fixed: "right",
    //   width: 50,
    //   render: (_, record) => (
    //     <div className="flex items-center flex-col">
    //       <ComMenuButonTable
    //         record={record}
    //         showModalDetails={() => {
    //           modalDetail.handleOpen();
    //           setSelectedData(record);
    //         }}
    //         showModalEdit={() => {
    //           modalEdit.handleOpen();
    //           setSelectedData(record);
    //         }}
    //         showModalDelete={() => {
    //           ComConfirmDeleteModal(
    //             `/upgrade-package`,
    //             record.id,
    //             `Bạn có chắc chắn muốn xóa?`,
    //             reloadData,
    //             notificationSuccess,
    //             notificationError
    //           );
    //         }}
    //         extraMenuItems={extraMenuItems}
    //         excludeDefaultItems={["edit", "delete", "details"]}
    //       />
    //     </div>
    //   ),
    // },
  ];

  const notificationSuccess = () => {
    notificationApi("success", "Thành công", "Đã thành công");
  };
  const notificationError = () => {
    notificationApi("error", "Lỗi", "Lỗi");
  };

  // const reloadData = () => {
  //   table.handleOpenLoading();
  //   getData(
  //     "manager/transaction?limit=9999&page=0&orderByPaymentMethod=asc&orderByAmount=asc&orderByType=asc&orderByCreatedAt=asc"
  //   )
  //     .then((e) => {
  //       setData(e?.data?.objects);
  //       console.log("====================================");
  //       console.log(123213213, e?.data);
  //       console.log("====================================");
  //       table.handleCloseLoading();
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching items:", error);
  //       if (error?.status === 401) {
  //         reloadData();
  //       }
  //     });
  // };
  // useEffect(() => {
  //   setTimeout(() => {
  //     reloadData();
  //   }, 500);
  // }, []);

  const reloadData = (pagination, filters, sorter) => {
    table.handleOpenLoading();
    const params = {};

    // Thêm các tham số phân trang vào params
    if (pagination) {
      params.limit = pagination.pageSize;
      params.page = pagination.current - 1; // API của bạn có thể bắt đầu từ 0
    }

    // Thêm các bộ lọc (filters) vào params nếu có
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        // Nếu giá trị là mảng (ví dụ: reportTypes), thêm từng phần tử vào params dưới dạng tham số riêng biệt
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params[key] = params[key] ? [...params[key], item] : [item];
          });
        } else if (value) {
          // Nếu giá trị không phải là mảng, thêm trực tiếp vào params
          params[key] = value;
        }
      });
    }

    if (sorter && sorter.field && sorter.order) {
      // Chuyển đổi tên trường và kiểu sắp xếp thành format bạn mong muốn
      const sortField = sorter.field;
      const sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      // Giả sử bạn muốn tham số sắp xếp theo định dạng "orderBy<FieldName>"
      params[sortField] = sortOrder;
    } else {
      params["orderByCreatedAt"] = "desc";
    }
    // if (sorter && sorter.field && sorter.order) {
    //   params.sortBy = sorter.field;
    //   params.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
    // }
    const urlParams = new URLSearchParams(params).toString();
    // console.log("====================================");
    // console.log(123, urlParams);
    // console.log(123, `/manager/report?${urlParams}`);

    // console.log("====================================");
    getData(`/manager/transaction?${new URLSearchParams(params)}`)
      .then((e) => {
        setData(e?.data?.objects);
        setTotalRecord(e?.data?.totalRecord);

        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        if (error?.status === 401) {
          // reloadData(pagination, filters, sorter);
        }
      });
  };
  useEffect(() => {
    reloadData(pagination, filters, sorter);
  }, [pagination]);
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== pagination.current) {
      setPagination({
        ...pagination,
        current: pageNumber,
      });
    }
  };
  // console.log("====================================");
  // console.log(data);
  // console.log("====================================");
  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <RefreshButton
          onClick={() => reloadData(pagination, filters, sorter)}
        />
      </div>
      <ComTable
        y={"65vh"}
        columns={columns}
        dataSource={data}
        loading={table.loading}
        // pagination={false}
        // pagination={pagination}
        pagination={{
          current: pagination.current,
          total: totalRecord,
          pageSize: pagination.pageSize,
          onChange: handlePageClick,
          showSizeChanger: false,
        }}
        onChange={(pagination, filters, sorter) => {
          setFilters(filters);
          setSorter(sorter);
          reloadData(pagination, filters, sorter);
        }}
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
