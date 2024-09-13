import React from "react";
import PhotoNCommentLayout from "./PhotoNCommentLayout";
import DetailLayout from "./DetailLayout";

const PhotoDetailLayout = () => {
  return (
    <div className="grid grid-cols-12 ">
      <PhotoNCommentLayout />
      <DetailLayout />
    </div>
  );
};

export default PhotoDetailLayout;
