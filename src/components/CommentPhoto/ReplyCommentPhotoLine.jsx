import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiSend } from "react-icons/fi";
import React, { useState } from "react";
import CommentApi from "../../apis/CommentApi";
import CommentDropdownAction from "./CommentDropdownAction";
import { useNavigate } from "react-router-dom";
import calculateDateDifference from "../../utils/calculateDateDifference";

export default function ReplyCommentPhotoLine({
  commentDetail,
  photoId,
  userData,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [editComment, setEditComment] = useState(null);

  const updateCommentPhoto = useMutation({
    mutationFn: ({ photoId, commentId, content }) =>
      CommentApi.updateComment(photoId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(
        ["photo-comment"],
        commentDetail.photoId,
        commentDetail.id
      );
      setEditComment("");
      setIsEdit(false);
    },
  });
  const viewUserProfile = () => {
    navigate(`/user/${commentDetail.user.id}`);
  };

  const isBelongToUser = (userIdCheck) =>
    userData && userIdCheck && userData.sub === userIdCheck;
  const handleEdit = () => {
    setIsEdit(true);
    setEditComment(commentDetail.content);
  };
  const submitEdit = () => {
    updateCommentPhoto.mutate({
      photoId: photoId,
      commentId: commentDetail.id,
      content: editComment,
    });
  };
  return isEdit ? (
    <div className="flex items-start space-x-3 pl-8 mb-2 w-full">
      <img
        src={commentDetail?.user?.avatar}
        alt={commentDetail?.user?.name}
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => viewUserProfile()}
      />
      <div className="w-4/5">
        <div className="flex items-center">
          <div className="flex">
            <p
              onClick={() => viewUserProfile()}
              className="font-medium cursor-pointer mr-5"
            >
              {commentDetail?.user?.name}
            </p>

            {isBelongToUser(commentDetail?.user?.id) && (
              <CommentDropdownAction
                photo={{ photoId: photoId, id: commentDetail.id }}
                handleEdit={handleEdit}
              />
            )}
          </div>
        </div>
        <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
          <div className="flex bg-[#202225]">
            <textarea
              className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
              value={editComment}
              onChange={(event) => setEditComment(event.target.value)}
              placeholder="Viết phản hồi của bạn..."
            ></textarea>
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2"></div>
              <button
                onClick={() => submitEdit()}
                className="text-[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
              >
                <FiSend className="text-lg" />
              </button>
            </div>
          </div>{" "}
        </p>
        <div className="flex gap-4 justify-between mt-2">
          <p className="text-xs text-gray-400 ">
            {calculateDateDifference(commentDetail?.createdAt)}
          </p>
          <p
            className="text-xs text-gray-400 hover:opacity-70 underline cursor-pointer"
            onClick={() => setIsEdit(false)}
          >
            Hủy
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-start space-x-3 pl-8 mb-2">
      <img
        src={commentDetail?.user?.avatar}
        alt={commentDetail?.user?.name}
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => viewUserProfile()}
      />
      <div className="w-4/5">
        <div className="flex items-center">
          <div className="flex">
            <p
              onClick={() => viewUserProfile()}
              className="font-medium cursor-pointer mr-5"
            >
              {commentDetail?.user?.name}
            </p>

            {isBelongToUser(commentDetail?.user?.id) && (
              <CommentDropdownAction
                photo={{ photoId: photoId, id: commentDetail.id }}
                handleEdit={handleEdit}
              />
            )}
          </div>
        </div>
        <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
          {commentDetail?.content}
        </p>
        <span className="text-xs text-gray-400 ml-2">
          {calculateDateDifference(commentDetail?.createdAt)}
        </span>
      </div>
    </div>
  );
}
