import { useRef } from "react";
import { TableServicePackage } from "./TableServicePackage";

export default function ServicePackageManager() {
  const tableRef = useRef(null);
  return (
    <>
      <TableServicePackage ref={tableRef} />
    </>
  );
}
