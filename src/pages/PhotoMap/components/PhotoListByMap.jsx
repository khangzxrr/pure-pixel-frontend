import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import usePhotoMapStore from "../../../states/UsePhotoMapStore";
import { useEffect, useRef } from "react";
import { set } from "lodash";

const PhotoListByMap = ({
  page,
  setPage,
  totalPage,
  isAddNewPhotoList,
  setIsAddNewPhotoList,
  handleSelectPhoto,
  setIsStopped,
}) => {
  const { photoList, selectedPhoto, setPreviousSelectedPhoto } =
    usePhotoMapStore();

  // Use a ref object instead of an array for photoRefs
  const photoRefs = useRef({}); // Use an object to map photo.id to the ref

  // Handle the scrolling behavior to bring the selected photo into view
  useEffect(() => {
    if (selectedPhoto && photoRefs.current[selectedPhoto.id]) {
      const selectedPhotoRef = photoRefs.current[selectedPhoto.id];

      if (selectedPhotoRef) {
        // Scroll the selected photo into view
        selectedPhotoRef.scrollIntoView({
          behavior: "smooth", // Smooth scroll animation
          block: "center", // Scroll to the center of the container
        });
      }
    }
  }, [selectedPhoto]); // Re-run the effect when selectedPhoto changes

  // Handle Next Photo (Update selected photo and scroll)
  const handleNextPhoto = () => {
    if (photoList.length > 0 && selectedPhoto) {
      const currentIndex = photoList.findIndex(
        (p) => p.id === selectedPhoto.id
      );
      const nextIndex = (currentIndex + 1) % photoList.length;

      // setSelectedPhoto(photoList[nextIndex]);
      handleSelectPhoto(photoList[nextIndex]);
    }
    if (photoList.length > 0 && !selectedPhoto) {
      handleSelectPhoto(photoList[0]);
    }
  };

  // Handle Previous Photo (Update selected photo and sc  roll)
  const handlePreviousPhoto = () => {
    if (photoList.length > 0 && selectedPhoto) {
      const currentIndex = photoList.findIndex(
        (p) => p.id === selectedPhoto.id
      );
      const prevIndex =
        (currentIndex - 1 + photoList.length) % photoList.length;
      handleSelectPhoto(photoList[prevIndex]);
    }
    if (photoList.length > 0 && !selectedPhoto) {
      handleSelectPhoto(photoList[0]);
    }
  };
  return (
    <div className="flex flex-row w-full items-center">
      {/* Previous Button */}
      <button
        onClick={handlePreviousPhoto} // Call the handlePreviousPhoto function
        className="p-2 text-xl hover:opacity-70"
      >
        <LeftCircleOutlined />
      </button>

      <div className="overflow-x-auto flex space-x-2 custom-scrollbar pb-2 items-center">
        {/* Photo Gallery */}
        {photoList &&
          photoList.length > 0 &&
          photoList.map((photo) => (
            <div
              key={photo.id}
              className={`flex h-28 w-auto cursor-pointer text-black rounded-md ${
                photo.id === selectedPhoto?.id
                  ? "border-2 border-gray-200 transition duration-300"
                  : ""
              }`}
              onClick={() => handleSelectPhoto(photo)}
              ref={(el) => (photoRefs.current[photo.id] = el)} // Set the ref for each photo
            >
              <img
                className="w-auto rounded-sm"
                src={photo.signedUrl.thumbnail}
                alt={photo.title}
                style={{ maxWidth: "none" }}
              />
            </div>
          ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNextPhoto} // Call the handleNextPhoto function
        className="p-2 text-xl hover:opacity-70"
      >
        <RightCircleOutlined />
      </button>
    </div>
  );
};

export default PhotoListByMap;
