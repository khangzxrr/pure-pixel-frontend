import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Upload } from "antd";
import { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import useUploadPhotoStore from "../../../states/UploadPhotoState";

export default function CustomUpload() {
  const [loading, setLoading] = useState(false);

  const { addSingleImage } = useUploadPhotoStore();

  const processPhotos = useMutation({
    mutationFn: (presignedData) => PhotoApi.processPhotos(presignedData),
  });

  const uploadPhoto = useMutation({
    mutationFn: ({ url, file, options }) =>
      PhotoApi.uploadPhotoUsingPresignedUrl(url, file, options),
  });

  const getPresignedUploadUrls = useMutation({
    mutationFn: (filenames) => PhotoApi.getPresignedUploadUrls({ filenames }),
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
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
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
    if (info.file.status === "done") {
      addSingleImage(info.file.response.data[0]);
    }
  };

  const customRequest = async ({ file, onError, onSuccess, onProgress }) => {
    try {
      setLoading(true);

      const fileName = file.name;

      //turn file name into an array of filenames
      //because this method support creating multiple presigned urls
      //but we only need to supply 1 filename
      const fileNames = [fileName];

      const presignedData = await getPresignedUploadUrls.mutateAsync(fileNames);

      const signedUploadUrl = presignedData.signedUploads[0].uploadUrl;

      const result = await uploadPhoto.mutateAsync({
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

      const photos = await processPhotos.mutateAsync(presignedData);

      message.success("uploaded!");

      onSuccess(photos, file);
    } catch (e) {
      message.error("something wrong! please try again");
      console.log(e);
      onError(e);
    }

    setLoading(false);
  };

  return (
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
    >
      {uploadButton}
    </Upload>
  );
}
