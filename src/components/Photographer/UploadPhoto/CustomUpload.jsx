import {
  LoadingOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload, Tooltip, Switch } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import ScrollingBar from "./ScrollingBar";
import { useNavigate } from "react-router-dom";
import "./UploadPhoto.css";

import PhotoService from "../../../services/PhotoService";
import UserService from "../../../services/Keycloak";

const { Dragger } = Upload;

export default function CustomUpload() {
  const [isWatermarkAll, setIsWatermarkAll] = useState(true);

  const {
    addPhoto,
    setSelectedPhotoByUid,
    photoArray,
    removePhotoByUid,
    updatePhotoPropertyByUid,
    toggleWatermark,
    setPhotoUploadResponse,
    clearState,
  } = useUploadPhotoStore();

  const userData = UserService.getTokenParsed()?.preferred_username;
  const navigate = useNavigate();

  //use keycloak to trigger refresh component when new token comes

  const uploadPhoto = useMutation({
    mutationFn: ({ file, onUploadProgress }) =>
      PhotoApi.uploadPhoto(file, onUploadProgress),
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
        reviewUrl,
        file,
        title: file.name,
        exif,
        watermark: false,
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
      const response = await uploadPhoto.mutateAsync({
        file,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );

          updatePhotoPropertyByUid(file.uid, "percent", percentCompleted);
          if (percentCompleted === 100) {
            updatePhotoPropertyByUid(file.uid, "status", "done");
          }
        },
      });

      setPhotoUploadResponse(file.uid, response);

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
        id: photo.response.id,
        categoryId: photo.categoryId,
        title: photo.title,
        watermark: photo.watermark,
        description: photo.description,
        photoType: photo.photoType,
        visibility: photo.visibility,
        photoTags: photo.photoTags,
        gps: photo.gps,
      };

      // Call the API to update a single photo and add watermark concurrently
      return Promise.all([
        updatePhotos.mutateAsync(photoToUpdate),
        photo.watermark
          ? addWatermark.mutateAsync({
              photoId: photo.response.id,
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
              className={`w-full h-1/2 ${
                photoArray.some((photo) => photo.status === "uploading")
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#56bc8a] hover:bg-[#68c397] cursor-pointer"
              } transition duration-150 flex justify-center items-center`}
              onClick={() => {
                if (!photoArray.some((photo) => photo.status === "uploading")) {
                  SubmitUpload();
                }
              }}
            >
              <div className="h-4 w-full m-2 text-6xl text-white flex justify-center items-center">
                {photoArray.some((photo) => photo.status === "uploading") ? (
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
                  <div className=" m-2 text-6xl">
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
