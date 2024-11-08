import React from "react";
import BookingPackageShowCaseCard from "./BookingPackageShowCaseCard";

const BookingPackageShowCase = () => {
  return (
    <div className="flex flex-col bg-[#292b2f] p-4 gap-2 rounded-lg">
      <div className="">Bộ sưu tập</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        <BookingPackageShowCaseCard />
        <BookingPackageShowCaseCard />
        <BookingPackageShowCaseCard />
        <BookingPackageShowCaseCard />
      </div>
    </div>
  );
};

export default BookingPackageShowCase;
