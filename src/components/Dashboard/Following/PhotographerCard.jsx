import React from "react";
import PhotoList from "./../ForYou/PhotoList";
import { Dropdown, Space } from "antd";
import { GoBlocked } from "react-icons/go";
import { SlOptions } from "react-icons/sl";
const PhotographerCard = () => {
  const items = [
    {
      label: (
        <div className="flex items-center gap-2 text-xl">
          <GoBlocked />
          Block user
        </div>
      ),
      key: "0",
    },
  ];
  const randomPhotos = [...PhotoList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  return (
    <div className="flex w-[340px] h-[450px] rounded-lg outline outline-1 bg-white outline-gray-300  group hover:cursor-pointer">
      <div className="flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 relative">
          {randomPhotos.map((item, index) => (
            <div
              key={item.id}
              className="flex h-[103px] w-[144px] justify-center items-center overflow-hidden rounded-lg"
            >
              <img
                src={item.photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
          ))}
          <div className="absolute overflow-hidden outline outline-2 outline-[#f7f8fa] top-44 left-28 rounded-full w-[64px] h-[64px] ">
            <img
              src="https://scontent.fsgn5-14.fna.fbcdn.net/v/t1.6435-9/55831629_2162311800748535_9158341979975712768_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=f798df&_nc_eui2=AeE2gCiHfZSBK1dQX9AdV1nlH176jHhziLgfXvqMeHOIuGrIIyDVduZ_Gv2sAlvvGgjlSY6YmmkbP_eIsW8_x0fK&_nc_ohc=mOR0fYTzpkoQ7kNvgFl7IEm&_nc_ht=scontent.fsgn5-14.fna&oh=00_AYDcnaRUlOUSbDtfyA7iSKub9ys7Q5-VUZ-92KIGVrcmQg&oe=6700F7CD"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="  text-xl font-bold mt-8">
            <div>Nguyễn Thành Trung</div>
          </div>
          <div className=" ">
            <div>Đồng Nai, Việt Nam</div>
          </div>
          <div className="bg-[#2986f7] px-5 py-2 text-white rounded-full mt-5  hover:bg-[#69a8f5] hover:cursor-pointer">
            <button>Theo dõi</button>
          </div>
        </div>
        <div className="flex  justify-end">
          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <div className=" flex justify-center text-xl rounded-full p-1 hover:bg-[#2986f7] hover:text-white">
                  <SlOptions />
                </div>
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default PhotographerCard;
