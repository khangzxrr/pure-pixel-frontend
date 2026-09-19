import MyPhotoshootPackageDetailInfo from "./MyPhotoshootPackageDetailInfo";
import MyPhotoshootPackageDetailShowcase from "./MyPhotoshootPackageDetailShowcase";
import BookingPackageReviewList from "../../components/Booking/BookingPackageReview";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import UpdatePhotoshootPackage from "./UpdatePhotoshootPackage";
import useModalStore from "../../states/UseModalStore";
import { ConfigProvider } from "antd";
import type { PhotographerPhotoshootPackage } from "./MyPhotoshootPackageCard";

const MyPhotoshootPackageDetail = () => {
  const {
    isUpdatePhotoshootPackageModal,
    setIsUpdatePhotoshootPackageModal,
    setSelectedUpdatePhotoshootPackage,

    clearDeleteShowcasesList,
  } = useModalStore();

  const { photoshootPackageId } = useParams();
  const {
    data: photoshootPackage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["package-detail-by-photographer", photoshootPackageId],
    queryFn: (): Promise<PhotographerPhotoshootPackage> =>
      PhotoshootPackageApi.photographerFindById(String(photoshootPackageId)),
  });

  return (
    <div className="flex flex-col p-4 gap-4">
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#292b2f",
              headerBg: "#292b2f",
              titleColor: "white",
            },
          },
        }}
      >
        {isUpdatePhotoshootPackageModal && (
          <UpdatePhotoshootPackage
            onClose={() => {
              setIsUpdatePhotoshootPackageModal(false);
              setSelectedUpdatePhotoshootPackage("");
              clearDeleteShowcasesList();
            }}
          />
        )}
      </ConfigProvider>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error?.message}</p>}
      {photoshootPackage && (
        <>
          <MyPhotoshootPackageDetailInfo
            photoshootPackage={photoshootPackage}
            setSelectedUpdatePhotoshootPackage={
              setSelectedUpdatePhotoshootPackage
            }
            setIsUpdatePhotoshootPackageModal={
              setIsUpdatePhotoshootPackageModal
            }
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
