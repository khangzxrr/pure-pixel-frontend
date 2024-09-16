import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image, message, Upload } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import RandomIntFromTo from "../../../utils/Utils";
import SinglePhotoUpload from "./SinglePhotoUpload";
import { set } from "react-hook-form";

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
    photoList,
    isPhotoExistByUid,
    selectedPhoto,
  } = useUploadPhotoStore();

  const poolingIntervals = {};

  const uploadPhoto = useMutation({
    mutationFn: ({ url, file, options }) =>
      PhotoApi.uploadPhotoUsingPresignedUrl(url, file, options),
  });

  const getPresignedUploadUrls = useMutation({
    mutationFn: (filenames) => PhotoApi.getPresignedUploadUrls({ filenames }),
  });

  const getProcessedPhoto = useMutation({
    mutationFn: (id) => PhotoApi.getPhotoById(id),
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

      poolingIntervals[photoId] = setInterval(async () => {
        try {
          const photo = await getProcessedPhoto.mutateAsync(photoId);

          if (photo.data.status == "PARSED") {
            message.success("parsed photo!");

            clearInterval(poolingIntervals[photoId]);

            // Call onSuccess to update the file status
            onSuccess(photo.data);
          }
        } catch (e) {
          if (e.response.data.message != "PhotoIsPendingStateException") {
            console.log(e);
          }
        }
      }, RandomIntFromTo(1000, 3000));
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
      addSingleImage(info.file);
    } else if (info.file.status === "done") {
      console.log("Upload done:", info, photoList);
      await updatePhotoByUid(info.file.uid, {
        ...info.file.response,
        title: info.file.name,
      });
      setSelectedPhoto({
        ...info.file.response,
        uid: info.file.uid,
        title: info.file.name,
        currentStep: 1,
      });
    }
  };
  const handleRemove = (file) => {
    console.log("onRemove", file);
    useUploadPhotoStore.getState().removePhotoByUid(file.uid);
  };
  const handleDoubleClick = (file) => {
    handlePreview(file);
  };

  const itemRender = (originNode, file, fileList, actions) => {
    return (
      <SinglePhotoUpload
        originNode={originNode}
        file={{ ...file, percent: 33 }}
        fileList={fileList}
        actions={actions}
        selectedPhoto={selectedPhoto}
        handleDoubleClick={handleDoubleClick}
        setSelectedPhoto={setSelectedPhoto}
      />
    );
  };
  return (
    <div className="h-full">
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        maxCount={10}
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
      {/* <Upload
        customRequest={customRequest}
        // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        maxCount={10}
        multiple={true}
        beforeUpload={beforeUpload}
        onPreview={handlePreview}
        onChange={handleChange}
        itemRender={itemRender}
      >
        {uploadButton}
      </Upload> */}
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
