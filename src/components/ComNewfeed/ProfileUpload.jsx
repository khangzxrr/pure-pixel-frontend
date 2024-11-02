import React from "react";
import { LuPlusCircle } from "react-icons/lu";

const ProfileUpload = () => {
  const imgSrc =
    "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg";
  return (
    <div className="grid grid-cols-2 gap-4 w-[400px] md:w-[700px]">
      <div className="flex justify-center items-center py-4 gap-2 rounded-lg bg-[#2f3136] hover:bg-[#36393f] hover:cursor-pointer transition-colors duration-200">
        <div className="size-14 overflow-hidden rounded-full">
          {" "}
          <img src={imgSrc} alt="" />
        </div>
        <div>Hồ sơ</div>
      </div>

      <div className="flex justify-center items-center py-4 gap-2 rounded-lg bg-[#2f3136] hover:bg-[#36393f] hover:cursor-pointer transition-colors duration-200">
        <div>
          <LuPlusCircle className="text-5xl" />
        </div>
        <div>Tạo bài viết</div>
      </div>
    </div>
  );
};

export default ProfileUpload;
