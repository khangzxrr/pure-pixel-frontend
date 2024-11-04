import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  User,
  Image,
} from "lucide-react";
import React from "react";
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
  console.log(data);

  return (
    <div className=" min-h-screen">
      {/* Seller Profile Header */}
      <div className="relative">
        <img
          src={data?.photographer.cover}
          alt="Eagle"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4 ml-6">
              {/* <ShoppingBag className="w-6 h-6" /> */}
              <h1 className="text-2xl font-bold">Hồ sơ</h1>
            </div>
          </div>
          <div className=" flex items-end justify-between shadow-md p-4">
            <div className="flex items-center space-x-4">
              <img
                src={data?.photographer.avatar}
                alt="Dr.Bedirhan Küpeli"
                className="w-16 h-16 rounded-full bg-[#eee]"
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">
                  {data?.photographer.name}
                </h2>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-1">
                    <User className="w-6 h-6" />{" "}
                    {data?.photographer._count.followers}
                  </div>
                  <div className="flex gap-1">
                    <Image className="w-6 h-6" />{" "}
                    {data?.photographer._count.photos}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Share2 className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <MoreHorizontal className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default UserProfileV2;
