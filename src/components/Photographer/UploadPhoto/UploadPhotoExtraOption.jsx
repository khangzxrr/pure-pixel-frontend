import { Input } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useUploadPhotoStore from "../../../zustand/UploadPhotoState";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingOutlined } from "@ant-design/icons";
import { uploadPhotoExtraOptionInputSchema } from "../../../yup/uploadPhotoExtraInputSchema";

export default function CombinedForm() {
  const {
    selectedPhoto,
    setCurrentStep,
    updateField,
    isUploading,
    setIsUploading,
    photoList,
  } = useUploadPhotoStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(uploadPhotoExtraOptionInputSchema),
    defaultValues: {
      camera: selectedPhoto.camera || "",
      lens: selectedPhoto.lens || "",
      focalLength: selectedPhoto.focalLength || "",
      shutterSpeed: selectedPhoto.shutterSpeed || "",
      aperture: selectedPhoto.aperture || "",
      iso: selectedPhoto.iso || "",
      shootDate: selectedPhoto.shootDate || "",
    },
  });

  const onSubmit = (data) => {
    setIsUploading(true);

    console.log(photoList);
  };

  useEffect(() => {
    reset({
      camera: selectedPhoto.camera || "",
      lens: selectedPhoto.lens || "",
      focalLength: selectedPhoto.focalLength || "",
      shutterSpeed: selectedPhoto.shutterSpeed || "",
      aperture: selectedPhoto.aperture || "",
      iso: selectedPhoto.iso || "",
      shootDate: selectedPhoto.shootDate || "",
    });
  }, [selectedPhoto, reset]);

  return (
    <div className="px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="camera"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.camera ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Camera"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "camera", e.target.value);
              }}
            />
          )}
        />
        {errors.camera && (
          <p className="text-red-500 text-sm p-1">{errors.camera.message}</p>
        )}

        <Controller
          name="lens"
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
                updateField(selectedPhoto.id, "lens", e.target.value);
              }}
            />
          )}
        />
        {errors.lens && (
          <p className="text-red-500 text-sm p-1">{errors.lens.message}</p>
        )}

        <Controller
          name="focalLength"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.focalLength ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="number"
              placeholder="Focal Length (mm)"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "focalLength", e.target.value);
              }}
            />
          )}
        />
        {errors.focalLength && (
          <p className="text-red-500 text-sm p-1">
            {errors.focalLength.message}
          </p>
        )}

        <Controller
          name="shutterSpeed"
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
                updateField(selectedPhoto.id, "shutterSpeed", e.target.value);
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
          name="aperture"
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
                updateField(selectedPhoto.id, "aperture", e.target.value);
              }}
            />
          )}
        />
        {errors.aperture && (
          <p className="text-red-500 text-sm p-1">{errors.aperture.message}</p>
        )}

        <Controller
          name="iso"
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
                updateField(selectedPhoto.id, "iso", e.target.value);
              }}
            />
          )}
        />
        {errors.iso && (
          <p className="text-red-500 text-sm p-1">{errors.iso.message}</p>
        )}

        <Controller
          name="shootDate"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.shootDate ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="date"
              placeholder="Shoot Date"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "shootDate", e.target.value);
              }}
            />
          )}
        />
        {errors.shootDate && (
          <p className="text-red-500 text-sm p-1">{errors.shootDate.message}</p>
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
          {isUploading ? <LoadingOutlined /> : "Save"}
        </button>
      </form>
    </div>
  );
}
