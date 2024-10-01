import React from "react";

const ErrorPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#202225] text-white">
      <div className="text-center">
        <h1 className="text-[100px] font-bold">404</h1>
        <h2 className="text-2xl mt-2">Không tìm thấy trang!</h2>
        <p className="mt-2">Rất tiếc, trang bạn đang tìm kiếm không tồn tại.</p>
        <p className="mt-2">
          Bạn có thể quay lại trang chính hoặc kiểm tra lại đường dẫn.
        </p>
        <a
          href="/test"
          className="mt-4 inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300"
        >
          Quay lại trang chính
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
