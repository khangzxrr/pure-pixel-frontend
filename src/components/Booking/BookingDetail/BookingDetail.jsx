import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import BookingDetailInfo from "./BookingDetailInfo";
import BookingDetailUpload from "./BookingDetailUpload";

const BookingDetail = () => {
  const { bookingId } = useParams();

  const { isPending, data } = useQuery({
    queryKey: [`findBookingById_${bookingId}`],
    queryFn: () => PhotographerBookingApi.findById(bookingId),
  });

  if (isPending) {
    return <div>Đang tải thông tin lịch hẹn...</div>;
  }

  const bookingDetail = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-8">
      <div className="md:col-span-2">
        <BookingDetailInfo bookingDetail={bookingDetail} />
      </div>
      <div className="md:col-span-6">
        <BookingDetailUpload bookingDetail={bookingDetail} />
      </div>
    </div>
  );
};

export default BookingDetail;
