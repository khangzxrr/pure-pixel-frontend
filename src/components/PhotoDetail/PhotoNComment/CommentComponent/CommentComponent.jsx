import React from "react";
import { RxAvatar } from "react-icons/rx";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { Input } from "antd";
const { TextArea } = Input;
const CommentComponent = () => {
  return (
    <div className="flex flex-col gap-7 bg-white p-5 h-[500px] shadow-lg rounded-lg">
      <div className="flex gap-3">
        <RxAvatar className="w-12 h-12" />
        <TextArea placeholder="Hãy viết bình luận của bạn..." rows={4} />
      </div>
      <div className="flex gap-5">
        <RxAvatar className="w-8 h-8" />
        <div className="flex flex-col">
          <div className="text-sm text-gray-500">Nguyen Thanh Trung</div>
          <div className="font-bold">Thật tuyệt vời!!!</div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <BiSolidLike /> 1
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <BiDislike /> 0
            </div>
            <div className="text-sm text-gray-500 hover:cursor-pointer hover:text-black">
              Reply to
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-5">
        <RxAvatar className="w-8 h-8" />
        <div className="flex flex-col">
          <div className="text-sm text-gray-500">Nguyen Thanh Trung</div>
          <div className="font-bold">Hình này bạn chụp ở đâu vậy?</div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1 text-gray-500">
              <BiLike /> 0
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <BiDislike /> 0
            </div>
            <div className="text-sm text-gray-500 hover:cursor-pointer hover:text-black">
              Reply to
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
