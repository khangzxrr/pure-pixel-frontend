import React, { useEffect, useState } from "react";
import MyPhotoFilter from "./MyPhotoFilter";
import { IoCloseSharp } from "react-icons/io5";

const FilterModel = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Tạo hiệu ứng mở modal khi component mount
    setIsVisible(true);
    return () => {
      // Đảm bảo modal biến mất khi unmount
      setIsVisible(false);
    };
  }, []);

  const handleOverlayClick = (e) => {
    // Đảm bảo không đóng modal khi click vào chính modal
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(onClose, 300); // Đảm bảo modal đóng sau khi hiệu ứng hoàn tất
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen overflow-y-auto flex justify-center items-center`}
      onClick={handleOverlayClick}
    >
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } flex justify-center items-center bg-[#43474e]  text-[#eee] rounded-lg  relative`}
      >
        <MyPhotoFilter />
        <button
          className="absolute top-1 right-1 text-white text-2xl"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200); // Đảm bảo modal đóng sau khi hiệu ứng hoàn tất
          }}
        >
          <IoCloseSharp />
        </button>
      </div>
    </div>
  );
};

export default FilterModel;
