import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PhotoApi from "./../../../../apis/PhotoApi";
import LoadingSpinner from "../../../LoadingSpinner/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";

const PhotoComponent = () => {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPhotoById = useQuery({
    queryKey: ["get-photo-by-id"],
    queryFn: () => PhotoApi.getPhotoById(id),
  });

  if (getPhotoById.isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    ); //
  }

  if (getPhotoById.error) {
    return (
      <div className="text-red-500">Error loading photo: {error.message}</div>
    );
  }

  console.log(getPhotoById.data);

  return (
    <div className="flex justify-center items-center">
      <img
        src={getPhotoById.data.signedUrl.url}
        alt={`Photo ${getPhotoById.data.id}`}
        className="rounded-lg w-[500px] "
      />
    </div>
  );
};

export default PhotoComponent;
