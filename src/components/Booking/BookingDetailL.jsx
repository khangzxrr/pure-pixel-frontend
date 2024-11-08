import React from "react";
import BookingPackageDetail from "./BookingPackageDetail";
import BookingPackageReview from "./BookingPackageReview";
import BookingPackageShowCase from "./BookingPackageShowCase";
import BookingPackageReference from "./BookingPackageReference";

const BookingDetailL = () => {
  return (
    <div className="flex flex-col gap-3 min-h-screen p-5">
      <BookingPackageDetail />
      <BookingPackageReview />
      <BookingPackageShowCase />
      <BookingPackageReference />
    </div>
  );
};

export default BookingDetailL;
