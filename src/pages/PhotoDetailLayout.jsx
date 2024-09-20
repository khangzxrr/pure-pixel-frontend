import React from "react";
import PhotoComponent from "../components/PhotoDetail/PhotoNComment/PhotoComponent/PhotoComponent";
import CommentComponent from "../components/PhotoDetail/PhotoNComment/CommentComponent/CommentComponent";
import Information from "../components/PhotoDetail/Detail/Information/Information";
import LocationDetail from "../components/PhotoDetail/Detail/Location/LocationDetail";
import CameraSpecification from "../components/PhotoDetail/Detail/CameraSpecification/CameraSpecification";
import Category from "../components/PhotoDetail/Detail/Category/Category";
import Selling from "../components/PhotoDetail/Detail/Selling/Selling";
import { useParams } from "react-router-dom";
import PhotoApi from "../apis/PhotoApi";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import UserService from "../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";

const PhotoDetailLayout = () => {
  const { id } = useParams();

  const getPhotoById = useQuery({
    queryKey: ["get-photo-by-id"],
    queryFn: () => PhotoApi.getPhotoById(id),
  });
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const userId = userData?.sub;

  console.log(UserService.hasRole(["photographer"]));

  if (getPhotoById.isFetching) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!getPhotoById.data || getPhotoById.isError) {
    return (
      <div className="text-red-500 text-center">
        Error loading photo details
      </div>
    );
  }

  const photographerId = getPhotoById.data?.photographer?.id;
  const titleT = getPhotoById.data?.title;
  const description = getPhotoById.data?.description;
  const dateTime = new Date(getPhotoById.data?.captureTime);
  const photographerName = getPhotoById.data?.photographer?.name;
  const photographerAvatar = getPhotoById.data?.photographer?.avatar;
  const photoTag = getPhotoById.data?.photoTags;
  const categoryName = getPhotoById.data?.category?.name;
  const location = getPhotoById.data?.location;
  const exifPhoto = getPhotoById.data?.exif;
  const quoteUser = getPhotoById.data?.photographer?.quote;
  const votePhoto = getPhotoById.data?._count?.votes;
  const commentPhoto = getPhotoById.data?._count?.comments;

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-9 bg-gray-100 p-5 pt-10">
        <div className="flex flex-col gap-5">
          <PhotoComponent id={id} />
          <CommentComponent />
        </div>
      </div>
      <div className="col-span-3 bg-gray-100 p-5">
        <div className="flex flex-col gap-5">
          <Information
            name={photographerName}
            avatar={photographerAvatar}
            quote={quoteUser}
          />
          <LocationDetail
            location={location}
            title={titleT}
            dateTime={dateTime}
            description={description}
            vote={votePhoto}
            comment={commentPhoto}
          />
          <CameraSpecification exif={exifPhoto} />
          <Category category={categoryName} tag={photoTag} />
          {userId && userId === photographerId ? <Selling /> : null}
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailLayout;
