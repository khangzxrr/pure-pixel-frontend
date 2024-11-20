import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import UserApi from "../../apis/UserApi";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaCaretDown, FaEarthAsia, FaImages, FaLock } from "react-icons/fa6";
import { FaRegSmile } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";

const CreateNewsModal = ({ onClose, userInfo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false); // Trạng thái cho chế độ thêm ảnh

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["/me"],
    queryFn: () => UserApi.getApplicationProfile(),
  });
  const userData = data;

  const handleCloseOutSide = (event) => {
    if (event.target === event.currentTarget) {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  return (
    <div
      onClick={handleCloseOutSide}
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 w-screen overflow-y-auto"
    >
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } relative flex flex-col w-[400px] md:w-[500px] bg-[#252728] rounded-lg`}
      >
        <button
          className="absolute top-0 right-0 m-2 p-2 rounded-full hover:cursor-pointer hover:bg-[#3b3d3d]"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <IoCloseSharp className="text-2xl" />
        </button>

        {!isAddingPhoto ? (
          <>
            <div className="flex items-center text-xl justify-center py-5 border-b border-gray-600 font-bold">
              Tạo bài viết
            </div>
            <div className="flex items-center gap-2 p-2 px-4">
              <div className="size-[40px] overflow-hidden rounded-full">
                <img
                  src={userData?.avatar}
                  alt=""
                  className="bg-[#eee] size-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="">{userInfo?.name}</div>
                <div>
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <MenuButton className="inline-flex  items-center w-full justify-center gap-1 rounded-md px-2 bg-[#3b3d3d] py-1  text-sm font-normal text-[#eee] shadow-sm   ">
                        <FaLock className="text-[12px]" />
                        <span className="text-[12px]">Chỉ mình tôi</span>

                        <FaCaretDown
                          aria-hidden="true"
                          className="text-[12px]"
                        />
                      </MenuButton>
                    </div>

                    <MenuItems
                      transition
                      className="absolute left-0 z-10 mt-2 w-32 origin-top rounded-md bg-[#3b3d3d] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="py-1">
                        <MenuItem>
                          <div className=" hover:cursor-pointer flex items-center gap-1 px-2 py-1 font-normal text-sm text-[#eee] data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                            <FaEarthAsia className="text-[12px]" />
                            Công khai
                          </div>
                        </MenuItem>
                      </div>
                      <MenuItem>
                        <div className=" hover:cursor-pointer flex items-center gap-1 px-2 py-1 font-normal text-sm text-[#eee] data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                          <FaLock className="text-[12px]" />
                          Chỉ mình tôi
                        </div>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>
            <div className="px-4">
              <textarea
                className="w-full outline-none bg-[#252728] text-lg text-[#eee] overflow-auto resize-none"
                placeholder={`${userInfo?.name}, bạn đang nghĩ gì?`}
                rows="5"
              ></textarea>
            </div>
            <div className="px-4">
              <div className="flex items-center justify-between px-2 py-4 border rounded-lg border-[#8a8a8a]">
                <div>Thêm vào bài viết</div>
                <div className="flex gap-3 text-2xl">
                  <div>
                    <FaImages
                      className="text-green-400 hover:cursor-pointer"
                      onClick={() => setIsAddingPhoto(true)} // Chuyển sang chế độ thêm ảnh
                    />
                  </div>
                  <FaRegSmile className="text-yellow-400 hover:cursor-pointer" />
                  <SlOptions className="text-[#868686]" />
                </div>
              </div>
            </div>
            <div className="px-4 my-2">
              <div className="flex items-center justify-center w-full py-2 rounded-lg bg-blue-500 hover:cursor-pointer">
                Đăng
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-xl justify-center py-5 border-b border-gray-600 font-bold">
              Thêm ảnh
            </div>
            <div className="px-4 py-5">
              <p>Chọn ảnh từ thiết bị hoặc kéo thả vào đây.</p>
              {/* Thêm phần giao diện để upload ảnh */}
              <div className="mt-4 border-dashed border-2 border-gray-600 rounded-lg h-40 flex items-center justify-center">
                <p className="text-gray-400">Kéo và thả ảnh vào đây</p>
              </div>
              <button
                className="mt-4 text-blue-500 hover:underline"
                onClick={() => setIsAddingPhoto(false)} // Quay lại modal chính
              >
                Quay lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateNewsModal;
