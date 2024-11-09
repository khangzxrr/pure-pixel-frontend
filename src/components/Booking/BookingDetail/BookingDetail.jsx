import React from "react";
import BookingDetailInfo from "./BookingDetailInfo";
import BookingDetailUpload from "./BookingDetailUpload";

const BookingDetail = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-8">
      <div className="md:col-span-2">
        <BookingDetailInfo />
      </div>
      <div className="md:col-span-6">
        <BookingDetailUpload />
      </div>
    </div>
  );
};

export default BookingDetail;
