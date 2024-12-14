import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useId, useState } from "react";
import { useParams } from "react-router-dom";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import BookingDetailInfo from "./BookingDetailInfo";
import BookingDetailUpload from "./BookingDetailUpload";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const BookingDetail = () => {
  const { bookingId } = useParams();

  const {
    setSelectedPhotoByUid,
    photoArray,
    addPhotoWithId,
    selectedPhoto,
    getPhotoByUid,
    clearState,
    setPreviousSelectedPhoto,
    setNextSelectedPhoto,
  } = useBookingPhotoStore();

  const { isPending, data: bookingDetail } = useQuery({
    queryKey: ["photographer-booking-detail", bookingId],
    queryFn: () => PhotographerBookingApi.findById(bookingId),
  });

  useEffect(() => {
    clearState();
    if (bookingDetail?.photos && Array.isArray(bookingDetail.photos)) {
      for (let photo of bookingDetail.photos) {
        addPhotoWithId(photo.id, {
          id: photo.id,
          uid: photo.id,
          reviewUrl: photo.signedUrl.url,
          thumbnailUrl: photo.signedUrl.thumbnail,
          visibility: photo.visibility,
          status: "done",
        });
        setSelectedPhotoByUid(photo.id);
      }
    }
  }, [bookingDetail, bookingId]);

  if (isPending) {
    return <div>Đang tải thông tin lịch hẹn...</div>;
  }
  const selectedPhotoData = getPhotoByUid(selectedPhoto);

  return (
    <div className="grid grid-cols-1 md:grid-cols-8 overflow-hidden">
      <div className="md:col-span-3 flex h-[95vh] overflow-y-scroll custom-scrollbar">
        <BookingDetailInfo bookingDetail={bookingDetail} />
      </div>
      <div className="md:col-span-5 flex flex-col h-screen ">
        <div
          className={`${
            photoArray.length === 0 && "hidden"
          }  bg-[#292b2f] p-7 relative flex  justify-center items-center overflow-hidden h-3/5`}
        >
          {photoArray.length > 1 && (
            <>
              <div
                className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                onClick={() => setPreviousSelectedPhoto()}
              >
                <ArrowLeftOutlined />
              </div>
              <div
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                onClick={() => setNextSelectedPhoto()}
              >
                <ArrowRightOutlined />
              </div>
            </>
          )}
          <img
            src={selectedPhotoData?.reviewUrl}
            className="w-11/12 shadow-gray-600 shadow-xl drop-shadow-none z-0"
            alt="Selected Photo"
          />
        </div>
        <div className={`${photoArray.length === 0 ? "h-full" : "h-2/5 "} `}>
          <BookingDetailUpload bookingDetail={bookingDetail} />
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
