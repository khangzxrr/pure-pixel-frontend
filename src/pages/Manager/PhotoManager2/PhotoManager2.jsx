import React, { useEffect, useState } from "react";
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
import useColumnFilters from "../../../components/ComTable/utils";
import { useTableState } from "../../../hooks/useTableState";
import { getData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import RefreshButton from "../../../components/ComButton/RefreshButton";

const PhotoManager2 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortDate, setSortDate] = useState("desc");
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [totalRecord, setTotalRecord] = useState(0);
  const itemsPerPage = 10;
  const table = useTableState();
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState(null);
  const [data, setData] = useState([]);

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

    // console.log("====================================");

    // console.log(`/manager/photo?${new URLSearchParams(params)}`);
    getData(`/manager/photo?${new URLSearchParams(params)}`)
      .then((e) => {
        setData(e?.data?.objects);
        setTotalRecord(e?.data?.totalRecord);
        // console.log(e?.data?.objects);

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

  const reLoadCurrentPage = () => {
    reloadData(pagination, filters, sorter);
  };

  useEffect(() => {
    reloadData(pagination, filters, sorter);
  }, [pagination]);

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
        reloadData(pagination, filters, sorter);
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
  const columns = [
    {
      title: "ID ảnh",
      dataIndex: "id",
      width: 300,
      ...getColumnSearchProps("id", "Tên ảnh"),

      render: (id) => (
        <div
        // className="hover:text-blue-500 hover:underline underline-offset-2 hover:cursor-pointer"
        // // onClick={() => navigate(`/photo/${id}`)}
        >
          {id}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "img",
      render: (_, data) => (
        // Assuming photoUrl is the URL to the image thumbnail
        <img
          src={data?.signedUrl?.thumbnail}
          alt="Photo Thumbnail"
          width="50"
          height="50"
        />
      ),
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Tên ảnh",
      dataIndex: "title",
      ...getColumnSearchProps("title", "Tên ảnh"),

      render: (title) => <div className="truncate max-w-[200px]">{title}</div>,
    },
    {
      title: "Người dùng",
      dataIndex: "photographerName",
      ...getColumnSearchProps("photographer.name", "Tên người dùng"),

      render: (_, user) => (
        <div className="truncate w-[200px]">{user?.photographer?.name}</div>
      ),
    },
    {
      title: "Loại ảnh",
      dataIndex: "photoType",
    },
    {
      title: "Trạng thái",
      dataIndex: "statuses",
      filters: [
        { text: "Đang chờ", value: "PENDING" },
        { text: "Hoạt động", value: "PARSED" },
        { text: "Bị trùng lặp", value: "DUPLICATED" },
        { text: "Khóa", value: "BAN" },
      ],
      onFilter: (value, record) => record.status === value,

      render: (_, data) => (
        <div className="truncate w-[200px]">
          {data?.status === "PENDING" && "Đang chờ"}
          {data?.status === "PARSED" && "Hoạt động"}
          {data?.status === "DUPLICATED" && "Bị trùng lặp"}
          {data?.status === "BAN" && "Khóa"}
        </div>
      ),
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
            showModalDelete={() => {
              handleOpenDeleteModal(record.id);
            }}
            // extraMenuItems={
            //   record?.reportStatus === "OPEN" ? extraMenuItems : extraMenuItems2
            // }
            excludeDefaultItems={["details", "delete"]}
          />
        </div>
      ),
    },
  ];
  // const dataPhotosTable = photosList?.map((photo) => ({
  //   key: photo.id,
  //   photoId: photo.id,
  //   photoUrl: photo.signedUrl?.thumbnail,
  //   photoName: photo.title,
  //   photoType: photo.photoType,
  //   user: photo.photographer?.name,
  //   categories: photo.categories,
  //   createdAt: FormatDateTime(photo.createdAt), // Format photo.createdAt,
  //   button: (
  //     <Menu as="div" className="relative inline-block text-left">
  //       <div>
  //         <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-90 ">
  //           <SlOptions
  //             aria-hidden="true"
  //             className="-mr-1 size-5 text-gray-400"
  //           />
  //         </MenuButton>
  //       </div>

  //       <MenuItems
  //         transition
  //         className="absolute right-0 z-10  w-32 origin-top-right rounded-md bg-[#202225]  transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
  //       >
  //         <div className="py-1">
  //           <MenuItem>
  //             <div
  //               onClick={() => handleOpenUpdateModal(photo)}
  //               className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
  //             >
  //               Chỉnh sửa
  //             </div>
  //           </MenuItem>
  //           <MenuItem>
  //             <div
  //               onClick={() => handleOpenDeleteModal(photo.id)}
  //               className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-red-500  data-[focus]:outline-none"
  //             >
  //               Xóa
  //             </div>
  //           </MenuItem>
  //         </div>
  //       </MenuItems>
  //     </Menu>
  //   ),
  // }));

  const onChange = (filters, sorter, extra) => {
    console.log("params", filters, sorter, extra);
  };

  // const handlePageClick = (pageNumber) => {
  //   if (pageNumber !== page) {
  //     setPage(pageNumber);
  //   }
  // };
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
          title=""
          visible={isModalUpdateOpen} // Use state from Zustand store
          onCancel={handleCloseUpdateModal} // Close the modal on cancel
          footer={null}
          width={1200} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <UpdatePhotoInManager
            onClose={handleCloseUpdateModal}
            photo={selectedPhoto}
            loading={() => reloadData(pagination, filters, sorter)}
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
          y: "72vh", // Chiều cao cố định để bảng cuộn dọc
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
      >
        {/* {totalPages > 1 && (
          <Pagination
            current={page}
            total={totalPages * itemsPerPage}
            onChange={handlePageClick}
            pageSize={itemsPerPage}
            showSizeChanger={false}
            className="flex justify-end my-2"
          />
        )} */}
      </ConfigProvider>
    </>
  );
};

export default PhotoManager2;
