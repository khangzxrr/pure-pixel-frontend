import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import FollowApi from "../../apis/FollowApi";
import { useInfiniteQuery } from "@tanstack/react-query";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import UseUserOtherStore from "../../states/UseUserOtherStore";
const ViewFollowersModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);

  useEffect(() => {
    // Tạo hiệu ứng mở modal khi component mount
    setIsVisible(true);
    return () => {
      // Đảm bảo modal biến mất khi unmount
      setIsVisible(false);
    };
  }, []);

  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ["followers-me"],
      queryFn: ({ pageParam = 0 }) =>
        FollowApi.getAllFolllowerMe(10, pageParam),
      getNextPageParam: (lastPage, allPages) => {
        const totalRecords = lastPage.totalRecord; // Tổng số bản ghi từ API
        const totalPages = lastPage.totalPage; // Tổng số trang từ API
        const currentPage = allPages.length; // Số trang đã tải

        return currentPage < totalPages ? currentPage : undefined;
      },
    });
  const listFollowers = data?.pages.flatMap((page) => page.objects);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen overflow-y-auto flex justify-center items-center`}
    >
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } flex justify-center items-center bg-[#43474e]  text-[#eee] rounded-lg  relative`}
      >
        <div className="flex flex-col w-[300px] md:w-[600px] max-h-[600px] relative gap-2">
          <button className="absolute right-0 m-1" onClick={onClose}>
            <IoCloseSharp className="size-6" />
          </button>
          <span className="flex justify-center w-full  bg-[#202225] rounded-t-lg p-2 ">
            Danh sách đang theo dõi bạn
          </span>
          <div className="flex flex-col px-2 gap-2">
            {isLoading && (
              <div>
                <LoadingSpinner />
              </div>
            )}
            {isError && <div>{error.message}</div>}
            {listFollowers?.map((user) => (
              <div className="flex items-center justify-between pb-2 mx-2 border-b border-[#8f8f8f]">
                <div
                  onClick={() => {
                    navigate(`/user/${user?.follower?.id}/photos`);
                    setNameUserOther(user?.follower?.name);
                    setUserOtherId(user?.follower?.id);
                  }}
                  className="flex items-center gap-2 group hover:cursor-pointer "
                >
                  <div className="md:size-10 size-7 overflow-hidden rounded-full">
                    <img
                      src={user?.follower?.avatar}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="font-normal md:text-md text-sm truncate md:max-w-auto max-w-[130px] transition duration-200 group-hover:text-blue-500 group-hover:cursor-pointer">
                    {user?.follower?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFollowersModal;
