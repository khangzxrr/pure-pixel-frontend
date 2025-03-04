import React from "react";
import BookingPackageReviewCard from "./BookingPackageReviewCard";

const BookingPackageReviewList = ({ photoshootPackage }) => {
  return (
    <div className="bg-[#292b2f] rounded-lg p-4 flex flex-col gap-2">
      <div>Đánh giá của khách hàng đã sử dụng dịch vụ</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {photoshootPackage.reviews.length > 0 &&
          photoshootPackage.reviews.map((review) => (
            <BookingPackageReviewCard
              review={review}
              photoshootPackage={photoshootPackage}
            />
          ))}
      </div>
    </div>
  );
};

export default BookingPackageReviewList;
