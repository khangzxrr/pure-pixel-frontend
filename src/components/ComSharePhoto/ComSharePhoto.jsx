import React from "react";
import { User, Link, ChevronDown, Info } from "lucide-react";
import { Select } from "antd";
import PhotoApi from "../../apis/PhotoApi";
import { useQuery } from "@tanstack/react-query";
import { FaClipboard } from "react-icons/fa";
import { useNotification } from "./../../Notification/Notification";
export default function ComSharePhoto({ idImg, onClose }) {
  const { notificationApi } = useNotification();
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  const AvailableResolutions = useQuery({
    queryKey: ["getAvailableResolutionsByPhotoId", idImg],
    queryFn: () => PhotoApi.getAvailableResolutionsByPhotoId(idImg),
  });
  console.log(idImg);
  console.log(AvailableResolutions);

  const baseURL = window.location.origin;
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`${baseURL}/photo/${idImg}`)
      .then(() => {
        notificationApi("success", "Thành công", "Đã copy liên kết");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };
  return (
    <div className="bg-white text-gray-800 py-8 px-1 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chia sẻ hình ảnh</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <Info size={20} />
        </button>
      </div>

      {/* <div className="mb-6">
        <input
          type="text"
          placeholder="Add people, groups and calendar events"
          className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div> */}

      {/* <h3 className="text-lg font-semibold mb-2 flex items-center">
        People with access
        <button className="ml-2 text-gray-500 hover:text-gray-700">
          <Info size={16} />
        </button>
      </h3> */}
      {false ? (
        <>
          <h3 className="text-lg font-semibold mb-2">Lựa chọn </h3>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
            <div className="flex items-center">
              <Link size={20} className="mr-3 text-gray-500" />
              <span>Chất lượng ảnh</span>
            </div>
            <div className="flex items-center">
              <Select
                defaultValue="Viewer"
                variant="borderless"
                style={{
                  width: 120,
                  backgroundColor: "#f3f4f6",
                  textAlign: "end",
                }}
                onChange={handleChange}
                options={[
                  { value: "Viewer", label: "Viewer" },
                  { value: "Commenter", label: "Commenter" },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
            <span className="text-gray-800 font-mono mr-2 overflow-hidden whitespace-nowrap text-ellipsis">
              {baseURL}/photo/{idImg}
            </span>
            <button onClick={copyToClipboard} className="ml-auto">
              <FaClipboard className="text-gray-500 hover:text-gray-800 cursor-pointer" />
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={copyToClipboard}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Copy link
        </button>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Xong
        </button>
      </div>
    </div>
  );
}
