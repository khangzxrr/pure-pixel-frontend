import React from "react";

const Selling = () => {
  return (
    <div className="flex flex-col bg-white p-5 gap-3 shadow-lg rounded-lg">
      <p>Buôn bán</p>
      <p className="text-sm">
        Bạn có thể kiếm lợi nhuận bằng cách bán hình ảnh của mình cho người khác
      </p>
      <button className="bg-blue-500 text-white rounded-md px-5 py-1 hover:opacity-80">
        Bán ảnh này
      </button>
    </div>
  );
};

export default Selling;
