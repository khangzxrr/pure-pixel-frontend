import { useEffect, useState } from "react";
import {
  ConfigProvider,
  Modal,
  Table,
  type TablePaginationConfig,
  type TableProps,
} from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useQueryClient } from "@tanstack/react-query";
import UpdateUserManager from "../../components/ComInputModal/UpdateUserManager";
import useColumnFilters from "../../components/ComTable/utils";
import { useTableState } from "../../hooks/useTableState";
import { getData } from "../../apis/api";
import type { ResponseOf, Schema } from "../../apis/types";
import ComMenuButonTable from "../../components/ComMenuButonTable/ComMenuButonTable";
import ComDateConverter from "../../components/ComDateConverter/ComDateConverter";
import AccountDetail from "../../components/ComInputModal/AccountDetail";
import RefreshButton from "../../components/ComButton/RefreshButton";

type UserRow = Schema<"UserDto">;
type TableFilters = Record<string, FilterValue | null>;
type TableSorter = SorterResult<UserRow> | SorterResult<UserRow>[];

const AccountManagerPage = () => {
  const queryClient = useQueryClient();
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserRow | null>(null);
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const table = useTableState();
  const [filters, setFilters] = useState<TableFilters>({});
  const [sorter, setSorter] = useState<TableSorter | null>(null);
  const [data, setData] = useState<UserRow[] | undefined>([]);
  const [totalRecord, setTotalRecord] = useState<number | undefined>(0);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { getColumnSearchProps } = useColumnFilters();

  const reloadData = (
    pagination: TablePaginationConfig,
    filters: TableFilters,
    sorter: TableSorter | null
  ) => {
    table.handleOpenLoading();
    const params: Record<string, unknown> = {};

    // Thêm các tham số phân trang vào params
    if (pagination) {
      params.limit = pagination.pageSize;
      params.page = Number(pagination.current) - 1; // API của bạn có thể bắt đầu từ 0
    }

    // Thêm các bộ lọc (filters) vào params nếu có
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        // Nếu giá trị là mảng (ví dụ: reportTypes), thêm từng phần tử vào params dưới dạng tham số riêng biệt
        if (Array.isArray(value)) {
          value.forEach((item) => {
            const current = params[key];
            params[key] = Array.isArray(current) ? [...current, item] : [item];
          });
        } else if (value) {
          // Nếu giá trị không phải là mảng, thêm trực tiếp vào params
          params[key] = value;
        }
      });
    }

    if (sorter && !Array.isArray(sorter) && sorter.field && sorter.order) {
      // Chuyển đổi tên trường và kiểu sắp xếp thành format bạn mong muốn
      const sortField = String(sorter.field);
      const sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      // Giả sử bạn muốn tham số sắp xếp theo định dạng "orderBy<FieldName>"
      params[sortField] = sortOrder;
    } else {
      params["orderByCreatedAt"] = "desc";
    }

    // URLSearchParams turns every value into a string (arrays join with commas)
    const query = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    );

    getData<ResponseOf<"UserController_getAllUsers">>(`/user?${query}`)
      .then((e) => {
        const filteredData = e?.data?.objects?.filter(
          (item) => !item.roles?.includes("purepixel-admin")
        );
        setData(filteredData); // Cập nhật data sau khi đã lọc
        setTotalRecord(e?.data?.totalRecord); // Đảm bảo cập nhật số lượng bản ghi sau khi lọc

        table.handleCloseLoading();
      })
      .catch((error: { status?: number } | undefined) => {
        table.handleCloseLoading();

        if (error?.status === 401) {
          // reloadData(pagination, filters, sorter);
        }
      });
  };
  useEffect(() => {
    reloadData(pagination, filters, sorter);
  }, [pagination]);

  const columns: TableProps<UserRow>["columns"] = [
    // { title: "ID", dataIndex: "id", ...getColumnSearchProps("id", "id") },
    {
      title: "Tên",
      dataIndex: "search",
      ...getColumnSearchProps<UserRow>("name", "Tên"),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.avatar || "https://via.placeholder.com/40"} // URL avatar, thêm ảnh mặc định nếu không có
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover bg-[#eee]"
          />
          <span>{record?.name}</span>
        </div>
      ),
    },

    {
      title: "Quyền",
      dataIndex: "roles",
      // ...getColumnSearchProps("mail", "Email"),
      // filters: [
      //   { text: "Nhiếp ảnh gia", value: "photographer" },
      //   { text: "Khách hàng", value: "customer" },
      // ],
      // onFilter: (value, record) => record.roles[0]?.includes(value),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <span>
            {record?.roles && record?.roles[0] === "photographer"
              ? "Nhiếp ảnh gia"
              : "Khách hàng"}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "enabled",
      // ...getColumnSearchProps("mail", "Email"),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <span
            className={`${record?.enabled ? "text-green-500" : "text-red-500"}`}
          >
            {record?.enabled ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "mail",
      // ...getColumnSearchProps("mail", "Email"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phonenumber",
      // ...getColumnSearchProps("phonenumber", "Số điện thoại"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "location",
      // ...getColumnSearchProps("location", "Địa chỉ"),
    },
    // { title: "Quyền", dataIndex: "role" },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "status",
    //   render: (status) => (
    //     <span
    //       className={`${
    //         status === "Đang hoạt động" ? "text-green-500" : "text-red-500"
    //       }`}
    //     >
    //       {status}
    //     </span>
    //   ),
    // },
    {
      title: "Ngày tạo",
      dataIndex: "orderByCreatedAt",
      key: "orderByCreatedAt",
      sorter: (a, b) =>
        new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),

      render: (_, render) => (
        <div>
          {/* {render?.contract?.signingDate} */}
          <ComDateConverter time>{render?.createdAt}</ComDateConverter>
        </div>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "button",
      render: (_, record) => (
        <div className="flex items-center flex-col">
          <ComMenuButonTable
            record={record}
            // showModalDetails={() => {
            //   modalDetail.handleOpen();
            //   setSelectedData(record);
            // }}
            showModalEdit={() => {
              // modalEdit.handleOpen();
              // setSelectedData(record);
              handleOpenUpdateModal(record);
            }}
            showModalDetails={() => {
              handleOpenDetailModal(record);
            }}
            // showModalDelete={() => {
            //   handleOpenDeleteModal(record.id);
            // }}
            // extraMenuItems={
            //   record?.reportStatus === "OPEN" ? extraMenuItems : extraMenuItems2
            // }
            excludeDefaultItems={["delete"]}
          />
        </div>
      ),
    },
  ];

  const handleOpenUpdateModal = (account: UserRow) => {
    setIsOpenUpdateModal(true);
    setSelectedAccount(account);
  };

  const handleOpenDetailModal = (account: UserRow) => {
    setIsOpenDetailModal(true);
    setSelectedAccount(account);
  };

  const handleCloseDetailModal = () => {
    setIsOpenDetailModal(false);
    setSelectedAccount(null);
    queryClient.invalidateQueries({
      queryKey: ["user-detail-manager"],
    });
  };

  const handleCloseUpdateModal = () => {
    setIsOpenUpdateModal(false);
    setSelectedAccount(null);
    queryClient.invalidateQueries({
      queryKey: ["user-detail-manager"],
    });
  };
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== pagination.current) {
      setPagination({
        ...pagination,
        current: pageNumber,
      });
    }
  };
  return (
    <>
      <div className="flex items-center justify-end mb-2">
        <RefreshButton
          onClick={() => reloadData(pagination, filters, sorter)}
        />
      </div>

      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#292b2f",
              headerBg: "#292b2f",
              titleColor: "white",
            },
          },
        }}
      >
        <Modal
          title="Thông tin chi tiết tài khoản"
          visible={isOpenDetailModal}
          onCancel={handleCloseDetailModal}
          footer={null}
          width={900}
          centered={true}
          className="custom-close-icon"
        >
          <AccountDetail
            account={selectedAccount}
            onClose={handleCloseDetailModal}
          />
        </Modal>
        <Modal
          title="Chỉnh sửa thông tin tài khoản"
          visible={isOpenUpdateModal} // Use state from Zustand store
          onCancel={handleCloseUpdateModal} // Close the modal on cancel
          footer={null}
          width={600} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <UpdateUserManager
            onClose={handleCloseUpdateModal}
            account={selectedAccount}
            loading={() => reloadData(pagination, filters, sorter)}
          />
        </Modal>
      </ConfigProvider>
      <Table
        // rows have no `key`; without a row key React warns about the table body list
        rowKey="id"
        loading={table.loading}
        columns={columns}
        dataSource={data}
        onChange={(pagination, filters, sorter) => {
          setFilters(filters);
          setSorter(sorter);
          reloadData(pagination, filters, sorter);
        }}
        scroll={{
          x: 1080, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
          y: "74vh", // Chiều cao cố định để bảng cuộn dọc
        }}
        pagination={{
          current: pagination.current,
          total: totalRecord,
          pageSize: pagination.pageSize,
          onChange: handlePageClick,
          showSizeChanger: false,
        }}
        showSorterTooltip={{
          target: "sorter-icon",
        }}
      />
      <ConfigProvider
        theme={{
          token: {
            colorBgContainer: "#1e1e1e",
            colorText: "#b3b3b3",
            colorPrimary: "white",
            colorBgTextHover: "#333333",
            colorBgTextActive: "#333333",
            colorTextDisabled: "#666666",
          },
        }}
      ></ConfigProvider>
    </>
  );
};

export default AccountManagerPage;
