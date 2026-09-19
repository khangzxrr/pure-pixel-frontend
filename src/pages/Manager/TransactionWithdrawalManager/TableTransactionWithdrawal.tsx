import { forwardRef, useEffect, useState } from "react";
import type { TableProps } from "antd";
import { isAxiosError } from "axios";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { getData } from "../../../apis/api";
import type { ResponseOf, Schema } from "../../../apis/types";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import ComModal from "../../../components/ComModal/ComModal";
import DetailTransactionWithdrawal from "./DetailTransactionWithdrawal";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import ComStatusWalletConverter from "../../../components/ComStatusConverter/ComStatusWalletConverter";
import ComCard from "./../../../components/ComCard/ComCard";
import RefreshButton from "../../../components/ComButton/RefreshButton";
import WithdrawalProcessingModal from "./WithdrawalProcessingModal";

// the list also serializes the withdrawal details, which TransactionDto does not declare
export type WithdrawalTransaction = Schema<"TransactionDto"> & {
  withdrawalTransaction?: Schema<"WithdrawalTransactionRecordDto"> | null;
};

type TransactionList = ResponseOf<"ManageTransactionController_findAll">;
type Balance = ResponseOf<"AdminController_getTotalBalance">;

function formatCurrency(number: unknown) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}

// the ref is not attached to anything
export const TableTransactionWithdrawal = forwardRef<unknown, object>(
  (_props, _ref) => {
    const [data, setData] = useState<WithdrawalTransaction[]>([]);
    const [selectedData, setSelectedData] =
      useState<WithdrawalTransaction | null>(null);
    const [totalWithdrawal, setTotalWithdrawal] = useState<number | null>(
      null,
    );
    const [totalBalance, setTotalBalance] = useState<number | null>(null);
    const table = useTableState();
    const modalDetail = useModalState();

    const { getColumnSearchProps, getColumnPriceRangeProps } =
      useColumnFilters();
    const columns: TableProps<WithdrawalTransaction>["columns"] = [
      // {
      //   title: "ID giao dịch",
      //   width: 50,
      //   dataIndex: "id",
      //   key: "id",
      //   sorter: (a, b) => a?.id?.localeCompare(b?.id),
      //   ...getColumnSearchProps("id", "ID giao dịch"),
      // },
      {
        title: "Người yêu cầu",
        width: 80,
        dataIndex: "name",
        key: "name",
        ...getColumnSearchProps<WithdrawalTransaction>("user.name", "Tên"),
        render: (_text, record) => (
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
        title: "Số tiền",
        width: 50,
        dataIndex: "amount",
        key: "amount",
        sorter: (a, b) => a.amount - b.amount,
        ...getColumnPriceRangeProps<WithdrawalTransaction>("amount", "Giá Tiền"),
        render: (_, record) => <div>{formatCurrency(record.amount)}</div>,
      },
      {
        title: "Số dư ví sau khi rút",
        width: 80,
        dataIndex: "walletBalance",
        key: "walletBalance",
        // ...getColumnSearchProps("wallet.walletBalance", "Số dư ví"),
        render: (_text, record) => (
          <div className="flex items-center gap-3">
            <>{formatCurrency(record?.wallet?.walletBalance)}</>
          </div>
        ),
      },
      {
        title: "Ngày tạo",
        width: 40,
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: (a, b) =>
          new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),
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
          // SUCCESS, FAILED, PENDING, CANCEL, EXPIRED
          { text: "Đã xử lý", value: "SUCCESS" },
          { text: "Chưa xử lý", value: "PENDING" },
          { text: "Đã hủy", value: "CANCEL" },
          { text: "Hết hạn", value: "EXPIRED" },
          { text: "Thất bại", value: "FAILED" },
        ],
        onFilter: (value, record) => record.status === value,
        // sorter: (a, b) => a?.status?.localeCompare(b?.status),
        // ...getColumnSearchProps("method", "Thanh toán bằng"),
        render: (_, record) => (
          <div>
            <h1>
              <ComStatusWalletConverter>
                {record.status}
              </ComStatusWalletConverter>
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
            <div className="flex items-center flex-col">
              <ComMenuButonTable
                record={record}
                showModalDetails={() => {
                  modalDetail.handleOpen();
                  setSelectedData(record);
                }}
                excludeDefaultItems={["edit", "delete"]}
              />
            </div>
          </>
        ),
      },
    ];

    const reloadData = () => {
      table.handleOpenLoading();
      getData<TransactionList>(
        "manager/transaction?limit=9999&page=0&types=WITHDRAWAL&orderByCreatedAt=desc",
      )
        .then((e) => {
          setData(e?.data?.objects);
          // console.log("====================================");
          // console.log(123213213, e?.data);
          // console.log("====================================");
          table.handleCloseLoading();
        })
        .catch((error: unknown) => {
          console.error("Error fetching items:", error);
          if (isAxiosError(error) && error.status === 401) {
            reloadData();
          }
        });

      getData<Balance>("/admin/dashboard/balance")
        .then((e) => {
          setTotalWithdrawal(e?.data?.totalWithdrawal);
          setTotalBalance(e?.data?.totalBalance);
          // console.log(2222, e?.data);
        })
        .catch((error: unknown) => {
          // console.error("Error fetching items:", error);
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
    const cardData = [
      { title: "Tổng số dư", value: totalBalance },
      { title: "Tổng số tiền rút", value: totalWithdrawal },
    ];
    // console.log("====================================");
    // console.log(data);
    // console.log("====================================");
    return (
      <div>
        <div className="grid grid-cols-3 gap-4 pb-2">
          {cardData.map((card, index) => (
            <ComCard
              key={index} // Sử dụng index làm key
              {...card}
            />
          ))}
          <div className="flex items-end justify-end">
            <RefreshButton onClick={() => reloadData()} />
          </div>
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
          {selectedData &&
            (selectedData.status === "PENDING" ? (
              <WithdrawalProcessingModal
                selectedData={selectedData}
                tableRef={reloadData}
                onClose={modalDetail?.handleClose}
              />
            ) : (
              <DetailTransactionWithdrawal
                selectedData={selectedData}
                onClose={modalDetail?.handleClose}
              />
            ))}
        </ComModal>
      </div>
    );
  },
);

TableTransactionWithdrawal.displayName = "TableTransactionWithdrawal";
