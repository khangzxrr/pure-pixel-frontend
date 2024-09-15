import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PhotoApi from "./../../../../apis/PhotoApi";

const PhotoComponent = () => {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await PhotoApi.getPresignedUploadUrls(id); // Gọi API lấy ảnh theo ID
        setPhoto(response);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>; // Hiển thị khi đang tải ảnh
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading photo: {error.message}</div>
    ); // Hiển thị lỗi
  }

  if (!photo) {
    return <div className="text-red-500">Photo not found</div>; // Hiển thị nếu không tìm thấy ảnh
  }

  return (
    <div className="flex justify-center items-center">
      <img
        src={photo.signedUrl.full}
        alt={`Photo ${photo.id}`}
        className="rounded-lg"
      />
    </div>
  );
};

export default PhotoComponent;
