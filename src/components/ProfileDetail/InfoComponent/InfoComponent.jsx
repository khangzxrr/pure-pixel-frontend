import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";
import Profile from "../../../pages/Customer/Profile";
import UserService from "../../../services/Keycloak";
const InfoComponent = () => {
  const userData = UserService.getTokenParsed();
  return (
    <div className="flex flex-col items-center">
      {/* <Profile /> */}
      <div className="relative">
        <img className="" src="https://random.imagecdn.app/1900/300" alt="" />
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden outline-[#f7f8fa] outline outline-4">
          <img
            className="w-full h-full  object-cover  "
            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            alt=""
          />
        </div>
      </div>
      <div className="pt-14 text-2xl font-bold">{userData.name || "null"}</div>
      <div className="flex items-center gap-1">
        <HiOutlineLocationMarker /> Đồng Nai
      </div>
      <div className="flex flex-col items-center gap-3 mt-3 bg-black text-white rounded-xl px-10 py-4">
        <div className="flex gap-5">
          <div className="flex items-center gap-1">
            <div className="font-bold">8,265</div>
            <div>ảnh yêu thích</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">568,6K</div>
            <div>người theo dõi</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">568,6K</div>
            <div>ảnh ấn tượng</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">100</div>
            <div>đang theo dõi</div>
          </div>
        </div>
        <div className="flex gap-10">
          <FaFacebook className="w-6 h-6 hover:cursor-pointer" />
          <FaInstagram className="w-6 h-6 hover:cursor-pointer" />
          <CiGlobe className="w-6 h-6 hover:cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default InfoComponent;
