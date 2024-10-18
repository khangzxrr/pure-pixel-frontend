import React, { useRef } from "react";
import { TableReport } from "./TableReport";
import { useModalState } from "../../../hooks/useModalState";
import ComModal from "./../../../components/ComModal/ComModal";
import ComButton from "../../../components/ComButton/ComButton";
import CreateUpgrade from "./CreateUpgrade";

export default function Report() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <TableReport ref={tableRef} />
      <ComModal
        width={800}
        isOpen={modal?.isModalOpen}
        onClose={modal?.handleClose}
      >
        <CreateUpgrade onClose={modal?.handleClose} tableRef={tableRef} />
      </ComModal>
    </>
  );
}
