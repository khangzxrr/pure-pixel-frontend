import React from "react";
import PhotoComponent from "../components/PhotoDetail/PhotoNComment/PhotoComponent/PhotoComponent";
import CommentComponent from "../components/PhotoDetail/PhotoNComment/CommentComponent/CommentComponent";
import Information from "../components/PhotoDetail/Detail/Information/Information";
import LocationDetail from "../components/PhotoDetail/Detail/Location/LocationDetail";
import CameraSpecification from "../components/PhotoDetail/Detail/CameraSpecification/CameraSpecification";
import Category from "../components/PhotoDetail/Detail/Category/Category";
import Selling from "../components/PhotoDetail/Detail/Selling/Selling";

const PhotoDetailLayout = () => {
  return (
    <div className="grid grid-cols-12 ">
      {/* <PhotoNCommentLayout /> */}
      <div className="col-span-9 bg-gray-300 p-5 pt-10">
        <div className="flex flex-col gap-5">
          <PhotoComponent />
          <CommentComponent />
        </div>
      </div>
      <div className="col-span-3 bg-gray-300 p-5">
        <div className="flex flex-col gap-5">
          <Information />
          <LocationDetail />
          <CameraSpecification />
          <Category />
          <Selling />
        </div>
      </div>
      {/* <DetailLayout /> */}
    </div>
  );
};

export default PhotoDetailLayout;
