import React, { useRef } from "react";
import { TableReport } from "./TableReport";
import { useModalState } from "../../../hooks/useModalState";

export default function Report() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <TableReport ref={tableRef} />
    </>
  );
}
