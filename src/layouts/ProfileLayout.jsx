import React from "react";
import { Outlet, NavLink, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserProfileApi from "../apis/UserProfile";
export default function ProfileLayout() {
  const { userId } = useParams(); // Get userId from the URL parameters
  const {
    data: userData,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => UserProfileApi.getMyProfile(userId),
  });
  console.log(userData);

  return (
    <div className="flex">
      <div className="flex flex-col w-full mt-4">
        <div className="flex justify-center mx-auto gap-10 hover:cursor-default">
          <div className="flex items-center gap-1">
            <NavLink
              to={`/profile/${userId}/photos`}
              className="flex items-center gap-1"
            >
              <div className="font-bold">Ảnh</div>
              <div className="">{userData?.tabs[0].images.length}</div>
            </NavLink>
          </div>
          <div className="flex flex-row items-center gap-1">
            <NavLink
              to={`/profile/${userId}/completed`}
              className="flex items-center gap-1"
            >
              <div className="font-bold">Công việc hoàn thành</div>
              <span>{userData?.tabs[1].images?.length}</span>
            </NavLink>
          </div>
          <div className="flex items-center gap-1">
            <NavLink
              to={`/profile/${userId}/packages`}
              className="flex items-center gap-1"
            >
              <div className="font-bold">Gói</div>
              <div className="">{userData?.tabs[2].booking_list?.length}</div>
            </NavLink>
          </div>
        </div>
        <Outlet />
      </div>
      {window.location.pathname === `/profile/${userId}` && (
        <Navigate to={`/profile/${userId}/photos`} replace />
      )}
    </div>
  );
}
