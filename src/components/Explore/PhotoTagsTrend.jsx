import { useQuery } from "@tanstack/react-query";
import React from "react";
import PhotoApi from "../../apis/PhotoApi";
import { MdNumbers } from "react-icons/md";

const PhotoTagsTrend = () => {
  const {
    data: tags,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photoTags", { top: 10 }], // sử dụng queryKey dưới dạng đối tượng
    queryFn: () => PhotoApi.getPhotoTags({ top: 5 }), // gọi hàm API
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching tags: {error.message}</div>;
  }

  return (
    <>
      {tags &&
        tags.map((tag) => (
          <div
            className="flex gap-2 items-center hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md px-2 py-[2px] transition-colors duration-200"
            key={tag.name}
          >
            <MdNumbers /> {tag.name}
          </div>
        ))}
    </>
  );
};

export default PhotoTagsTrend;
