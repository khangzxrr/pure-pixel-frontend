import React from "react";
import {
  FaClockRotateLeft,
  FaRegBookmark,
  FaRegHeart,
  FaRegMessage,
} from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import { SlOptionsVertical } from "react-icons/sl";
const NewfeedCard = () => {
  const srcImg =
    "https://phanmemmkt.vn/wp-content/uploads/2024/09/Hinh-anh-dai-dien-mac-dinh-Facebook.jpg";

  const longCmt =
    "long cmt long cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmt";

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;

    // Tìm vị trí dấu cách gần nhất trước maxLength
    const lastSpaceIndex = text.lastIndexOf(" ", maxLength);

    // Nếu không tìm thấy dấu cách, cắt chuỗi theo maxLength
    const truncateIndex = lastSpaceIndex !== -1 ? lastSpaceIndex : maxLength;

    return `${text.substring(0, truncateIndex)}...`;
  };
  return (
    <div className="flex flex-col w-[400px] md:w-[700px] bg-[#2f3136] rounded-xl">
      <div className="flex justify-between items-center p-3">
        <div className="flex gap-2 items-center ">
          <div className="size-14 overflow-hidden rounded-full">
            <img src={srcImg} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col ">
            <div className="text-[#eee] text-lg hover:underline underline-offset-2 hover:cursor-pointer">
              Tên tác giả
            </div>
            <div className="font-normal text-sm text-[#a3a3a3]">
              1 ngày trước
            </div>
          </div>
        </div>
        <div className="flex text-2xl gap-6">
          <div className="hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
            <IoShareSocialOutline />
          </div>
          <div className="hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
            <SlOptionsVertical />
          </div>
        </div>
      </div>

      <div className="flex justify-center bg-black">
        <img
          src="https://picsum.photos/1920/1080"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-3 px-3 py-2">
        <div className="text-xl">Tiêu đề ảnh</div>
        <div className="flex justify-between py-1 border-b-2 border-[#3f4043]">
          <div className="flex gap-5 ">
            <div className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
              {" "}
              <FaRegHeart className="text-2xl" />
              269
            </div>
            <div className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
              {" "}
              <FaClockRotateLeft className="text-2xl" />
              269
            </div>
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
              <FaRegMessage className="text-2xl" />5
            </div>
            <div className="flex gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
              <FaRegBookmark className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-3 pb-3 pt-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full overflow-hidden ">
            <img src={srcImg} alt="" />
          </div>
          <div className="flex gap-1 items-center">
            <div className="text-sm">Tên người bình luận: </div>
            <div className="text-sm font-normal">Đây là bình luận</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full overflow-hidden ">
            <img src={srcImg} alt="" />
          </div>
          <div className="flex gap-1 items-center">
            <div className="text-sm">Tên người bình luận: </div>
            <div className="text-sm font-normal">
              {truncateText(longCmt, 30)}
            </div>
          </div>
        </div>

        <div className="flex py-3 items-center gap-2">
          {" "}
          <div className="size-7 rounded-full overflow-hidden">
            <img src={srcImg} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-1 bg-[#36393f] px-3 py-3 w-full rounded-full">
            <input
              type="text"
              className="bg-[#36393f] font-normal text-sm outline-none w-[95%]"
              placeholder="Bình luận ở đây"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewfeedCard;
