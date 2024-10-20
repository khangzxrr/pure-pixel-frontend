import { PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload, Tooltip, Switch } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { useKeycloak } from "@react-keycloak/web";
import ScrollingBar from "./ScrollingBar";
import { useNavigate } from "react-router-dom";
import "./UploadPhoto.css";

import PhotoService from "../../../services/PhotoService";
import { useNotification } from "../../../Notification/Notification";
import UserService from "../../../services/Keycloak";

const { Dragger } = Upload;

export default function CustomUpload() {
  const [isWatermarkAll, setIsWatermarkAll] = useState(true);

  const {
    addPhoto,
    setSelectedPhotoByUid,
    getPhotoByUid,
    photoArray,
    removePhotoByUid,
    updatePhotoPropertyByUid,
    toggleWatermark,
    clearState,
  } = useUploadPhotoStore();

  const userData = UserService.getTokenParsed()?.preferred_username;
  // notificationApi(
  //   "success",
  //   "Thành công",
  //   <span className="text-blue-500">
  //     Đã tải ảnh lên thành công, ảnh đang được xử lý
  //   </span>
  // );
  const navigate = useNavigate();

  //use keycloak to trigger refresh component when new token comes

  const uploadPhoto = useMutation({
    mutationFn: ({ url, file, options }) =>
      PhotoApi.uploadPhotoUsingPresignedUrl(url, file, options),
  });

  const getPresignedUploadUrls = useMutation({
    mutationFn: (filename) => PhotoApi.getPresignedUploadUrls({ filename }),
  });

  const processPhoto = useMutation({
    mutationFn: (signedUploads) => PhotoApi.processPhoto(signedUploads),
  });

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });

  const addWatermark = useMutation({
    mutateKey: "add-watermark",
    mutationFn: async (photo) => await PhotoApi.addWatermark(photo),
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
    removePhotoByUid(file.uid);
  };

  const beforeUpload = async (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");

      return false;
    }

    const isLt150M = file.size / 1024 / 1024 < 150;
    if (!isLt150M) {
      message.error("Image must smaller than 150MB!");

      return false;
    }

    const exif = await PhotoService.getExifData(file);
    const isValidExif = PhotoService.validateExifData(exif);

    if (!isValidExif) {
      message.error("Ảnh bạn chọn không tồn tại exif hợp lệ");

      return false;
    }

    try {
      const presignedData = await getPresignedUploadUrls.mutateAsync(file.name);

      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);
      //set global state by
      //key = photoId
      //value { presignedData }
      addPhoto(file.uid, presignedData.signedUpload.photoId, {
        signedUpload: presignedData.signedUpload,
        reviewUrl,
        file,
        title: file.name,
        exif,
        watermark: true,
        watermarkContent: `${userData}`,
        visibility: "PUBLIC",
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
    try {
      const photo = getPhotoByUid(file.uid);
      console.log(photo);

      // Upload the photo
      await uploadPhoto.mutateAsync({
        url: photo.signedUpload.uploadUrl,
        file,
        options: {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 70) / progressEvent.total
            );
            updatePhotoPropertyByUid(file.uid, "percent", percentCompleted);
            console.log(progressEvent, percentCompleted);
          },
        },
      });

      // Process the photo after upload
      await processPhoto.mutateAsync(photo.signedUpload);
    } catch (e) {
      onError(e);
    }
  };

  const handleChange = async (info) => {
    console.log(info);

    if (info.file.status === "uploading") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "uploading");
      console.log("updatePhotoPropertyByUid: uploading");

      return;
    }
    if (info.file.status === "processing") {
      // updatePhotoPropertyByUid(info.file.uid, "status", "processing");
      console.log("updatePhotoPropertyByUid: processing");

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
      removePhotoByUid(info.file.uid);

      return;
    }
  };

  const handleToggleWatermark = () => {
    setIsWatermarkAll(!isWatermarkAll);
    toggleWatermark(!isWatermarkAll);
  };

  const itemRender = () => {
    return "";
  };

  const SubmitUpload = async () => {
    // Loop over each photo and update them individually
    const updatePromises = photoArray.map(async (photo) => {
      const photoToUpdate = {
        id: photo.signedUpload.photoId,
        categoryId: photo.categoryId,
        title: photo.title,
        watermark: photo.watermark,
        showExif: photo.showExif ?? true,
        exif: photo.exif,
        colorGrading: photo.colorGrading,
        location: photo.location,
        captureTime: photo.captureTime,
        description: photo.description,
        originalPhotoUrl: photo.originalPhotoUrl,
        watermarkPhotoUrl: photo.watermarkPhotoUrl,
        thumbnailPhotoUrl: photo.thumbnailPhotoUrl,
        watermarkThumbnailPhotoUrl: photo.watermarkThumbnailPhotoUrl,
        photoType: photo.photoType,
        visibility: photo.visibility,
        status: photo.status,
        photoTags: photo.photoTags,
      };
      console.log(photoToUpdate);

      // Call the API to update a single photo and add watermark concurrently
      return Promise.all([
        updatePhotos.mutateAsync(photoToUpdate),
        photo.watermark
          ? addWatermark.mutateAsync({
              photoId: photo.signedUpload.photoId,
              text: photo.watermarkContent,
            })
          : Promise.resolve(),
      ]);
    });

    try {
      // Wait for all update and watermark operations to complete
      await Promise.all(updatePromises);
      navigate("/profile/my-photos");
      // Clear state after successful updates
      clearState();

      // Display success message
      message.success("Đã lưu các chỉnh sửa!");
      // navigate("/my-photo/photo/all");
    } catch (error) {
      // Handle errors if any of the updates fail
      console.error("Error updating photos:", error);
      message.error("Có lỗi xảy ra trong quá trình cập nhật!");
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="w-full h-full flex flex-row">
        {photoArray.length > 0 && (
          <div className="w-5/6 bg-[#36393f]">
            <div
              className={`w-full ${
                photoArray.length > 1 ? "visible" : "invisible"
              }`}
            >
              <Tooltip placement="rightTop" color="geekblue">
                <div className="flex items-center pl-3">
                  <Switch
                    defaultChecked
                    size="small"
                    onChange={handleToggleWatermark}
                  />
                  {isWatermarkAll ? (
                    <p className="ml-2 text-slate-300 font-semibold">
                      Gỡ nhãn toàn bộ ảnh
                    </p>
                  ) : (
                    <p className="ml-2 text-slate-300 font-semibold">
                      Gắn nhãn toàn bộ ảnh
                    </p>
                  )}
                </div>
              </Tooltip>
            </div>
            <ScrollingBar />
          </div>
        )}
        <div
          className={` tranlation duration-150 ${
            photoArray.length > 0
              ? "w-1/6 bg-[#42454a] "
              : "w-full h-full bg-[#42454a]  hover:bg-slate-300"
          }`}
        >
          {photoArray.length > 0 && (
            <div
              className="w-full h-1/2 bg-[#56bc8a] hover:bg-[#68c397] transition duration-150 flex justify-center items-center cursor-pointer"
              onClick={SubmitUpload}
            >
              <div className="h-4 w-full m-2 text-6xl text-white flex justify-center items-center">
                <UploadOutlined />
              </div>
            </div>
          )}
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
            accept=".jpg,.jpeg,.png"
            style={{
              width: "100%",
              padding: "none",
              border: "0px",
            }}
          >
            <div className=" h-full w-full ">
              {photoArray.length > 0 ? (
                <div className="w-full h-full hover:text-white text-gray-200">
                  <div className="   m-2 text-6xl">
                    <PlusCircleOutlined />
                  </div>
                </div>
              ) : (
                <div className="h-screen">
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
            </div>
          </Dragger>
        </div>
      </div>
    </div>
  );
}
