import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload } from "antd";

import PhotoService from "../../../services/PhotoService";

import { useNotification } from "../../../Notification/Notification";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import PhotoShootApi from "../../../apis/PhotoShootApi";
import BookingPhotoList from "./BookingPhotoList";
import UploadBookingPhotoCard from "./UploadBookingPhotoCard";
import { useEffect, useRef } from "react";

const { Dragger } = Upload;

export default function UploadBookingPhoto({ bookingDetail }) {
  const {
    addPhoto,
    setSelectedPhotoByUid,
    photoArray,
    selectedPhoto,
    // removePhotoByUid,
    updatePhotoPropertyByUid,
    toggleWatermark,
    setPhotoUploadResponse,
  } = useBookingPhotoStore();

  const { notificationApi } = useNotification();
  const enableUpdate = bookingDetail.status === "ACCEPTED";

  const daysAgo30 = new Date(new Date().setDate(new Date().getDate() - 30));
  const isAbleDelete =
    bookingDetail.status === "ACCEPTED" ||
    (bookingDetail.status === "SUCCESSED" &&
      new Date(bookingDetail.updatedAt) < daysAgo30);

  const selectedPhotoRef = useRef({});

  //use keycloak to trigger refresh component when new token comes

  const uploadBookingPhoto = useMutation({
    mutationFn: ({ bookingId, file, onUploadProgress }) =>
      PhotoShootApi.uploadBookingPhoto(bookingId, file, onUploadProgress),
  });

  const handleException = (file, e) => {
    switch (e.response.data.message) {
      case "RunOutPhotoQuotaException":
        message.error(
          "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ"
        );
        break;

      default:
        // message.error(`Lỗi không xác định, vui lòng thử lại`);

        break;
    }
    // removePhotoByUid(file.uid);
  };

  const beforeUpload = async (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ hỗ trợ đuôi ảnh jpeg, jpg");

      return false;
    }

    const isLt150M = file.size / 1024 / 1024 < 150;
    if (!isLt150M) {
      message.error("Ảnh phải nhỏ hơn 150");

      return false;
    }

    try {
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);

      addPhoto(file.uid, {
        uid: file.uid,
        reviewUrl,
        visibility: "PRIVATE",
        status: "uploading",
      });

      setSelectedPhotoByUid(file.uid);
    } catch (e) {
      handleException(file, e);
      return false;
    }

    return true;
  };

  const customRequest = async ({ file, onError, onSuccess }) => {
    const bookingId = bookingDetail.id;
    try {
      const response = await uploadBookingPhoto.mutateAsync({
        bookingId,
        file,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );

          updatePhotoPropertyByUid(file.uid, "percent", percentCompleted);
          if (percentCompleted === 100) {
          }
        },
      });

      updatePhotoPropertyByUid(file.uid, "status", "done");

      setPhotoUploadResponse(file.uid, {
        id: response.id,
        reviewUrl: response.signedUrl.url,
        thumbnailUrl: response.signedUrl.thumbnail,
      });
      onSuccess();
    } catch (e) {
      onError(e);
    }
  };

  const handleChange = async (info) => {
    if (info.file.status === "uploading") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "uploading");

      return;
    }
    if (info.file.status === "done") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "done");

      return;
    }
    //skip removed this status
    if (info.file.status === "removed") {
      return;
    }

    if (info.file.status === "error") {
      switch (info.file.error.response.data.message) {
        case "RunOutPhotoQuotaException":
          message.error(
            "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ"
          );
          break;

        default:
          message.error(`Lỗi không xác định, vui lòng thử lại`);
          break;
      }
      // removePhotoByUid(info.file.uid);

      return;
    }
  };

  const itemRender = () => {
    return "";
  };
  // Scroll to the selected photo whenever it changes
  useEffect(() => {
    if (selectedPhoto) {
      const selectedPhotoElement = document.getElementById(selectedPhoto);
      if (selectedPhotoElement) {
        selectedPhotoElement.scrollIntoView({
          behavior: "smooth", // Smooth scrolling
          block: "center", // Center the selected photo
        });
      }
    }
  }, [selectedPhoto]); // Run effect when selected photo changes

  return (
    <div
      className={`w-full bg-[#36393f] h-full flex flex-wrap ${
        !photoArray.length > 0 && "justify-center"
      } overflow-y-scroll custom-scrollbar`}
    >
      <div
        className={`${
          photoArray.length > 0
            ? "w-1/4 lg:w-1/5"
            : " h-full flex justify-center item-center"
        } ${!enableUpdate && "hidden"}  p-2 hover:opacity-90`}
      >
        <Dragger
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          multiple={true}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={customRequest}
          itemRender={itemRender}
          fileList={photoArray}
          showUploadList={false}
          accept=".jpg,.jpeg,.png"
          style={{
            width: "100%",
            padding: "none",
            margin: "none",
            border: "0px",
            backgroundColor: "#696c73",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            {photoArray.length > 0 ? (
              <div className="w-full h-full m-4 hover:text-white text-gray-200">
                <div className=" text-6xl">
                  <UploadOutlined />
                </div>
                <p className="mt-1 font-normal">Tải thêm ảnh</p>
              </div>
            ) : (
              <div className="flex flex-col m-20 my-56 items-center justify-center h-full w-full">
                <p className="text-3xl text-white font-semibold">
                  Nhấp hoặc kéo tệp vào khu vực này để tải lên
                </p>
                <p className="text-lg text-white font-extralight">
                  Hỗ trợ tải lên một hoặc nhiều tệp. Nghiêm cấm tải lên dữ liệu
                  công ty hoặc các tệp bị cấm khác.
                </p>
              </div>
            )}
          </div>
        </Dragger>
      </div>

      {photoArray.length > 0 &&
        [...photoArray] // Create a shallow copy to avoid mutating the original array
          .reverse() // Reverse the copied array
          .map((photo, index) => (
            <div
              key={index}
              id={photo.uid} // Add unique ID
              className="w-1/4 lg:w-1/5"
              ref={photo.uid === selectedPhoto ? selectedPhotoRef : null} // Set ref conditionally for selected photo
            >
              <UploadBookingPhotoCard
                photo={photo}
                index={index}
                enableUpdate={enableUpdate}
                isAbleDelete={isAbleDelete}
              />
            </div>
          ))}
    </div>
  );
}
