import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image, message, Upload, Progress } from "antd";
import { useEffect, useRef, useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import SinglePhotoUpload from "./SinglePhotoUpload";
import { io } from "socket.io-client";
import UserService from "../../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function CustomUpload() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const {
    addSingleImage,
    setSelectedPhoto,
    updatePhotoByUid,
    removePhotoByUid,
    selectedPhoto,
    photoList,
    isPhotoExistByUid,
  } = useUploadPhotoStore();

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
  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
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

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      {/* {loading ? <LoadingOutlined /> : <PlusOutlined />} */}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const customRequest = async ({ file, onError, onSuccess, onProgress }) => {
    try {
      const fileNames = [file.name];
      const presignedData = await getPresignedUploadUrls.mutateAsync(fileNames);
      const signedUploadUrl = presignedData.signedUploads[0].uploadUrl;
      const photoId = presignedData.signedUploads[0].photoId;

      await uploadPhoto.mutateAsync({
        url: signedUploadUrl,
        file,
        options: {
          onUploadProgress: (event) => {
            const { loaded, total } = event;
            onProgress({
              percent: Math.round((loaded / total) * 100),
            });
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

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
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

  const handleRemove = (file) => {
    console.log("onRemove", file);
    deletePhoto.mutateAsync(
      { id: file.id },
      {
        onSuccess: () => {
          message.success("Xóa ảnh thành công");
          removePhotoByUid(file.uid);
          // Additional logic to handle the successful deletion of the photo
        },
        onError: (error) => {
          message.error("Chưa thể xóa ảnh"); // Additional logic to handle the successful deletion of the photo
          // Additional logic to handle the error
        },
      }
    );
  };

  const handleDoubleClick = (file) => {
    handlePreview(file);
  };

  const itemRender = (originNode, file, fileList, actions) => {
    return (
      <SinglePhotoUpload
        originNode={originNode}
        file={{ ...file }}
        event={file.event}
        fileList={fileList}
        actions={actions}
        selectedPhoto={selectedPhoto}
        handleDoubleClick={handleDoubleClick}
        setSelectedPhoto={setSelectedPhoto}
        handlePreview={handlePreview}
      />
    );
  };

  return (
    <div className="h-full">
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        // showUploadList={false}
        multiple={true}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={customRequest}
        onPreview={handlePreview}
        onRemove={handleRemove}
        itemRender={itemRender}
        fileList={photoList}
        // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
      >
        {uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{
            display: "none",
          }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
}
