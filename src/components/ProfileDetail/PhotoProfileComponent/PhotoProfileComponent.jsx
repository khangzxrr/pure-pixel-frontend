import React from "react";
import PhotoList from "../../../components/Dashboard/ForYou/PhotoList"; // Giả sử đây là danh sách ảnh
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { Link } from "react-router-dom";

const PhotoProfileComponent = () => {
  const DailyDoseItem = [
    {
      label: <Link to="">Ảnh công khai</Link>,
      key: "0",
    },
    {
      label: <Link to="">Ảnh riêng tư</Link>,
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: "3rd menu item",
      key: "3",
    },
  ];
  return (
    <div className="flex flex-col">
      <div className="flex justify-center gap-10 hover:cursor-default">
        <div className="flex items-center gap-1">
          <div className="font-bold">Ảnh</div>
          <div className="">{PhotoList.length}</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="font-bold">Công việc hoàn thành</div>
          <div className="">35</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="font-bold">Gói</div>
          <div className="">558</div>
        </div>
      </div>
      <div className="w-full max-w-[1500px] px-5 mx-auto ">
        <Dropdown
          className="hover:cursor-pointer"
          menu={{
            items: DailyDoseItem,
          }}
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              Phân loại
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
      <div className="w-full max-w-[1500px] px-5 py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5">
        {PhotoList.map((photo) => (
          <div className="overflow-hidden rounded-xl hover:cursor-pointer">
            <img
              key={photo.id}
              src={photo.photo}
              alt=""
              className="rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoProfileComponent;
