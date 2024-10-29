import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PhotoshootPackageYup } from "../../yup/PhotoshootPackageYup";
import { patchData, putData } from "../../apis/api";
import ComInput from "../../components/ComInput/ComInput";
import ComTextArea from "../../components/ComInput/ComTextArea";
import ComUpImgOne from "../../components/ComUpImg/ComUpImgOne";
import ComButton from "../../components/ComButton/ComButton";
import { useNotification } from "../../Notification/Notification";

export default function EditPhotoshootPackage({
  selectedPackage,
  onClose,
  tableRef,
}) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  const [image, setImage] = useState(null);

  const methods = useForm({
    resolver: yupResolver(PhotoshootPackageYup),
    defaultValues: selectedPackage,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  // Handle image change
  const onChange = (data) => {
    const selectedImage = data;
    setImage(selectedImage);
  };

  // Handle form submission
  const onSubmit = (data) => {
    setDisabled(true);
    if (!image) {
      // No image change; use patchData
      patchData("/photoshoot-package", selectedPackage.id, {
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        description: data.description,
      })
        .then((response) => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            if (tableRef) tableRef();
          }, 100);
          onClose();
        })
        .catch((error) => {
          console.error(error);
          setDisabled(false);
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    } else {
      // Image changed; use putData with FormData
      const formData = new FormData();
      formData.append("thumbnail", image);
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("price", data.price);
      formData.append("description", data.description);

      putData("/photoshoot-package", selectedPackage.id, formData)
        .then((response) => {
          notificationApi("success", "Thành công", "Đã cập nhật");
          setDisabled(false);
          setTimeout(() => {
            if (tableRef) tableRef();
          }, 100);
          onClose();
        })
        .catch((error) => {
          console.error(error);
          setDisabled(false);
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    }
  };

  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cập nhật gói chụp ảnh
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
              </div>
              <div className="sm:col-span-2">
                <ComUpImgOne
                  onChange={onChange}
                  label="Hình ảnh gói chụp ảnh"
                  error={image ? "" : "Vui lòng chọn hình ảnh"}
                  required
                  imgUrl={selectedPackage?.thumbnail}
                />
              </div>
              <div className="mt-10">
                <ComButton
                  htmlType="submit"
                  disabled={disabled}
                  className="block w-full rounded-md bg-[#0F296D] text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0F296D]"
                >
                  {disabled ? "Đang cập nhật..." : "Cập nhật"}
                </ComButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
