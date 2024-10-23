import React from "react";
import { useNavigate } from "react-router-dom";

const CameraCard = () => {
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/camera/${id}`);
  };
  return (
    <div
      onClick={() => handleClick("nikon-d3500")}
      className="flex flex-col items-center bg-[#202225] h-auto w-full max-w-[350px] rounded-lg shadow-md overflow-hidden hover:cursor-pointer"
    >
      <div className="w-full h-[220px] overflow-hidden bg-[#eee]">
        <img
          src="https://www.transparentpng.com/download/-camera/7mDYcE-nikon-camera-transparent-background-photography.png"
          alt="Nikon D3500"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-white font-bold text-xl mt-3">Nikon D3500</div>
      <div className="text-gray-400 text-sm font-normal p-4 leading-relaxed">
        Cảm biến hình ảnh 24,2MP DX ISO 100-12800; cũng có thể được đặt thành
        khoảng 0,3, 0,7 hoặc 1 EV (tương đương ISO 25600) trên ISO 12800. Điểm
        lấy nét: Có thể chọn 39 hoặc 11 điểm. Chế độ Wi-Fi® tích hợp sẵn của
        D5300.
      </div>
    </div>
  );
};

export default CameraCard;
