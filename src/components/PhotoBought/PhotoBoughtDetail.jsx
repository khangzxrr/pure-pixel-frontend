import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import UserService from "../../services/Keycloak";
import { useNavigate, useParams } from "react-router-dom";
import PhotoProfile from "../PhotoProfile/PhotoProfile";

const PhotoBoughtDetail = () => {
  const { boughtId } = useParams();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();
  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#292b2f] h-screen">
        <div className="max-h-[95vh] w-full overflow-hidden bg-black col-span-2">
          <img
            src="https://picsum.photos/3840/2160?random=1"
            alt=""
            className="w-full h-full object-contain "
          />
        </div>

        <div className="flex flex-col gap-5 px-5 py-2">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-2xl ">{boughtId}</div>
            <div className="font-normal">Mô tả</div>
            <div className="font-normal">
              Đã mua ngày: <span className="font-semibold">5/11/2024</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl ">Chọn kích thước để tải:</div>
            <div className="flex flex-wrap gap-2">
              <div className="text-center px-2 py-1 rounded-lg w-[80px] bg-[#383b41] hover:cursor-pointer">
                1920px
              </div>
              <div className="text-center px-2 py-1 rounded-lg w-[80px] bg-[#383b41] hover:cursor-pointer">
                720px
              </div>
              <div className="text-center px-2 py-1 rounded-lg w-[80px] bg-[#383b41] hover:cursor-pointer">
                480px
              </div>
            </div>
            <div className="text-center hover:cursor-pointer w-full bg-blue-500 py-2 rounded-lg">
              Tải ảnh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBoughtDetail;
