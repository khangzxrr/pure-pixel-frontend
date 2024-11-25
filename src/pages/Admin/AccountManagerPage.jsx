import React, { useState } from "react";
import AdminApi from "./../../apis/AdminApi";
import {
  ConfigProvider,
  message,
  Modal,
  notification,
  Pagination,
  Table,
} from "antd";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlOptions } from "react-icons/sl";
import { FaEdit } from "react-icons/fa";
import UpdateUserManager from "../../components/ComInputModal/UpdateUserManager";

const AccountManagerPage = () => {
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users-manager", page],
    queryFn: () => AdminApi.getUserManager(itemsPerPage, page - 1),
    keepPreviousData: true,
  });

  //   if (isLoading) {
  //     return <div>Loading...</div>;
  //   }
  const userList = data?.objects;
  // console.log(userList);
  const totalPages = data?.totalPage || 1;
  const onChange = (filters, sorter, extra) => {
    // console.log("params", filters, sorter, extra);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Tên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "phone" },
    { title: "Địa chỉ", dataIndex: "address" },
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
    { title: "Thao tác", dataIndex: "action" },
  ];

  const filteredUserList = userList?.filter(
    (user) => !user.roles?.includes("purepixel-admin")
  );

  const dataUsersTable = filteredUserList?.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phonenumber,
    address: user.location,
    // role: user.roles
    //   ?.map((role) => {
    //     if (role === "photographer") return "Nhiếp ảnh gia";
    //     if (role === "purepixel-admin") return "Quản trị viên";
    //     if (role === "customer") return "Người dùng";
    //     if (role === "manager") return "Quản lý";
    //     return role;
    //   })
    //   .join(", "),
    // status: user.enabled ? "Đang hoạt động" : "Ngưng hoạt động",
    action: (
      <div
        onClick={() => handleOpenUpdateModal(user)}
        className="flex items-center gap-2 hover:cursor-pointer text-blue-500"
      >
        <FaEdit className="text-xl" />
        Chỉnh sửa
      </div>
    ),
  }));
  const handleOpenUpdateModal = (account) => {
    setSelectedAccount(account);
    setIsOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setIsOpenUpdateModal(false);
    setSelectedAccount(null);
  };
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
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
          />
        </Modal>
      </ConfigProvider>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={dataUsersTable}
        onChange={onChange}
        scroll={{
          x: 1020, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
          y: "73vh", // Chiều cao cố định để bảng cuộn dọc
        }}
        pagination={false}
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
      >
        {totalPages > 1 && (
          <Pagination
            current={page}
            total={totalPages * itemsPerPage}
            onChange={handlePageClick}
            pageSize={itemsPerPage}
            showSizeChanger={false}
            className="flex justify-end my-2"
          />
        )}
      </ConfigProvider>
    </>
  );
};

export default AccountManagerPage;
