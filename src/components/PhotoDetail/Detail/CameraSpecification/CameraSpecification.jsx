import React, { useState } from "react";
import { RiCamera3Line, RiCameraLensLine } from "react-icons/ri";
import ExifDetail from "./ExifDetail";

const CameraSpecification = ({ exif }) => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const hasProperties = Object.keys(exif).some(
    (key) => exif[key] !== undefined && exif[key] !== null && exif[key] !== ""
  );

  return (
    <div className="flex flex-col bg-white p-5 gap-3 shadow-lg rounded-lg">
      <div className="flex items-center gap-3">
        <div>
          <RiCamera3Line className="w-7 h-7" />
        </div>
        <ul>
          <li>
            <strong>Model: </strong>
            {exif.Model || "Không xác định"}
          </li>
        </ul>
      </div>
      <div className="flex gap-3 w-full">
        <div>
          <RiCameraLensLine className="w-7 h-7" />
        </div>

        <div className="flex flex-col">
          <ExifDetail exif={exif} showMore={showMore} />
        </div>
      </div>
      {hasProperties && (
        <button
          onClick={toggleShowMore}
          className="mt-2 text-blue-500 hover:underline"
        >
          {showMore ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default CameraSpecification;
