import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  User,
  Image,
  UserCheck,
} from "lucide-react";
import React, { useState } from "react"; // Nhập useState để quản lý trạng thái hover
import { Outlet, useNavigate, useParams } from "react-router-dom";
import PhotographerApi from "../../apis/PhotographerApi";
import { useQuery } from "@tanstack/react-query";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import { FaImages } from "react-icons/fa6";

const UserProfileV2 = () => {
  const navigate = useNavigate();
  const params = useParams();

  const { data, error, isLoading } = useQuery({
    queryKey: ["user", params],
    queryFn: () => PhotographerApi.getPhotographerById(params.id),
  });

  const [hoveredIcon, setHoveredIcon] = useState(null); // State để theo dõi icon nào đang được hover

  const handleMouseEnter = (icon) => setHoveredIcon(icon);
  const handleMouseLeave = () => setHoveredIcon(null);

  return (
    <div className="min-h-screen">
      {/* Seller Profile Header */}
      <div className="relative">
        <img
          src={data?.photographer.cover}
          alt=""
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-end justify-between p-4">
            <div className="flex items-center space-x-4">
              <img
                src={data?.photographer.avatar}
                alt=""
                className="w-16 h-16 rounded-full bg-[#eee]"
              />

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold max-w-[50px] md:max-w-full ">
                  {data?.photographer.name}
                </h2>
                {data?.photographer.location && (
                  <div className="font-normal">
                    Đến từ:{" "}
                    <span className="font-semibold">
                      {data?.photographer.location}
                    </span>
                  </div>
                )}

                {data?.photographer.quote && (
                  <div className="font-normal text-sm hidden md:block">
                    "{data?.photographer.quote}"
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <div
                    onMouseEnter={() => handleMouseEnter("follower")}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex gap-1"
                  >
                    <User className="w-6 h-6" />
                    {hoveredIcon === "follower" && (
                      <span className="absolute flex justify-center w-[70px] top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                        Theo dõi
                      </span>
                    )}
                    {data?.photographer._count.followers}
                  </div>
                  <div
                    onMouseEnter={() => handleMouseEnter("following")}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex gap-1"
                  >
                    <UserCheck className="w-6 h-6" />
                    {hoveredIcon === "following" && (
                      <span className="absolute flex justify-center w-[100px] top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                        Đang theo dõi
                      </span>
                    )}
                    {data?.photographer._count.followings}
                  </div>
                  <div
                    onMouseEnter={() => handleMouseEnter("image")}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex gap-1"
                  >
                    <Image className="w-6 h-6" />
                    {hoveredIcon === "image" && (
                      <span className="absolute flex justify-center w-[70px] top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                        Tổng ảnh
                      </span>
                    )}
                    {data?.photographer._count.photos}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div
                onMouseEnter={() => handleMouseEnter("share")}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <Share2 className="w-6 h-6" />
                {hoveredIcon === "share" && (
                  <span className="absolute flex justify-center w-[70px] bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                    Chia sẻ
                  </span>
                )}
              </div>
              <div
                onMouseEnter={() => handleMouseEnter("message")}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                {hoveredIcon === "message" && (
                  <span className="absolute flex justify-center w-[70px] bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                    Nhắn tin
                  </span>
                )}
              </div>
              <div
                onMouseEnter={() => handleMouseEnter("more")}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <MoreHorizontal className="w-6 h-6" />
                {hoveredIcon === "more" && (
                  <span className="absolute flex justify-center w-[70px] bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded-md p-1">
                    Thêm
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default UserProfileV2;
