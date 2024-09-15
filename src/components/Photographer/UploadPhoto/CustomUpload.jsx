import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image, message, Upload } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import RandomIntFromTo from "../../../utils/Utils";

export default function CustomUpload() {
  const { addSingleImage } = useUploadPhotoStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
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

  const handleChange = (info) => {
    console.log(info);
    if (info.file.status === "done") {
      addSingleImage(info.file.response.data);
    }
  };

  const customRequest = async ({ file, onError, onSuccess, onProgress }) => {
    try {
      //turn file name into an array of filenames
      //because this method support creating multiple presigned urls
      //but we only need to supply 1 filename
      const fileNames = [file.name];

      //get presigned PUT upload url first
      const presignedData = await getPresignedUploadUrls.mutateAsync(fileNames);

      //extract upload url from payload
      const signedUploadUrl = presignedData.signedUploads[0].uploadUrl;

      const photoId = presignedData.signedUploads[0].photoId;

      //upload
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

      poolingIntervals[photoId] = setInterval(
        async () => {
          try {
            const photo = await getProcessedPhoto.mutateAsync(photoId);

            if (photo.data.status == "PARSED") {
              addSingleImage(photo.data);

              message.success("parsed photo!");

              clearInterval(poolingIntervals[photoId]);
            }
          } catch (e) {
            //this is fine becuase when image is not parsed yet it will throw 400
            //we only show what is not this exception
            if (e.response.data.message != "PhotoIsPendingStateException") {
              console.log(e);
            }
          }
        },
        //random interval to prevent request all at the same time
        RandomIntFromTo(1000, 3000)
      );
    } catch (e) {
      message.error("something wrong! please try again");
      console.log(e);
      onError(e);
    }
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file) => {
    console.log("file", file);

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  return (
    <div>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        maxCount={10}
        showUploadList={false}
        multiple={true}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={customRequest}
        onPreview={handlePreview}
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
