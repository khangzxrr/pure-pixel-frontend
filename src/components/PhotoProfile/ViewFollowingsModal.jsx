import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

const ViewFollowingsModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Tạo hiệu ứng mở modal khi component mount
    setIsVisible(true);
    return () => {
      // Đảm bảo modal biến mất khi unmount
      setIsVisible(false);
    };
  }, []);
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen overflow-y-auto flex justify-center items-center`}
    >
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } flex justify-center items-center bg-[#43474e]  text-[#eee] rounded-lg  relative`}
      >
        <div className="flex flex-col w-[600px] max-h-[600px] relative gap-2">
          <button className="absolute right-0 m-1" onClick={onClose}>
            <IoCloseSharp className="size-6" />
          </button>
          <span className="flex justify-center w-full  bg-[#202225] rounded-t-lg p-2 ">
            Danh sách đang theo dõi
          </span>
          <div className="flex flex-col px-2">
            <div className="flex items-center justify-between pb-2 border-b ">
              <div className="flex items-center gap-2">
                <div>
                  <img src="" alt="" />
                </div>
                <div className="font-normal">Nguyễn Thành Trung</div>
              </div>
              <button className="text-center bg-[#6b7280] px-3 py-1 rounded-sm ">
                Hủy theo dõi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFollowingsModal;
