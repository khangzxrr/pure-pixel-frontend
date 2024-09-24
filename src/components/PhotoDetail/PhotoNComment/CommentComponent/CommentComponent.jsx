import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState } from "draft-js";
import "../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { Input, Spin } from "antd";
import UserService from "../../../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import useCommentStore from "../../../../states/InputCommentState";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PhotoApi from "../../../../apis/PhotoApi";
const { TextArea } = Input;

const CommentComponent = () => {
  const { id: photoId } = useParams();
  const { inputComment, setInputComment } = useCommentStore();
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromText(inputComment))
  );
  const [progress, setProgress] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isErrorComments, setIsErrorComments] = useState(false);

  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const fetchCommentsMutation = useMutation({
    mutationFn: () => PhotoApi.getPhotoComments(photoId),
    onSuccess: (data) => {
      setComments(data.reverse());
      setIsLoadingComments(false);
    },
    onError: (error) => {
      console.error("Error fetching comments:", error);
      setIsErrorComments(true);
      setIsLoadingComments(false);
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: (inputComment) =>
      PhotoApi.commentPhoto(photoId, { content: inputComment }, setProgress),
    onSuccess: () => {
      fetchComments();
      setInputComment("");
      setProgress(false);
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    },
  });

  const fetchComments = () => {
    setIsLoadingComments(true);
    setIsErrorComments(false);
    fetchCommentsMutation.mutate();
  };

  const onEditorStateChange = (state) => {
    setEditorState(state);
  };

  const handleLogin = () => {
    keycloak.login();
  };

  const onEditorChange = (e) => {
    setInputComment(e.blocks[0].text);
  };

  const handleCommentSubmit = () => {
    postCommentMutation.mutate(inputComment);
  };

  React.useEffect(() => {
    fetchComments();
  }, [photoId]);

  return (
    <div className="flex flex-col gap-7 bg-white p-5 h-[500px] shadow-lg rounded-lg">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <img
              src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="outline outline-1 outline-gray-200 rounded-lg px-3 py-1 w-[96%] ">
            <Editor
              placeholder="Hãy viết bình luận của bạn..."
              editorState={editorState}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              onEditorStateChange={onEditorStateChange}
              onChange={onEditorChange}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="px-[18px] py-[4px] outline outline-1 text-[#3b82f6] outline-[#3b82f6] hover:bg-[#3b82f6] hover:text-white hover:cursor-pointer rounded-lg transition-colors duration-200"
            onClick={handleCommentSubmit}
          >
            Bình luận
          </div>
        </div>
      </div>
      <div className="overflow-y-auto">
        {isLoadingComments && <div>Loading comments...</div>}
        {isErrorComments && <div>Error loading comments</div>}
        {progress && (
          <div className="m-7 ">
            <Spin />
          </div>
        )}
        {comments &&
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-5">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <img
                  src={
                    comment.user.avatar ||
                    "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <div className="text-sm text-gray-500">
                  {comment.user.name || "Nguyen Thanh Trung"}
                </div>
                <div className="">{comment.content || "Thật tuyệt vời!!!"}</div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1">
                    <BiSolidLike className="hover:cursor-pointer" />{" "}
                    {comment.likes || 1}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <BiDislike className="hover:cursor-pointer" />{" "}
                    {comment.dislikes || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="flex flex-col gap-7 bg-white p-5 shadow-lg rounded-lg relative">
        <div
          className={`relative ${
            !userData ? "blur-sm pointer-events-none" : ""
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 overflow-hidden rounded-full">
                <img
                  src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="outline outline-1 outline-gray-200 rounded-lg px-3 py-1 w-[96%] ">
                <Editor
                  placeholder="Hãy viết bình luận của bạn..."
                  editorState={editorState}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  onEditorStateChange={onEditorStateChange}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="px-[18px] py-[4px] outline outline-1 text-[#3b82f6] outline-[#3b82f6] hover:bg-[#3b82f6] hover:text-white hover:cursor-pointer rounded-lg transition-colors duration-200">
                Bình luận
              </div>
            </div>
          </div>
        </div>

        {!userData && (
          <div className="absolute top-[-50px] left-50 w-full h-full flex justify-center items-center z-10">
            <button
              onClick={handleLogin}
              className="px-4 py-2 outline outline-1 outline-[#3b82f6] text-[#3b82f6] rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200 z-20"
            >
              Đăng nhập để bình luận
            </button>
          </div>
        )}

        <div className="flex gap-5">
          <div className="w-8 h-8 overflow-hidden rounded-full">
            <img
              src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Nguyen Thanh Trung</div>
            <div className="">Thật tuyệt vời!!!</div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1">
                <BiSolidLike className="hover:cursor-pointer" /> 1
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <BiDislike className="hover:cursor-pointer" /> 0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
