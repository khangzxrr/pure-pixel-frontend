import { Select, Checkbox } from "antd";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useUploadPhotoStore from "../../../zustand/UploadPhotoState";
import { LoadingOutlined } from "@ant-design/icons";

export default function UploadPhotoExtraOption() {
  const { currentStep, setCurrentStep, setPhotoExtraOption } =
    useUploadPhotoStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    setPhotoExtraOption(data);
    setCurrentStep(currentStep + 1);
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
              <Checkbox {...field} className="m-2">
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
              <Checkbox {...field} className="m-2">
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

        <button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 float-left"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={currentStep === 3}
          className="mt-4 px-4 py-2  bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          {currentStep === 3 ? <LoadingOutlined /> : "Save"}
        </button>
      </form>
    </div>
  );
}
