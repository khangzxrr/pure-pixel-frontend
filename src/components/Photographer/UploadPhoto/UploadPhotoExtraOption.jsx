import { Select, Checkbox } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useUploadPhotoStore from "../../../zustand/UploadPhotoState";
import { LoadingOutlined } from "@ant-design/icons";

export default function UploadPhotoExtraOption() {
  const { setCurrentStep, updatePhotoList, selectedPhoto, photoList } =
    useUploadPhotoStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      private: selectedPhoto.private,
      addWatermark: selectedPhoto.addWatermark,
      includeEXIF: selectedPhoto.includeEXIF,
    },
  });
  useEffect(() => {
    reset({
      private: selectedPhoto.private,
      addWatermark: selectedPhoto.addWatermark,
      includeEXIF: selectedPhoto.includeEXIF,
    });
    console.log("selectedPhoto", selectedPhoto);
  }, [selectedPhoto, reset]);

  const handlePrivateChange = (value) => {
    updatePhotoList({
      ...selectedPhoto,
      private: value,
    });

    console.log("Private changed to:", value);
  };

  const handleAddWatermarkChange = (e) => {
    updatePhotoList({
      ...selectedPhoto,
      addWatermark: e.target.checked,
    });

    console.log("Add Watermark changed to:", e.target.checked);
  };

  const handleIncludeEXIFChange = (e) => {
    updatePhotoList({
      ...selectedPhoto,
      includeEXIF: e.target.checked,
    });

    console.log("Include EXIF Data changed to:", e.target.checked);
  };

  const onSubmit = (data) => {
    console.log(data);
    console.log("selectedPhoto", photoList);
    setCurrentStep(selectedPhoto.id, selectedPhoto.currentStep + 1);
  };

  return (
    <div className="m-4 px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Controller
            name="private"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Photo privacy"
                options={[
                  { label: "Public", value: "public" },
                  { label: "Private", value: "private" },
                  { label: "Only who had link", value: "link" },
                ]}
                className="w-1/3 m-2"
                onChange={(value) => {
                  field.onChange(value);
                  handlePrivateChange(value);
                }}
                disabled={selectedPhoto.currentStep === 3}
              />
            )}
          />
          {errors.private && (
            <p className="text-red-500 text-sm p-1">{errors.private.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="addWatermark"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className="m-2"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  handleAddWatermarkChange(e);
                }}
                disabled={selectedPhoto.currentStep === 3}
              >
                Add Watermark
              </Checkbox>
            )}
          />
          {errors.addWatermark && (
            <p className="text-red-500 text-sm p-1">
              {errors.addWatermark.message}
            </p>
          )}
        </div>
        <div>
          <Controller
            name="includeEXIF"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className="m-2"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  handleIncludeEXIFChange(e);
                }}
                disabled={selectedPhoto.currentStep === 3}
              >
                Include EXIF Data
              </Checkbox>
            )}
          />
          {errors.includeEXIF && (
            <p className="text-red-500 text-sm p-1">
              {errors.includeEXIF.message}
            </p>
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
          disabled={selectedPhoto.currentStep === 3}
          className="mt-4 px-4 py-2  bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          {selectedPhoto.currentStep === 3 ? <LoadingOutlined /> : "Save"}
        </button>
      </form>
    </div>
  );
}
