import { Input, Select } from "antd";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { uploadPhotoInputSchema } from "../../../yup/UploadPhotoInput";
import useUploadPhotoStore from "../../../zustand/UploadPhotoState";
import TextArea from "antd/es/input/TextArea";
import { yupResolver } from "@hookform/resolvers/yup";
import { SelectType } from "../../../fakejson/SelectType";
import { SelectTag } from "../../../fakejson/SelectTag";

export default function UploadPhotoForm() {
  const { currentStep, photoDetails, setCurrentStep, setPhotoDetails } =
    useUploadPhotoStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(uploadPhotoInputSchema),
  });

  const handleTagChange = (value) => {
    console.log(`selected ${value}`);
    console.log(`Type of value: ${typeof value}`);
  };
  const onSubmit = (data) => {
    console.log("photo detail", data);
    setPhotoDetails(data);
    console.log("photo detail", photoDetails);
    setCurrentStep(currentStep + 1);
  };
  return (
    <div className="px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="imageDetails"
          control={control}
          defaultValue={photoDetails.imageDetails} // Set your default value here
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.imageDetails ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter image details"
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
          defaultValue={photoDetails.additionalDetails} // Set your default value here
          render={({ field }) => (
            <TextArea
              {...field}
              className={`w-full p-2 m-2 border-[1px] ${
                errors.additionalDetails ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-[#e0e0e0]`}
              placeholder="Enter additional details"
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
          defaultValue={photoDetails.type} // Set your default value here
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
            />
          )}
        />
        {errors.type && (
          <p className=" text-red-500 text-sm p-1">{errors.type.message}</p>
        )}
        <Controller
          name="tag"
          control={control}
          defaultValue={photoDetails.tag} // Set your default value here
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
          defaultValue={photoDetails.location} // Set your default value here
          render={({ field }) => (
            <Input
              {...field}
              className={`w-full px-2 m-2 border-[1px] ${
                errors.location ? "border-red-500" : "border-[#e0e0e0]"
              } focus:outline-none focus:border-[#e0e0e0]`}
              type="text"
              placeholder="Enter location"
            />
          )}
        />
        {errors.location && (
          <p className=" text-red-500 text-sm p-1">{errors.location.message}</p>
        )}

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 float-right"
        >
          Next
        </button>
      </form>
    </div>
  );
}
