import React from "react";
import { useParams } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa6";
import { FiCameraOff } from "react-icons/fi";

const PackagesUser = () => {
  const { userId } = useParams();
  const limit = 10;

  const fetchPackages = ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const photographerId = userId;
    const response = PhotoshootPackageApi.getPackagesByPhotographerId(
      photographerId,
      validLimit,
      validPage
    );
    return response;
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["packages", userId],
      queryFn: fetchPackages,
      getNextPageParam: (lastPage, pages) => {
        const currentPage = pages.length;
        // Trả về số trang tiếp theo nếu còn ảnh
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });
  const packagesList = data?.pages
    ? data.pages.flatMap((page) => page.objects)
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {packagesList.length > 0 ? (
        packagesList.map((item) => (
          <div className="w-full">
            <div className="group hover:cursor-pointer relative w-full h-[200px] overflow-hidden rounded-lg">
              <img
                src={item?.thumbnail}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="sticky top-0">
                <div className="absolute flex items-end justify-between bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div>
                    <div className="text-xl">{item?.title}</div>
                    <div className="truncate max-w-[200px] md:max-w-[300px]  font-normal text-sm">
                      {item?.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 hover:underline underline-offset-2 hover:cursor-pointer">
                    <span className="hidden xl:block">Xem chi tiết</span>{" "}
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col col-span-3 justify-center items-center text-[#8b8d91] h-[200px]">
          <FiCameraOff className="text-[100px]" />
          Không có gói dịch vụ nào!
        </div>
      )}
    </div>
  );
};

export default PackagesUser;
