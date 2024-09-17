import React, { useState } from "react";
import PhotoComponent from "../components/PhotoDetail/PhotoNComment/PhotoComponent/PhotoComponent";
import CommentComponent from "../components/PhotoDetail/PhotoNComment/CommentComponent/CommentComponent";
import Information from "../components/PhotoDetail/Detail/Information/Information";
import LocationDetail from "../components/PhotoDetail/Detail/Location/LocationDetail";
import CameraSpecification from "../components/PhotoDetail/Detail/CameraSpecification/CameraSpecification";
import Category from "../components/PhotoDetail/Detail/Category/Category";
import Selling from "../components/PhotoDetail/Detail/Selling/Selling";
import { useParams } from "react-router-dom";
import PhotoApi from "../apis/PhotoApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import UserService from "../services/Keycloak";

const PhotoDetailLayout = () => {
  const { id } = useParams();

  const getPhotoById = useQuery({
    queryKey: ["get-photo-by-id"],
    queryFn: () => PhotoApi.getPhotoById(id),
  });
  const userData = UserService.getTokenParsed();
  // const queryClient = useQueryClient();
  // queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });

  if (getPhotoById.isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  const userId = userData.sub;

  const photographerId = getPhotoById.data.photographerId;

  const titleT = getPhotoById.data.title;
  const description = getPhotoById.data.description;
  const location = getPhotoById.data.location;
  const dateTime = new Date(getPhotoById.data.captureTime);

  return (
    <div className="grid grid-cols-12 ">
      {/* <PhotoNCommentLayout /> */}
      <div className="col-span-9 bg-gray-100 p-5 pt-10">
        <div className="flex flex-col gap-5">
          <PhotoComponent id={id} />
          <CommentComponent />
        </div>
      </div>
      <div className="col-span-3 bg-gray-100 p-5">
        <div className="flex flex-col gap-5">
          <Information />
          <LocationDetail
            title={titleT}
            location={location}
            dateTime={dateTime}
            description={description}
          />
          <CameraSpecification />
          <Category />
          {userId === photographerId ? <Selling /> : null}
          {/* <Selling /> */}
        </div>
      </div>
    </div>
  );
};
export default PhotoDetailLayout;
