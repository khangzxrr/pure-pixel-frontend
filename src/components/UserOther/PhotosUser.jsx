import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import PhotoApi from "../../apis/PhotoApi";

const PhotosUser = () => {
  const { param } = useParams();
  const queryClient = useQueryClient();
  const limit = 20;

  console.log(param.id);

  // const fetchPhotos = async ({ pageParam = 0 }) => {
  //   const validLimit = Math.max(1, Math.min(limit, 9999));
  //   const validPage = Math.max(0, Math.min(pageParam, 9999));
  //   const photographerId = param.id;
  //   const response = await PhotoApi.getPublicPhotos(
  //     validLimit,
  //     validPage,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     photographerId,
  //     null
  //   );
  //   return response;
  // };
  // const { data, error, isLoading, isError, fetchNextPage, hasNextPage } =
  //   useInfiniteQuery({
  //     queryKey: ["user-photos", param.id],
  //     queryFn: fetchPhotos,
  //     getNextPageParam: (lastPage, pages) => {
  //       const currentPage = pages.length;
  //       // Trả về số trang tiếp theo nếu còn ảnh
  //       return currentPage < lastPage.totalPage ? currentPage : undefined;
  //     },
  //   });

  // const photoList = data?.pages
  //   ? data.pages.flatMap((page) => page.objects)
  //   : [];

  return <div>PhotosUser</div>;
};

export default PhotosUser;
