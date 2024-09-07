import { Input, Select, Checkbox } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { uploadPhotoInputSchema } from "../../../yup/UploadPhotoInput";
import useUploadPhotoStore from "../../../zustand/UploadPhotoState";
import TextArea from "antd/es/input/TextArea";
import { yupResolver } from "@hookform/resolvers/yup";
import { SelectType } from "../../../fakejson/SelectType";
import { SelectTag } from "../../../fakejson/SelectTag";
import { LoadingOutlined } from "@ant-design/icons";

export default function CombinedForm() {
  const { updatePhotoList, selectedPhoto, setCurrentStep, updateField } =
    useUploadPhotoStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(uploadPhotoInputSchema),
    defaultValues: {
      imageDetails: selectedPhoto.imageDetails || "",
      additionalDetails: selectedPhoto.additionalDetails || "",
      type: selectedPhoto.type || "",
      tag: selectedPhoto.tag || [],
      location: selectedPhoto.location || "",
      private: selectedPhoto.private,
      addWatermark: selectedPhoto.addWatermark,
      includeEXIF: selectedPhoto.includeEXIF,
    },
  });

  const handleTagChange = (value) => {
    console.log(`selected ${value}`);
    console.log(`Type of value: ${typeof value}`);
  };

  const onSubmit = (data) => {
    console.log("photo detail", data, selectedPhoto.id);
    setCurrentStep(selectedPhoto.id, selectedPhoto.currentStep + 1);
    console.log("photo detail", selectedPhoto);
  };

  useEffect(() => {
    reset({
      imageDetails: selectedPhoto.imageDetails || "",
      additionalDetails: selectedPhoto.additionalDetails || "",
      type: selectedPhoto.type || "",
      tag: selectedPhoto.tag || [],
      location: selectedPhoto.location || "",
      private: selectedPhoto.private,
      addWatermark: selectedPhoto.addWatermark,
      includeEXIF: selectedPhoto.includeEXIF,
    });
  }, [selectedPhoto, reset]);

  return (
    <div className="px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="imageDetails"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.imageDetails ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter image details"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "imageDetails", e.target.value);
              }}
            />
          )}
        />
        {errors.imageDetails && (
          <p className=" text-red-500 text-sm p-1">
            {errors.imageDetails.message}
          </p>
        )}

        <Controller
          name="additionalDetails"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              className={`w-full p-2 m-2 border-[1px] ${
                errors.additionalDetails ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-[#e0e0e0]`}
              placeholder="Enter additional details"
              onChange={(e) => {
                field.onChange(e);
                updateField(
                  selectedPhoto.id,
                  "additionalDetails",
                  e.target.value
                );
              }}
            />
          )}
        />
        {errors.additionalDetails && (
          <p className=" text-red-500 text-sm p-1">
            {errors.additionalDetails.message}
          </p>
        )}

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              showSearch
              placeholder="Select a type"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={SelectType}
              className="w-3/5 max-w-full m-2"
              onChange={(value) => {
                field.onChange(value);
                updateField(selectedPhoto.id, "type", value);
              }}
            />
          )}
        />
        {errors.type && (
          <p className=" text-red-500 text-sm p-1">{errors.type.message}</p>
        )}
        <Controller
          name="tag"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              mode="multiple"
              style={{
                width: "100%",
              }}
              className="w-3/5 max-w-full m-2"
              placeholder="Please select"
              onChange={(value) => {
                field.onChange(value); // Ensure the form state is updated
                handleTagChange(value); // Call your custom handler
                updateField(selectedPhoto.id, "tag", value);
              }}
              options={SelectTag}
            />
          )}
        />
        {errors.tag && (
          <p className=" text-red-500 text-sm p-1">{errors.tag.message}</p>
        )}
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.location ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter location"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "location", e.target.value);
              }}
            />
          )}
        />
        {errors.location && (
          <p className=" text-red-500 text-sm p-1">{errors.location.message}</p>
        )}
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
                updateField(selectedPhoto.id, "private", value);
              }}
              disabled={selectedPhoto.currentStep === 3}
            />
          )}
        />
        {errors.private && (
          <p className="text-red-500 text-sm p-1">{errors.private.message}</p>
        )}
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
                updateField(selectedPhoto.id, "addWatermark", e.target.checked);
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
                updateField(selectedPhoto.id, "includeEXIF", e.target.checked);
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

        <button
          type="submit"
          disabled={selectedPhoto.currentStep === 3}
          className="mt-4 px-4 py-2  bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          Next{" "}
        </button>
      </form>
    </div>
  );
}
