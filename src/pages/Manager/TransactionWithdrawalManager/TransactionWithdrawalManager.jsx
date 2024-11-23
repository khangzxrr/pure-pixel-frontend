import { useRef } from "react";
import { TableTransactionWithdrawal } from "./TableTransactionWithdrawal";

export default function TransactionWithdrawalManager() {
  const tableRef = useRef(null);
  return (
    <>
      <TableTransactionWithdrawal ref={tableRef} />
    </>
  );
}
