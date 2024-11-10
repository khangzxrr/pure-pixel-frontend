import React, { useEffect, useState } from "react";
import { getData, postData } from "../../apis/api";
import ComDateConverter from "../ComDateConverter/ComDateConverter";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import { FiSend } from "react-icons/fi";
function calculateTimeFromNow(dateString) {
  const startDate = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  if (!diffInMinutes) {
    return `vừa xong`;
  }
  if (diffInDays >= 1) {
    return `${diffInDays} ngày trước`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} giờ trước`;
  } else {
    if (diffInMinutes < 1) {
      return `vừa xong`;
    }
    return `${diffInMinutes} phút`;
  }
}
export default function CommentPhoto({ id, reload, top }) {
  const [dataComment, setDataComment] = useState([]);
  const [valueComment, setValueComment] = useState("");
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleReplyClick = (commentId) => {
    setReplyingToCommentId(commentId);
  };

  const submitReply = (commentId) => {
    const data = {
      content: replyContent,
    };
    postData(`/comment/photo/${id}/comment/${commentId}/reply`, data)
      .then((response) => {
        setReplyContent("");
        setReplyingToCommentId(null);
        // Cập nhật danh sách bình luận nếu cần
        callApiComment();
        reload();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const callApiComment = () => {
    getData(`/comment/photo/${id}`)
      .then((e) => {
        setDataComment(e?.data?.reverse());
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    callApiComment();
  }, [id]);

  const handComment = () => {
    postData(`comment/photo/${id}`, {
      content: valueComment,
    })
      .then((e) => {
        setValueComment("");
        callApiComment();
        reload();
      })
      .catch((error) => {
        console.log(error);
      });
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
                    onClick={handComment}
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
      {dataComment?.map((value, index) => (
        <div key={value.id}>
          <div className="flex items-start space-x-3 mb-3 w-full">
            <img
              src={value?.user?.avatar}
              alt={value?.user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className=" flex-1">
              <div className="flex items-center flex-wrap">
                <span className="font-medium mr-2">{value?.user?.name}</span>
              </div>
              <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
                {value?.content}
              </p>
              <div className="flex gap-4">
                <span className="text-xs text-gray-400 ">
                  {/* <ComDateConverter> */}
                  {calculateTimeFromNow(value?.createdAt)}
                  {/* </ComDateConverter> */}
                </span>
                {userData && (
                  <button
                    className="text-xs text-gray-400 "
                    onClick={() => handleReplyClick(value.id)}
                  >
                    Trả lời
                  </button>
                )}
              </div>

              {value.id === replyingToCommentId && (
                <div className="reply-input mt-2">
                  <div className="flex bg-[#202225]">
                    <textarea
                      className="w-full p-2 border-none focus:ring-0 text-[#eee] placeholder-[#6e6e6e] outline-none resize-none bg-[#202225] rounded-md"
                      rows="2"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                    ></textarea>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-2"></div>
                      <button
                        onClick={() => submitReply(value.id)}
                        className=" text[#eee] p-2 rounded-sm hover:bg-[#3d3d3d]"
                      >
                        <FiSend className="text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {value.replies.map((e, index) => (
            <div key={index} className="flex items-start space-x-3 pl-8 mb-2">
              <img
                src={e?.user?.avatar}
                alt={e?.user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{e?.user?.name}</span>
                </div>
                <p className="text-sm" style={{ whiteSpace: "pre-line" }}>
                  {e?.content}
                </p>
                <span className="text-xs text-gray-400 ml-2">
                  {calculateTimeFromNow(e?.createdAt)}
                </span>
              </div>
            </div>
          ))}
          <div className="bg-slate-300 h-[1px] px-3 my-3"></div>
        </div>
      ))}
      {dataComment.length === 0 && (
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
                    onClick={handComment}
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
