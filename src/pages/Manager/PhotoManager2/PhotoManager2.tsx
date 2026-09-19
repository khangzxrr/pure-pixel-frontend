import { useEffect, useState } from "react";
import {
  ConfigProvider,
  Image,
  message,
  Modal,
  Table,
  type TableProps,
} from "antd";
import type {
  FilterValue,
  SorterResult,
  TablePaginationConfig,
} from "antd/es/table/interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import ManagerPhotoApi from "../../../apis/ManagerPhotoApi";
import type { ResponseOf, Schema } from "../../../apis/types";
import DeleteWarning from "../../../components/ComWarning/DeleteWarning";
import UpdatePhotoInManager from "../../../components/ComInputModal/UpdatePhotoInManager";
import { notificationApi } from "../../../Notification/Notification";
import useColumnFilters from "../../../components/ComTable/utils";
import { useTableState } from "../../../hooks/useTableState";
import { getData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import RefreshButton from "../../../components/ComButton/RefreshButton";
import { FaCheckSquare } from "react-icons/fa";

type ManagerPhoto = Schema<"SignedPhotoDto">;
type PhotoList = ResponseOf<"ManagePhotoController_findAllPhotos">;
type TableFilters = Record<string, FilterValue | null>;
type TableSorter = SorterResult<ManagerPhoto> | SorterResult<ManagerPhoto>[];

const PhotoManager2 = () => {
  const queryClient = useQueryClient();
  // only read once the delete dialog opened for a photo
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<ManagerPhoto | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [totalRecord, setTotalRecord] = useState(0);
  const table = useTableState();
  const [filters, setFilters] = useState<TableFilters>({});
  const [sorter, setSorter] = useState<TableSorter | null>(null);
  const [data, setData] = useState<ManagerPhoto[]>([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { getColumnSearchProps } = useColumnFilters();

  const reloadData = (
    pagination?: TablePaginationConfig,
    filters?: TableFilters,
    sorter?: TableSorter | null,
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
            const previous = params[key];
            params[key] = Array.isArray(previous) ? [...previous, item] : [item];
          });
        } else if (value) {
          // Nếu giá trị không phải là mảng, thêm trực tiếp vào params
          params[key] = value;
        }
      });
    }

    // a multi-column sort has no single field
    const singleSorter = Array.isArray(sorter) ? undefined : sorter;
    if (singleSorter && singleSorter.field && singleSorter.order) {
      // Chuyển đổi tên trường và kiểu sắp xếp thành format bạn mong muốn
      const sortField = singleSorter.field;
      const sortOrder = singleSorter.order === "ascend" ? "asc" : "desc";
      // Giả sử bạn muốn tham số sắp xếp theo định dạng "orderBy<FieldName>"
      params[String(sortField)] = sortOrder;
    } else {
      params["orderByCreatedAt"] = "desc";
    }

    // console.log("====================================");

    // arrays are joined with commas, like URLSearchParams does with a plain object
    const search = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    );
    // console.log(`/manager/photo?${new URLSearchParams(params)}`);
    getData<PhotoList>(`/manager/photo?${search}`)
      .then((e) => {
        setData(e?.data?.objects);
        setTotalRecord(e?.data?.totalRecord);
        // console.log(e?.data?.objects);

        table.handleCloseLoading();
      })
      .catch((error: unknown) => {
        console.error("Error fetching items:", error);
        table.handleCloseLoading();

        if (isAxiosError(error) && error.status === 401) {
          // reloadData(pagination, filters, sorter);
        }
      });
  };

  useEffect(() => {
    reloadData(pagination, filters, sorter);
  }, [pagination]);

  const handleOpenDeleteModal = (photoId: string) => {
    setIsModalOpen(true);
    setSelectedPhotoId(photoId);
  };
  const handleCloseDeleteModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenUpdateModal = (photo: ManagerPhoto) => {
    setIsModalUpdateOpen(true);
    setSelectedPhoto(photo);
  };
  const deletePhoto = useMutation({
    mutationFn: (photoId: string) => ManagerPhotoApi.deletePhoto(photoId),
  });

  const handleDeletePhoto = () => {
    deletePhoto.mutate(selectedPhotoId, {
      onSuccess: () => {
        notificationApi?.(
          "success",
          "Xóa ảnh thành công",
          `Ảnh có ID ${selectedPhotoId} đã được xóa.`,
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
  const columns: TableProps<ManagerPhoto>["columns"] = [
    // {
    //   title: "ID ảnh",
    //   dataIndex: "id",
    //   width: 300,
    //   ...getColumnSearchProps("id", "Tên ảnh"),

    //   render: (id) => (
    //     <div
    //     // className="hover:text-blue-500 hover:underline underline-offset-2 hover:cursor-pointer"
    //     // // onClick={() => navigate(`/photo/${id}`)}
    //     >
    //       {id}
    //     </div>
    //   ),
    // },
    {
      title: "Tên ảnh",
      dataIndex: "title",
      ...getColumnSearchProps<ManagerPhoto>("title", "Tên ảnh"),

      render: (title: string) => <div className="">{title}</div>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "img",
      render: (_, data) => (
        <div className="flex justify-center items-center">
          {data?.signedUrl?.thumbnail && (
            <div className="size-20 overflow-hidden ">
              <Image
                wrapperClassName="w-full h-full object-cover object-center flex items-center justify-center "
                src={data?.signedUrl?.thumbnail}
                alt="Photo Thumbnail"
              />
            </div>
          )}
        </div>
        // Assuming photoUrl is the URL to the image thumbnail
      ),
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.age - b.age,
    },

    {
      title: "Người dùng",
      dataIndex: "photographerName",
      ...getColumnSearchProps<ManagerPhoto>(
        "photographer.name",
        "Tên người dùng",
      ),

      render: (_, user) => (
        <div className="truncate w-[200px]">{user?.photographer?.name}</div>
      ),
    },
    {
      title: "Loại ảnh",
      dataIndex: "photoType",
      filters: [
        { text: "RAW", value: "RAW" },
        { text: "BOOKING", value: "BOOKING" },
      ],
      onFilter: (value, record) => record.photoType === value,
    },
    {
      title: "Ảnh bán",
      dataIndex: "isSell",
      render: (_, data) => (
        <div className="truncate w-[200px]">
          {(data?.photoSellings?.length ?? 0) > 0 ? (
            <FaCheckSquare className="text-green-500 text-2xl" />
          ) : null}
        </div>
      ),
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
          {data?.status === "PENDING" && (
            <div className="text-yellow-500">Đang chờ</div>
          )}
          {data?.status === "PARSED" && (
            <div className="text-green-500">Hoạt động</div>
          )}
          {data?.status === "DUPLICATED" && (
            <div className="text-blue-500">Bị trùng lặp</div>
          )}
          {data?.status === "BAN" && <div className="text-red-500">Khóa</div>}
        </div>
      ),
    },
    {
      title: "Quyền riêng tư",
      dataIndex: "visibility",
      filters: [
        { text: "Công khai", value: "PUBLIC" },
        { text: "Riêng tư", value: "PRIVATE" },
      ],
      onFilter: (value, record) => record.visibility === value,
      render: (_, data) => (
        <div className="">
          {data?.visibility === "PUBLIC" && "Công khai"}
          {data?.visibility === "PRIVATE" && "Riêng tư"}
        </div>
      ),
    },

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

  // const handlePageClick = (pageNumber) => {
  //   if (pageNumber !== page) {
  //     setPage(pageNumber);
  //   }
  // };
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
