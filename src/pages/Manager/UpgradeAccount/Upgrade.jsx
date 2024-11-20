import React, { useRef } from "react";
import { TableUpgrade } from "./TableUpgrade";
import { useModalState } from "../../../hooks/useModalState";
import ComModal from "./../../../components/ComModal/ComModal";
import ComButton from "../../../components/ComButton/ComButton";
import CreateUpgrade from "./CreateUpgrade";

export default function Upgrade() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <div className="flex justify-end pb-2">
        <div>
          <ComButton onClick={modal.handleOpen}>+ Tạo mới gói</ComButton>
        </div>
      </div>
      <TableUpgrade ref={tableRef} />
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
