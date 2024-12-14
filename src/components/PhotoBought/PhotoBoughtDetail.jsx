import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoExchange from "../../apis/PhotoExchange";
import PhotoApi from "../../apis/PhotoApi";
import PhotoBoughtPreviewComponent from "./PhotoBoughtPreviewComponent";

const PhotoBoughtDetail = () => {
  const { boughtId } = useParams();

  const {
    data: photoData,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ["photo-bought-detail", boughtId],
    queryFn: () => PhotoExchange.getPhotoBoughtDetail(boughtId),
  });

  if (isLoading || isPending) {
    return <div>Loading...</div>;
  }

  return (
    <PhotoBoughtPreviewComponent
      photoData={photoData}
      photoBoughtId={boughtId}
    />
  );
};

export default PhotoBoughtDetail;
