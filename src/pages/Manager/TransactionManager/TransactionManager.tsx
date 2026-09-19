import { useRef } from "react";
import { TableTransaction } from "./TableTransaction";

export default function TransactionManager() {
  const tableRef = useRef(null);
  return (
    <>
      <TableTransaction ref={tableRef} />
    </>
  );
}
