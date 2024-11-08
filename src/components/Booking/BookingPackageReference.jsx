import React from "react";
import BookingPackageCard from "./BookingPackageCard";

const BookingPackageReference = () => {
  return (
    <div className="flex flex-col bg-[#292b2f] gap-2 p-4 rounded-lg">
      <div>Gói tham khảo</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 ">
        <BookingPackageCard />
        <BookingPackageCard />
        <BookingPackageCard />
        <BookingPackageCard />
      </div>
    </div>
  );
};

export default BookingPackageReference;
