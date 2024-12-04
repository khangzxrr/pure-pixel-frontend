import React, { useEffect, useRef } from "react";
// import "./UploadPhoto.css";
import useSellPhotoStore from "../../../states/UseSellPhotoState";
import PhotoSellCard from "./PhotoSellCard";

export default function PhotoSellList() {
  const { photoArray, selectedPhoto } = useSellPhotoStore();
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
          <PhotoSellCard photo={photo} />
        </div>
      ))}
    </div>
  );
}
