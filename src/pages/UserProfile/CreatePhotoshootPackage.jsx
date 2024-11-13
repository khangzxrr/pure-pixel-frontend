import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Upload, Tooltip, Input } from "antd";
import { MessageCircleMore, Share2 } from "lucide-react";
import ComButton from "../../components/ComButton/ComButton";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoService from "../../services/PhotoService";
import { useNotification } from "../../Notification/Notification";
import formatPrice from "../../utils/FormatPriceUtils";

const { Dragger } = Upload;

export default function CreatePhotoshootPackage({
  photoshootPackage,
  onClose,
}) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState();
  const [showcases, setShowcases] = useState([]);
  const [showcasesUrl, setShowcasesUrl] = useState([]);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PhotoshootPackageYup),
    defaultValues: {
      title: "",
      subtitle: "",
      price: 0,
      description: "",
    },
  });

  const createPhotoShootPackage = useMutation({
    mutationFn: (data) => PhotoshootPackageApi.createPhotoshootPackage(data),
    onSuccess: () => {
      notificationApi(
        "success",
        "Cập nhật hồ sơ",
        "Hồ sơ của bạn đã được cập nhật thành công."
      );
      onClose();
    },
    onError: (error) => {
      console.log(error);
      notificationApi(
        "error",
        "Cập nhật thất bại",
        "Không thể cập nhật hồ sơ của bạn. Vui lòng thử lại."
      );
    },
  });

  const onThumbnailChange = async (info) => {
    try {
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(
        info.file.originFileObj
      );
      setThumbnail(info.file.originFileObj);
      setThumbnailUrl(reviewUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const onShowcasesChange = async (info) => {
    try {
      setShowcases(info.fileList);
      const newUrls = await Promise.all(
        info.fileList.map(async (file) =>
          PhotoService.convertArrayBufferToObjectUrl(file.originFileObj)
        )
      );
      setShowcasesUrl(Array.from(new Set(newUrls)));
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data) => {
    setDisabled(true);

    if (!thumbnail) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn hình ảnh."
      );
      setDisabled(false);
      return;
    }

    if (!showcases || showcases.length === 0) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn showcase."
      );
      setDisabled(false);
      return;
    }

    try {
      createPhotoShootPackage.mutate({ thumbnail, showcases, ...data });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 text-[#d7d7d8]"
    >
      {/* Left Column */}
      <div>
        <div className="overflow-hidden h-[400px] rounded-none md:rounded-l-lg">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div>
              <div className="flex justify-center items-center my-auto h-full">
                <p className="text-[#d7d7d8]">Chọn ảnh thumbnail</p>
              </div>
            </div>
          )}
        </div>
        <Dragger
          name="thumbnail"
          listType="picture-card"
          showUploadList={false}
          onChange={onThumbnailChange}
          accept=".jpg,.jpeg,.png,.gif,.webp"
        >
          <button type="button">Upload</button>
        </Dragger>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-3 py-4 px-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-10 overflow-hidden rounded-full">
              <img
                src="https://www.nissantanphu.com.vn/upload_images/images/2022/02/13/dai-ly-nissan-tan-phu-1.jpeg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>photographer</div>
          </div>
        </div>

        <p>Tên gói</p>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                errors.title ? "border-red-500" : "border-[#4c4e52]"
              }`}
              placeholder="Tựa đề của ảnh"
            />
          )}
        />
        {errors.title && (
          <p className="text-red-500 text-sm p-1">{errors.title.message}</p>
        )}
        <p>Phụ đề</p>

        <Controller
          name="subtitle"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                errors.subtitle ? "border-red-500" : "border-[#4c4e52]"
              }`}
              placeholder="Tựa đề của ảnh"
            />
          )}
        />
        {errors.subtitle && (
          <p className="text-red-500 text-sm p-1">{errors.subtitle.message}</p>
        )}

        <p>Mô tả chi tiết gói</p>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                errors.description ? "border-red-500" : "border-[#4c4e52]"
              }`}
              placeholder="Tựa đề của ảnh"
            />
          )}
        />
        {errors.description && (
          <p className="text-red-500 text-sm p-1">
            {errors.description.message}
          </p>
        )}
        <p>Giá gợi ý cho gói</p>

        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                errors.price ? "border-red-500" : "border-[#4c4e52]"
              }`}
              placeholder="Tựa đề của ảnh"
            />
          )}
        />
        {errors.price && (
          <p className="text-red-500 text-sm p-1">{errors.price.message}</p>
        )}
        <Upload
          name="showcases"
          listType="picture-card"
          showUploadList={false}
          onChange={onShowcasesChange}
          accept=".jpg,.jpeg,.png,.gif,.webp"
        >
          <button type="button">Upload showcase</button>
        </Upload>
        {showcasesUrl &&
          showcasesUrl.map((url, index) => (
            <img
              key={index}
              src={url}
              alt="Showcase"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          ))}

        <ComButton disabled={disabled} htmlType="submit">
          {disabled ? "Đang tạo..." : "Đặt lịch"}
        </ComButton>
      </div>
    </form>
  );
}
