import React from "react";
import MyPhotoshootPackageDetailInfo from "./MyPhotoshootPackageDetailInfo";
import MyPhotoshootPackageDetailShowcase from "./MyPhotoshootPackageDetailShowcase";
import BookingPackageReviewList from "../../components/Booking/BookingPackageReview";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";

const MyPhotoshootPackageDetail = () => {
  const { photoshootPackageId } = useParams();
  const {
    data: photoshootPackage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["package-detail-by-photographer", photoshootPackageId],
    queryFn: () =>
      PhotoshootPackageApi.photographerFindById(photoshootPackageId),
    keepPreviousData: true,
  });
  // console.log("data", photoshootPackageId, photoshootPackage);

  return (
    <div className="flex flex-col p-4 gap-4">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {photoshootPackage && (
        <>
          <MyPhotoshootPackageDetailInfo
            photoshootPackage={photoshootPackage}
          />
          <MyPhotoshootPackageDetailShowcase
            showcases={photoshootPackage.showcases}
          />
          <BookingPackageReviewList photoshootPackage={photoshootPackage} />
        </>
      )}
    </div>
  );
};

export default MyPhotoshootPackageDetail;
