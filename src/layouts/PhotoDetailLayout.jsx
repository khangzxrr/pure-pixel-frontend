import React from "react";
import DetailLayout from "../components/PhotoDetail/Detail/DetailLayout";
import PhotoNCommentLayout from "../components/PhotoDetail/PhotoNComment/PhotoNCommentLayout";

const PhotoDetailLayout = () => {
  return (
    <div className="grid grid-cols-12 ">
      <PhotoNCommentLayout />
      <DetailLayout />
    </div>
  );
};

export default PhotoDetailLayout;
