import { Input, Select, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { uploadPhotoInputSchema } from "../../../yup/UploadPhotoInput";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import TextArea from "antd/es/input/TextArea";
import { yupResolver } from "@hookform/resolvers/yup";
import { SelectType } from "../../../fakejson/SelectType";
import { SelectTag } from "../../../fakejson/SelectTag";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import { useMutation } from "@tanstack/react-query";
import { CategoryApi } from "../../../apis/CategoryApi";

export default function UploadPhotoForm() {
  const { selectedPhoto, setCurrentStep, updateField } = useUploadPhotoStore();
  const [categories, setCategories] = useState([]);
  const getAllCategories = useMutation({
    mutationFn: () => CategoryApi.getAllCategories(),
    onSuccess: (data) => {
      console.log("data", data);

      setCategories(
        data.map((category) => ({ label: category.name, value: category.id }))
      );
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(uploadPhotoInputSchema),
    defaultValues: getDefaultPhoto(selectedPhoto),
  });

  const handleTagChange = (value) => {
    console.log(`selected ${value}`);
    console.log(`Type of value: ${typeof value}`);
  };

  const onSubmit = (data) => {
    setCurrentStep(selectedPhoto.id, selectedPhoto.currentStep + 1);
  };

  useEffect(() => {
    reset(selectedPhoto);
    getAllCategories.mutate();
  }, [selectedPhoto, reset]);

  return (
    <div className="px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.title ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter image title"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "title", e.target.value);
              }}
            />
          )}
        />
        {errors.title && (
          <p className=" text-red-500 text-sm p-1">{errors.title.message}</p>
        )}

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              className={`w-full p-2 m-2 border-[1px] ${
                errors.description ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-[#e0e0e0]`}
              placeholder="Enter description"
              onChange={(e) => {
                field.onChange(e);
                updateField(selectedPhoto.id, "description", e.target.value);
              }}
            />
          )}
        />
        {errors.description && (
          <p className=" text-red-500 text-sm p-1">
            {errors.description.message}
          </p>
        )}

        <Controller
          name="photoType"
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
                updateField(selectedPhoto.id, "photoType", value);
              }}
            />
          )}
        />
        {errors.type && (
          <p className=" text-red-500 text-sm p-1">{errors.type.message}</p>
        )}
        <Controller
          name="photoTags"
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
                updateField(selectedPhoto.id, "photoTags", value);
              }}
              options={categories}
            />
          )}
        />
        {errors.photoTags && (
          <p className=" text-red-500 text-sm p-1">
            {errors.photoTags.message}
          </p>
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
          name="visibility"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Photo privacy"
              options={[
                { label: "Public", value: "PUBLIC" },
                { label: "Private", value: "PRIVATE" },
                { label: "Only who had link", value: "SHARE_LINK" },
              ]}
              className="w-1/3 m-2"
              onChange={(value) => {
                field.onChange(value);
                updateField(selectedPhoto.id, "visibility", value);
              }}
              disabled={selectedPhoto.currentStep === 3}
            />
          )}
        />
        {errors.visibility && (
          <p className="text-red-500 text-sm p-1">
            {errors.visibility.message}
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
                updateField(selectedPhoto.id, "showExif", e.target.checked);
              }}
              disabled={selectedPhoto.currentStep === 3}
            >
              Include EXIF Data
            </Checkbox>
          )}
        />
        {errors.showExif && (
          <p className="text-red-500 text-sm p-1">{errors.showExif.message}</p>
        )}

        <button
          type="submit"
          // disabled={selectedPhoto.currentStep === 3}
          className="mt-4 px-4 py-2  bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          Next
        </button>
      </form>
    </div>
  );
}
