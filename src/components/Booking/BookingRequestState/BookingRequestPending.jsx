import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";

import BookingRequestCard from "./BookingRequestCard";

const BookingRequestPending = () => {
  const { isPending, data } = useQuery({
    queryKey: ["findAllRequestingBooking"],
    queryFn: PhotographerBookingApi.photographerFindAllBooking,
  });

  if (isPending) {
    return "loading...";
  }

  console.log(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {data.objects.map((booking) => {
        return <BookingRequestCard booking={booking} />;
      })}
    </div>
  );
};

export default BookingRequestPending;
