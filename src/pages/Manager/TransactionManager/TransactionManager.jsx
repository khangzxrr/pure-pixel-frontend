import React, { useRef } from "react";
import { useModalState } from "../../../hooks/useModalState";
import { TableTransaction } from "./TableTransaction";


export default function TransactionManager() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <TableTransaction ref={tableRef} />
    </>
  );
}
