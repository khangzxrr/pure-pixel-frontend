import React from "react";
import { RxAvatar } from "react-icons/rx";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { Input } from "antd";
const { TextArea } = Input;
const CommentComponent = () => {
  return (
    <div className="flex flex-col gap-7 bg-white p-5 h-[500px] shadow-lg rounded-lg">
      <div className="flex gap-3">
        <div className="w-12 h-12 overflow-hidden rounded-full">
          <img
            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <TextArea placeholder="Hãy viết bình luận của bạn..." rows={4} />
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
          <div className="font-bold">Thật tuyệt vời!!!</div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <BiSolidLike className="hover:cursor-pointer" /> 1
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <BiDislike className="hover:cursor-pointer" /> 0
            </div>
            <div className="text-sm text-gray-500 hover:cursor-pointer hover:text-black">
              Reply to
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex gap-5">
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
      </div> */}
    </div>
  );
};

export default CommentComponent;
