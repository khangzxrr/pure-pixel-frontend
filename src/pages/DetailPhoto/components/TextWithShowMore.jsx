import { useState } from "react";

const TextWithShowMore = ({ description }) => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleShowMore = () => {
    setShowFullText(!showFullText);
  };

  const isLongText = description?.length > 100;

  return (
    <div
      className={`${showFullText ? " cursor-pointer hover:opacity-90" : ""}`}
      onClick={showFullText ? toggleShowMore : ""}
    >
      {isLongText && !showFullText
        ? description?.slice(0, 100) + "..." // Show first 100 characters
        : description}

      {isLongText && (
        <button
          onClick={toggleShowMore}
          className="text-white font-semibold ml-2 underline  hover:opacity-90"
        >
          {showFullText ? "Rút gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default TextWithShowMore;
