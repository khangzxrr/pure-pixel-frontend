import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import UserService from "../../services/Keycloak";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoExchange from "../../apis/PhotoExchange";
import PhotoApi from "../../apis/PhotoApi";
import PhotoBoughtPreviewComponent from "./PhotoBoughtPreviewComponent";

const PhotoBoughtDetail = () => {
  const { boughtId } = useParams();

  const { data, isLoading: isPhotoBoughtDetailLoading } = useQuery({
    queryKey: ["photo-bought-detail", boughtId],
    queryFn: () => PhotoExchange.getPhotoBoughtDetail(boughtId),
  });
  const sizeList = data;

  const {
    data: photoData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photo-by-id", boughtId],
    queryFn: () => PhotoApi.getPhotoById(boughtId), // Không cần `await` khi đã trả về `Promise`
  });

  if (isLoading || isPhotoBoughtDetailLoading) {
    return <div>Loading...</div>;
  }

  return <PhotoBoughtPreviewComponent photo={photoData} sizeList={sizeList} />;
};

export default PhotoBoughtDetail;
