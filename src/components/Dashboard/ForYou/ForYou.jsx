import React from "react";
import Photos from "./Photo";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { PlayCircleOutlined, AlignLeftOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPhotos } from "../../../apis/photo/GetPhotos";

const ForYou = () => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred" + error.message;

  console.log(data);

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
              src={photo.photo}
              alt={`Photo ${photo.id}`}
              className=" rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110 "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForYou;
