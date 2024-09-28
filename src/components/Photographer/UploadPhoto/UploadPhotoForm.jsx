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

export default function UploadPhotoForm({ selectedPhoto }) {
  const { updateFieldByUid } = useUploadPhotoStore();
  const [categories, setCategories] = useState([]);
  const getAllCategories = useMutation({
    mutationFn: () => CategoryApi.getAllCategories(),
    onSuccess: (data) => {
      setCategories(
        data.map((category) => ({ label: category.name, value: category.id })),
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

  const onSubmit = (data) => {};

  useEffect(() => {
    reset(selectedPhoto);
    getAllCategories.mutate();
  }, [selectedPhoto, reset]);

  return (
    <div className="px-2 lg:px-6 text-white font-normal lg:text-base text-xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>Tựa đề</p>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] lg:text-base text-xs ${
                errors.title ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter image title"
              onChange={(e) => {
                field.onChange(e);
                updateFieldByUid(selectedPhoto.uid, "title", e.target.value);
              }}
            />
          )}
        />
        {errors.title && (
          <p className=" text-red-500 text-sm p-1">{errors.title.message}</p>
        )}
        <p>Mô tả </p>

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
                updateFieldByUid(
                  selectedPhoto.uid,
                  "description",
                  e.target.value,
                );
              }}
            />
          )}
        />
        {errors.description && (
          <p className=" text-red-500 text-sm p-1">
            {errors.description.message}
          </p>
        )}
        <p>Thể loại</p>

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
                updateFieldByUid(selectedPhoto.uid, "photoType", value);
              }}
            />
          )}
        />
        {errors.type && (
          <p className=" text-red-500 text-sm p-1">{errors.type.message}</p>
        )}
        <p>Gắn thẻ</p>

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
                updateFieldByUid(selectedPhoto.uid, "photoTags", value);
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
        <p>Vị trí</p>

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
                updateFieldByUid(selectedPhoto.uid, "location", e.target.value);
              }}
            />
          )}
        />
        {errors.location && (
          <p className=" text-red-500 text-sm p-1">{errors.location.message}</p>
        )}

        {/* <button
          type="submit"
          className="mt-4 px-4 py-2  bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          Next
        </button> */}
      </form>
    </div>
  );
}
