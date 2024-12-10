import React, { useEffect, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaAngleDown } from "react-icons/fa6";
import { TbEdit, TbEditOff } from "react-icons/tb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ManagerPhotoApi from "../../apis/ManagerPhotoApi";
import { message } from "antd";
import { notificationApi } from "../../Notification/Notification";
import LoadingOval from "../LoadingSpinner/LoadingOval";
const UpdatePhotoInManager = ({ photo, onClose, loading }) => {
  const [isWatermark, setIsWatermark] = useState(photo?.watermark);
  const [isVisibility, setIsVisibility] = useState(photo?.visibility);
  const [title, setTitle] = useState(photo?.title);
  const [description, setDescription] = useState(photo?.description);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const updatePhoto = useMutation({
    mutationFn: (updateBody) =>
      ManagerPhotoApi.updatePhoto(photo.id, updateBody),
  });

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || "");
      setDescription(photo.description || "");
      setIsWatermark(photo.watermark);
      setIsVisibility(photo.visibility);
    }
  }, [photo]);

  const handleUpdatePhoto = () => {
    setIsLoading(true);
    const updateBody = {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      visibility: isVisibility,
    };
    updatePhoto.mutate(updateBody, {
      onSuccess: () => {
        // message.success("Cập nhật thành công");
        notificationApi(
          "success",
          "Cập nhật thành công",
          "Cập nhật ảnh thành công"
        );
        queryClient.invalidateQueries({ queryKey: ["manager-photos"] });
        setIsLoading(false);
        loading()
        onClose();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message;
        if (errorMessage?.includes("PhotoHasActiveSellingException")) {
          notificationApi(
            "error",
            "Cập nhật không thành công",
            "Ảnh đang bán không thể chỉnh sửa"
          );
        } else {
          notificationApi("error", "Cập nhật không thành công", errorMessage);
        }

        setTitle(photo?.title);
        setDescription(photo?.description);
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ["manager-photos"] });
      },
    });
  };

  return (
    <div className="text-[#eee] flex flex-col  w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 place-items-stretch gap-3 min-h-[400px]">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="max-w-[500px] max-h-[500px] overflow-hidden">
            <img
              src={photo?.signedUrl?.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 pb-3 border-b">
            <div className="size-[30px] rounded-full overflow-hidden">
              <img
                src={photo?.photographer?.avatar}
                alt=""
                className="w-full h-full object-cover bg-[#eee]"
              />
            </div>
            <div>{photo?.photographer?.name}</div>
          </div>
          <div className="flex flex-col  px-4 bg-[#36393f] rounded-md py-4">
            {/* Tiêu đề */}
            <div className="grid grid-cols-2 items-center py-2 border-b border-gray-500">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEdit className="text-blue-500 size-4" />
                Tiêu đề:
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-[#eee] bg-transparent border-none outline-none w-full"
                placeholder="Nhập tiêu đề mới"
              />
            </div>

            {/* Mô tả */}
            <div className="grid grid-cols-2 items-center py-2 border-b border-gray-500">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEdit className="text-blue-500 size-4" />
                Mô tả:
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-[#eee] bg-transparent border-none outline-none w-full resize-none"
                rows={3}
                placeholder="Nhập mô tả mới"
              ></textarea>
            </div>

            {/* Loại ảnh */}
            <div className="grid grid-cols-2 items-center py-2 border-b border-gray-500">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEditOff className="text-red-500 size-4" />
                Loại ảnh:
              </div>
              <div className="font-bold text-[#eee]">{photo?.photoType}</div>
            </div>

            {/* Danh mục */}
            {/* <div className="grid grid-cols-2 items-center py-2 border-b border-gray-500">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEditOff className="text-red-500 size-4" />
                Danh mục:
              </div>
              <div className="text-[#eee]">
                {photo?.categories.map((c) => c.name).join(", ")}
              </div>
            </div> */}

            {/* Bật/tắt nhãn */}
            <div className="grid grid-cols-2 items-center py-2 border-b border-gray-500">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEditOff className="text-red-500 size-4" />
                Nhãn (watermark):
              </div>
              {/* <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isWatermark}
                  onChange={(e) => setIsWatermark(e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-green-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
              </label> */}
              <div className="text-[#eee] font-bold">
                {isWatermark ? "Có" : "Không"}
              </div>
            </div>

            {/* Quyền riêng tư */}
            <div className="grid grid-cols-2 items-center py-2">
              <div className="text-gray-400 flex items-center gap-1">
                <TbEditOff className="text-red-500 size-4" />
                Quyền riêng tư:{" "}
              </div>
              <div className="font-bold">
                {isVisibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
              </div>
              {/* <div>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <MenuButton className="inline-flex items-center bg-[#eee] text-[#202225] gap-2 w-full justify-center rounded-md px-3 py-2 text-sm font-semibold">
                      {isVisibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
                      <FaAngleDown />
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute left-0 z-10 mt-2 w-full origin-top rounded-md bg-[#202225] shadow-lg focus:outline-none">
                    <div className="py-1">
                      <MenuItem>
                        {({ active }) => (
                          <div
                            onClick={() => setIsVisibility("PUBLIC")}
                            className={`block px-4 py-2 text-sm cursor-pointer ${
                              active ? "bg-gray-600 text-white" : "text-[#eee]"
                            }`}
                          >
                            Công khai
                          </div>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <div
                            onClick={() => setIsVisibility("PRIVATE")}
                            className={`block px-4 py-2 text-sm cursor-pointer ${
                              active ? "bg-gray-600 text-white" : "text-[#eee]"
                            }`}
                          >
                            Riêng tư
                          </div>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </div> */}
            </div>
          </div>

          <div className="flex">
            <button
              onClick={() => handleUpdatePhoto()}
              className="bg-[#eee] w-full flex items-center justify-center text-[#202225] hover:bg-[#9d9d9d] font-bold py-2 rounded-md"
            >
              {isLoading ? (
                <LoadingOval
                  size={"22"}
                  color={"#202225"}
                  strongWidth={5}
                  secondaryColor={"#eee"}
                />
              ) : (
                "Lưu chỉnh sửa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhotoInManager;
