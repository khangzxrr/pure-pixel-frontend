import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PhotoShootApi from "../../apis/PhotoShootApi";
import BookingModal from "./component/BookingModal";

export default function BookingDetail() {
  const { packageId } = useParams();

  const {
    data: photoPackage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["package-by-id"],
    queryFn: () => PhotoShootApi.getPhotoShootPackageById(packageId),
  });

  return (
    <div className="flex flex-col h-screen w-full text-white p-6 md:p-8 rounded-lg space-y-6 md:space-y-0 md:space-x-8">
      {/* Image Section */}
      <div className="flex flex-row w-full h-[60vh]">
        <div className="w-2/3 flex justify-center p-3">
          <img
            src={photoPackage?.thumbnail}
            alt="Photography Package"
            className="w-full h-full rounded-lg"
          />
        </div>

        {/* Details Section */}
        <div className="w-1/3 p-3 flex">
          <div className="bg-[#292b2f] h-full p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">{photoPackage?.title}</h2>
              <p className="text-2xl text-green-400 font-semibold mb-4">
                {photoPackage?.price}
              </p>
              <p className="mb-2">
                <span className="font-bold">12 lượt</span>
              </p>
              <div>{photoPackage?.description}</div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Dịch vụ</h3>
                <p>Trang điểm và làm tóc tại Studio</p>
              </div>
            </div>
            <BookingModal photoPackage={photoPackage} />
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="flex flex-col w-full items-start space-y-4">
        <h3 className="font-semibold mb-2">Đánh giá</h3>
        <div className="flex space-x-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-gray-800 p-4 rounded-lg"
            >
              <p className="text-yellow-400 text-2xl">★★★★★</p>
              <p>Đẹp</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
