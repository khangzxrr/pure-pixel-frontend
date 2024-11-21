import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Tooltip, Input, Button } from "antd";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoService from "../../services/PhotoService";
import { useNotification } from "../../Notification/Notification";
import formatPrice from "../../utils/FormatPriceUtils";
import {
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";

const { Dragger } = Upload;

export default function UpdatePhotoshootPackage({
  photoshootPackage,
  onClose,
}) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://t3.ftcdn.net/jpg/04/92/94/70/360_F_492947093_LOGkIRfXScJs3PS2tgjJ4lGR74B0hs7Z.jpg"
  );
  const [showcases, setShowcases] = useState([]);
  const [showcasesUrl, setShowcasesUrl] = useState([]);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PhotoshootPackageYup),
    defaultValues: {
      title: "",
      subtitle: "",
      price: "",
      description: "",
    },
  });

  const createPhotoShootPackage = useMutation({
    mutationFn: async (data) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.createPhotoshootPackage(data);
    },
    onSuccess: () => {
      notificationApi(
        "success",
        "Tạo gói chụp thành công",
        "Gói chụp ảnh của bạn đã được tạo thành công."
      );
      setDisabled(false);
      setThumbnail(null);
      setShowcases([]);
      setThumbnailUrl(
        "https://t3.ftcdn.net/jpg/04/92/94/70/360_F_492947093_LOGkIRfXScJs3PS2tgjJ4lGR74B0hs7Z.jpg"
      );
      setShowcasesUrl([]);
      reset();
      onClose();
      queryClient.invalidateQueries("findAllPhotoshootPackages");
    },
    onError: (error) => {
      console.log(error);
      notificationApi(
        "error",
        "Tạo gói chụp thất bại",
        "Không thể tạo gói của bạn. Vui lòng thử lại."
      );
      setDisabled(false);
    },
  });

  const onThumbnailChange = async (info) => {
    console.log(info, info.file.originFileObj);
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

  const onSubmit = async (data) => {
    setDisabled(true);

    if (!thumbnail) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn ảnh bìa."
      );
      setDisabled(false);
      return;
    }

    if (!showcases || showcases.length === 0) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn ảnh cho bộ sưu tập."
      );
      setDisabled(false);
      return;
    }

    try {
      await createPhotoShootPackage.mutate({ thumbnail, showcases, ...data });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" text-[#d7d7d8] grid grid-rows-9 h-[86vh]"
    >
      <div className="rounded-lg grid grid-cols-1 md:grid-cols-4 gap-5 row-span-7 h-[68vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 col-span-3 bg-[#43474E] rounded-lg">
          <div className="overflow-hidden  rounded-none md:rounded-l-lg flex items-center justify-center">
            <img
              src={thumbnailUrl}
              className="w-11/12 object-cover"
              alt="Thumbnail"
            />
          </div>

          <div className="flex flex-col gap-3 py-4 px-6 h-full">
            <div className="flex-grow">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 overflow-hidden rounded-full">
                    {/* // Avatar */}
                  </div>
                </div>
              </div>
              <div className=" overflow-scroll custom-scrollbar h-[44vh]">
                <div className="text-xl font-semibold m-1">
                  {title ? title : "Tựa đề"}
                </div>
                <div className="font-normal m-2">
                  {price ? formatPrice(price) : "Giá gói"}
                </div>
                <div className="font-normal text-sm text-gray-400 m-2">
                  {subtitle ? subtitle : "Phụ đề"}
                </div>

                <div className="flex flex-col gap-1 p-2 border border-gray-600 rounded-lg m-2">
                  {description ? description : "Phần mô tả sẽ hiển thị ở đây"}
                </div>
              </div>
            </div>
            <div>
              <button
                disabled={disabled}
                type="submit"
                className="w-full py-2 px-5 bg-[#eee] text-center text-[#57585a] font-semibold rounded-lg hover:bg-[#b3b3b3] hover:text-black transition duration-300"
              >
                {disabled ? "Đang tạo gói chụp..." : "Tạo gói chụp"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-1 ">
          <div>
            <Dragger
              name="thumbnail"
              listType="picture-card"
              showUploadList={false}
              onChange={onThumbnailChange}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              style={{
                backgroundColor: "#d7d7d8",
                // border: "none",
              }}
            >
              <button type="button">Đổi ảnh bìa</button>
            </Dragger>
          </div>

          <div className="flex flex-col py-4 px-1 ">
            <p>Tên gói</p>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setTitle(e.target.value);
                  }}
                  className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] p-2 m-2 mb-4 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] placeholder:text-sm ${
                    errors.title ? "border-red-500" : "border-[#4c4e52]"
                  }`}
                  placeholder="Tựa đề của ảnh"
                />
              )}
            />
            {errors.title && (
              <p className="text-red-500 text-xs -mt-2 mb-1">
                {errors.title.message}
              </p>
            )}
            <p>Giá gợi ý cho gói</p>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setPrice(e.target.value);
                  }}
                  className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] p-2 m-2 mb-4 border-[1px] lg:text-base text-xs focus:outline-none hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] placeholder:text-sm ${
                    errors.price
                      ? "border-red-500  focus:border-red-500"
                      : "border-[#4c4e52]  focus:border-[#e0e0e0]"
                  }`}
                  placeholder="Giá gói"
                />
              )}
            />
            {errors.price && (
              <p className="text-red-500 text-xs -mt-2 mb-1">
                {errors.price.message}
              </p>
            )}
            <p>Phụ đề</p>
            <Controller
              name="subtitle"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setSubtitle(e.target.value);
                  }}
                  className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] p-2 m-2 mb-4 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] placeholder:text-sm ${
                    errors.subtitle
                      ? "border-red-500  focus:border-red-500"
                      : "border-[#4c4e52]  focus:border-[#e0e0e0]"
                  }`}
                  placeholder="Phụ đề"
                />
              )}
            />
            {errors.subtitle && (
              <p className="text-red-500 text-xs -mt-2 mb-1">
                {errors.subtitle.message}
              </p>
            )}
            <p>Mô tả chi tiết gói</p>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setDescription(e.target.value);
                  }}
                  className={`w-full custom-scrollbar text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] p-2 m-2 mb-4 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] placeholder:text-sm ${
                    errors.description
                      ? "border-red-500  focus:border-red-500"
                      : "border-[#4c4e52]  focus:border-[#e0e0e0]"
                  }`}
                  placeholder="Mô tả chi tiết"
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-xs -mt-2 mb-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="row-span-2 grid grid-cols-10 gap-2 mt-4 overflow-y-scroll custom-scrollbar">
        <div className="col-span-1 flex  mx-auto pt-1">
          <Tooltip title="Chọn ảnh cho bộ sưu tập">
            <Upload
              multiple={true}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              name="showcases"
              showUploadList={false}
              onChange={onShowcasesChange}
              style={{
                backgroundColor: "#d7d7d8",
              }}
            >
              <div className="w-[5.5rem] h-[5.5rem] flex flex-col text-xs bg-[#d7d7d8] items-center justify-center cursor-pointer hover:bg-[#c0c0c0] rounded-md">
                <UploadOutlined style={{ fontSize: "32px" }} />
                <p>Chọn ảnh cho</p>
                <p>bộ sưu tập</p>
              </div>
            </Upload>
          </Tooltip>
        </div>
        {showcasesUrl &&
          showcasesUrl.map((url, index) => (
            <div className="col-span-1">
              <img
                key={index}
                src={url}
                alt="Showcase"
                className="w-24 h-24 object-cover"
              />
            </div>
          ))}
      </div>
    </form>
  );
}
