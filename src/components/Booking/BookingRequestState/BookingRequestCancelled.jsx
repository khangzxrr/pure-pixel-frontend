import React from "react";
import BookingRequestCard from "./BookingRequestCard";

const BookingRequestCancelled = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <BookingRequestCard
        state={"Đã hủy"}
        colorStateText={"text-red-500"}
        isCanceled={true}
      />
      <BookingRequestCard
        state={"Đã hủy"}
        colorStateText={"text-red-500"}
        isCanceled={true}
      />
      <BookingRequestCard
        state={"Đã hủy"}
        colorStateText={"text-red-500"}
        isCanceled={true}
      />
      <BookingRequestCard
        state={"Đã hủy"}
        colorStateText={"text-red-500"}
        isCanceled={true}
      />
    </div>
  );
};

export default BookingRequestCancelled;
