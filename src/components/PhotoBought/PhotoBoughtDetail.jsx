import React from "react";
import { useParams } from "react-router-dom";
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

  const { data: photoData, isLoading } = useQuery({
    queryKey: ["photo-by-id", boughtId],
    queryFn: () => PhotoApi.getPhotoById(boughtId), // Không cần `await` khi đã trả về `Promise`
  });

  if (isLoading || isPhotoBoughtDetailLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PhotoBoughtPreviewComponent
      photo={photoData}
      sizeList={sizeList}
      photoBoughtId={boughtId}
    />
  );
};

export default PhotoBoughtDetail;
