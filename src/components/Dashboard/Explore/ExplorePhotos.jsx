import React from "react";
import { IoIosArrowForward } from "react-icons/io";

const ExplorePhotos = ({
  title,
  description,
  linkText,
  PhotoCardsComponent,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold">{title}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
        <div className="flex items-end">
          <div className="flex items-center gap-1 text-[#2986f7] font-bold hover:cursor-pointer hover:text-[#67a9fa]">
            {linkText} <IoIosArrowForward className="text-xl" />
          </div>
        </div>
      </div>
      <div className="">
        {PhotoCardsComponent ? <PhotoCardsComponent /> : ""}
      </div>
    </div>
  );
};

export default ExplorePhotos;
