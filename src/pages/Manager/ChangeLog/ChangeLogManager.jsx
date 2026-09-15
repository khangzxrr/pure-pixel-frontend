import React, { useRef } from "react";
import { TableChangeLog } from "./TableChangeLog";
import { useModalState } from "../../../hooks/useModalState";
import ComModal from "../../../components/ComModal/ComModal";
import ComButton from "../../../components/ComButton/ComButton";
import ChangeLogForm from "./ChangeLogForm";

export default function ChangeLogManager() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <div className="flex justify-end pb-2">
        <div>
          <ComButton onClick={modal.handleOpen}>+ Tạo bản cập nhật</ComButton>
        </div>
      </div>
      <TableChangeLog ref={tableRef} />
      <ComModal
        width={800}
        isOpen={modal?.isModalOpen}
        onClose={modal?.handleClose}
      >
        <ChangeLogForm
          onClose={modal?.handleClose}
          onSaved={() => tableRef.current?.reloadData()}
        />
      </ComModal>
    </>
  );
}
