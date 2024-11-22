import { useRef } from "react";
import { TableCamera } from "./TableCamera";

export default function CameraManager() {
  const tableRef = useRef(null);
  return (
    <>
      <TableCamera ref={tableRef} />
    </>
  );
}
