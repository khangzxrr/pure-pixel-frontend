import React, { useEffect, useState } from "react";
import AdminApi from "./../../apis/AdminApi";
import {
  ConfigProvider,
  message,
  Modal,
  notification,
  Pagination,
  Table,
} from "antd";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlOptions } from "react-icons/sl";
import { FaEdit } from "react-icons/fa";
import UpdateUserManager from "../../components/ComInputModal/UpdateUserManager";
import useColumnFilters from "../../components/ComTable/utils";
import { useTableState } from "../../hooks/useTableState";
import { getData } from "../../apis/api";
import ComMenuButonTable from "../../components/ComMenuButonTable/ComMenuButonTable";
import ComDateConverter from "../../components/ComDateConverter/ComDateConverter";

const AccountManagerPage = () => {
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const table = useTableState();
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState(null);
  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const {
    getColumnSearchProps,
    getColumnPriceRangeProps,
    getUniqueValues,
    getColumnFilterProps,
    getColumnApprox,
  } = useColumnFilters();

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

    console.log("====================================");

    console.log(`/user?${new URLSearchParams(params)}`);
    getData(`/user?${new URLSearchParams(params)}`)
      .then((e) => {
        setData(e?.data?.objects);
        setTotalRecord(e?.data?.totalRecord);
        console.log(e?.data?.objects);

        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        table.handleCloseLoading();

        if (error?.status === 401) {
          // reloadData(pagination, filters, sorter);
        }
      });
  };
  useEffect(() => {
    reloadData(pagination, filters, sorter);
  }, [pagination]);

  const columns = [
    { title: "ID", dataIndex: "id", ...getColumnSearchProps("id", "id") },
    {
      title: "Tên",
      dataIndex: "search",
      ...getColumnSearchProps("name", "Tên"),

      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.avatar || "https://via.placeholder.com/40"} // URL avatar, thêm ảnh mặc định nếu không có
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover bg-[#eee]"
          />
          <span>{record.name}</span>
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
      sorter: (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt),

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
            // showModalDelete={() => {
            //   handleOpenDeleteModal(record.id);
            // }}
            // extraMenuItems={
            //   record?.reportStatus === "OPEN" ? extraMenuItems : extraMenuItems2
            // }
            excludeDefaultItems={["details", "delete"]}
          />
        </div>
      ),
    },
  ];

  const handleOpenUpdateModal = (account) => {
    setIsOpenUpdateModal(true);
    setSelectedAccount(account);
  };

  const handleCloseUpdateModal = () => {
    setIsOpenUpdateModal(false);
    setSelectedAccount(null);
    queryClient.invalidateQueries({
      queryKey: ["user-detail-manager"],
    });
  };
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== pagination.current) {
      setPagination({
        ...pagination,
        current: pageNumber,
      });
    }
  };
  return (
    <>
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
