import React from "react";

const Category = () => {
  return (
    <div className="flex flex-col bg-white p-5 gap-3 shadow-lg rounded-lg">
      <p>
        Danh mục: <span className="font-bold">Phong cảnh</span>
      </p>
      <div className="flex gap-3">
        <div className="text-sm bg-gray-200 px-3 py-1 rounded-sm hover:cursor-pointer hover:bg-gray-400">
          Thẻ 1
        </div>
        <div className="text-sm bg-gray-200 px-3 py-1 rounded-sm hover:cursor-pointer hover:bg-gray-400">
          Thẻ 2
        </div>
        <div className="text-sm bg-gray-200 px-3 py-1 rounded-sm hover:cursor-pointer hover:bg-gray-400">
          Thẻ 3
        </div>
      </div>
    </div>
  );
};

export default Category;
