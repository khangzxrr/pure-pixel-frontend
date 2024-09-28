import { PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload, Tooltip, Switch } from "antd";
import { useEffect, useRef, useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { io } from "socket.io-client";
import UserService from "../../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import ScrollingBar from "./ScrollingBar";
import { useNavigate } from "react-router-dom";
import "./UploadPhoto.css";

import PhotoService from "../../../services/PhotoService";

const { Dragger } = Upload;

export default function CustomUpload() {
  const [isWatermarkAll, setIsWatermarkAll] = useState(true);

  const {
    addPhoto,
    setSelectedPhotoById,

    getPhotoByUid,
    selectedPhoto,

    photoArray,

    removePhotoByUid,
    toggleWatermark,
    clearState,
  } = useUploadPhotoStore();

  const navigate = useNavigate();

  //use keycloak to trigger refresh component when new token comes
  const { keycloak } = useKeycloak();

  const userToken = UserService ? UserService.getTokenParsed() : "";

  //using ref to NOT cause re-render when socketRef is change
  const socketRef = useRef();

  useEffect(() => {
    if (!userToken) {
      return;
    }

    //init connection to socket.io backend
    socketRef.current = io(process.env.REACT_APP_WEBSOCKET_UPLOAD_PHOTO, {
      autoConnect: true,
      extraHeaders: {
        Authorization: `bearer ${UserService.getToken()}`,
      },
    });

    //emit join event to join photo process gateway
    socketRef.current.emit("join");

    socketRef.current.on("finish-process-photos", (data) => {
      console.log(`got data from WS`);
      console.log(data);
      message.success(`Đã xử lý ảnh ${data.id} thành công!`);
    });

    return () => {
      socketRef.current.off("finish-process-photos");
      socketRef.current.disconnect();
    };
  }, [userToken]);

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

  const handleException = (file, e) => {
    switch (e.response.data.message) {
      case "RunOutPhotoQuotaException":
        message.error(
          "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
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
      });
      if (!selectedPhoto) {
        setSelectedPhotoById(presignedData.signedUpload.photoId);
      }
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

      await uploadPhoto.mutateAsync({
        url: photo.signedUpload.uploadUrl,
        file,
      });

      onSuccess({
        ...file,
        status: "done",
      }); // Set status to 'done'
      // Then process the photo
      await processPhoto.mutateAsync(photo.signedUpload);
    } catch (e) {
      onError(e);
    }
  };

  const handleChange = async (info) => {
    console.log(info);
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
    // Extract the necessary fields from photoList and filter by status 'PARSED'
    const photosToUpload = photoArray.map((photo) => ({
      id: photo.signedUpload.photoId,
      categoryId: photo.categoryId,
      title: photo.title,
      watermark: photo.watermark,
      showExif: photo.showExif ? photo.showExif : true,
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
    }));

    console.log("photosToUpload", photosToUpload);

    // Create the payload
    const payload = { photos: photosToUpload };

    // Upload the photos
    await updatePhotos.mutateAsync(payload.photos);

    clearState();

    message.success("saved all uploaded photos!");
    navigate("/my-photo/photo/all");
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="w-full h-full flex flex-row">
        {photoArray.length > 0 && (
          <div className="w-5/6 bg-[#36393f]">
            <div
              className={`w-full ${photoArray.length > 1 ? "visible" : "invisible"}`}
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
              <div className="h-16 w-full flex-shrink-0 m-2 text-6xl text-white flex justify-center items-center">
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
                  <div className="  flex-shrink-0 m-2 text-6xl">
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
