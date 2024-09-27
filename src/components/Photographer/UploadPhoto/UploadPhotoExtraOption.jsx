import { Checkbox, Input, message, Select, Tooltip } from "antd";
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
  const { updateFieldByUid, isUpdating, setIsOpenDraftModal } =
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
    <div className="px-2 lg:px-6 text-white font-normal lg:text-base text-xs">
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
                    className={`w-full px-2 m-2 lg:text-base text-xs border-[1px] ${
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
                      updateFieldByUid(selectedPhoto.uid, field.name, value);
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
                  checked={controllerField.value}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    controllerField.onChange(checked);
                    console.log(
                      "watermark",
                      checked,
                      controllerField.value,
                      selectedPhoto.uid
                    );
                    updateFieldByUid(selectedPhoto.uid, "watermark", checked);
                  }}
                >
                  <p className="text-white lg:text-base text-xs">Thêm Nhãn</p>
                </Checkbox>
              </Tooltip>
            )}
          />
          {errors.watermark && (
            <p className="text-red-500 text-sm p-1">
              {errors.watermark.message}
            </p>
          )}

          <Controller
            name="showExif"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className="m-2"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  updateFieldByUid(
                    selectedPhoto.uid,
                    "showExif",
                    e.target.checked
                  );
                }}
              >
                <p className="text-white lg:text-base text-xs">
                  Hiện thông số bức ảnh
                </p>
              </Checkbox>
            )}
          />
          {errors.showExif && (
            <p className="text-red-500 text-sm p-1">
              {errors.showExif.message}
            </p>
          )}
        </div>
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Photo privacy"
              options={[
                { label: "Công khai", value: "PUBLIC" },
                { label: "Riêng tư", value: "PRIVATE" },
                { label: "Liên kết riêng tư", value: "SHARE_LINK" },
              ]}
              className="w-5/6 m-2 lg:text-base text-xs"
              onChange={(value) => {
                field.onChange(value);
                updateFieldByUid(selectedPhoto.uid, "visibility", value);
              }}
            />
          )}
        />
        {errors.visibility && (
          <p className="text-red-500 text-sm p-1">
            {errors.visibility.message}
          </p>
        )}
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
