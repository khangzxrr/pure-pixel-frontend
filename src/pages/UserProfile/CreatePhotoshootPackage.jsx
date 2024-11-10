import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { postData } from "../../apis/api";
import { useNotification } from "../../Notification/Notification";
import ComInput from "../../components/ComInput/ComInput";
import ComTextArea from "../../components/ComInput/ComTextArea";
import ComUpImgOne from "../../components/ComUpImg/ComUpImgOne";
import ComButton from "../../components/ComButton/ComButton";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";

export default function CreatePhotoshootPackage({ onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [image, setImage] = useState(null);

  const methods = useForm({
    resolver: yupResolver(PhotoshootPackageYup),
    defaultValues: {
      title: "",
      subtitle: "",
      price: "",
      description: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  // Hàm thay đổi hình ảnh
  const onChange = (data) => {
    const selectedImage = data;
    setImage(selectedImage);
  };

  // Hàm submit form
  const onSubmit = (data) => {
    // Kiểm tra nếu chưa chọn hình ảnh
    if (!image) {
      notificationApi(
        "error",
        "Hình ảnh không hợp lệ",
        "Vui lòng chọn hình ảnh.",
      );
      return;
    }

    setDisabled(true);
    const formData = new FormData();
    formData.append("thumbnail", image);
    for (const key in data) {
      formData.append(key, data[key]);
    }
    postData("photographer/photoshoot-package", formData)
      .then((response) => {
        notificationApi("success", "Thành công", "Đã tạo thành công");
        setDisabled(false);
        setTimeout(() => {
          tableRef();
        }, 100);
        onClose();
      })
      .catch((error) => {
        console.error(error);
        setDisabled(false);
        notificationApi("error", "Không thành công", "Vui lòng thử lại");
      });
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tạo gói chụp ảnh
        </h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl">
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label="Tiêu đề"
                      placeholder="Tiêu đề"
                      error={errors.title?.message}
                      required
                      {...register("title")}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="text"
                      label="Phụ đề"
                      placeholder="Phụ đề"
                      error={errors.subtitle?.message}
                      required
                      {...register("subtitle")}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComInput
                      type="number"
                      label="Giá"
                      placeholder="Giá"
                      error={errors.price?.message}
                      required
                      {...register("price")}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="mt-2.5">
                    <ComTextArea
                      label="Mô tả"
                      placeholder="Vui lòng nhập mô tả"
                      {...register("description")}
                      rows={5}
                      error={errors.description?.message}
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <ComUpImgOne
                    onChange={onChange}
                    label="Hình ảnh gói chụp ảnh"
                    error={image ? "" : "Vui lòng chọn hình ảnh"}
                    required
                  />
                </div>
              </div>

              <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  disabled={disabled}
                  className={`block w-full rounded-md bg-[#0F296D] text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0F296D] ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {disabled ? "Đang tạo..." : "Tạo mới"}
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
