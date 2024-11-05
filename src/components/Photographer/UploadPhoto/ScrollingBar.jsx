import React from "react"; // Added useState import
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import PhotoCard from "./PhotoCard";
import "./UploadPhoto.css";

export default function ScrollingBar() {
  const { photoArray } = useUploadPhotoStore();

  return (
    <div className="flex gap-4 overflow-x-auto h-[175px] lg:h-[190px] custom-scrollbar">
      {photoArray.map((photo) => (
        <PhotoCard key={photo.file.uid} photo={photo} />
      ))}
    </div>
  );
}
