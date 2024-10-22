import React from "react";
import { Dropdown, Space } from "antd";
import { GoBlocked } from "react-icons/go";
import { SlOptions } from "react-icons/sl";
import PhotoList from "../../Dashboard/ForYou/PhotoList";

// Hàm để cắt ngắn câu quote nếu quá dài
const truncateQuote = (quote, maxLength) => {
  if (!quote) return "Không xác định";
  return quote.length > maxLength
    ? `${quote.substring(0, maxLength)}...`
    : quote;
};

const PhotographerCard = ({ id, name, avatar, quote, maxQuoteLength = 35 }) => {
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
    <div className="flex flex-col w-full md:w-[340px] h-[450px] rounded-lg text-[#eee] bg-[#202225] group hover:cursor-pointer">
      <div className="flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 relative">
          {randomPhotos.map((item, index) => (
            <div
              key={item.id}
              className="flex h-[100px] w-full md:w-[144px] justify-center items-center overflow-hidden rounded-lg"
            >
              <img
                src={item.photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
          ))}
          <div className="absolute overflow-hidden outline outline-2 outline-[#202225] bg-[#eee] top-44 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:top-44 md:left-28 rounded-full w-[64px] h-[64px]">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-xl font-bold mt-8 text-center">
            <div>{name || "Không xác định"}</div>
          </div>
          <div className="text-center text-sm font-normal ">
            <div>“{truncateQuote(quote, maxQuoteLength)}”</div>
          </div>
          <div className="bg-[#6d6d6d] px-5 py-2 rounded-sm mt-5 transition-color duration-300 hover:bg-[#929292] hover:cursor-pointer">
            <button>Theo dõi</button>
          </div>
        </div>
        <div className="flex justify-end">
          <Dropdown menu={{ items }} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <div className="flex justify-center text-xl rounded-full p-1 transition-color duration-300 hover:bg-[#929292] hover:text-white">
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
