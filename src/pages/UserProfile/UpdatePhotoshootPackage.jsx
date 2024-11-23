import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Tooltip, Input, Button } from "antd";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoService from "../../services/PhotoService";
import { useNotification } from "../../Notification/Notification";

import {
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { NumericFormat } from "react-number-format";
import useModalStore from "../../states/UseModalStore";

const { Dragger } = Upload;

export default function UpdatePhotoshootPackage({ onClose }) {
  const { setIsUpdatePhotoshootPackageModal, selectedUpdatePhotoshootPackage } =
    useModalStore();
  console.log(
    "selectedUpdatePhotoshootPackage",
    selectedUpdatePhotoshootPackage
  );
  const {
    data: photoshootPackage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "package-detail-by-photographer",
      selectedUpdatePhotoshootPackage,
    ],
    queryFn: () =>
      PhotoshootPackageApi.photographerFindById(
        selectedUpdatePhotoshootPackage
      ),
    keepPreviousData: true,
  });
  console.log("photoshootPackage", photoshootPackage);

  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [thumbnail, setThumbnail] = useState();
  const [thumbnailUrl, setThumbnailUrl] = useState(
    photoshootPackage ? photoshootPackage.thumbnail : ""
  );
  const [showcases, setShowcases] = useState([]);
  const [showcasesUrl, setShowcasesUrl] = useState(
    photoshootPackage ? photoshootPackage.showcase : []
  );

  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(PhotoshootPackageYup),
    defaultValues: {
      title: "",
      subtitle: "",
      price: "",
      description: "",
    },
  });

  useEffect(() => {
    if (photoshootPackage) {
      reset({
        title: photoshootPackage.title || "",
        subtitle: photoshootPackage.subtitle || "",
        price: photoshootPackage.price || "",
        description: photoshootPackage.description || "",
      });
      setThumbnailUrl(photoshootPackage.thumbnail || "");
      setShowcasesUrl(photoshootPackage.showcases || []);
    }
  }, [photoshootPackage, reset]);
  console.log(showcasesUrl, showcases);

  const updatePhotoshootPackage = useMutation({
    mutationFn: async (data) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.updatePhotoshootPackage(data);
    },
    onSuccess: () => {
      notificationApi(
        "success",
        "Sửa gói chụp thành công",
        "Gói chụp ảnh của bạn đã được sửa thành công. Vui lòng kiểm tra lại"
      );
      setDisabled(false);
      setThumbnail(null);
      setShowcases([]);
      setThumbnailUrl();
      setShowcasesUrl([]);
      reset();
      onClose();
      queryClient.invalidateQueries("findAllPhotoshootPackages");
      queryClient.invalidateQueries("package-detail-by-photographer");
    },
    onError: (error) => {
      console.log(error);
      notificationApi(
        "error",
        "Cập nhật gói chụp thất bại",
        "Không thể cập nhật gói của bạn, vui lòng thử lại."
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
      const newFile = info.file;
      console.log(newFile.status);
      // Add the new file to the current showcases list
      if (newFile.status !== "uploading") {
        setShowcases((prevShowcases) => {
          const updatedShowcases = [...prevShowcases, newFile];
          return updatedShowcases;
        });

        // Generate the URL for the new file and add it to the current showcasesUrl
        const newUrl = await PhotoService.convertArrayBufferToObjectUrl(
          newFile.originFileObj
        );
        console.log(newUrl);
        setShowcasesUrl((prevUrls) =>
          Array.from(new Set([...prevUrls, { photoUrl: newUrl }]))
        );
      } else {
        return;
      }
    } catch (error) {
      console.error("Error in onShowcasesChange:", error);
    }
  };
  const deletePhotoFromShowcases = (index) => {
    // Remove the image from showcases
    const updatedShowcases = showcases.filter((_, i) => i !== index);
    setShowcases(updatedShowcases);

    // Remove the URL from showcasesUrl
    const updatedShowcasesUrl = showcasesUrl.filter((_, i) => i !== index);
    setShowcasesUrl(updatedShowcasesUrl);
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
      await updatePhotoshootPackage.mutate({ thumbnail, showcases, ...data });
    } catch (error) {
      console.log(error);
    }
  };
  console.log("watch", watch("price"), showcasesUrl, showcases);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" text-[#d7d7d8] flex flex-col h-full"
    >
      {/* handle input form for photoshoot package */}
      <div className="h-3/5 rounded-lg  gap-5 ">
        <div className="grid grid-cols-1 md:grid-cols-2  bg-[#43474E] rounded-lg">
          <div className="m-2 rounded-none md:rounded-l-lg flex items-center justify-center">
            <Dragger
              name="thumbnail"
              listType="picture-card"
              showUploadList={false}
              onChange={onThumbnailChange}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              style={{
                backgroundColor: "#34373e",
                // border: "none",
              }}
            >
              {/* <button type="button">Đổi ảnh bìa</button> */}
              {!thumbnailUrl ? (
                <div className=" h-[50vh] my-auto flex items-center justify-center hover:opacity-80 bg-transparent">
                  <p className="text-white text-2xl">
                    Nhấp hoặc kéo tệp vào khu vực này để tải lên{" "}
                  </p>
                </div>
              ) : (
                <div className="w-full h-[40vh] overflow-hidden flex my-auto">
                  <img
                    src={thumbnailUrl}
                    className="w-full object-cover"
                    alt="Thumbnail"
                  />
                </div>
              )}
            </Dragger>
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
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <>
                        <span
                          ref={(el) => {
                            if (el && field.value !== undefined) {
                              el.innerText = field.value || ""; // Update span with input value
                            }
                          }}
                          className="absolute invisible whitespace-pre"
                          style={{ font: "inherit" }}
                        />
                        <input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTitle(e.target.value);
                          }}
                          ref={(input) => {
                            if (input) {
                              const span = input.previousSibling;
                              if (span) {
                                span.innerText = input.value || "";
                                input.style.width = `${
                                  30 + Math.max(span.offsetWidth, 100)
                                }px`; // Add minimum width (e.g., 100px)
                              }
                            }
                          }}
                          className={`bg-transparent hover:bg-transparent focus:bg-transparent mb-4 p-1 focus:ring-0 focus:outline-none border-b-[1px] placeholder:text-[#d7d7d8] ${
                            errors.title
                              ? "border-red-500 focus:border-red-600 hover:border-red-600"
                              : "border-[#ababab] focus:border-[#e0e0e0] hover:border-b-[#e0e0e0]"
                          }`}
                          style={{ minWidth: "130px" }} // Add minimum width directly
                          placeholder="Tựa đề của gói"
                        />
                      </>
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs -mt-2 mb-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="font-normal m-2">
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        {...field}
                        thousandSeparator="."
                        decimalSeparator=","
                        suffix=" ₫"
                        className={`w-fit text-[#d7d7d8] bg-transparent hover:bg-transparent focus:bg-transparent mb-4 p-1 lg:text-base text-xs focus:ring-0 focus:outline-none border-b-[1px] placeholder:text-[#d7d7d8]  ${
                          errors.price
                            ? "border-red-500 focus:border-red-600 hover:border-red-600"
                            : "border-[#ababab] focus:border-[#e0e0e0] hover:border-b-[#e0e0e0]"
                        }`}
                        placeholder="Nhập giá"
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                      />
                    )}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="font-normal text-sm m-2">
                  <Controller
                    name="subtitle"
                    control={control}
                    render={({ field }) => (
                      <>
                        <span
                          ref={(el) => {
                            if (el && field.value !== undefined) {
                              el.innerText = field.value || ""; // Update span with input value
                            }
                          }}
                          className="absolute invisible whitespace-pre"
                          style={{ font: "inherit" }}
                        />
                        <input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSubtitle(e.target.value);
                          }}
                          ref={(input) => {
                            if (input) {
                              const span = input.previousSibling;
                              if (span) {
                                span.innerText = input.value || "";
                                input.style.width = `${
                                  30 + Math.max(span.offsetWidth, 100)
                                }px`; // Add minimum width (e.g., 100px)
                              }
                            }
                          }}
                          className={`bg-transparent hover:bg-transparent focus:bg-transparent mb-4 p-1 lg:text-base text-xs focus:ring-0 focus:outline-none border-b-[1px] text-[#e0e0e0] placeholder:text-[#e0e0e0] ${
                            errors.subtitle
                              ? "border-red-500 focus:border-red-600 hover:border-red-600"
                              : "border-[#ababab] focus:border-[#e0e0e0] hover:border-b-[#e0e0e0]"
                          }`}
                          placeholder="Phụ đề"
                        />
                      </>
                    )}
                  />
                  {errors.subtitle && (
                    <p className="text-red-500 text-xs -mt-2 mb-1">
                      {errors.subtitle.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 m-2">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setDescription(e.target.value);
                        }}
                        className={`w-full text-[#d7d7d8] bg-transparent hover:bg-transparent focus:bg-transparent mb-4 p-2  lg:text-base text-xs focus:ring-0 focus:outline-none border-[1px] rounded-lg  placeholder:text-[#d7d7d8]  ${
                          errors.description
                            ? "border-red-500 focus:border-red-600 hover:border-red-600"
                            : "border-[#ababab] focus:border-[#e0e0e0] hover:border-[#e0e0e0]"
                        }`}
                        placeholder="Phần mô tả chi tiết gói sẽ nằm ở đây"
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs -mt-2 mb-1">
                      {errors.description.message}
                    </p>
                  )}{" "}
                </div>
              </div>
            </div>
            <div>
              <button
                disabled={disabled}
                type="submit"
                className="w-full py-2 px-5 bg-[#eee] text-center text-[#57585a] font-semibold rounded-lg hover:bg-[#b3b3b3] hover:text-black transition duration-300"
              >
                {disabled ? "Đang cập nhật gói chụp..." : "Cập nhật gói chụp"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* handle add showcase for photoshoot package */}
      <div className="h-2/5 grid grid-cols-5 md:grid-cols-7 grid-rows-5 md:grid-rows-3 gap-2 mt-4 bg-[#43474E] p-3 overflow-y-auto custom-scrollbar">
        <div className="col-span-1 h-full flex flex-col items-center justify-center">
          <Tooltip title="Chọn ảnh cho bộ sưu tập, tối đa 20 ảnh">
            <Upload
              multiple={true}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              name="showcases"
              showUploadList={false}
              onChange={onShowcasesChange}
              disabled={showcases.length >= 20}
            >
              <div className="flex flex-col items-center justify-center p-5 px-9 bg-[#d7d7d8] hover:bg-[#c0c0c0] rounded-md cursor-pointer transition-colors duration-300">
                <UploadOutlined className="text-3xl mb-1" />
                <p className="text-xs text-center">Chọn ảnh cho</p>
                <p className="text-xs text-center">bộ sưu tập</p>
              </div>
            </Upload>
          </Tooltip>
        </div>
        {/* Show case list */}
        {showcasesUrl &&
          showcasesUrl.length > 0 &&
          showcasesUrl.map((showcase, index) => (
            <div
              key={`showcase-${index}`}
              className="col-span-1  h-full py-2 px-1 relative group"
            >
              <img
                src={showcase.photoUrl}
                alt={`Showcase ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button" // Prevent the button from acting as a submit button
                onClick={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  deletePhotoFromShowcases(index);
                }}
                className="absolute top-3 right-2 hover:bg-opacity-70 bg-white text-red-500 hover:text-red-600 text-xl px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <DeleteOutlined className="w-7 h-7" />
              </button>
            </div>
          ))}

        {/* Add placeholder cells to ensure grid structure */}
        {showcasesUrl &&
          [...Array(21 - showcasesUrl.length - 1)].map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="col-span-1  h-full bg-[#767676] rounded-md"
            />
          ))}
      </div>
    </form>
  );
}
