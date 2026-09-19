import { forwardRef, useEffect, useState, type Key } from "react";
import type { TableProps } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useTableState } from "../../../hooks/useTableState";
import { useModalState } from "../../../hooks/useModalState";
import ComTable from "../../../components/ComTable/ComTable";
import useColumnFilters from "../../../components/ComTable/utils";
import { getData } from "../../../apis/api";
import type { ResponseOf, Schema } from "../../../apis/types";
import ComMenuButonTable from "../../../components/ComMenuButonTable/ComMenuButonTable";
import ComModal from "../../../components/ComModal/ComModal";
import DetailReport, { type ReportSelection } from "./DetailReport";
import ComReportTypeConverter from "../../../components/ComReportTypeConverter/ComReportTypeConverter";
import ComReportStatusConverter from "../../../components/ComReportStatusConverter/ComReportStatusConverter";
import ComReportConverter from "../../../components/ComReportConverter/ComReportConverter";
import ComDateConverter from "./../../../components/ComDateConverter/ComDateConverter";
import RefreshButton from "../../../components/ComButton/RefreshButton";
import BookingReport from "./BookingReport";

type ReportRow = Schema<"ReportDto">;
type ReportPagination = { current?: number; pageSize?: number };
type ReportFilters = Record<string, FilterValue | null>;
type ReportSorter = SorterResult<ReportRow> | SorterResult<ReportRow>[] | null;

export type TableReportHandle = Record<string, never>;

export const TableReport = forwardRef<TableReportHandle, object>(
  (_props, _ref) => {
    const [data, setData] = useState<ReportRow[]>([]);
    const [selectedData, setSelectedData] = useState<ReportSelection>({});
    const table = useTableState();
    const modalDetail = useModalState();
    const [totalRecord, setTotalRecord] = useState(0);

    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 7,
    });
    const [filters, setFilters] = useState<ReportFilters>({});
    const [sorter, setSorter] = useState<ReportSorter>(null);
    const { getColumnSearchProps } = useColumnFilters();
    const columns: TableProps<ReportRow>["columns"] = [
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
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
          { text: "Gói chụp ảnh từ khách", value: "BOOKING" },
          {
            text: "Gói chụp ảnh từ nhiếp ảnh gia",
            value: "BOOKING_PHOTOGRAPHER_REPORT_USER",
          },

          // { text: "Bình luận", value: "COMMENT" },
        ],
        onFilter: (value, record) => record.reportType === value,
        // sorter: (a, b) => a?.reportTypes?.localeCompare(b?.reportTypes),
        render: (_, record) => (
          <div>
            <ComReportTypeConverter>
              {record?.reportType}
            </ComReportTypeConverter>
          </div>
        ),
      },

      {
        title: "Đối tượng bị báo cáo",
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
        ...getColumnSearchProps<ReportRow>("content", "Nội dung"),
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
              // showModalEdit={() => {
              //   modalEdit.handleOpen();
              //   setSelectedData(record);
              // }}
              // extraMenuItems={
              //   record?.reportStatus === "OPEN" ? extraMenuItems : extraMenuItems2
              // }
              excludeDefaultItems={["edit", "delete"]}
            />
          </div>
        ),
      },
    ];

    const reloadData = (
      pagination: ReportPagination,
      filters: ReportFilters,
      sorter: ReportSorter,
    ) => {
      table.handleOpenLoading();
      const params: Record<
        string,
        string | number | undefined | Array<Key | boolean>
      > = {};

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
              params[key] = Array.isArray(current)
                ? [...current, item]
                : [item];
            });
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
      // if (sorter && sorter.field && sorter.order) {
      //   params.sortBy = sorter.field;
      //   params.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      // }
      // console.log("====================================");
      // console.log(123, urlParams);
      // console.log(123, `/manager/report?${urlParams}`);

      // console.log("====================================");
      // URLSearchParams stringifies every value, lists as comma separated
      const query = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      );
      getData<ResponseOf<"ManagerReportController_getReports">>(
        `/manager/report?${query}`,
      )
        .then((e) => {
          setData(e.data.objects);
          setTotalRecord(e.data.totalRecord);

          table.handleCloseLoading();
        })
        .catch((error: unknown) => {
          console.error("Error fetching items:", error);
        });
    };
    useEffect(() => {
      reloadData(pagination, filters, sorter);
    }, [pagination]);

    // console.log("====================================");
    // console.log(pagination);
    // console.log("====================================");

    const handlePageClick = (pageNumber: number) => {
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
          {(selectedData && selectedData?.reportType === "BOOKING") ||
          selectedData?.reportType === "BOOKING_PHOTOGRAPHER_REPORT_USER" ? (
            <BookingReport
              selectedData={selectedData}
              tableRef={() => {
                reloadData(pagination, filters, sorter);
              }}
              onClose={modalDetail?.handleClose}
            />
          ) : (
            <DetailReport
              selected={selectedData}
              tableRef={() => {
                reloadData(pagination, filters, sorter);
              }}
              onClose={modalDetail?.handleClose}
            />
          )}
        </ComModal>
        {/* <ComModal
        isOpen={modalEdit?.isModalOpen}
        onClose={modalEdit?.handleClose}
        width={800}
      >
        <EditUpgrede
          selectedUpgrede={selectedData}
          // tableRef={reloadData}
          onClose={modalEdit?.handleClose}
        />
      </ComModal> */}
      </div>
    );
  },
);

TableReport.displayName = "TableReport";
