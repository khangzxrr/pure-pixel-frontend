import React from "react";

const DeleteWarning = ({ onClose, onDelete, loading }) => {
  const handleDelete = () => {
    
    onDelete();
    onClose();
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="text-[#eee]">
        Bạn có chắc chắn muốn
        <span className="font-bold text-red-500"> XÓA</span> hình ảnh này không?
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 place-items-stretch w-full">
        <button
          onClick={onClose}
          className="flex items-center justify-center px-2 py-1 bg-[#eee] text-[#202225] rounded-md"
        >
          Hủy bỏ
        </button>
        <button
          onClick={() => handleDelete()}
          className="flex items-center justify-center bg-red-500 text-[#eee] rounded-md"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default DeleteWarning;
