import React from "react";
import NewfeedCard from "./../components/ComNewfeed/NewfeedCard";
import ProfileUpload from "../components/ComNewfeed/ProfileUpload";
import NewsfeedApi from "../apis/NewsfeedApi";
import { useInfiniteQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../services/Keycloak";
import { Skeleton } from "antd";
const NewfeedLayout = () => {
  const { keyloack } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const limit = 3;
  const fetchNewsfeed = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const response = await NewsfeedApi.getAllNewsfeed(validLimit, validPage);
    return response;
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["newsfeed"],
      queryFn: fetchNewsfeed,
      getNextPageParam: (lastPage, pages) => {
        const currentPage = pages.length;
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });

  const NewsfeedList = data?.pages
    ? data.pages.flatMap((page) => page.objects)
    : [];

  return (
    <div className="flex flex-col gap-3 py-2 items-center w-full ">
      <ProfileUpload userInfo={userData} />
      {isLoading && (
        <div className="flex flex-col w-[400px] md:w-[700px] bg-[#2f3136] rounded-xl p-3">
          <Skeleton circle={true} height={40} width={40} />
          <Skeleton height={20} count={2} />
          <Skeleton height={500} />
          <Skeleton height={70} />
          <Skeleton height={50} />
        </div>
      )}
      {!isLoading &&
        NewsfeedList.map((item) => (
          <NewfeedCard
            userInfo={userData}
            id={item.id}
            userId={item.user.id}
            userName={item.user.name}
            avatar={item.user.avatar}
            title={item.title}
            createdAt={item.createdAt}
            commentCount={item._count.comments}
            likeCount={item._count.likes}
            photo={item.photos}
          />
        ))}
    </div>
  );
};

export default NewfeedLayout;
