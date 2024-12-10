import React, { useState } from "react";
import {
  ConfigProvider,
  message,
  Modal,
  notification,
  Pagination,
  Table,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ManagerPhotoApi from "../../../apis/ManagerPhotoApi";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlOptions } from "react-icons/sl";
import DeleteWarning from "../../../components/ComWarning/DeleteWarning";
import UpdatePhotoInManager from "../../../components/ComInputModal/UpdatePhotoInManager";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { notificationApi } from "../../../Notification/Notification";
import { useNavigate } from "react-router-dom";

const PhotoManager2 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortDate, setSortDate] = useState("desc");
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const itemsPerPage = 10;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["manager-photos", page, sortDate],
    queryFn: () =>
      ManagerPhotoApi.getAllPhotos(itemsPerPage, page - 1, null, sortDate),
    keepPreviousData: true,
  });
  4;

  const handleOpenDeleteModal = (photoId) => {
    setIsModalOpen(true);
    setSelectedPhotoId(photoId);
  };
  const handleCloseDeleteModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenUpdateModal = (photo) => {
    setIsModalUpdateOpen(true);
    setSelectedPhoto(photo);
  };
  const deletePhoto = useMutation({
    mutationFn: (photoId) => ManagerPhotoApi.deletePhoto(photoId),
  });

  const handleDeletePhoto = () => {
    deletePhoto.mutate(selectedPhotoId, {
      onSuccess: () => {
        notificationApi(
          "success",
          "Xóa ảnh thành công",
          `Ảnh có ID ${selectedPhotoId} đã được xóa.`
        );
        queryClient.invalidateQueries({ queryKey: ["manager-photos"] });
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };
  const handleCloseUpdateModal = () => {
    setIsModalUpdateOpen(false);
    setSelectedPhoto(null);
  };
  const photosList = data?.objects;

  const totalPages = data?.totalPage || 1;
  const columns = [
    {
      title: "ID ảnh",
      dataIndex: "photoId",
      width: 300,
      render: (photoId) => (
        <div
          className="hover:text-blue-500 hover:underline underline-offset-2 hover:cursor-pointer"
          onClick={() => navigate(`/photo/${photoId}`)}
        >
          {photoId}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "photoUrl",
      render: (photoUrl) => (
        // Assuming photoUrl is the URL to the image thumbnail
        <img src={photoUrl} alt="Photo Thumbnail" width="50" height="50" />
      ),
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Tên ảnh",
      dataIndex: "photoName",
      render: (photoName) => (
        <div className="truncate max-w-[200px]">{photoName}</div>
      ),

      // filters: [
      //   {
      //     text: "London",
      //     value: "London",
      //   },
      //   {
      //     text: "New York",
      //     value: "New York",
      //   },
      // ],
      // onFilter: (value, record) => record.address.indexOf(value) === 0,
    },
    {
      title: "Người dùng",
      dataIndex: "user",
      render: (user) => <div className="truncate w-[200px]">{user}</div>,
    },
    {
      title: "Loại ảnh",
      dataIndex: "photoType",
    },
    {
      title: "Danh mục",
      dataIndex: "categories",
      render: (categories) => (
        <div>
          {categories?.map((category) => (
            <div key={category.id} className="text-[#eee] text-sm">
              {category.name}
            </div>
          ))}
        </div>
      ),
    },

    {
      title: (
        <div className="flex justify-between items-center">
          <div>Ngày tạo</div>
          <div
            onClick={() =>
              sortDate === "asc" ? setSortDate("desc") : setSortDate("asc")
            }
          >
            {sortDate === "asc" ? <IoMdArrowDropdown /> : <IoMdArrowDropup />}
          </div>
        </div>
      ),
      dataIndex: "createdAt",
    },
    {
      title: "Thao tác",
      dataIndex: "button",
    },
  ];
  const dataPhotosTable = photosList?.map((photo) => ({
    key: photo.id,
    photoId: photo.id,
    photoUrl: photo.signedUrl?.thumbnail,
    photoName: photo.title,
    photoType: photo.photoType,
    user: photo.photographer?.name,
    categories: photo.categories,
    createdAt: FormatDateTime(photo.createdAt), // Format photo.createdAt,
    button: (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-90 ">
            <SlOptions
              aria-hidden="true"
              className="-mr-1 size-5 text-gray-400"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10  w-32 origin-top-right rounded-md bg-[#202225]  transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            <MenuItem>
              <div
                onClick={() => handleOpenUpdateModal(photo)}
                className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                Chỉnh sửa
              </div>
            </MenuItem>
            <MenuItem>
              <div
                onClick={() => handleOpenDeleteModal(photo.id)}
                className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-red-500  data-[focus]:outline-none"
              >
                Xóa
              </div>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    ),
  }));

  const onChange = (filters, sorter, extra) => {
    console.log("params", filters, sorter, extra);
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
          title=""
          visible={isModalUpdateOpen} // Use state from Zustand store
          onCancel={handleCloseUpdateModal} // Close the modal on cancel
          footer={null}
          width={1100} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <UpdatePhotoInManager
            onClose={handleCloseUpdateModal}
            photo={selectedPhoto}
          />
        </Modal>
        <Modal
          title=""
          visible={isModalOpen} // Use state from Zustand store
          onCancel={handleCloseDeleteModal} // Close the modal on cancel
          footer={null}
          width={500} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <DeleteWarning
            onClose={handleCloseDeleteModal}
            onDelete={handleDeletePhoto}
          />
        </Modal>
      </ConfigProvider>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={dataPhotosTable}
        onChange={onChange}
        scroll={{
          x: 1080, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
          y: "74vh", // Chiều cao cố định để bảng cuộn dọc
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

export default PhotoManager2;
