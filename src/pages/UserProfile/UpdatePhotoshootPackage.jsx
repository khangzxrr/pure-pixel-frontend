import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Tooltip, Input, Button, Modal } from "antd";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import PhotoService from "../../services/PhotoService";
import { useNotification } from "../../Notification/Notification";
import ImgCrop from "antd-img-crop";

import {
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { NumericFormat } from "react-number-format";
import useModalStore from "../../states/UseModalStore";
import ShowcasesField from "./Component/ShowcasesField";

const { Dragger } = Upload;

export default function UpdatePhotoshootPackage({ onClose }) {
  const {
    setIsUpdatePhotoshootPackageModal,
    selectedUpdatePhotoshootPackage,
    isUpdatePhotoshootPackageModal,
    setSelectedUpdatePhotoshootPackage,
    clearDeleteShowcasesList,
  } = useModalStore();

  const { data: photoshootPackage, isFetching } = useQuery({
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
      setShowcases([]);
    }
  }, [photoshootPackage, reset]);

  const updatePhotoshootPackage = useMutation({
    mutationFn: async (data) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.updatePhotoshootPackage({
        packageId: selectedUpdatePhotoshootPackage,
        data: data,
      });
    },
    onSuccess: () => {
      onClose();
      notificationApi(
        "success",
        "Cập nhật thành công",
        "Gói chụp ảnh của bạn đã được cập nhật thành công!"
      );
      setThumbnail(null);
      setShowcases([]);
      setThumbnailUrl();
      setShowcasesUrl([]);
      queryClient.invalidateQueries("package-detail-by-photographer");
      queryClient.invalidateQueries("findAllPhotoshootPackages");

      reset();
    },
    onError: (error) => {
      console.log(error);
      notificationApi(
        "error",
        "Cập nhật gói chụp thất bại",
        "Không thể cập nhật gói của bạn, vui lòng thử lại."
      );
    },
  });
  const { isLoading: isLoadingUpdatePhotoshootPackage } =
    updatePhotoshootPackage;
  const onThumbnailChange = async (info) => {
    // console.log("image crop", info.file.originFileObj.size, thumbnail.size);
    return false;
  };
  const beforeUpload = async (file) => {
    try {
      // Get the cropped image from the info object
      // Convert the cropped image to a URL for preview
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(file);

      // Update states with the cropped image
      setThumbnail(file);
      setThumbnailUrl(reviewUrl);
    } catch (error) {
      console.log(error);
    }
  };
  const onSubmit = async (data) => {
    // Check if showcasesUrl is valid
    if (!showcasesUrl || showcasesUrl.length === 0) {
      notificationApi(
        "error",
        "Thiếu ảnh cho bộ sưu tập",
        "Bắt buộc phải có ít nhất 1 và nhiều nhất 20 ảnh cho 1 bộ sưu tập."
      );
      return;
    }

    // Update photoshoot package
    try {
      await updatePhotoshootPackage.mutateAsync({ thumbnail, ...data });
    } catch (error) {
      console.error("Error updating photoshoot package:", error);
    }
  };

  return (
    <Modal
      title="Sửa gói chụp"
      visible={isUpdatePhotoshootPackageModal} // Use state from Zustand store
      onCancel={() => {
        setIsUpdatePhotoshootPackageModal(false);
        setSelectedUpdatePhotoshootPackage("");
        clearDeleteShowcasesList();
        queryClient.invalidateQueries({
          queryKey: ["package-detail-by-photographer"],
        });
        reset();
      }} // Close the modal on cancel
      footer={null}
      width={1000} // Set the width of the modal
      centered={true}
      className="custom-close-icon"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" text-[#d7d7d8] flex flex-col h-full"
      >
        {/* handle input form for photoshoot package */}
        <div className="h-3/5 rounded-lg  gap-5 ">
          <div className="grid grid-cols-1 md:grid-cols-2  bg-[#43474E] rounded-lg">
            <div className="m-2 rounded-none md:rounded-l-lg flex items-center justify-center">
              <ImgCrop
                aspect={1 / 1}
                modalTitle="Chỉnh sửa ảnh bìa"
                modalWidth={1000}
                showGrid={true}
              >
                <Dragger
                  beforeUpload={beforeUpload} // Add this line
                  onChange={onThumbnailChange}
                  name="thumbnail"
                  listType="picture-card"
                  showUploadList={false}
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  style={{
                    backgroundColor: "#34373e",
                    // border: "none",
                  }}
                >
                  {/* <button type="button">Đổi ảnh bìa</button> */}

                  <div className="w-full h-[40vh] overflow-hidden flex my-auto">
                    <img
                      src={thumbnailUrl}
                      className="w-full object-cover"
                      alt="Thumbnail"
                    />
                  </div>
                </Dragger>
              </ImgCrop>
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
                  disabled={isLoadingUpdatePhotoshootPackage}
                  type="submit"
                  className="w-full py-2 px-5 bg-[#eee] text-center text-[#57585a] font-semibold rounded-lg hover:bg-[#b3b3b3] hover:text-black transition duration-300"
                >
                  {isLoadingUpdatePhotoshootPackage
                    ? "Đang cập nhật gói chụp..."
                    : "Cập nhật gói chụp"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <ShowcasesField
          photoshootPackageId={selectedUpdatePhotoshootPackage}
          showcases={showcases}
          setShowcases={setShowcases}
          showcasesUrl={showcasesUrl}
          setShowcasesUrl={setShowcasesUrl}
        />
      </form>
    </Modal>
  );
}
