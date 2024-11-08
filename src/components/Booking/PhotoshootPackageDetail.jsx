import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import React from "react";
import { useParams } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoshootPackageInfo from "./BookingPackageDetail";
import BookingPackageReviewList from "./BookingPackageReview";
import BookingPackageShowCaseList from "./BookingPackageShowCase";

const PhotoshootPackageDetail = () => {
  const { photoshootPackageId } = useParams();

  const { isPending, data } = useQuery({
    queryKey: [`getPhotoshootPackageDetailById_${photoshootPackageId}`],
    queryFn: () => PhotoshootPackageApi.findById(photoshootPackageId),
  });

  const photoshootPackage = data;

  if (isPending) {
    return <Skeleton />;
  }

  return (
    <div className="flex flex-col gap-3 min-h-screen p-5">
      <PhotoshootPackageInfo photoshootPackage={photoshootPackage} />
      <BookingPackageReviewList photoshootPackage={photoshootPackage} />
      <BookingPackageShowCaseList photoshootPackage={photoshootPackage} />
    </div>
  );
};

export default PhotoshootPackageDetail;
