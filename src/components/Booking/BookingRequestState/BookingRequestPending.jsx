import React from "react";
import BookingRequestCard from "./BookingRequestCard";

const BookingRequestPending = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <BookingRequestCard
        isPending={true}
        state={"Chờ xác nhận"}
        colorStateText={"text-yellow-500"}
      />
      <BookingRequestCard
        isPending={true}
        state={"Chờ xác nhận"}
        colorStateText={"text-yellow-500"}
      />
      <BookingRequestCard
        isPending={true}
        state={"Chờ xác nhận"}
        colorStateText={"text-yellow-500"}
      />
      <BookingRequestCard
        isPending={true}
        state={"Chờ xác nhận"}
        colorStateText={"text-yellow-500"}
      />
    </div>
  );
};

export default BookingRequestPending;
