import React from "react";
import PhotoComponent from "../components/PhotoDetail/PhotoNComment/PhotoComponent/PhotoComponent";
import CommentComponent from "../components/PhotoDetail/PhotoNComment/CommentComponent/CommentComponent";

const PhotoNCommentLayout = () => {
  return (
    <div className="col-span-9 bg-gray-300 p-5 pt-10">
      <div className="flex flex-col gap-5">
        <PhotoComponent />
        <CommentComponent />
      </div>
    </div>
  );
};

export default PhotoNCommentLayout;
