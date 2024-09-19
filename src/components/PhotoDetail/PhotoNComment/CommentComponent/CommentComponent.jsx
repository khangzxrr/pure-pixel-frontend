import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { Input } from "antd";
const { TextArea } = Input;

const CommentComponent = () => {
  // Quản lý trạng thái của Editor
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  // Hàm xử lý thay đổi của Editor
  const onEditorStateChange = (state) => {
    setEditorState(state);
  };
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
          {/* <TextArea placeholder="Hãy viết bình luận của bạn..." rows={4} /> */}
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
          <div className="px-[18px] py-[4px] outline outline-1 text-[#3b82f6] outline-[#3b82f6]  hover:bg-[#3b82f6] hover:text-white hover:cursor-pointer rounded-lg transition-colors duration-200">
            Bình luận
          </div>
        </div>
      </div>

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
            {/* <div className="text-sm text-gray-500 hover:cursor-pointer hover:text-black">
              Reply to
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
