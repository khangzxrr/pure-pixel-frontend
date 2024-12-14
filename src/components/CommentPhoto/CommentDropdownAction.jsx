import React, { useState } from "react";
import { ConfigProvider, Dropdown, Modal } from "antd";
import { BsThreeDots } from "react-icons/bs";
import { IoPencilOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModalState } from "../../hooks/useModalState";
import CommentApi from "../../apis/CommentApi";
import ComModal from "../ComModal/ComModal";

const CommentDropdownAction = ({ handleEdit, photo }) => {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const confirmDelete = useModalState();

  const deleteCommentPhoto = useMutation({
    mutationFn: ({ photoId, commentId }) =>
      CommentApi.deleteComment(photoId, commentId), // Destructure the object
    onSuccess: () => {
      queryClient.invalidateQueries(["photo-comment"]);
      confirmDelete.handleClose();
    },
  });

  const items = [
    {
      key: "1",
      icon: <IoPencilOutline />,
      label: <p className="text-blue-500">Chỉnh sửa</p>,
      onClick: () => {
        handleEdit();
      },
    },
    {
      key: "2",
      icon: <CgRemove />,
      label: <span className="text-red-500">Xóa bình luận</span>,
      onClick: () => {
        confirmDelete.handleOpen();
      },
    },
  ];
  return (
    <div>
      <div className=" w-1/12 flex justify-center">
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
          <ComModal
            isOpen={confirmDelete.isModalOpen}
            onClose={confirmDelete.handleClose}
            width={444}
            className="custom-close-icon"
          >
            <div className="p-4">
              <h2 className="text-xl font-normal text-center text-white">
                Bạn có chắc chắn muốn xóa bình luận này không?
              </h2>
              <div className="flex justify-center mt-4">
                <button
                  onClick={confirmDelete.handleClose}
                  className="bg-gray-300 text-black px-4 py-2 rounded-md mr-4"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    // console.log(
                    //   "photoId",
                    //   photo.photoId,
                    //   "commentId",
                    //   photo.id
                    // );
                    deleteCommentPhoto.mutate({
                      photoId: photo.photoId,
                      commentId: photo.id, // Pass as a single object
                    });
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md "
                >
                  Xóa
                </button>
              </div>
            </div>
          </ComModal>
        </ConfigProvider>
        <Dropdown
          menu={{ items }}
          onOpenChange={(open) => setIsHovered(open)}
          overlayClassName="custom-dropdown"
          trigger={["click"]}
        >
          <div
            className={`px-1 cursor-pointer ${
              isHovered
                ? "bg-gray-100 rounded-full bg-opacity-50 text-black"
                : "opacity-80"
            } group-hover:opacity-100 transition-opacity duration-300`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <BsThreeDots />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default CommentDropdownAction;
