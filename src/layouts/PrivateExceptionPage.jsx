import React from "react";
import { FaLinkSlash } from "react-icons/fa6";

const PrivateExceptionPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#202225] text-white">
      <div className="text-center">
        <h1 className="flex justify-center">
          <FaLinkSlash className="text-[100px]" />
        </h1>
        <h2 className="text-2xl mt-2 font-bold">
          Rất tiếc, không có quyền xem ảnh này!
        </h2>
        <p className="mt-2"></p>
        <p className="mt-2">Bạn có thể quay lại trang chính .</p>
        <a
          href="/"
          className="mt-4 inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300"
        >
          Quay lại trang chính
        </a>
      </div>
    </div>
  );
};

export default PrivateExceptionPage;
