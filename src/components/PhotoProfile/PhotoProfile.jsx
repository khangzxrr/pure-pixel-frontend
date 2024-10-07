import React from "react";
import UserService from "../../services/Keycloak";
import { IoEyeSharp } from "react-icons/io5";
const PhotoProfile = () => {
  const userData = UserService.getTokenParsed();
  console.log(userData);

  return (
    <div className="flex">
      <div className="flex items-center gap-5">
        <div className="w-[120px] h-[120px] overflow-hidden rounded-full">
          <img
            className="w-full h-full object-cover"
            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-2 p-1">
          <div className="font-bold text-4xl">{userData.name}</div>
          <div>{userData.email}</div>
          <div className="flex gap-2">
            <div className="px-[12px] py-[4px] bg-[#fff3] rounded-full">
              2 người theo dõi
            </div>
            <div className="flex items-center gap-1 px-[12px] py-[4px] bg-[#fff3] rounded-full">
              64 <IoEyeSharp />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoProfile;
