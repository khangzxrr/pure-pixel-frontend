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
import DetailTransactionWithdrawal from "./DetailTransactionWithdrawal";
import EditUpgrede from "./EditTransactionWithdrawal";
import ComReportTypeConverter from "../../../components/ComReportTypeConverter/ComReportTypeConverter";
import ComReportStatusConverter from "../../../components/ComReportStatusConverter/ComReportStatusConverter";
import ComReportConverter from "../../../components/ComReportConverter/ComReportConverter";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { Link } from "react-router-dom";
import ComTypeWalletConverter from "../../../components/ComStatusConverter/ComTypeWalletConverter";
import { FaWallet } from "react-icons/fa";
import ComStatusWalletConverter from "../../../components/ComStatusConverter/ComStatusWalletConverter";
import ComCard from "./../../../components/ComCard/ComCard";
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
  const [totalWithdrawal, setTotalWithdrawal] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);
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
      width: 50,
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a?.id?.localeCompare(b?.id),
      ...getColumnSearchProps("id", "ID giao dịch"),
    },
    {
      title: "Số tiền",
      width: 50,
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      ...getColumnPriceRangeProps("amount", "Giá Tiền"),
      render: (_, record) => <div>{formatCurrency(record.amount)}</div>,
    },
    {
      title: "Người yêu cầu",
      width: 80,
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("user.name", "Tên"),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.user?.avatar || "https://via.placeholder.com/40"} // URL avatar, thêm ảnh mặc định nếu không có
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover bg-[#eee]"
          />
          <span>{record?.user?.name}</span>
        </div>
      ),
    },
    {
      title: "Số dư ví",
      width: 80,
      dataIndex: "walletBalance",
      key: "walletBalance",
      // ...getColumnSearchProps("wallet.walletBalance", "Số dư ví"),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <>{formatCurrency(record?.wallet.walletBalance)}</>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      width: 40,
      dataIndex: "createdAt",
      key: "createdAt",
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
      title: "Trạng thái",
      width: 50,
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
      width: 30,
      render: (_, record) => (
        <>
          {record.status === "PENDING" ? (
            <div className="flex items-center flex-col">
              <ComMenuButonTable
                record={record}
                extraMenuItems={extraMenuItems}
                showModalDetails={() => {
                  modalDetail.handleOpen();
                  setSelectedData(record);
                }}
                excludeDefaultItems={["edit", "delete"]}
              />
            </div>
          ) : (
            <div className="flex items-center flex-col">
              <ComMenuButonTable
                record={record}
                showModalDetails={() => {
                  modalDetail.handleOpen();
                  setSelectedData(record);
                }}
                // extraMenuItems={extraMenuItems}
                excludeDefaultItems={["edit", "delete"]}
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
      "manager/transaction?limit=9999&page=0&types=WITHDRAWAL&orderByCreatedAt=desc"
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
    
     getData("/admin/dashboard/balance")
       .then((e) => {
         setTotalWithdrawal(e?.data?.totalWithdrawal); 
         setTotalBalance(e?.data?.totalBalance); 
         console.log(2222, e?.data); 
         
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
  const cardData = [
    { title: "Tổng số dư", value: totalBalance },
    { title: "Tổng số tiền rút", value: totalWithdrawal },
  ];
  console.log("====================================");
  console.log(data);
  console.log("====================================");
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 pb-2">
        {cardData.map((card, index) => (
          <ComCard
            key={index} // Sử dụng index làm key
            {...card}
          />
        ))}
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
        <DetailTransactionWithdrawal
          selectedData={selectedData}
          reloadData={reloadData}
          onClose={modalDetail?.handleClose}
        />
      </ComModal>
      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        <EditUpgrede
          selectedData={selectedData}
          tableRef={reloadData}
          onClose={modalEdit?.handleClose}
        />
      </ComModal>
    </div>
  );
});
