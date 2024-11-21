import { Star } from "lucide-react";
import React from "react";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { Rate } from "antd";

const BookingPackageReviewCard = ({ review, photoshootPackage }) => {
  console.log("review", review);

  return (
    <div className="w-full flex flex-col bg-[#36393f] rounded-lg gap-2 p-2">
      <div className="flex gap-1 items-center pt-2">
        <Rate disabled value={review.star} />
      </div>
      <div className="flex flex-col">
        <div>{photoshootPackage.title}</div>
        <div className="text-[12px] font-normal">{review.description}</div>
      </div>
      <div className="flex gap-1 items-center">
        <div className="size-6 overflow-hidden rounded-full">
          <img
            src={review.user.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col ">
          <div className="text-[14px] font-normal">{review.user.name}</div>
          <div className="text-[12px] text-gray-400 font-normal">
            {calculateDateDifference(review.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPackageReviewCard;
