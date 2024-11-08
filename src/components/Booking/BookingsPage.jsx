import React from "react";
import BookingPackageCard from "./BookingPackageCard";

const BookingsPage = () => {
  return (
    <div className="min-h-screen p-4 ">
      <div className=" rounded-md p-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <BookingPackageCard />
          <BookingPackageCard />
          <BookingPackageCard />
          <BookingPackageCard />
          <BookingPackageCard />
          <BookingPackageCard />
          <BookingPackageCard />
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
