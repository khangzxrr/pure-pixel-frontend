import React from "react";

export default function BookingFilter() {
  return (
    <div className="w-full">
      <p className="text-lg font-semibold">My Booking</p>
      <div className="flex justify-start items-center py-2">
        <p className="text-sm mx-3 text-blue-500 underline  ">All</p>
        <p className="text-sm mx-3">Booking</p>
        <p className="text-sm mx-3">Pending</p>
        <p className="text-sm mx-3">Booked</p>
      </div>
    </div>
  );
}
