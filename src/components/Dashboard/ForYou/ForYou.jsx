import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { PlayCircleOutlined, AlignLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";

const ForYou = () => {
  const navigate = useNavigate();
  const [photoList, setPhotoList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 30; // Giới hạn 60 ảnh
  const pageSize = 10; // Số lượng ảnh mỗi lần load

  // Fetch data for the current page
  const fetchPhotos = async () => {
    const response = await PhotoApi.getPublicPhotos(page, pageSize);
    const totalPhotos = photoList.length + response.length;

    if (totalPhotos >= limit) {
      setHasMore(false);
      setPhotoList((prevPhotos) => [
        ...prevPhotos,
        ...response.slice(0, limit - prevPhotos.length),
      ]);
    } else {
      setPhotoList((prevPhotos) => [...prevPhotos, ...response]);
      setPage((prevPage) => prevPage + 1);
    }
    console.log(response);
  };

  // Fetch initial photos
  const result = useQuery({
    queryKey: ["public-photo", page],
    queryFn: fetchPhotos,
    enabled: photoList.length === 0,
  });

  if (result.error) {
    return <div>error {JSON.stringify(result.error)}</div>;
  }

  return (
    <div className=" ">
      <div className="flex justify-between items-center px-6">
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
        {/* <div className="flex mr-6 gap-5">
          <div className="hover:cursor-pointer hover:font-bold">
            Slide show <PlayCircleOutlined />
          </div>
          <div className="hover:cursor-pointer hover:font-bold">
            Layout <AlignLeftOutlined />{" "}
          </div>
        </div> */}
      </div>

      <InfiniteScroll
        dataLength={photoList.length}
        next={fetchPhotos}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center mt-4">
            <LoadingSpinner />
          </div>
        }
        endMessage={
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            <b>Bạn đã xem hết ảnh ngày hôm nay</b>
          </p>
        }
      >
        <div className="max-w-8xl px-12 py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5 relative">
          {photoList.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-xl hover:cursor-pointer "
            >
              <img
                key={photo.id}
                src={photo.signedUrl.thumbnail}
                alt={`Photo ${photo.id}`}
                className="rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110 w-full h-full object-cover"
                onClick={() => navigate(`/for-you/${photo.id}`)}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default ForYou;
