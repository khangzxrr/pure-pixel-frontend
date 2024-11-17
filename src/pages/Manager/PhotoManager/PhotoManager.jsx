import React, { useRef } from "react";
import { useModalState } from "../../../hooks/useModalState";
import { TablePhoto } from "./TablePhoto";


export default function PhotoManager() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <TablePhoto ref={tableRef} />
    </>
  );
}
