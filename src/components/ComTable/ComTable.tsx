import { Table, type TableProps } from "antd";
import type { Key } from "react";

export type ComTableProps<T extends { id: Key }> = TableProps<T> & {
  // horizontal scroll width, 1520 by default
  x?: string | number | true;
  // table body height, 55vh by default
  y?: string | number;
  dataSource: readonly T[];
};

// rows are keyed by id; pagination, scroll and anything else can be overridden through props
export default function ComTable<T extends { id: Key }>({
  x,
  y,
  columns,
  dataSource,
  loading,
  ...props
}: ComTableProps<T>) {
  return (
    <>
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={dataSource}
        scroll={{
          x: x || 1520,
          y: y || "55vh",
        }}
        // bordered
        pagination={{
          hideOnSinglePage: true,

          showSizeChanger: dataSource.length >= 10,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        loading={loading}
        {...props}
      />
    </>
  );
}
