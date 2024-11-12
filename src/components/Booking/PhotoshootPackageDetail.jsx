import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import React from "react";
import { useParams } from "react-router-dom";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoshootPackageInfo from "./BookingPackageDetail";
import BookingPackageReviewList from "./BookingPackageReview";
import BookingPackageShowCaseList from "./BookingPackageShowCase";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";

const PhotoshootPackageDetail = () => {
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const { photoshootPackageId } = useParams();
  const handleLogin = () => keycloak.login();
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
      <PhotoshootPackageInfo
        photoshootPackage={photoshootPackage}
        userData={userData}
        onLogin={handleLogin}
      />
      <BookingPackageReviewList photoshootPackage={photoshootPackage} />
      <BookingPackageShowCaseList photoshootPackage={photoshootPackage} />
    </div>
  );
};

export default PhotoshootPackageDetail;
