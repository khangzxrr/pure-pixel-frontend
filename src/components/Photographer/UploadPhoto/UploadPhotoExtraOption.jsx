import { Input, message } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingOutlined } from "@ant-design/icons";
import { uploadPhotoExtraOptionInputSchema } from "../../../yup/UploadPhotoExtraInputSchema";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import { useMutation } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";

export default function CombinedForm() {
  const {
    selectedPhoto,
    setCurrentStep,
    updateField,
    isUpdating,
    setIsUpdating,
    photoList,
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

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });

  const onSubmit = async (data) => {
    setIsUpdating(true);

    const result = await updatePhotos.mutateAsync(photoList);

    console.log(result);
    message.success("saved all uploaded photos!");
  };

  useEffect(() => {
    reset(getDefaultPhoto(selectedPhoto));
  }, [selectedPhoto, reset]);

  return (
    <div className="px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="exif.Model"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.camera ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Camera model"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "exif.Model", e.target.value);
              }}
            />
          )}
        />
        {errors.camera && (
          <p className="text-red-500 text-sm p-1">{errors.camera.message}</p>
        )}

        <Controller
          name="exif.FocalLength"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.lens ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Lens"
              onChange={(e) => {
                field.onChange(e);
                updateField(
                  selectedPhoto.id,
                  "exif.FocalLength",
                  e.target.value,
                );
              }}
            />
          )}
        />
        {errors.lens && (
          <p className="text-red-500 text-sm p-1">{errors.lens.message}</p>
        )}

        <Controller
          name="exif.ShutterSpeedValue"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.shutterSpeed ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Shutter Speed (s)"
              onChange={(e) => {
                field.onChange(e);
                updateField(
                  selectedPhoto.id,
                  "exif.ShutterSpeedValue",
                  e.target.value,
                );
              }}
            />
          )}
        />
        {errors.shutterSpeed && (
          <p className="text-red-500 text-sm p-1">
            {errors.shutterSpeed.message}
          </p>
        )}

        <Controller
          name="exif.ApertureValue"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.aperture ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="number"
              placeholder="Aperture (f)"
              onChange={(e) => {
                field.onChange(e);
                updateField(
                  selectedPhoto.id,
                  "exif.ApertureValue",
                  e.target.value,
                );
              }}
            />
          )}
        />
        {errors.aperture && (
          <p className="text-red-500 text-sm p-1">{errors.aperture.message}</p>
        )}

        <Controller
          name="exif.ISO"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.iso ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="number"
              placeholder="ISO"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "exif.ISO", e.target.value);
              }}
            />
          )}
        />
        {errors.iso && (
          <p className="text-red-500 text-sm p-1">{errors.iso.message}</p>
        )}

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
          {isUpdating ? <LoadingOutlined /> : "Save"}
        </button>
      </form>
    </div>
  );
}
