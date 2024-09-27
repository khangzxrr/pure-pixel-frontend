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

export default function UploadPhotoExtraOption({ selectedPhoto }) {
  const { updateField, isUpdating, setIsOpenDraftModal } =
    useUploadPhotoStore();

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
    <div className="px-6 text-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {PhotoDataFields.map((field) => (
            <div key={field.name}>
              <p>{field.placeholder}</p>
              <Controller
                name={field.name}
                control={control}
                render={({ field: controllerField }) => (
                  <Input
                    {...controllerField}
                    className={`w-full px-2 m-2 font-light border-[1px] ${
                      errors[field.name] ? "border-red-500" : "border-[#e0e0e0]"
                    } focus:outline-none focus:border-[#e0e0e0]`}
                    type={field.type}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (
                        field.name === "exif.ShutterSpeedValue" ||
                        field.name === "exif.ApertureValue"
                      ) {
                        value = parseFloat(value).toFixed(2);
                      }
                      controllerField.onChange(value);
                      updateField(selectedPhoto.id, field.name, value);
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
        </div>
        <div className="flex flex-row w-full mt-1">
          <Controller
            name="watermark"
            control={control}
            render={({ field: controllerField }) => (
              <Tooltip
                placement="left"
                color="geekblue"
                title={selectedPhoto?.watermark ? "Gỡ nhãn" : "Gắn nhãn"}
              >
                <Checkbox
                  {...controllerField}
                  className="m-2"
                  checked={selectedPhoto?.watermark}
                  onChange={(e) => {
                    controllerField.onChange(e.target.checked);
                    console.log(
                      "watermark",
                      e.target.checked,
                      controllerField.value,
                      selectedPhoto.id
                    );
                    updateField(
                      selectedPhoto.id,
                      "watermark",
                      e.target.checked
                    );
                  }}
                >
                  <p className="text-white">Thêm Nhãn</p>
                </Checkbox>
              </Tooltip>
            )}
          />
          {errors.watermark && (
            <p className="text-red-500 text-sm p-1">
              {errors.watermark.message}
            </p>
          )}
        </div>
        <div className="h-24"></div>{" "}
        {/* <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          {isUpdating ? <LoadingOutlined /> : "Next"}
        </button> */}
      </form>
    </div>
  );
}
