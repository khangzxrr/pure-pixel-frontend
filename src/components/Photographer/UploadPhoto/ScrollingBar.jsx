import React from "react"; // Added useState import
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import PhotoCard from "./PhotoCard";
import "./UploadPhoto.css";

export default function ScrollingBar() {
  const { photoList } = useUploadPhotoStore();

  return (
    <div className="flex overflow-x-auto scrollbar-hidden w-fit">
      {photoList &&
        photoList.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}
    </div>
  );
}
