import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiSend } from "react-icons/fi";
import { useState } from "react";
import type { KeycloakTokenParsed } from "keycloak-js";
import CommentApi from "../../apis/CommentApi";
import type { Schema } from "../../apis/types";
import CommentDropdownAction from "./CommentDropdownAction";
import { useNavigate } from "react-router-dom";
import calculateDateDifference from "../../utils/calculateDateDifference";

type ReplyCommentPhotoLineProps = {
  commentDetail: Schema<"CommentDto">;
  photoId?: string;
  userData?: KeycloakTokenParsed;
};

type UpdateReplyVariables = {
  photoId?: string;
  commentId: string;
  content: string;
};

export default function ReplyCommentPhotoLine({
  commentDetail,
  photoId,
  userData,
}: ReplyCommentPhotoLineProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [editComment, setEditComment] = useState("");

  const updateCommentPhoto = useMutation({
    mutationFn: ({ photoId, commentId, content }: UpdateReplyVariables) =>
      CommentApi.updateComment(String(photoId), commentId, content),
    onSuccess: () => {
      // the v4-style array filter matched every query in react-query v5
      queryClient.invalidateQueries();
      setEditComment("");
      setIsEdit(false);
    },
  });
  const viewUserProfile = () => {
    navigate(`/user/${commentDetail.user.id}`);
  };

  const isBelongToUser = (userIdCheck: string | undefined) =>
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
