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

  //use keycloak to trigger refresh component when new token comes

  const uploadBookingPhoto = useMutation({
    mutationFn: ({ bookingId, file, onUploadProgress }) =>
      PhotoShootApi.uploadBookingPhoto(bookingId, file, onUploadProgress),
  });

  const handleException = (file, e) => {
    switch (e.response.data.message) {
      case "RunOutPhotoQuotaException":
        message.error(
          "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
        );
        break;

      default:
        // message.error(`Lỗi không xác định, vui lòng thử lại`);
        console.log(e);
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
            (progressEvent.loaded / progressEvent.total) * 100,
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
              "upload-photo-dragger",
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
            "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
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
