import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiSend } from "react-icons/fi";

import React, { useState } from "react";
import CommentApi from "../../apis/CommentApi";
import CommentDropdownAction from "./CommentDropdownAction";
import { useNavigate } from "react-router-dom";
import ReplyCommentPhotoLine from "./ReplyCommentPhotoLine";
import calculateDateDifference from "../../utils/calculateDateDifference";

export default function CommentPhotoLine({
  value,
  userData,
  replyingToCommentId,
  setReplyingToCommentId,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [editComment, setEditComment] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const relyCommentPhoto = useMutation({
    mutationFn: ({ photoId, commentId, content }) =>
      CommentApi.replyToComment(photoId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["photo-comment"], value.photoId, value.id);
      setReplyingToCommentId("");
      setReplyContent("");
    },
  });
  const updateCommentPhoto = useMutation({
    mutationFn: ({ photoId, commentId, content }) =>
      CommentApi.updateComment(photoId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["photo-comment"], value.photoId, value.id);
      setEditComment("");
      setIsEdit(false);
    },
  });
  const handleReplyClick = (commentId) => {
    if (replyingToCommentId === commentId) {
      setReplyingToCommentId("");
    } else {
      setReplyingToCommentId(commentId);
    }
  };

  const submitReply = () => {
    relyCommentPhoto.mutate({
      photoId: value.photoId,
      commentId: value.id,
      content: replyContent,
    });
  };
  const submitEdit = () => {
    updateCommentPhoto.mutate({
      photoId: value.photoId,
      commentId: value.id,
      content: editComment,
    });
  };
  const viewUserProfile = () => {
    navigate(`/user/${value.user.id}`);
  };
  const isBelongToUser = (userIdCheck) =>
    userData && userIdCheck && userData.sub === userIdCheck;
  const handleEdit = () => {
    setIsEdit(true);
    setEditComment(value.content);
  };
  const handleEditRely = (commentId) => {};
  return (
    <div key={value.id}>
      {isEdit ? (
        <div className="flex items-start space-x-3 mb-3 w-full">
          <img
            src={value?.user?.avatar}
            alt={value?.user?.name}
            className="w-10 h-10 rounded-full cursor-pointer  "
            onClick={() => viewUserProfile()}
          />
          <div className=" flex-1  w-full">
            <div className="flex items-center flex-wrap w-full">
              <div className="flex">
                <p
                  onClick={() => viewUserProfile()}
                  target="_blank"
                  className="font-medium mr-5 cursor-pointer"
                >
                  {value?.user?.name}
                </p>
              </div>
            </div>
            <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
              <div className="flex bg-[#202225]">
                <textarea
                  className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
                  rows="2"
                  value={editComment}
                  onChange={(e) => {
                    setEditComment(e.target.value);
                  }}
                  placeholder="Sửa bình luận của bạn..."
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2"></div>
                  <button
                    onClick={submitEdit}
                    className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
              </div>{" "}
            </p>
            <div className="flex gap-4 justify-between mt-2">
              <span className="text-xs text-gray-400 ">
                {calculateDateDifference(value?.createdAt)}
              </span>
              <span
                className="text-xs text-gray-400 underline cursor-pointer"
                onClick={() => setIsEdit(false)}
              >
                Hủy
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3 mb-3 w-full">
          <img
            src={value?.user?.avatar}
            alt={value?.user?.name}
            className="w-10 h-10 rounded-full cursor-pointer  "
            onClick={() => viewUserProfile()}
          />
          <div className=" flex-1  w-full">
            <div className="flex items-center flex-wrap w-full">
              <div className="flex">
                <p
                  onClick={() => viewUserProfile()}
                  target="_blank"
                  className="font-medium mr-5 cursor-pointer"
                >
                  {value?.user?.name}
                </p>
                {isBelongToUser(value?.user?.id) && (
                  <CommentDropdownAction
                    handleEdit={handleEdit}
                    photo={value}
                  />
                )}
              </div>
            </div>
            <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
              {value?.content}
            </p>
            <div className="flex gap-4">
              <span className="text-xs text-gray-400 ">
                {calculateDateDifference(value?.createdAt)}
              </span>
              {userData && (
                <p
                  className="text-xs text-gray-400 hover:opacity-70 cursor-pointer"
                  onClick={() => handleReplyClick(value.id)}
                >
                  Trả lời
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {value.id === replyingToCommentId && (
        <div className="flex items-start space-x-3 pl-20 mb-2 w-full">
          <div className="w-4/5">
            <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
              <div className="flex bg-[#202225]">
                <textarea
                  className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết phản hồi của bạn..."
                ></textarea>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2"></div>
                  <button
                    onClick={() => submitReply(value.id)}
                    className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
              </div>{" "}
            </p>
            <p
              className="text-xs text-gray-400 hover:opacity-70 underline cursor-pointer text-right"
              onClick={() => setReplyingToCommentId("")}
            >
              Hủy
            </p>
          </div>
        </div>
      )}
      {value.replies.map((e, index) => (
        <ReplyCommentPhotoLine
          key={index}
          photoId={value.photoId}
          commentDetail={e}
          userData={userData}
        />
      ))}

      <div className="bg-slate-300 h-[1px] px-3 my-3"></div>
    </div>
  );
}
