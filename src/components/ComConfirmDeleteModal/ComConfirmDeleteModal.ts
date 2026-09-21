import type { ReactNode } from "react";
import { appModal } from "../../theme/antdApp";
import { deleteData, putData } from "../../apis/api";

// asks for confirmation, then deletes `${apiPath}/${id}` (or marks it Deleted with put)
const ComConfirmDeleteModal = async (
  apiPath: string,
  id: string | number,
  message: ReactNode,
  onSuccess: () => void,
  oke: () => void,
  failed: () => void,
  put?: boolean,
) => {
  if (put) {
    appModal().confirm({
      title: "Xác nhận xóa",
      content: message,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        putData(`${apiPath}`, `${id}/change-state`, {
          state: "Deleted",
        })
          .then(() => {
            onSuccess();
            oke();
          })
          .catch((error) => {
            failed();
            console.log("error", error);
          });
      },
    });
  } else {
    appModal().confirm({
      title: "Xác nhận xóa",
      content: message,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        deleteData(`${apiPath}`, id)
          .then(() => {
            onSuccess();
            oke();
          })
          .catch((error) => {
            failed();
            console.log("error", error);
          });
      },
    });
  }
};

export default ComConfirmDeleteModal;
