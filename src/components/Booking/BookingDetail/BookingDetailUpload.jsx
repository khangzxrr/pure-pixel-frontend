import {
  LoadingOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload, Tooltip, Switch } from "antd";
import { useNavigate } from "react-router-dom";

import PhotoService from "../../../services/PhotoService";
import UserService from "../../../services/Keycloak";
import { useNotification } from "../../../Notification/Notification";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import PhotoShootApi from "../../../apis/PhotoShootApi";
import BookingPhotoList from "./BookingPhotoList";

const { Dragger } = Upload;

export default function UploadBookingPhoto({ bookingDetail }) {
  const {
    addPhoto,
    setSelectedPhotoByUid,
    photoArray,
    // removePhotoByUid,
    updatePhotoPropertyByUid,
    toggleWatermark,
    setPhotoUploadResponse,
  } = useBookingPhotoStore();

  const navigate = useNavigate();
  const { notificationApi } = useNotification();
  const enableUpdate = bookingDetail.status === "ACCEPTED";
  console.log("enableUpdate", enableUpdate);

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
        message.error(`Lỗi không xác định, vui lòng thử lại`);
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

    const exif = await PhotoService.getExifData(file);
    const isValidExif = PhotoService.validateExifData(exif);

    if (!isValidExif) {
      message.error("Ảnh bạn chọn không tồn tại exif hợp lệ");

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
            updatePhotoPropertyByUid(file.uid, "status", "done");
            notificationApi(
              "success",
              "Tải ảnh thành công",
              "Ảnh đã được tải lên thành công",
              "",
              0,
              "upload-photo-dragger"
            );
          }
        },
      });

      setPhotoUploadResponse(file.uid, {
        id: response.id,
        reviewUrl: response.signedUrl.url,
      });

      onSuccess();
    } catch (e) {
      console.log(e);
      onError(e);
    }
  };

  const handleChange = async (info) => {
    if (info.file.status === "uploading") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "uploading");
      console.log("updatePhotoPropertyByUid: uploading");

      return;
    }
    if (info.file.status === "done") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "done");
      console.log("updatePhotoPropertyByUid: done");

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

  // const handleToggleWatermark = () => {
  //   setIsWatermarkAll(!isWatermarkAll);
  //   toggleWatermark(!isWatermarkAll);
  // };

  const itemRender = () => {
    return "";
  };

  // const SubmitUpload = async () => {
  //   // Loop over each photo and update them individually
  //   const updatePromises = photoArray.map(async (photo) => {
  //     const photoToUpdate = {
  //       id: photo.response.id,
  //       categoryId: photo.categoryId,
  //       title: photo.title,
  //       watermark: photo.watermark,
  //       description: photo.description,
  //       categoryIds: photo.categoryIds,
  //       visibility: photo.visibility,
  //       photoTags: photo.photoTags,
  //       gps: photo.gps,
  //     };

  //     // Call the API to update a single photo and add watermark concurrently
  //     return Promise.all([
  //       updatePhotos.mutateAsync(photoToUpdate),
  //       photo.watermark
  //         ? addWatermark.mutateAsync({
  //             photoId: photo.response.id,
  //             text: photo.watermarkContent,
  //           })
  //         : Promise.resolve(),
  //     ]);
  //   });

  //   try {
  //     // Wait for all update and watermark operations to complete
  //     await Promise.all(updatePromises);
  //     navigate("/profile/my-photos");
  //     // Clear state after successful updates
  //     clearState();

  //     // Display success message
  //     message.success("Đã lưu các chỉnh sửa!");
  //     // navigate("/my-photo/photo/all");
  //   } catch (error) {
  //     // Handle errors if any of the updates fail
  //     console.error("Error updating photos:", error);
  //     message.error("Có lỗi xảy ra trong quá trình cập nhật!");
  //   }
  // };

  return (
    <div className="w-full h-full grid grid-cols-6">
      <div
        className={`${
          photoArray.length > 0 ? "col-span-1" : "col-span-6 h-full"
        } ${
          !enableUpdate && "hidden"
        } flex items-center justify-center bg-[#36393f] hover:opacity-90`}
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
              <div className="w-full h-full m-6 hover:text-white text-gray-200">
                <div className=" text-6xl">
                  <UploadOutlined />
                </div>
                <p className="mt-1 font-normal">Tải thêm ảnh</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-2xl text-white font-semibold">
                  Nhấp hoặc kéo tệp vào khu vực này để tải lên
                </p>
                <p className="text-white font-extralight">
                  Hỗ trợ tải lên một hoặc nhiều tệp. Nghiêm cấm tải lên dữ liệu
                  công ty hoặc các tệp bị cấm khác.
                </p>
              </div>
            )}
          </div>
        </Dragger>
      </div>
      {photoArray.length > 0 && (
        <div
          className={`${
            enableUpdate ? "col-span-5" : "col-span-6"
          } w-full bg-[#36393f]`}
        >
          <BookingPhotoList enableUpdate={enableUpdate} />
        </div>
      )}
    </div>
  );
}
