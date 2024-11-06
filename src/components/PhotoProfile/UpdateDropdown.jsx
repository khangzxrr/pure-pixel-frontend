import React from "react";
import { Dropdown, message } from "antd";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoPencilOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";
import PhotoApi from "../../apis/PhotoApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../Notification/Notification";

const UpdateDropdown = ({ photoId }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const queryClient = useQueryClient();
  const { notificationApi } = useNotification();

  const deletePhoto = useMutation({
    mutationFn: (id) => PhotoApi.deletePhoto(id),
  });

  const handleDeletePhoto = async () => {
    try {
      await deletePhoto.mutateAsync(photoId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["my-photo"] });
          notificationApi("success", "Xóa ảnh thành công", "Ảnh đã được xóa.");
        },
        onError: () => {
          notificationApi(
            "error",
            "Chưa thể xóa ảnh",
            "Xóa ảnh thất bại, vui lòng thử lại",
            "",
            0,
            "delete-photo-error"
          );
        },
      });
    } catch (error) {
      message.error("Chưa thể xóa ảnh");
    }
  };

  const items = [
    {
      key: "1",
      icon: <IoPencilOutline />,
      label: <p className="text-blue-500">Chỉnh sửa</p>,
      onClick: () => {
        // Add edit functionality here
      },
    },
    {
      key: "2",
      icon: <CgRemove />,
      label: "Xóa ảnh",
      danger: true,
      onClick: handleDeletePhoto,
    },
  ];

  return (
    <div className="absolute top-1 right-1 w-1/12 flex justify-center">
      <Dropdown
        menu={{ items }}
        onOpenChange={(open) => setIsHovered(open)}
        overlayClassName="custom-dropdown"
        trigger={["click"]}
      >
        <div
          className={`py-2 ${
            isHovered
              ? "bg-gray-100 rounded-full bg-opacity-50 text-black"
              : "opacity-80"
          } group-hover:opacity-100 transition-opacity duration-300`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <BiDotsVerticalRounded />
        </div>
      </Dropdown>
    </div>
  );
};

export default UpdateDropdown;
