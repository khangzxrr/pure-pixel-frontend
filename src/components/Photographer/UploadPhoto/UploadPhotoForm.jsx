import { Button, Checkbox, Input, Select, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextArea from "antd/es/input/TextArea";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { uploadPhotoInputSchema } from "../../../yup/UploadPhotoInput";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import { ExifField } from "./PhotoDataFields";
import { useMutation } from "@tanstack/react-query";
import { CategoryApi } from "../../../apis/CategoryApi";
import TagInputArea from "./TagInputArea";
import { IoLocationSharp } from "react-icons/io5";

export default function UploadPhotoForm({ selectedPhoto }) {
  const { updatePhotoPropertyByUid, setIsOpenDraftModal, setIsOpenMapModal } =
    useUploadPhotoStore();
  const [categories, setCategories] = useState([]);

  const getAllCategories = useMutation({
    mutationFn: () => CategoryApi.getAllCategories(),
    onSuccess: (data) => {
      setCategories(
        data.map((category) => ({ label: category.name, value: category.id }))
      );
    },
    onError: (error) => {
      console.error("Error fetching categories:", error);
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
  };

  const onSubmit = async (data) => {
    setIsOpenDraftModal(true);
  };

  useEffect(() => {
    reset(getDefaultPhoto(selectedPhoto));
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
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "title",
                  e.target.value
                );
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
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "description",
                  e.target.value
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
              options={categories}
              className="w-3/5 max-w-full m-2"
              onChange={(value) => {
                field.onChange(value);
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "photoType",
                  value
                );
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
            <TagInputArea
              field={field}
              updatePhotoPropertyByUid={updatePhotoPropertyByUid}
              selectedPhoto={selectedPhoto}
              isError={errors.photoTags}
            />
          )}
        />
        <p>Vị trí</p>
        {/* <Controller
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
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "location",
                  e.target.value
                );
              }}
            />
          )}
        />
        {errors.location && (
          <p className=" text-red-500 text-sm p-1">{errors.location.message}</p>
        )} */}
        <div className="m-2">
          <Tooltip
            title={`${
              selectedPhoto.address ? "Thay đổi" : "Thêm"
            } vị trí bức ảnh`}
            color="volcano"
            placement="right"
          >
            <Button
              color="default"
              variant="solid"
              icon={<IoLocationSharp fontSize={19} color="red" />}
              onClick={() => setIsOpenMapModal(true)}
            >
              {selectedPhoto.address ? selectedPhoto.address : "Vị Trí"}
            </Button>
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {ExifField.map((field) => (
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
                      controllerField.onChange(value);
                      updatePhotoPropertyByUid(
                        selectedPhoto.file.uid,
                        field.name,
                        value
                      );
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
        <div className="flex flex-col w-full mt-1">
          <div className="flex flex-row w-full">
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
                      const checked = e.target.checked;
                      controllerField.onChange(checked);
                      updatePhotoPropertyByUid(
                        selectedPhoto.file.uid,
                        "watermark",
                        checked
                      );
                    }}
                  >
                    <p className="text-white lg:text-sm text-xs my-2">
                      Thêm Nhãn
                    </p>
                  </Checkbox>
                </Tooltip>
              )}
            />
            {errors.watermark && (
              <p className="text-red-500 text-sm p-1">
                {errors.watermark.message}
              </p>
            )}

            <div className={selectedPhoto?.watermark ? "visible" : "invisible"}>
              <Controller
                name="watermarkContent"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={`w-full px-2 m-2 border-[1px] lg:text-sm text-xs ${
                      errors.watermarkContent
                        ? "border-red-500"
                        : "border-[#e0e0e0]"
                    } focus:outline-none focus:border-[#e0e0e0]`}
                    type="text"
                    placeholder="Thông tin gắn nhãn"
                    onChange={(e) => {
                      field.onChange(e);
                      updatePhotoPropertyByUid(
                        selectedPhoto.file.uid,
                        "watermarkContent",
                        e.target.value
                      );
                    }}
                  />
                )}
              />
              {errors.watermarkContent && (
                <p className="text-red-500 text-sm p-1">
                  {errors.watermarkContent.message}
                </p>
              )}
            </div>
          </div>
        </div>
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
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "showExif",
                  e.target.checked
                );
              }}
            >
              <p className="text-white lg:text-sm text-xs">
                Hiện thông số bức ảnh
              </p>
            </Checkbox>
          )}
        />
        {errors.showExif && (
          <p className="text-red-500 text-sm p-1">{errors.showExif.message}</p>
        )}
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
              className="w-5/6 m-2 lg:text-sm text-xs"
              onChange={(value) => {
                field.onChange(value);
                updatePhotoPropertyByUid(
                  selectedPhoto.file.uid,
                  "visibility",
                  value
                );
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
      </form>
    </div>
  );
}
