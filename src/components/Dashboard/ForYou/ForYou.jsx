import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { PlayCircleOutlined, AlignLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";

const ForYou = () => {
  const navigate = useNavigate();
  const handlePhotoClick = (id) => {
    navigate(`/for-you/${id}`);
  };

  const result = useQuery({
    queryKey: ["public-photo"],
    //20 is the limit of API returns
    //handle infinity scroll takes 20 elements each time
    queryFn: () => PhotoApi.getPublicPhotos(0, 20),
  });

  if (result.error) {
    return <div>error {JSON.stringify(result.error)}</div>;
  }

  const photos = result.data;

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
        {result.isFetching
          ? "loading..."
          : photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl">
                <img
                  key={photo.id}
                  src={photo.signedUrl.thumbnail}
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
