import React from "react";
import { IoImageOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";
import { SlOptions } from "react-icons/sl";
import PhotoList from "../ForYou/PhotoList";

const FeaturedGalleries = () => {
  const randomPhotos = [...PhotoList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  return (
    <div className="flex flex-col w-[550px] h-[472px] bg-white rounded-xl hover:cursor-pointer gap-3 px-5 py-4 group shadow-lg">
      <div className="flex justify-between items-center">
        <div>Phong cảnh</div>
        <div className="flex items-center gap-1 bg-[#45457c] text-white px-2 rounded hover:cursor-pointer">
          <IoImageOutline className="text-xl" />
          10
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 relative">
          {randomPhotos.map((item, index) => (
            <div
              key={item.id}
              className="flex h-[178px] w-[253px] justify-center items-center overflow-hidden rounded-lg"
            >
              <img
                src={item.photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex w-[24px] h-[24px]">
            <img
              src="https://scontent.fsgn5-14.fna.fbcdn.net/v/t1.6435-9/55831629_2162311800748535_9158341979975712768_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=f798df&_nc_eui2=AeE2gCiHfZSBK1dQX9AdV1nlH176jHhziLgfXvqMeHOIuGrIIyDVduZ_Gv2sAlvvGgjlSY6YmmkbP_eIsW8_x0fK&_nc_ohc=mOR0fYTzpkoQ7kNvgFl7IEm&_nc_ht=scontent.fsgn5-14.fna&oh=00_AYDcnaRUlOUSbDtfyA7iSKub9ys7Q5-VUZ-92KIGVrcmQg&oe=6700F7CD"
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="text-sm font-bold">Nguyễn Thành Trung</div>
        </div>
        <div className="flex gap-3 items-center ">
          <div>
            <CiHeart className="text-3xl" />
          </div>
          <div>
            <SlOptions className="text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGalleries;
