import { useRef } from "react";
import { TablePhoto } from "./TablePhoto";

export default function PhotoManager() {
  const tableRef = useRef(null);
  return (
    <>
      <TablePhoto ref={tableRef} />
    </>
  );
}
