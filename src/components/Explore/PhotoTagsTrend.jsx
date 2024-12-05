import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import PhotoApi from "../../apis/PhotoApi";
import { MdNumbers } from "react-icons/md";
import { IoClose } from "react-icons/io5"; // Icon cho nút xóa
import UseCategoryStore from "../../states/UseCategoryStore";
import { useLocation } from "react-router-dom";
import { isError } from "lodash";

const PhotoTagsTrend = () => {
  const [activeTag, setActiveTag] = useState(null); // Trạng thái tag đang được chọn
  const setSearchByTags = UseCategoryStore((state) => state.setSearchByTags);
  const location = useLocation();
  const {
    data: tags,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["photoTags", { top: 10 }], // Sử dụng queryKey dưới dạng đối tượng
    queryFn: () => PhotoApi.getPhotoTags({ top: 10 }), // Gọi hàm API
  });
  const clearActiveTag = () => {
    setActiveTag(null);
    setSearchByTags("");
  };
  useEffect(() => {
    if (location.pathname === "/explore/inspiration") {
      clearActiveTag();
    }
  }, [location.pathname]);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching tags: {error}</div>;
  }

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setSearchByTags(tag);
  };

  return (
    <div className=" flex flex-col  gap-2 px-1">
      {tags &&
        tags.map((tag) => (
          <div
            key={tag.name}
            className={`flex items-center justify-between hover:cursor-pointer rounded-md px-2 py-1 transition-colors duration-200 ${
              activeTag === tag.name
                ? "bg-gray-500 text-white"
                : "hover:bg-gray-700 hover:text-[#eee]"
            }`}
            onClick={() => handleTagClick(tag.name)}
          >
            <div className="flex items-center gap-2">
              <MdNumbers />
              {tag.name}
            </div>
            {activeTag === tag.name && (
              <button
                className="ml-2 p-1 rounded-full  hover:bg-red-500 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  clearActiveTag();
                }}
              >
                <IoClose size={14} />
              </button>
            )}
          </div>
        ))}
    </div>
  );
};

export default PhotoTagsTrend;
