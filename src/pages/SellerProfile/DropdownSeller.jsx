import React, { useState } from "react";
import { ConfigProvider, Dropdown, Modal, Popconfirm, message } from "antd";
import { BiDollar, BiDotsVerticalRounded } from "react-icons/bi";
import { IoPencilOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";
import PhotoApi from "../../apis/PhotoApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../Notification/Notification";
import useModalStore from "../../states/UseModalStore";
import { useModalState } from "../../hooks/useModalState";
import PhotoManagementModal from "./PhotoManagementModal";
import { postData } from "../../apis/api";

const DropdownSeller = ({ photo, callData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    setIsUpdatePhotoModal,
    setSelectedPhoto,
    setIsDeletePhotoConfirmModal,
    setDeletePhotoId,
  } = useModalStore();

  const modal = useModalState();
  const modalDelete = useModalState();

  const items = [
    {
      key: "1",
      icon: <IoPencilOutline />,
      label: <p className="text-blue-500">Chỉnh sửa</p>,
      onClick: () => {
        modal.handleOpen();
      },
    },

    {
      key: "2",
      icon: <CgRemove />,
      label: <span className="text-red-500">Xóa ảnh</span>,
      danger: true,
      onClick: () => {
        modalDelete.handleOpen()
      },
    },
  ];
  const handleDeletePhoto = () => {
    postData(`/photo/${photo.id}/stop-selling`)
      .then((e) => {
        message.success("Xóa ảnh thành công!");
        callData()
        modalDelete.handleClose()
      }).catch((error) => {
        message.error("Xóa ảnh không thành công!");
        console.log(error);
        
    })

  };
  return (
    <div>
      {modal.isModalOpen && (
        <PhotoManagementModal
          close={modal.handleClose}
          id={photo.id}
          data={photo}
          callData={callData}
        />
      )}
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#2f3136",
              headerBg: "#2f3136",
              titleColor: "white",
            },
          },
        }}
      >
        <Modal
          visible={modalDelete.isModalOpen}
          onOk={handleDeletePhoto}
          onCancel={modalDelete.handleClose}
          okText="Xóa"
          cancelText="Hủy"
          width={300}
          footer={null}
          centered={true}
          bodyStyle={{ padding: 0 }}
          className="custom-close-icon "
        >
          <>
            <p className="text-white text-xl font-semibold py-4">
              Bạn có chắc muốn xóa ảnh này không?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={modalDelete.handleClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePhoto}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Xóa
              </button>
            </div>
          </>
        </Modal>
      </ConfigProvider>

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

export default DropdownSeller;
