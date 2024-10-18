import React, { useRef } from "react";
import { TableBlog } from "./TableBlog";
import { useModalState } from "../../../hooks/useModalState";
import ComModal from "../../../components/ComModal/ComModal";
import ComButton from "../../../components/ComButton/ComButton";
import CreateBlog from "./CreateBlog";

export default function BlogManager() {
  const modal = useModalState();
  const tableRef = useRef(null);
  return (
    <>
      <div className="flex justify-end pb-2">
        <div>
          <ComButton onClick={modal.handleOpen}>+ Tạo mới blog</ComButton>
        </div>
      </div>
      <TableBlog ref={tableRef} />
      <ComModal
        width={800}
        isOpen={modal?.isModalOpen}
        onClose={modal?.handleClose}
      >
        <CreateBlog onClose={modal?.handleClose} tableRef={tableRef} />
      </ComModal>
    </>
  );
}
