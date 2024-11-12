import React from "react";
import BookingRequestCard from "./BookingRequestCard";

import { useQuery } from "@tanstack/react-query";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";

const BookingRequestInProgress = () => {
  const { isPending, data, error } = useQuery({
    queryKey: ["findAllAcceptedBooking"],
    queryFn: () => PhotographerBookingApi.findAllBooking("ACCEPTED"),
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
            textStateColor={"text-blue-500"}
            textStateName={"Đang thực hiện"}
          />
        );
      })}
    </div>
  );
};

export default BookingRequestInProgress;
