import { useRef } from "react";
import { TableCamera, type TableCameraHandle } from "./TableCamera";

export default function CameraManager() {
  const tableRef = useRef<TableCameraHandle>(null);
  return (
    <>
      <TableCamera ref={tableRef} />
    </>
  );
}
