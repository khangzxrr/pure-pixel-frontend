import {
  LoadingOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload, Tooltip, Switch } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
// import ScrollingBar from "./ScrollingBar";

import { useNavigate } from "react-router-dom";
// import "./UploadPhoto.css";
import PhotoService from "../../../services/PhotoService";

import { useNotification } from "../../../Notification/Notification";
import useSellPhotoStore from "../../../states/UseSellPhotoState";
import PhotoSellList from "./PhotoSellList";
import PhotoExchange from "../../../apis/PhotoExchange";
const { Dragger } = Upload;

export default function UploadPhotoSell() {
  const {
    addPhoto,
    setSelectedPhotoByUid,
    photoArray,
    updatePhotoPropertyByUid,
    setPhotoUploadResponse,
    disableUpload,
    setDisableUpload,
  } = useSellPhotoStore();

  const navigate = useNavigate();
  const { notificationApi } = useNotification();

  //use keycloak to trigger refresh component when new token comes

  const uploadPhoto = useMutation({
    mutationFn: ({ file, onUploadProgress }) =>
      PhotoApi.uploadPhoto(file, onUploadProgress),
  });

  const getAvailableResolutionsByPhotoId = useMutation({
    mutationFn: async (photoId) =>
      await PhotoApi.getAvailableResolutionsByPhotoId(photoId),
  });

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });
  const sellPhoto = useMutation({
    mutationFn: async (photos) =>
      await PhotoExchange.sellPhotoByPhotoId(photos),
  });

  //handle exception from api response
  const handleException = (file, e) => {
    switch (e && e.response.data.message) {
      case "RunOutPhotoQuotaException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "outQuota");

        break;

      case "FailToPerformOnDuplicatedPhotoException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Ảnh bạn tải lên đã tồn tại trong hệ thống, vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "duplicated");

        break;

      case "FileIsNotValidException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Tệp tải lên không hợp lệ, vui lòng chọn tệp hình ảnh hợp lệ",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "invalid");

        break;

      case "ExifNotFoundException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Không tìm thấy dữ liệu EXIF trong ảnh, vui lòng chọn ảnh có dữ liệu EXIF",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "invalid");

        break;

      case "MissingMakeExifException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Dữ liệu EXIF thiếu thông tin nhà sản xuất (Make), vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "invalid");

        break;

      case "MissingModelExifException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Dữ liệu EXIF thiếu thông tin mẫu máy (Model), vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "invalid");

        break;

      case "UploadPhotoFailedException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Đã xảy ra lỗi khi tải ảnh lên, vui lòng thử lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "failed");

        break;

      default:
        notificationApi(
          "error",
          "Lỗi không xác định",
          "Đã xảy ra lỗi không xác định, vui lòng thử lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(file.uid, "status", "failed");

        break;
    }
    console.log("handleException", file.uid);
  };

  const beforeUpload = async (file) => {
    console.log("beforeUpload", file);

    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    const isLt150M = file.size / 1024 / 1024 < 150;

    const exif = await PhotoService.getExifData(file);

    if (!isJpgOrPng) {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Chỉ hỗ trợ đuôi ảnh jpeg, jpg",
        "",
        0,
        "upload-photo-dragger-error"
      );

      return false;
    }

    if (!isLt150M) {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh phải nhỏ hơn 150MB",
        "",
        0,
        "upload-photo-dragger-error"
      );

      return false;
    }

    if (exif === undefined) {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh bạn chọn không phải ảnh gốc hợp lệ",
        "",
        0,
        "upload-photo-dragger-error"
      );
      return false;
    }
    if (!exif.Model) {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh bạn chọn thiếu thông tin loại máy chụp (Model)",
        "",
        0,
        "upload-photo-dragger-error"
      );
      return false;
    }

    if (!exif.Make) {
      notificationApi(
        "error",
        "Tải ảnh lên thất bại",
        "Ảnh bạn chọn thiếu thông tin nhà sản xuất (Make)",
        "",
        0,
        "upload-photo-dragger-error"
      );
      return false;
    }
    try {
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);

      addPhoto(file.uid, {
        reviewUrl,
        file,
        title: file.name.substring(0, file.name.lastIndexOf(".")),
        exif,
        status: "uploading",
      });
    } catch (e) {
      console.log("beforeUpload error", e);

      handleException(file, e);
      return false;
    }

    return true;
  };

  const customRequest = async ({ file, onError, onSuccess }) => {
    console.log("customRequest", file);
    try {
      const response = await uploadPhoto.mutateAsync({
        file,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 90
          );

          updatePhotoPropertyByUid(file.uid, "percent", percentCompleted);
        },
      });

      setPhotoUploadResponse(file.uid, response);
      updatePhotoPropertyByUid(file.uid, "status", "done");
      updatePhotoPropertyByUid(file.uid, "percent", 100);
      try {
        const photoResolution =
          await getAvailableResolutionsByPhotoId.mutateAsync(response.id);
        console.log("photoResolution", photoResolution);
        updatePhotoPropertyByUid(file.uid, "pricetags", photoResolution);
        setSelectedPhotoByUid(file.uid);
        onSuccess(response);
      } catch (error) {
        onError(e);
      }
    } catch (e) {
      handleException(file, e);
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

  const SubmitUpload = () => {
    setDisableUpload(true);
  };
  return (
    <div className="h-full w-full overflow-hidden relative ">
      <div className={`w-full h-full grid grid-cols-7`}>
        {/* scrollbar for photo list */}
        <div
          className={`bg-[#36393f] grid grid-rows-8 overflow-x-auto lg:col-span-6 md:col-span-5 sm:col-span-5 xs:col-span-5 col-span-5 ${
            photoArray.length > 0 ? "" : "hidden"
          }`}
        >
          <div className="row-span-8">
            <PhotoSellList />
          </div>
        </div>

        <div
          className={`tranlation duration-150 ${
            photoArray.length > 0
              ? "lg:col-span-1 md:col-span-2 sm:col-span-2 col-span-2  grid grid-row-4 "
              : "col-span-7"
          }  bg-[#42454a] `}
          style={{ zIndex: 10 }}
        >
          <div
            className={`w-full row-span-3 ${
              photoArray.length > 0 ? "" : "hidden"
            } ${
              photoArray.some((photo) => photo.status === "uploading") ||
              disableUpload
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#56bc8a] hover:bg-[#68c397] cursor-pointer"
            } transition duration-150 flex justify-center items-center`}
            onClick={() => {
              if (
                !photoArray.some((photo) => photo.status === "uploading") ||
                disableUpload
              ) {
                SubmitUpload();
              }
            }}
          >
            <div className="w-full lg:text-6xl md:text-4xl sm:text-4xl text-4xl text-white flex justify-center items-center">
              {photoArray.some((photo) => photo.status === "uploading") ||
              disableUpload ? (
                <LoadingOutlined
                  style={{
                    fontSize: 48,
                  }}
                  spin
                />
              ) : (
                <UploadOutlined />
              )}
            </div>
          </div>
          <div
            className={` ${
              photoArray.length > 0 ? "row-span-1" : "row-span-7"
            }`}
          >
            <Dragger
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              multiple={true}
              beforeUpload={beforeUpload}
              showUploadList={false}
              onChange={handleChange}
              customRequest={customRequest}
              itemRender={itemRender}
              fileList={photoArray}
              accept=".jpg,.jpeg,.png"
              style={{
                width: "100%",
                padding: "none",
                border: "0px",
              }}
            >
              {photoArray.length > 0 ? (
                <div className="hover:text-white text-gray-200 text-6xl">
                  <PlusCircleOutlined />
                </div>
              ) : (
                <div className="h-screen bg-[#36393f] hover:bg-gray-600">
                  <div className="h-1/2 w-full flex justify-center items-center">
                    <div>
                      <p className="h-1/2 text-2xl text-white font-semibold">
                        Nhấp hoặc kéo tệp vào khu vực này để tải lên
                      </p>
                      <p className="h-1/2 text-white font-extralight">
                        Hỗ trợ tải lên một hoặc nhiều tệp. Nghiêm cấm tải lên dữ
                        liệu công ty hoặc các tệp bị cấm khác.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Dragger>
          </div>
        </div>
      </div>
    </div>
  );
}
