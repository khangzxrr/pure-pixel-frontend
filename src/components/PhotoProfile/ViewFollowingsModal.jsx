import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import FollowApi from "../../apis/FollowApi";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { FaUserAltSlash } from "react-icons/fa";

const ViewFollowingsModal = ({ onClose }) => {
  const queryClient = useQueryClient();
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
      queryKey: ["followings-me"],
      queryFn: ({ pageParam = 0 }) =>
        FollowApi.getAllFollowingMe(10, pageParam),

      getNextPageParam: (lastPage, allPages) => {
        console.log(lastPage);

        const totalRecords = lastPage.totalRecord; // Tổng số bản ghi từ API
        const totalPages = lastPage.totalPage; // Tổng số trang từ API
        const currentPage = allPages.length; // Số trang đã tải
        return currentPage < totalPages ? currentPage : undefined;
      },
    });

  const listFollowings = data?.pages.flatMap((page) => page.objects);
  console.log(listFollowings);

  const unFollowMutation = useMutation({
    mutationFn: (followId) => FollowApi.unFollow(followId),
  });
  const handleUnFollow = (id) => {
    unFollowMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["followings-me"],
        });
        queryClient.invalidateQueries({
          queryKey: ["me"],
        });
      },

      onError: (error) => {
        console.log(error);
      },
    });
  };
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen overflow-y-auto flex justify-center items-center`}
    >
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } flex justify-center items-center bg-[#43474e]  text-[#eee] rounded-lg  relative`}
      >
        <div className="flex flex-col w-[600px] max-h-[600px]  min-h-[300px] relative gap-2">
          <button className="absolute right-0 m-1" onClick={onClose}>
            <IoCloseSharp className="size-6" />
          </button>
          <span className="flex justify-center w-full  bg-[#202225] rounded-t-lg p-2 ">
            Danh sách đang theo dõi
          </span>
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            {isLoading && <div>Loading...</div>}

            {!isLoading && listFollowings.length > 0 ? (
              listFollowings?.map((user) => (
                <div className="flex items-center justify-between py-2 border-b ">
                  <div
                    onClick={() => {
                      navigate(`/user/${user?.following?.id}/photos`);
                      setNameUserOther(user?.following?.name);
                      setUserOtherId(user?.following?.id);
                    }}
                    className="flex items-center  gap-2 group hover:cursor-pointer "
                  >
                    <div className="md:size-10 size-7 bg-[#eee] overflow-hidden rounded-full">
                      <img
                        src={user?.following?.avatar}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="font-normal md:text-md text-sm truncate md:max-w-full max-w-[130px] transition duration-200 group-hover:text-blue-500 group-hover:cursor-pointer">
                      {user?.following?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnFollow(user?.following?.id)}
                    className="text-center font-normal text-sm md:text-md transition duration-200 hover:bg-red-300 bg-red-500 md:px-3 px-1 py-1 rounded-sm "
                  >
                    Hủy theo dõi
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center text-[#8b8d91] justify-center h-[200px]">
                <FaUserAltSlash className="size-12" />
                <div>Bạn chưa theo dõi ai cả!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFollowingsModal;
