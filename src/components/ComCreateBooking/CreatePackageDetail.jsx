import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./FormInput.css";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
const { Dragger } = Upload;
const props = {
  name: "file",
  multiple: true,
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};
const CreatePackageDetail = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#292b2f] rounded-lg">
      <div className="overflow-hidden h-[600px] rounded-none md:rounded-l-lg ">
        {/* <img
          src="https://picsum.photos/seed/picsum/1920/1080"
          alt=""
          className="size-full object-cover"
        /> */}
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text ">
            <span className="text-[#eee]">
              Nhấp hoặc kéo tệp vào khu vực này để tải lên đại diện cho gói này
            </span>
          </p>
        </Dragger>
      </div>
      <div className="flex flex-col gap-3 py-4 px-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-10 overflow-hidden rounded-full">
              <img
                src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>Trung Nguyen</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-xl font-semibold ">Tên gói:</div>
          <input
            type="text"
            className="bg-[#202225] outline-none text-xl font-semibold p-2 rounded-lg w-[70%]"
            placeholder="Nhập tên gói"
          />
        </div>
        <div className="flex items-center gap-2">
          <div>Giá gói:</div>
          <input
            type="number"
            className="bg-[#202225] outline-none w-[50%] text-sm font-normal p-2 rounded-lg"
            placeholder="Nhập giá gói đơn vị VNĐ"
          />
        </div>
        <div className="flex flex-col gap-1 p-2 border border-gray-600 rounded-lg">
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorChange}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            editorStyle={{ maxHeight: "300px", overflowY: "hidden" }}
            placeholder="Nhập mô tả chi tiết gói"
          />
        </div>

        <button className="bg-[#eee] text-center p-2 text-[#202225] rounded-lg hover:bg-[#b3b3b3] transition duration-300">
          Tạo gói
        </button>
      </div>
    </div>
  );
};

export default CreatePackageDetail;
