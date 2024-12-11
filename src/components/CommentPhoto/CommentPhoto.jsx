import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import { FiSend } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommentApi from "../../apis/CommentApi";
import CommentPhotoLine from "./CommentPhotoLine";

export default function CommentPhoto({ id, reload, top }) {
  const queryClient = useQueryClient();
  const [valueComment, setValueComment] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();

  const { data, isLoading } = useQuery({
    queryKey: ["photo-comment", id],
    queryFn: () => CommentApi.getComments(id),
  });

  const commentPhoto = useMutation({
    mutationFn: ({ id, content }) => CommentApi.addComment(id, content),
    onSuccess: () => {
      console.log("hiiii");
      queryClient.invalidateQueries(["photo-comment"], id);
      setValueComment("");
    },
  });
  const handleComment = () => {
    commentPhoto.mutate({ id, content: valueComment });
  };
  return (
    <div className="space-y-4">
      {top && (
        <>
          {userData ? (
            <div className="">
              <div className="flex bg-[#202225]">
                <textarea
                  className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
                  rows="3"
                  value={valueComment}
                  onChange={(e) => {
                    setValueComment(e.target.value);
                  }}
                  placeholder="Viết bình luận của bạn..."
                ></textarea>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2"></div>
                  <button
                    onClick={handleComment}
                    className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
                  >
                    <FiSend className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={handleLogin}
              className="text-center hover:underline hover:cursor-pointer"
            >
              Vui lòng đăng nhập để bình luận
            </div>
          )}
        </>
      )}
      {data &&
        data.length > 0 &&
        data?.map((value, index) => (
          <CommentPhotoLine
            key={index}
            value={value}
            userData={userData}
            replyingToCommentId={replyingToCommentId}
            setReplyingToCommentId={setReplyingToCommentId}
          />
        ))}
      {data && data.length === 0 && (
        <div className="h-16">
          <p className="text-center ">Chưa có bình luận</p>
        </div>
      )}
      {!top && (
        <>
          {userData ? (
            <div className="sticky bottom-0 ">
              <div className="flex bg-[#202225]">
                <textarea
                  className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
                  rows="2"
                  value={valueComment}
                  onChange={(e) => {
                    setValueComment(e.target.value);
                  }}
                  placeholder="Viết bình luận của bạn..."
                ></textarea>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2"></div>
                  <button
                    onClick={handleComment}
                    className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
                  >
                    <FiSend className="text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={handleLogin}
              className="text-center hover:underline hover:cursor-pointer"
            >
              Vui lòng đăng nhập để bình luận
            </div>
          )}
        </>
      )}
    </div>
  );
}
