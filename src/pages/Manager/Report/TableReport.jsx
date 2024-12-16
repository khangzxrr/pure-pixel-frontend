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
import { Image, Modal, Pagination, Tooltip } from "antd";
import { getData, patchData, putData } from "../../../apis/api";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import { useNotification } from "../../../Notification/Notification";
import ComConfirmDeleteModal from "../../../components/ComConfirmDeleteModal/ComConfirmDeleteModal";
import ComModal from "../../../components/ComModal/ComModal";
import DetailReport from "./DetailReport";
import EditUpgrede from "./EditReport";
import ComReportTypeConverter from "../../../components/ComReportTypeConverter/ComReportTypeConverter";
import ComReportStatusConverter from "../../../components/ComReportStatusConverter/ComReportStatusConverter";
import ComReportConverter from "../../../components/ComReportConverter/ComReportConverter";
import ComDateConverter from "./../../../components/ComDateConverter/ComDateConverter";
import ComFilters from "../../../components/ComFilters/ComFilters";
import {
  AlertCircle,
  BarChart,
  BarChart2,
  BarChart3,
  CheckCircle,
  Clock,
} from "lucide-react";
import { FaSearch } from "react-icons/fa";
import ComReportConverterUser from "../../../components/ComReportConverter/ComReportConverterUser";
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
export const TableReport = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const table = useTableState();
  const modal = useModalState();
  const modalDetail = useModalState();
  const modalEdit = useModalState();
  const [totalRecord, setTotalRecord] = useState(0);

  const { notificationApi } = useNotification();
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
    //   title: "Id",
    //   width: 120,
    //   fixed: "left",
    //   dataIndex: "id",
    //   key: "id",
    //   // sorter: (a, b) => a?.id?.localeCompare(b?.id),
    //   ...getColumnSearchProps("id", "Id"),
    // },
    {
      title: "Người báo cáo",
      width: 120,
      // fixed: "left",
      dataIndex: "user.name",
      key: "user",
      // sorter: (a, b) => a?.user?.name?.localeCompare(b.user?.name),
      // ...getColumnSearchProps("user.name", "Người báo cáo"),
      render: (_, record) => (
        <div className=" flex items-center gap-3">
          {record?.user?.avatar && (
            <img
              src={record?.user?.avatar || "https://via.placeholder.com/40"} // URL avatar, thêm ảnh mặc định nếu không có
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover bg-[#eee]"
            />
          )}
          <span>{record?.user?.name}</span>
        </div>
      ),
    },
    {
      title: "Thời gian báo cáo",
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
      title: "Trạng thái",
      width: 120,
      dataIndex: "reportStatuses",
      key: "reportStatuses",
      filters: [
        { text: "Chưa phản hồi", value: "OPEN" },
        // { text: "WAITING_FEEDBACK", value: "WAITING_FEEDBACK" },
        // { text: "Đã trả lời", value: "RESPONSED" },
        { text: "Đóng ", value: "CLOSED" },
      ],
      onFilter: (value, record) => record.reportStatus === value,
      // sorter: (a, b) => a?.reportStatus?.localeCompare(b?.reportStatus),
      render: (_, record) => (
        <div>
          <ComReportStatusConverter>
            {record?.reportStatus}
          </ComReportStatusConverter>
        </div>
      ),
    },
    {
      title: "Thể loại báo cáo",
      width: 100,
      dataIndex: "reportTypes",
      key: "reportTypes",
      filters: [
        { text: "Hình ảnh", value: "PHOTO" },
        { text: "Người dùng", value: "USER" },
        // { text: "Dịch vụ", value: "BOOKING" },
        // { text: "Bình luận", value: "COMMENT" },
      ],
      onFilter: (value, record) => record.reportType === value,
      // sorter: (a, b) => a?.reportTypes?.localeCompare(b?.reportTypes),
      render: (_, record) => (
        <div>
          <ComReportTypeConverter>{record?.reportType}</ComReportTypeConverter>
        </div>
      ),
    },

    {
      title: "Nội dung bị báo cáo",
      width: 180,
      dataIndex: "maxPackageCount",
      key: "maxPackageCount",
      render: (_, record) => (
        <div>
          <ComReportConverter>{record}</ComReportConverter>
        </div>
      ),
    },
    {
      title: "Nội dung",
      width: 150,
      dataIndex: "search",
      key: "search",
      // sorter: (a, b) => a?.content?.localeCompare(b?.content),
      ...getColumnSearchProps("content", "Nội dung"),
    },

    // {
    //   title: "Người bị báo cáo",
    //   width: 120,
    //   // fixed: "left",
    //   dataIndex: "userReport",
    //   key: "userReport",
    //   render: (_, record) => (
    //     <div>
    //       <ComReportConverterUser>{record}</ComReportConverterUser>
    //     </div>
    //   ),
    // },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 50,
      render: (_, record) => (
        <div className="flex items-center flex-col">
          <ComMenuButonTable
            record={record}
            showModalDetails={() => {
              modalDetail.handleOpen();
              setSelectedData(record);
            }}
            showModalEdit={() => {
              modalEdit.handleOpen();
              setSelectedData(record);
            }}
            // extraMenuItems={
            //   record?.reportStatus === "OPEN" ? extraMenuItems : extraMenuItems2
            // }
            excludeDefaultItems={["edit", "delete"]}
          />
        </div>
      ),
    },
  ];

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
    getData(`/manager/report?${new URLSearchParams(params)}`)
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

  const handleSearch = () => {};
  // console.log("====================================");
  // console.log(pagination);
  // console.log("====================================");

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== pagination.current) {
      setPagination({
        ...pagination,
        current: pageNumber,
      });
    }
  };
  return (
    <div>
      <div className="flex justify-end items-center mb-2">
        <RefreshButton
          onClick={() => reloadData(pagination, filters, sorter)}
        />
      </div>
      {/* <div className="flex justify-end">
        <ComFilters
          filterSections={filterSections}
          displayOptions={displayOptions}
        />
      </div> */}

      {/* <div className="flex items-center rounded-lg bg-[#202225] min-w-min mb-4">
        <input
          // value={inputValue}
          // onChange={handleInputChange}
          // onKeyDown={handleKeyDown}
          type="text"
          placeholder={`Tìm kiếm ...`}
          className="font-normal text-sm px-2 py-2 w-full pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
        />
        <div className=" ">
          <button className=" py-3 px-4 text-white" onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
      </div> */}
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
      {/* {totalRecord > 1 && (
        <Pagination
          current={pagination.current}
          total={totalRecord}
          onChange={handlePageClick}
          pageSize={pagination.pageSize}
          showSizeChanger={false}
          className="flex justify-end my-2"
        />
      )} */}
      <ComModal
        isOpen={modalDetail?.isModalOpen}
        onClose={modalDetail?.handleClose}
        width={800}
      >
        <DetailReport
          selected={selectedData}
          tableRef={() => {
            reloadData(pagination, filters, sorter);
          }}
          onClose={modalDetail?.handleClose}
        />
      </ComModal>
      <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        <EditUpgrede
          selectedUpgrede={selectedData}
          // tableRef={reloadData}
          onClose={modalEdit?.handleClose}
        />
      </ComModal>
    </div>
  );
});
