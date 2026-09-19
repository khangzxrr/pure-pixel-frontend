import { useRef } from "react";
import {
  TableServicePackage,
  type TableServicePackageHandle,
} from "./TableServicePackage";

export default function ServicePackageManager() {
  const tableRef = useRef<TableServicePackageHandle>(null);
  return (
    <>
      <TableServicePackage ref={tableRef} />
    </>
  );
}
