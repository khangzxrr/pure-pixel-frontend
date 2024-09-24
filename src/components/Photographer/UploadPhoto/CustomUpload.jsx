import { PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image, message, Upload, Progress, Flex, Tooltip, Switch } from "antd";
import { useEffect, useRef, useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import SinglePhotoUpload from "./SinglePhotoUpload";
import { io } from "socket.io-client";
import UserService from "../../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import PhotoCard from "./PhotoCard";
import ScrollingBar from "./ScrollingBar";
import { useNavigate } from "react-router-dom";
import "./UploadPhoto.css";

const { Dragger } = Upload;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function CustomUpload() {
  const [isWatermarkAll, setIsWatermarkAll] = useState(true);

  const {
    addSingleImage,
    setSelectedPhoto,
    updatePhotoByUid,
    updateFieldByUid,
    removePhotoByUid,
    toggleWatermark,
    photoList,
    isPhotoExistByUid,
    setIsUpdating,
    clearState,
  } = useUploadPhotoStore();
  const navigate = useNavigate();

  //use keycloak to trigger refresh component when new token comes
  const { keycloak } = useKeycloak();

  const userToken = UserService ? UserService.getTokenParsed() : "";
  console.log("userToken", userToken);

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
  }, [userToken]);

  const uploadPhoto = useMutation({
    mutationFn: ({ url, file, options }) =>
      PhotoApi.uploadPhotoUsingPresignedUrl(url, file, options),
  });

  const getPresignedUploadUrls = useMutation({
    mutationFn: (filenames) => PhotoApi.getPresignedUploadUrls({ filenames }),
  });

  const processPhoto = useMutation({
    mutationFn: (signedUploads) => PhotoApi.processPhotos(signedUploads),
  });

  const beforeUpload = async (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");

      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error("Image must smaller than 50MB!");

      return false;
    }

    return true;
  };

  const customRequest = async ({ file, onError, onSuccess, onProgress }) => {
    try {
      const fileNames = [file.name];
      const presignedData = await getPresignedUploadUrls.mutateAsync(fileNames);
      const signedUploadUrl = presignedData.signedUploads[0].uploadUrl;
      const photoId = presignedData.signedUploads[0].photoId;
      const uid = file.uid;
      console.log(file, "customRequest");

      await uploadPhoto.mutateAsync({
        url: signedUploadUrl,
        file,
        uid,
        options: {
          onUploadProgress: (event) => {
            const { loaded, total } = event;
            console.log(event, uid);
            const percent = Math.round((loaded / total) * 100);
            onProgress({ percent });
            updateFieldByUid(uid, "upload_percent", percent);
          },
          headers: {
            "Content-Type": file.type,
          },
        },
      });

      await processPhoto.mutateAsync(presignedData);

      message.info("upload success, start to parse photo metadata...");

      socketRef.current.on("finish-process-photos", (data) => {
        //only call back onSuccess if the data return is equal photoId
        //this prevent all photos in pending state trigger onSuccess when ONLY ONE DATA is received
        if (data[0].id == photoId) {
          onSuccess(data[0]);
        }
      });
    } catch (e) {
      message.error("something wrong! please try again");
      console.log(e);
      onError(e);
    }
  };

  const handleChange = async (info) => {
    console.log("Upload onChange:", info);
    if (!isPhotoExistByUid(info.file.uid) && info.file.status !== "removed") {
      addSingleImage({
        ...info.file,
        title: info.file.name.replace(/\.(png|jpg)$/i, ""),
      });
    } else if (info.file.status === "done") {
      console.log("Upload done:", info, photoList);
      await updatePhotoByUid(info.file.uid, {
        ...info.file.response,
        title: info.file.name.replace(/\.(png|jpg)$/i, ""), // Remove file extension
        watermark: userToken
          ? userToken.preferred_username.split("@")[0]
          : "Pure Pixel",
      });
      setSelectedPhoto({
        ...info.file.response,
        uid: info.file.uid,
        title: info.file.name.replace(/\.(png|jpg)$/i, ""), // Remove file extension
        watermark: userToken
          ? userToken.preferred_username.split("@")[0]
          : "Pure Pixel",
        isWatermark: true,
        currentStep: 1,
      });
    } else if (info.file.status === "uploading") {
      if (!info.file.url && !info.file.preview) {
        info.file.preview = await getBase64(info.file.originFileObj);
      }
      updatePhotoByUid(info.file.uid, {
        upload_url: info.file.url || info.file.preview,
        percent: info.file.percent,
      });
    } else if (info.file.status === "PARSED") {
      console.log("PARSED", info.file);
    }
  };

  const handleToggleWatermark = () => {
    setIsWatermarkAll(!isWatermarkAll);
    toggleWatermark(!isWatermarkAll);
  };

  const itemRender = () => {
    return "";
  };

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });

  const SubmitUpload = async () => {
    setIsUpdating(true);

    // Extract the necessary fields from photoList and filter by status 'PARSED'
    const photosToUpload = photoList
      .filter((photo) => photo.status === "PARSED")
      .map((photo) => ({
        id: photo.id,
        categoryId: photo.categoryId,
        photographerId: photo.photographerId,
        title: photo.title,
        watermark: photo.isWatermark ? photo.isWatermark : true,
        showExif: photo.showExif,
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
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        deletedAt: photo.deletedAt,
        photographer: photo.photographer,
        category: photo.category,
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
        {photoList.length > 0 && (
          <div className="w-5/6 bg-slate-600">
            <div className="w-full">
              {photoList.length > 1 && (
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
              )}
            </div>
            <ScrollingBar />
          </div>
        )}
        <div
          className={` tranlation duration-150 ${
            photoList.length > 0
              ? "w-1/6"
              : "w-full h-full bg-slate-400  hover:bg-slate-300"
          }`}
        >
          {photoList.length > 0 && (
            <div
              className="w-full h-1/2 bg-green-400 hover:bg-green-300 transition duration-150 flex justify-center items-center cursor-pointer"
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
            fileList={photoList}
            style={{
              width: "100%",
              padding: "none",
              border: "0px",
            }}
          >
            <div className=" h-full w-full ">
              {photoList.length > 0 ? (
                <div className="w-full h-full hover:text-white text-gray-200">
                  <div className="  flex-shrink-0 m-2 text-6xl">
                    <PlusCircleOutlined />
                  </div>
                </div>
              ) : (
                <div className="h-screen">
                  <div className="h-full w-full flex justify-center items-center">
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
      {console.log("photoList", photoList)}
    </div>
  );
}
