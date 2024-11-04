import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlOptions } from "react-icons/sl";
import PhotoApi from "../../../apis/PhotoApi";
import { useQuery } from "@tanstack/react-query";
import { FaRegMessage } from "react-icons/fa6";
import { MdBlock } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Hàm để cắt ngắn câu quote nếu quá dài
const truncateQuote = (quote, maxLength) => {
  if (!quote) return "Không xác định";
  return quote.length > maxLength
    ? `${quote.substring(0, maxLength)}...`
    : quote;
};

const PhotographerCard = ({ id, name, avatar, quote, maxQuoteLength = 30 }) => {
  const navigate = useNavigate();
  const items = [
    {
      label: (
        <div className="flex items-center gap-2 text-lg">
          <FaRegMessage />
          Nhắn tin
        </div>
      ),
      key: "0",
    },
    {
      label: (
        <div className="flex items-center gap-2 text-lg">
          <MdBlock className="text-xl" />
          Chặn
        </div>
      ),
      key: "1",
    },
  ];

  const {
    data: photoData = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["photographerPhotos", id],
    queryFn: () =>
      PhotoApi.getPublicPhotos(
        4,
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        id
      ),
    staleTime: 300000,
  });

  const photos = photoData.objects || [];

  // Kiểm tra kiểu dữ liệu trước khi xử lý
  const randomPhotos =
    Array.isArray(photos) && photos.length > 0
      ? photos
      : Array(4).fill({
          signedUrl: {
            thumbnail:
              "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg",
          },
        }); // Thay thế bằng ảnh mặc định nếu không có ảnh

  return (
    <div className=" flex flex-col w-full max-w-[340px] h-[450px] rounded-lg text-[#eee] bg-[#2f3136] group hover:cursor-pointer mx-auto">
      <div className="relative flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 ">
          {randomPhotos.map((item, index) => (
            <div
              key={index}
              className="flex h-[100px] w-full justify-center items-center overflow-hidden rounded-lg"
            >
              <img
                src={item.signedUrl?.thumbnail}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
          ))}
          <div className="absolute overflow-hidden outline outline-2 outline-[#202225] bg-[#eee] left-1/2 bottom-[43%] sm:left-[40%] transform -translate-x-1/2 md:translate-x-0  rounded-full w-[64px] h-[64px]">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-xl font-bold mt-8 text-center">
            <div
              onClick={() => navigate(`/user/${id}/photos`)}
              className="hover:underline underline-offset-2"
            >
              {name || "Không xác định"}
            </div>
          </div>
          <div className="text-center text-sm font-normal">
            <div>“{truncateQuote(quote, maxQuoteLength)}”</div>
          </div>
          <div className="bg-[#6b7280] px-5 py-2 rounded-sm mt-5 transition-color duration-200 hover:bg-[#4d525c] hover:cursor-pointer">
            <button>Theo dõi</button>
          </div>
        </div>
        <div className="flex justify-end">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-full hover:bg-[#6b7280]  p-1 text-sm font-semibold text-gray-900 transition-colors duration-200">
                <SlOptions className="text-[#eee] text-lg" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute -right-4 top-7 z-10 mt-2 w-32 origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#36393f] transition-colors duration-200 data-[focus]:text-[#eee]">
                    <FaRegMessage className="font-bold text-lg" />
                    Nhắn tin
                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 transition-colors duration-200 data-[focus]:text-[#eee]">
                    <MdBlock className="font-bold text-xl" />
                    Chặn
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default PhotographerCard;
