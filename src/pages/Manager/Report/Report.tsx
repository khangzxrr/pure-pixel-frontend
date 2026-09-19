import { useRef } from "react";
import { TableReport, type TableReportHandle } from "./TableReport";

export default function Report() {
  const tableRef = useRef<TableReportHandle>(null);
  return (
    <>
      <TableReport ref={tableRef} />
    </>
  );
}
