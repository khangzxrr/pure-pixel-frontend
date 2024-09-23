import { Checkbox, Input, message, Tooltip } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingOutlined } from "@ant-design/icons";
import { uploadPhotoExtraOptionInputSchema } from "../../../yup/UploadPhotoExtraInputSchema";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import { useMutation } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import { PhotoDataFields } from "./PhotoDataFields";

export default function UploadPhotoExtraOption() {
  const {
    selectedPhoto,
    setCurrentStep,
    updateField,
    isUpdating,
    setIsOpenDraftModal,
  } = useUploadPhotoStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(uploadPhotoExtraOptionInputSchema),
    defaultValues: getDefaultPhoto(selectedPhoto),
  });
  console.log("UploadPhotoExtraOption", selectedPhoto);

  const onSubmit = async (data) => {
    setIsOpenDraftModal(true);
  };

  useEffect(() => {
    reset(getDefaultPhoto(selectedPhoto));
  }, [selectedPhoto, reset]);

  return (
    <div className="px-6 ">
      <form onSubmit={handleSubmit(onSubmit)}>
        {PhotoDataFields.map((field) => (
          <div key={field.name}>
            <p>{field.placeholder}</p>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  {...controllerField}
                  className={`w-full px-2 m-2 border-[1px] ${
                    errors[field.name] ? "border-red-500" : "border-[#e0e0e0]"
                  } focus:outline-none focus:border-[#e0e0e0]`}
                  type={field.type}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    controllerField.onChange(e);
                    updateField(selectedPhoto.id, field.name, e.target.value);
                  }}
                />
              )}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm p-1">
                {errors[field.name].message}
              </p>
            )}
          </div>
        ))}
        <div className="flex flex-row w-full mt-1">
          <Controller
            name="isWatermark"
            control={control}
            render={({ field: controllerField }) => (
              <Tooltip
                placement="left"
                color="geekblue"
                title={selectedPhoto.isWatermark ? "Gỡ nhãn" : "Gắn nhãn"}
              >
                <Checkbox
                  {...controllerField}
                  className="m-2"
                  checked={selectedPhoto.isWatermark}
                  onChange={(e) => {
                    controllerField.onChange(e.target.checked);
                    console.log(
                      "isWatermark",
                      e.target.checked,
                      controllerField.value,
                      selectedPhoto.id
                    );
                    updateField(
                      selectedPhoto.id,
                      "isWatermark",
                      e.target.checked
                    );
                  }}
                  disabled={selectedPhoto.currentStep === 3}
                >
                  <p>Thêm Nhãn</p>
                </Checkbox>
              </Tooltip>
            )}
          />
          {errors.isWatermark && (
            <p className="text-red-500 text-sm p-1">
              {errors.isWatermark.message}
            </p>
          )}
          {selectedPhoto.isWatermark && (
            <div key="watermark">
              <Controller
                name="watermark"
                control={control}
                render={({ field: controllerField }) => (
                  <Input
                    {...controllerField}
                    className={`w-full px-2 border-[1px] ${
                      errors.watermark ? "border-red-500" : "border-[#e0e0e0]"
                    } focus:outline-none focus:border-[#e0e0e0]`}
                    type="text"
                    placeholder="Nhập nhãn cho ảnh"
                    onChange={(e) => {
                      controllerField.onChange(e);
                      updateField(
                        selectedPhoto.id,
                        "watermark",
                        e.target.value
                      );
                    }}
                  />
                )}
              />
              {errors.watermark && (
                <p className="text-red-500 text-sm p-1">
                  {errors.watermark.message}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedPhoto.currentStep !== 3 && (
          <button
            type="button"
            onClick={() =>
              setCurrentStep(selectedPhoto.id, selectedPhoto.currentStep - 1)
            }
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 float-left"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          {isUpdating ? <LoadingOutlined /> : "Next"}
        </button>
      </form>
    </div>
  );
}
