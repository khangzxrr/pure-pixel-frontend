import React, { useEffect } from "react";
import { User, Link, ChevronDown, Info } from "lucide-react";
import { Select, Skeleton } from "antd";
import PhotoApi from "../../apis/PhotoApi";
import { useQuery } from "@tanstack/react-query";
import { FaClipboard } from "react-icons/fa";
import { useNotification } from "./../../Notification/Notification";
import { useState } from "react";
import { getData, postData } from "./../../apis/api";
export default function ComSharePhoto({ idImg, onClose }) {
  const { notificationApi } = useNotification();
  const [linkShare, setLinkShare] = useState(null);
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    callApiShare(value);
  };
  const callApiShare = (value) => {
    setLinkShare(null);
    postData(`/photo/share`, {
      photoId: idImg,
      resolution: value,
    })
      .then((e) => {
        console.log("====================================");
        console.log(e.shareUrl);
        console.log("====================================");
        setLinkShare(e.shareUrl);
      })
      .catch((error) => {
        console.log(error);
        setLinkShare(null);
      });
  };


  const AvailableResolutions = useQuery({
    queryKey: ["getAvailableResolutionsByPhotoId", idImg],
    queryFn: () => PhotoApi.getAvailableResolutionsByPhotoId(idImg),
  });

  console.log(AvailableResolutions);

  const baseURL = window.location.origin;
  const copyToClipboard = () => {
    const url = linkShare || `${baseURL}/photo/${idImg}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notificationApi("success", "Thành công", "Đã sao chép liên kết");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };
  const resolutionOptions = AvailableResolutions?.data?.map((res) => ({
    value: res.resolution,
    label: res.resolution,
  }));
    useEffect(() => {
      try {
        callApiShare(resolutionOptions[0]?.value);
      } catch (error) {}
    }, [AvailableResolutions?.data]);
  return (
    <div className="bg-white text-gray-800 py-8 px-1 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chia sẻ hình ảnh</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <Info size={20} />
        </button>
      </div>
      {AvailableResolutions?.isLoadingError ? (
        <Skeleton active />
      ) : AvailableResolutions?.data ? (
        <>
          <h3 className="text-lg font-semibold mb-2">Lựa chọn </h3>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
            <div className="flex items-center">
              <Link size={20} className="mr-3 text-gray-500" />
              <span>Chất lượng ảnh</span>
            </div>
            <div className="flex items-center">
              <Select
                defaultValue={resolutionOptions[0].value}
                variant="borderless"
                style={{
                  width: 120,
                  backgroundColor: "#f3f4f6",
                  textAlign: "end",
                }}
                onChange={handleChange}
                options={resolutionOptions}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              disabled={linkShare ? false : true}
              onClick={copyToClipboard}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy đường dẫn
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Xong
            </button>
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
          <div className="flex justify-between mt-4">
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy đường dẫn
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Xong
            </button>
          </div>
        </>
      )}
    </div>
  );
}
