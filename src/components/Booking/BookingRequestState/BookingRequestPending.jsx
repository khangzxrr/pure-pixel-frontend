import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";

import BookingRequestCard from "./BookingRequestCard";

const BookingRequestPending = () => {
  const { isPending, data } = useQuery({
    queryKey: ["findAllRequestingBooking"],
    queryFn: () => PhotographerBookingApi.findAllBooking("REQUESTED"),
  });

  if (isPending) {
    return "loading...";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {data.objects.map((booking) => {
        return (
          <BookingRequestCard
            booking={booking}
            textStateColor={"text-yellow-500"}
            textStateName={"Chờ xác nhận"}
          />
        );
      })}
    </div>
  );
};

export default BookingRequestPending;
