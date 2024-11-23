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
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { Link } from "react-router-dom";
import ComTypeWalletConverter from "../../../components/ComStatusConverter/ComTypeWalletConverter";
import { FaWallet } from "react-icons/fa";
import ComStatusWalletConverter from "../../../components/ComStatusConverter/ComStatusWalletConverter";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export const TableTransactionWithdrawal = forwardRef((props, ref) => {
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
      title: "ID giao dịch",
      width: 150,
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a?.id?.localeCompare(b?.id),
      ...getColumnSearchProps("id", "ID giao dịch"),
    },
    // {
    //   title: "Loại",
    //   width: 100,
    //   dataIndex: "type",
    //   key: "type",
    //   filters: [
    //     { text: "Nâng cấp tài khoản", value: "UPGRADE_TO_PHOTOGRAPHER" },
    //     { text: "Nạp tiền", value: "DEPOSIT" },
    //     { text: "Mua ảnh", value: "IMAGE_BUY" },
    //     { text: "Rút tiền", value: "WITHDRAWAL" },
    //   ],
    //   onFilter: (value, record) => record.type === value,
    //   sorter: (a, b) => a?.type?.localeCompare(b?.type),
    //   render: (_, record) => (
    //     <div>
    //       <ComTypeWalletConverter>{record.type}</ComTypeWalletConverter>
    //     </div>
    //   ),
    // },
    {
      title: "Số tiền",
      width: 100,
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      ...getColumnPriceRangeProps("amount", "Giá Tiền"),
      render: (_, record) => <div>{formatCurrency(record.amount)}</div>,
    },
    {
      title: "Ngày tạo",
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
    //   title: "Hình thức thanh toán ",
    //   width: 100,
    //   dataIndex: "paymentMethod",
    //   key: "paymentMethod",
    //   filters: [
    //     { text: "SEPAY", value: "SEPAY" },
    //     { text: "Ví", value: "WALLET" },
    //     // { text: "Momo", value: "Momo" },
    //   ],
    //   onFilter: (value, record) => record.paymentMethod === value,
    //   sorter: (a, b) => a?.paymentMethod?.localeCompare(b?.paymentMethod),
    //   // ...getColumnSearchProps("paymentMethod", "Thanh toán bằng"),
    //   render: (_, record) => (
    //     <div>
    //       <h1>
    //         {record.paymentMethod === "SEPAY" && (
    //           <div className="flex flex-row justify-center">
    //             <img
    //               src="https://sepay.vn/assets/img/logo/sepay-820x820-blue-icon.png"
    //               alt="sepay"
    //               className="w-8 h-8"
    //             />
    //             <p className="ml-3 font-normal">Sepay</p>
    //           </div>
    //         )}
    //         {record.paymentMethod === "WALLET" && (
    //           <div className="flex flex-row justify-center">
    //             <FaWallet className="text-3xl" />
    //             <p className="ml-3 font-normal">Ví</p>
    //           </div>
    //         )}
    //       </h1>
    //     </div>
    //   ),
    // },
    {
      title: "Trạng thái",
      width: 100,
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Chưa thanh toán", value: "UnPaid" },
        { text: "Đã hủy", value: "Faied" },
        { text: "Hết hạn", value: "OverDue" },
      ],
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a?.status?.localeCompare(b?.status),
      // ...getColumnSearchProps("method", "Thanh toán bằng"),
      render: (_, record) => (
        <div>
          <h1>
            <ComStatusWalletConverter>{record.status}</ComStatusWalletConverter>
          </h1>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 50,
      render: (_, record) => (
        <>
          {record.status === "PENDING" && (
            <div className="flex items-center flex-col">
              <ComMenuButonTable
                record={record}
                extraMenuItems={extraMenuItems}
                excludeDefaultItems={["edit", "delete", "details"]}
              />
            </div>
          )}
        </>
      ),
    },
  ];

  const extraMenuItems = [
    {
      label: "Xác nhận đã chuyển tiền",
      onClick: (e) => {
        Modal.confirm({
          title: "Xác nhận đã chuyển tiền",
          content: "Bạn có chắc đã chuyển tiền cho người dùng?",
          okText: "Đóng báo cáo",
          okType: "primary",
          cancelText: "Hủy",
          onOk: () => {
            patchData(`manager/transaction`, `${e.id}`, {
              status: "SUCCESS",
            })
              .then((e) => {
                console.log("11111", e);
                notificationApi("success", "Thành công", "Đã đổi trạng thái");

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
  const reloadData = () => {
    table.handleOpenLoading();
    getData(
      "manager/transaction?limit=9999&page=0&type=WITHDRAWAL&orderByPaymentMethod=asc&orderByAmount=asc&orderByType=asc&orderByCreatedAt=asc"
    )
      .then((e) => {
        setData(e?.data?.objects);
        console.log("====================================");
        console.log(123213213, e?.data);
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
