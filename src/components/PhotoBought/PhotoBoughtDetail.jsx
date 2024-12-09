import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoExchange from "../../apis/PhotoExchange";
import PhotoApi from "../../apis/PhotoApi";
import PhotoBoughtPreviewComponent from "./PhotoBoughtPreviewComponent";

const PhotoBoughtDetail = () => {
  const { boughtId } = useParams();

  const { data: photoData, isLoading } = useQuery({
    queryKey: ["photo-bought-detail", boughtId],
    queryFn: () => PhotoExchange.getPhotoBoughtDetail(boughtId),
  });

  const { data: photoById } = useQuery({
    queryKey: ["photo", boughtId],
    queryFn: () => PhotoApi.getPhotoById(boughtId), // Không cần `await` khi đã trả về `Promise`
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PhotoBoughtPreviewComponent photo={photoData} photoBoughtId={boughtId} />
  );
};

export default PhotoBoughtDetail;
