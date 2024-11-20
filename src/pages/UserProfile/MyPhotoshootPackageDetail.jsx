import React from "react";
import MyPhotoshootPackageDetailInfo from "./MyPhotoshootPackageDetailInfo";
import MyPhotoshootPackageDetailShowcase from "./MyPhotoshootPackageDetailShowcase";
import BookingPackageReviewList from "../../components/Booking/BookingPackageReview";

const MyPhotoshootPackageDetail = () => {
  return (
    <div className="flex flex-col p-4 gap-4">
      <MyPhotoshootPackageDetailInfo />
      <MyPhotoshootPackageDetailShowcase />
      <BookingPackageReviewList />
    </div>
  );
};

export default MyPhotoshootPackageDetail;
