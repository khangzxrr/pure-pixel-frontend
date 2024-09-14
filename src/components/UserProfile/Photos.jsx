import { Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserProfileApi from "../../apis/UserProfile";
import UserService from "../../services/Keycloak";

export default function Photos() {
  const { userId } = useParams();
  const isCurrentUser =
    UserService.isLoggedIn() && userId === UserService.getUserId(); // Get userId from the URL parameters
  const {
    data: userData,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => UserProfileApi.getUserProfileById(userId),
  });
  // console.log(userId, currentUser);
  useEffect(() => {
    console.log(UserService.isLoggedIn(), UserService.getUserId());

    UserService.isLoggedIn();
  }, []);
  console.log(UserService.isLoggedIn(), UserService.getUserId());

  const DailyDoseItem = [
    {
      label: <NavLink to="">Ảnh công khai</NavLink>,
      key: "0",
    },
    {
      label: <NavLink to="">Ảnh riêng tư</NavLink>,
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
    <div className="">
      {isCurrentUser ? (
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
      ) : (
        ""
      )}
      <div className="w-full max-w-[1500px] px-5 py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5">
        {userData?.tabs[0].images.map((photo) => (
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
}
