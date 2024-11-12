import React from "react";
import BookingRequestCard from "./BookingRequestCard";

import { useQuery } from "@tanstack/react-query";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";

const BookingRequestCancelled = () => {
  const { isPending, data } = useQuery({
    queryKey: ["findAllAcceptedBooking"],
    queryFn: () => PhotographerBookingApi.findAllBooking("DENIED"),
  });

  if (isPending) {
    return <div>loading..</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {data.objects.map((booking) => {
        return (
          <BookingRequestCard
            booking={booking}
            textStateColor={"text-red-500"}
            textStateName={"Đã hủy"}
          />
        );
      })}
    </div>
  );
};

export default BookingRequestCancelled;
