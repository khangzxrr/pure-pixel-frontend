import React from "react";
import { useParams } from "react-router-dom";
import Photos from "../../Dashboard/ForYou/PhotoList";
import PhotoComponent from "./PhotoComponent/PhotoComponent";
import CommentComponent from "./CommentComponent/CommentComponent";
import CameraSpecification from "./../Detail/CameraSpecification/CameraSpecification";

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
