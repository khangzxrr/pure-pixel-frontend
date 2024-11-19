import {
  LoadingOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  message,
  Upload,
  Tooltip,
  Switch,
  Progress,
  ConfigProvider,
} from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import ScrollingBar from "./ScrollingBar";
import { useNavigate } from "react-router-dom";
import "./UploadPhoto.css";
import PhotoService from "../../../services/PhotoService";
import UserService from "../../../services/Keycloak";
import { useNotification } from "../../../Notification/Notification";
import "./UploadPhoto.css";
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
  const { notificationApi } = useNotification();

  //use keycloak to trigger refresh component when new token comes

  const uploadPhoto = useMutation({
    mutationFn: ({ file, onUploadProgress }) =>
      PhotoApi.uploadPhoto(file, onUploadProgress),
  });

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
    onSuccess: () => {
      navigate("/profile/my-photos");
      // Clear state after successful updates
      clearState();

      // Display success message
      notificationApi(
        "success",
        "Đăng tải ảnh thành công",
        "Ảnh của bạn đã được đăng tải thành công"
      );
    },
  });

  const addWatermark = useMutation({
    mutateKey: "add-watermark",
    mutationFn: async (photo) => await PhotoApi.addWatermark(photo),
  });
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
        break;
    }
    console.log("handleException", file.uid);

    removePhotoByUid(file.uid);
  };

  const beforeUpload = async (file) => {
    console.log("beforeUpload", file);

    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    console.log("isJpgOrPng", isJpgOrPng);
    const isLt150M = file.size / 1024 / 1024 < 150;
    console.log("isLt150M", isLt150M);

    const exif = await PhotoService.getExifData(file);

    console.log("exif", exif);

    console.log("true false", isJpgOrPng && isLt150M);

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

    console.log("isLt150M", isLt150M);
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

    console.log("isValidExif", exif);
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

    try {
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);
      console.log("reviewUrl", reviewUrl);

      addPhoto(file.uid, {
        reviewUrl,
        file,
        title: file.name.substring(0, file.name.lastIndexOf(".")),
        exif,
        watermark: false,
        watermarkContent: "PUREPIXEL",
        visibility: "PUBLIC",
        status: "uploading",
      });

      setSelectedPhotoByUid(file.uid);
    } catch (e) {
      console.log("beforeUpload error", e);

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
            (progressEvent.loaded / progressEvent.total) * 90
          );

          updatePhotoPropertyByUid(file.uid, "percent", percentCompleted);
        },
      });

      setPhotoUploadResponse(file.uid, response);
      updatePhotoPropertyByUid(file.uid, "status", "done");
      updatePhotoPropertyByUid(file.uid, "percent", 100);

      onSuccess(response);
    } catch (e) {
      handleException(file, e);
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
        categoryIds: photo.categoryIds,
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

      // navigate("/my-photo/photo/all");
    } catch (error) {
      // Handle errors if any of the updates fail
      console.error("Error updating photos:", error);
      message.error("Có lỗi xảy ra trong quá trình cập nhật!");
    }
  };

  return (
    <div className="h-full w-full overflow-hidden relative ">
      <div className={`w-full h-full grid grid-cols-7`}>
        {/* scrollbar for photo list */}
        <div
          className={`bg-[#36393f] grid grid-rows-8 overflow-x-auto lg:col-span-6 md:col-span-5 sm:col-span-5 xs:col-span-5 col-span-5 ${
            photoArray.some((photo) => photo.status === "done") ? "" : "hidden"
          }`}
        >
          <div
            className={`w-full row-span-1 ${
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
          <div className="row-span-7">
            <ScrollingBar />
          </div>
        </div>

        <div
          className={`tranlation duration-150 ${
            photoArray.some((photo) => photo.status === "done")
              ? "lg:col-span-1 md:col-span-2 sm:col-span-2 col-span-2  grid grid-row-4 "
              : "col-span-7"
          }  bg-[#42454a] `}
          style={{ zIndex: 10 }}
        >
          <div
            className={`w-full row-span-3 ${
              photoArray.some((photo) => photo.status === "done")
                ? ""
                : "hidden"
            } ${
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
            <div className="w-full lg:text-6xl md:text-4xl sm:text-4xl text-4xl text-white flex justify-center items-center">
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
          <div
            className={` ${
              photoArray.some((photo) => photo.status === "done")
                ? "row-span-1"
                : "row-span-7"
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
              {photoArray.some((photo) => photo.status === "done") ? (
                <div className="hover:text-white text-gray-200 text-6xl">
                  <PlusCircleOutlined />
                </div>
              ) : (
                <div className="h-screen bg-[#36393f] hover:bg-gray-600">
                  <div className="h-1/2 w-full flex justify-center items-center">
                    {!photoArray.some(
                      (photo) => photo.status === "uploading"
                    ) ? (
                      <div>
                        <p className="h-1/2 text-2xl text-white font-semibold">
                          Nhấp hoặc kéo tệp vào khu vực này để tải lên
                        </p>
                        <p className="h-1/2 text-white font-extralight">
                          Hỗ trợ tải lên một hoặc nhiều tệp. Nghiêm cấm tải lên
                          dữ liệu công ty hoặc các tệp bị cấm khác.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <ConfigProvider
                          theme={{
                            components: {
                              Progress: {
                                circleIconFontSize: "1.5em", // Customize the icon size if needed
                                circleTextColor: "#f0f0f0", // Change the text color inside the circle
                                circleTextFontSize: "1.2em", // Change the text size inside the circle
                                defaultColor: "#52c41a", // Default color of the progress bar
                                remainingColor: "rgba(255, 255, 255, 0.2)", // Color of the unfilled part
                              },
                            },
                          }}
                        >
                          <Progress
                            type="circle"
                            percent={
                              photoArray.reduce(
                                (acc, photo) => acc + (photo.percent || 0),
                                0
                              ) / photoArray.length
                            }
                            strokeColor="#52c41a" // Main progress bar color
                            className="custom-progress-text"
                          />
                        </ConfigProvider>
                        <div>
                          <p className="text-white text-lg font-normal   mt-3 ">
                            {photoArray[0].percent < 70
                              ? "Đang tải ảnh lên"
                              : "Đang xử lý ảnh"}
                          </p>
                        </div>
                      </div>
                    )}
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
