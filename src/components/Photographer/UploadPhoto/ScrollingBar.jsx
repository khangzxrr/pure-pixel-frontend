import React from "react"; // Added useState import
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import PhotoCard from "./PhotoCard";
import "./UploadPhoto.css";

export default function ScrollingBar() {
  const { photoArray } = useUploadPhotoStore();

  return (
    <div className="flex overflow-x-auto scrollbar-hidden w-fit">
      {photoArray.map((photo) => (
        <PhotoCard key={1} photo={photo} />
      ))}
    </div>
  );
}
