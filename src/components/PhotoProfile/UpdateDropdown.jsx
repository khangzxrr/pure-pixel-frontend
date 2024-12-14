import React, { useState } from "react";
import { Dropdown, Popconfirm, message } from "antd";
import { BiDollar, BiDotsVerticalRounded } from "react-icons/bi";
import { IoPencilOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";
import PhotoApi from "../../apis/PhotoApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../Notification/Notification";
import useModalStore from "../../states/UseModalStore";
import { useModalState } from "../../hooks/useModalState";
import PhotoManagementModal from "../PhotoManagementModal/PhotoManagementModal";

const UpdateDropdown = ({ photo, totalRecord, page, setPage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    setIsUpdatePhotoModal,
    setSelectedPhoto,
    setIsDeletePhotoConfirmModal,
    setDeletePhotoId,
    setNumberOfRecord,
  } = useModalStore();

  const modal = useModalState();

  const items = [
    {
      key: "1",
      icon: <IoPencilOutline />,
      label: <p className="text-blue-500">Chỉnh sửa</p>,
      onClick: () => {
        setIsUpdatePhotoModal(true);
        setSelectedPhoto({ ...photo, isChangeGPS: false });
      },
    },
    {
      key: "3",
      icon: <BiDollar />,
      label: (
        <p
          className={`${
            photo.status === "BAN"
              ? "text-blue-200 cursor-not-allowed"
              : "text-blue-500"
          } `}
        >
          Đăng bán ảnh
        </p>
      ),
      onClick: () => {
        if (photo.status === "BAN") {
          return;
        } else {
          modal.handleOpen();
        }
      },
    },
    {
      key: "2",
      icon: <CgRemove />,
      label: <span className="text-red-500">Xóa ảnh</span>,
      onClick: () => {
        setDeletePhotoId(photo.id);
        setIsDeletePhotoConfirmModal(true);
        setNumberOfRecord(totalRecord);
        // console.log(totalRecord);
      },
    },
  ];
  // console.log("photo", photo);
  return (
    <div>
      {modal.isModalOpen && (
        <PhotoManagementModal
          close={modal.handleClose}
          id={photo.id}
          data={photo}
        />
      )}

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
    </div>
  );
};

export default UpdateDropdown;
