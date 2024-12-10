import React, { useState } from "react";
import {
  FaClockRotateLeft,
  FaRegBookmark,
  FaRegHeart,
  FaRegMessage,
} from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import { SlOptionsVertical } from "react-icons/sl";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline, MdOutlineReport } from "react-icons/md";
import UserApi from "../../apis/UserApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";

const NewfeedCard = ({
  userInfo,
  id,
  userId,
  userName,
  avatar,
  title,
  createdAt,
  commentCount,
  likeCount,
  photo,
}) => {
  const srcImg =
    "https://phanmemmkt.vn/wp-content/uploads/2024/09/Hinh-anh-dai-dien-mac-dinh-Facebook.jpg";

  const longCmt =
    "long cmt long cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong cmtlong";

  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const formatTimeDifference = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = Date.now();
    const differenceInSeconds = Math.floor((now - createdDate) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} giây trước`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(differenceInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };
  const { data } = useQuery({
    queryKey: ["/me"],
    queryFn: () => UserApi.getApplicationProfile(),
  });
  const userData = data;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;

    // Tìm vị trí dấu cách gần nhất trước maxLength
    const lastSpaceIndex = text.lastIndexOf(" ", maxLength);

    // Nếu không tìm thấy dấu cách, cắt chuỗi theo maxLength
    const truncateIndex = lastSpaceIndex !== -1 ? lastSpaceIndex : maxLength;

    return `${text.substring(0, truncateIndex)}...`;
  };

  const ListPhotos = photo;
  const handleOnClick = (id) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(id);
  };
  return (
    <>
      {selectedImage && (
        <DetailedPhotoView
          idImg={selectedImage}
          onClose={() => {
            navigate(`/home/newfeed`);
            setSelectedImage(null);
          }}
          onCloseToMap={() => {
            navigate(`/explore/photo-map`);
            setSelectedImage(null);
          }}
          listImg={ListPhotos}
        />
      )}

      <div className="flex flex-col w-[400px] md:w-[700px] bg-[#2f3136] rounded-xl">
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2 items-center ">
            <div className="size-14 overflow-hidden rounded-full">
              <img
                src={avatar}
                alt=""
                className="bg-[#eee] w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col ">
              <div className="text-[#eee] text-lg hover:underline underline-offset-2 hover:cursor-pointer">
                {userName}
              </div>
              <div className="font-normal text-sm text-[#a3a3a3]">
                {formatTimeDifference(createdAt)}
              </div>
            </div>
          </div>
          <div className="flex text-2xl items-center gap-6">
            <div className="hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
              <IoShareSocialOutline />
            </div>
            <div className="hover:cursor-pointer   transition duration-200">
              <div>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <MenuButton className="inline-flex w-full justify-center p-2 rounded-full gap-x-1.5 hover:bg-[#3c3f46]  text-sm font-semibold text-gray-900 ">
                      <SlOptionsVertical
                        aria-hidden="true"
                        className="text-2xl  text-[#eee]"
                      />
                    </MenuButton>
                  </div>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    {userData?.id === userId ? (
                      <div className="py-1">
                        <MenuItem>
                          <div className="flex items-center gap-2 px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#43474e]  data-[focus]:outline-none">
                            <FaRegEdit className="text-2xl" />
                            Chỉnh sửa bài viết
                          </div>
                        </MenuItem>
                      </div>
                    ) : null}

                    <div className="py-1">
                      {userData?.id === userId ? (
                        <MenuItem>
                          <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500  data-[focus]:text-[#eee]">
                            <MdDeleteOutline className="text-2xl" />
                            Xóa bài viết
                          </div>
                        </MenuItem>
                      ) : (
                        <MenuItem>
                          <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500  data-[focus]:text-[#eee]">
                            <MdOutlineReport className="text-2xl" />
                            Báo cáo bài viết
                          </div>
                        </MenuItem>
                      )}
                    </div>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-1 bg-black hover:cursor-pointer">
          {ListPhotos.length === 1 && (
            <img
              key={ListPhotos[0].id}
              src={ListPhotos[0].signedUrl.thumbnail}
              alt=""
              className="w-full h-auto object-contain"
              onClick={() => handleOnClick(ListPhotos[0].id)}
            />
          )}
          {ListPhotos.length === 2 && (
            <div className="grid grid-cols-2 gap-1">
              {ListPhotos.map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.signedUrl.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                  onClick={() => handleOnClick(photo.id)}
                />
              ))}
            </div>
          )}
          {ListPhotos.length === 3 && (
            <div className="grid grid-cols-2 gap-1">
              <img
                key={ListPhotos[0].id}
                src={ListPhotos[0].signedUrl.thumbnail}
                alt=""
                className="col-span-2 w-full h-[300px] object-cover"
                onClick={() => handleOnClick(ListPhotos[0].id)}
              />
              {ListPhotos.slice(1).map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.signedUrl.thumbnail}
                  alt=""
                  className="w-full h-[150px] object-cover"
                  onClick={() => handleOnClick(photo.id)}
                />
              ))}
            </div>
          )}
          {ListPhotos.length >= 4 && (
            <div className="grid grid-cols-2 gap-1">
              <img
                key={ListPhotos[0].id}
                src={ListPhotos[0].signedUrl.thumbnail}
                alt=""
                className="row-span-2 w-full h-[300px] object-cover"
              />
              {ListPhotos.slice(1, 4).map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.signedUrl.thumbnail}
                  alt=""
                  className="w-full h-[150px] object-cover"
                />
              ))}
              {ListPhotos.length > 4 && (
                <div className="relative">
                  <img
                    src={ListPhotos[4].signedUrl.thumbnail}
                    alt=""
                    className="w-full h-[150px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold">
                    +{ListPhotos.length - 4}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-3 py-2">
          <div className="text-xl">{title}</div>
          <div className="flex justify-between py-1 border-b-2 border-[#3f4043]">
            <div className="flex gap-5 ">
              <div className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
                {" "}
                <FaRegHeart className="text-2xl" />
                {likeCount}
              </div>
              <div className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
                {" "}
                <FaClockRotateLeft className="text-2xl" />0
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex gap-2 hover:cursor-pointer hover:bg-[#3c3f46] p-2 rounded-full transition duration-200">
                <FaRegMessage className="text-2xl" />
                {commentCount}
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
              <img
                src={userData.avatar}
                alt=""
                className="w-full h-full object-cover bg-[#eee]"
              />
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
    </>
  );
};

export default NewfeedCard;
