import React from "react";
import PhotographerCard from "./PhotographerCard";

const Following = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center items-center gap-1 py-5">
        <div className="text-xl font-bold">Bạn chưa theo dõi ai cả</div>
        <div className="">
          Bắt đầu theo dõi các nhiếp ảnh gia và cập nhật những bức ảnh mới nhất
          của họ tại đây!
        </div>
      </div>
      <div className="flex flex-wrap  gap-7 px-10 py-3">
        {[...Array(12)].map((_, index) => (
          <PhotographerCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default Following;
