import React from "react";

const Category = ({ tag = [], category }) => {
  return (
    <div className="flex flex-col bg-white p-5 gap-3 shadow-lg rounded-lg">
      <p>
        Danh mục:{" "}
        <span className="font-bold">{category || "Không xác định"}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {tag.map((tagItem, index) => (
          <div
            key={index}
            className="flex justify-center items-center text-sm w-14 bg-gray-200 px-3 py-1 rounded-sm hover:cursor-pointer transition-colors duration-200 hover:bg-gray-400"
          >
            {tagItem}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
