import React, { useEffect, useRef } from "react";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import PhotoCard from "./PhotoCard";
import "./UploadPhoto.css";

export default function ScrollingBar() {
  const { photoArray, selectedPhoto } = useUploadPhotoStore();
  const photoRefs = useRef({}); // Object to store refs for each photo

  useEffect(() => {
    if (selectedPhoto && photoRefs.current[selectedPhoto]) {
      // Scroll the selected photo card into view
      photoRefs.current[selectedPhoto].scrollIntoView({
        behavior: "smooth",
        block: "center", // Scroll to center of the view
      });
    }
  }, [selectedPhoto]);

  return (
    <div className="flex gap-4 overflow-x-auto h-[175px] lg:h-[190px] custom-scrollbar">
      {photoArray.map((photo) => (
        <div
          key={photo.file.uid}
          ref={(el) => (photoRefs.current[photo.file.uid] = el)}
        >
          <PhotoCard photo={photo} />
        </div>
      ))}
    </div>
  );
}
