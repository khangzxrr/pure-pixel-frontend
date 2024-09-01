import React from "react";
import Photos from "./PhotoList";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { PlayCircleOutlined, AlignLeftOutlined } from "@ant-design/icons";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import PhotographerApi from "../../../apis/PhotographerApi";

const ForYou = () => {
  const navigate = useNavigate();
  const handlePhotoClick = (id) => {
    navigate(`/for-you/${id}`);
  };

  const result = useQueries({
    queries: [
      {
        queryKey: ["photos"],
        queryFn: PhotoApi.getPublicPhotos,
      },
      {
        queryKey: ["presignedUploadUrl", { filename: "test.jpg" }],
        queryFn: PhotographerApi.getPresignedUploadUrl,
      },
    ],
  });

  if (result[0].isPending || result[1].isPending) return "Loading...";

  if (result[0].error || result[1].error)
    return "An error has occurred" + result[0].message;

  console.log(result[0].data);
  console.log(result[1].data);

  return (
    <div className="bg-black ">
      <div className="flex justify-between items-center text-white">
        <div className="ml-6 hover:cursor-pointer hover:font-bold">
          <Dropdown
            className="hover:cursor-pointer"
            menu={{
              items: DailyDoseItem,
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Daily dose
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
        <div className="flex mr-6 gap-5">
          <div className="hover:cursor-pointer hover:font-bold">
            Slide show <PlayCircleOutlined />
          </div>
          <div className="hover:cursor-pointer hover:font-bold">
            Layout <AlignLeftOutlined />{" "}
          </div>
        </div>
      </div>

      <div className="w-full max-w-8xl px-5 py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5">
        {Photos.map((photo) => (
          <div key={photo.id} className="overflow-hidden rounded-xl">
            <img
              key={photo.id}
              src={photo.thumbnailPhotoUrl}
              alt={`Photo ${photo.id}`}
              className=" rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110 "
              onClick={() => handlePhotoClick(photo.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForYou;
