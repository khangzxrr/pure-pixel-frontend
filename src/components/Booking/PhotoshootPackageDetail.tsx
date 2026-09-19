import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
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
  // the route always provides the id
  const { photoshootPackageId = "" } = useParams();
  const handleLogin = () => keycloak.login();
  const { isPending, data } = useQuery({
    queryKey: [`getPhotoshootPackageDetailById_${photoshootPackageId}`],
    queryFn: () => PhotoshootPackageApi.findById(photoshootPackageId),
  });

  const photoshootPackage = data;

  // a failed request left no package to render (reading it threw)
  if (isPending || !photoshootPackage) {
    return <Skeleton />;
  }

  return (
    <div className="flex flex-col gap-3 min-h-screen p-5">
      <PhotoshootPackageInfo
        photoshootPackage={photoshootPackage}
        userData={userData}
        onLogin={handleLogin}
      />
      <BookingPackageShowCaseList photoshootPackage={photoshootPackage} />
      <BookingPackageReviewList photoshootPackage={photoshootPackage} />
    </div>
  );
};

export default PhotoshootPackageDetail;
