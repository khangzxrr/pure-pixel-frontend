import { useEffect, useState, type ReactNode } from "react";
import { Upload, type UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

type ComUpImgOneProps = {
  // the picked image file
  onChange: (file: RcFile) => void;
  label?: ReactNode;
  required?: boolean;
  inputId?: string;
  // preview shown until another file is picked
  imgUrl?: string;
  // clears the preview when set
  reset?: boolean;
  // accepted but not used
  numberImg?: number;
  listType?: UploadProps["listType"];
  multiple?: boolean;
  error?: string;
};

const ComUpImgOne = ({
  onChange,
  inputId,
  required,
  label,
  imgUrl,
  reset,
}: ComUpImgOneProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(imgUrl);

  useEffect(() => {
    if (imgUrl) {
      setImageUrl(imgUrl);
    } else {
      setImageUrl("");
    }
  }, [imgUrl]);

  useEffect(() => {
    if (reset) {
      setImageUrl("");
    }
  }, [reset]);

  const getBase64 = (img: Blob, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        callback(reader.result);
      }
    });
    reader.readAsDataURL(img);
  };

  const handleFileChange: UploadProps["onChange"] = (fileList) => {
    const file = fileList.file.originFileObj;
    if (file) {
      getBase64(file, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
      onChange(file);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Hình ảnh</div>
    </button>
  );

  return (
    <>
      <div>
        {label && (
          <div className="mb-4 flex justify-between">
            <label htmlFor={inputId} className="text-paragraph font-bold">
              {label}
              {required && (
                <span className="text-paragraph font-bold text-error-7 text-red-500">
                  *
                </span>
              )}
            </label>
          </div>
        )}
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.webp"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="avatar"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </div>
    </>
  );
};

export default ComUpImgOne;
