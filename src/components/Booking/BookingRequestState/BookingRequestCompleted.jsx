import React from "react";
import BookingRequestCard from "./BookingRequestCard";

const BookingRequestCompleted = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <BookingRequestCard
        state={"Đã hoàn thành"}
        colorStateText={"text-green-500"}
        isCompleted={true}
      />
      <BookingRequestCard
        state={"Đã hoàn thành"}
        colorStateText={"text-green-500"}
        isCompleted={true}
      />
      <BookingRequestCard
        state={"Đã hoàn thành"}
        colorStateText={"text-green-500"}
        isCompleted={true}
      />
      <BookingRequestCard
        state={"Đã hoàn thành"}
        colorStateText={"text-green-500"}
        isCompleted={true}
      />
    </div>
  );
};

export default BookingRequestCompleted;
