import React from "react";
import BookingRequestCard from "./BookingRequestCard";

const BookingRequestInProgress = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <BookingRequestCard
        state={"Đang thực hiện"}
        colorStateText={"text-blue-500"}
      />
      <BookingRequestCard
        state={"Đang thực hiện"}
        colorStateText={"text-blue-500"}
      />
      <BookingRequestCard
        state={"Đang thực hiện"}
        colorStateText={"text-blue-500"}
      />
      <BookingRequestCard
        state={"Đang thực hiện"}
        colorStateText={"text-blue-500"}
      />
    </div>
  );
};

export default BookingRequestInProgress;
