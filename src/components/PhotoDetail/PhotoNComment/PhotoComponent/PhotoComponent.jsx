import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PhotoApi from "./../../../../apis/PhotoApi";
import LoadingSpinner from "../../../LoadingSpinner/LoadingSpinner";

const PhotoComponent = () => {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await PhotoApi.getPhotoById(id);
        setPhoto(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    ); //
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading photo: {error.message}</div>
    );
  }

  if (!photo || !photo.signedUrl) {
    return <div className="text-red-500">Không tìm thấy ảnh</div>;
  }

  return (
    <div className="flex justify-center items-center">
      <img
        src={photo.signedUrl.url}
        alt={`Photo ${photo.id}`}
        className="rounded-lg w-[500px] "
      />
    </div>
  );
};

export default PhotoComponent;
