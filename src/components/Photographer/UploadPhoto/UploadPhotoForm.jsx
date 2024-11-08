import { Button, Checkbox, ConfigProvider, Input, Select, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextArea from "antd/es/input/TextArea";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { uploadPhotoInputSchema } from "../../../yup/UploadPhotoInput";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { CategoryApi } from "../../../apis/CategoryApi";
import TagInputArea from "./TagInputArea";

export default function UploadPhotoForm({ selectedPhoto }) {
  const { updatePhotoPropertyByUid, setIsOpenDraftModal, setIsOpenMapModal } =
    useUploadPhotoStore();
  const [categories, setCategories] = useState([]);

  console.log("selectphoto", selectedPhoto);

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
    mode: "onChange", // Enable validation onChange
    reValidateMode: "onChange", // Revalidate onChange
  });

  const onSubmit = async (data) => {
    setIsOpenDraftModal(true);
  };

  useEffect(() => {
    reset(getDefaultPhoto(selectedPhoto));
    getAllCategories.mutate();
  }, [selectedPhoto, reset]);

  return (
    <div className="px-2 lg:px-6 text-[#d7d7d8] font-normal lg:text-base text-xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ConfigProvider
          theme={{
            components: {
              Select: {
                colorBgContainer: "#292b2f",
                colorBorder: "#4c4e52",
                activeBorderColor: "#e0e0e0",
                colorPrimaryHover: "#e0e0e0",
                colorPrimary: "#e0e0e0",
                controlItemBgActive: "#e6f4ff",
                colorText: "#d7d7d8",
                colorTextPlaceholder: "#d7d7d8",
                controlItemBgHover: "rgba(0, 0, 0, 0.04)",
                fontSize: 14,
                optionSelectedFontWeight: 400,
                optionSelectedColor: "black",
              },
            },
          }}
        >
          {/* Title Field */}
          <p>Tựa đề</p>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                  errors.title ? "border-red-500" : "border-[#4c4e52]"
                }`}
                type="text"
                placeholder="Nhập tựa đề cho ảnh"
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
            <p className="text-red-500 text-sm p-1">{errors.title.message}</p>
          )}

          {/* Description Field */}
          <p>Mô tả</p>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                  errors.description ? "border-red-500" : "border-[#4c4e52]"
                }`}
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
            <p className="text-red-500 text-sm p-1">
              {errors.description.message}
            </p>
          )}

          {/* Category Field */}
          <p>Thể loại</p>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple" // Enable multiple selection
                showSearch
                placeholder="Select types"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={categories}
                dropdownRender={(menu) => (
                  <div
                    style={{
                      color: "#000",
                      backgroundColor: "#fff",
                      padding: 2,
                    }}
                  >
                    {menu}
                  </div>
                )}
                className={`w-full max-w-full m-2  text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f]  lg:text-base text-xs focus:outline-none   ${
                  errors.categoryIds ? "border-red-500" : "border-[#4c4e52]"
                }`}
                tagRender={(props) => {
                  const { label, value, closable, onClose } = props;

                  return (
                    <div
                      style={{
                        backgroundColor: "#474747",
                        color: "#fff",
                        padding: "2px 8px",
                        margin: 3,
                        borderRadius: "4px",
                        marginRight: "4px",
                      }}
                    >
                      {label}
                      {closable && (
                        <span
                          style={{ marginLeft: "8px", cursor: "pointer" }}
                          onClick={onClose}
                        >
                          ×
                        </span>
                      )}
                    </div>
                  );
                }}
                onChange={(value) => {
                  field.onChange(value);
                  updatePhotoPropertyByUid(
                    selectedPhoto.file.uid,
                    "categoryIds",
                    value
                  );
                }}
              />
            )}
          />
          {errors.categoryIds && (
            <p className="text-red-500 text-sm p-1">
              {errors.categoryIds.message}
            </p>
          )}

          {/* Tags Field */}
          <p>Gắn thẻ</p>
          <Controller
            name="photoTags"
            control={control}
            render={({ field }) => (
              <TagInputArea
                field={field}
                tagStyle={{
                  color: "#000", // Màu chữ đen
                  backgroundColor: "#e0e0e0", // Màu nền
                }}
                inputStyle={{
                  backgroundColor: "#292b2f", // Đặt màu nền của input
                  color: "#d7d7d8", // Đặt màu chữ
                  border: "1px solid #4c4e52",
                }}
                updatePhotoPropertyByUid={updatePhotoPropertyByUid}
                selectedPhoto={selectedPhoto}
                isError={errors.photoTags}
                className={`w-full max-w-full m-2 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] ${
                  errors.photoTags ? "border-red-500" : "border-[#4c4e52]"
                }`}
              />
            )}
          />
          {errors.photoTags && (
            <p className="text-red-500 text-sm p-1">
              {errors.photoTags.message}
            </p>
          )}

          {/* Location Field */}
          <p>Vị trí</p>
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
                className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0]`}
              >
                {selectedPhoto.address ? selectedPhoto.address : "Vị Trí"}
              </Button>
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full mt-1">
            {/* Visibility Field */}
            <div>
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
                    style={{
                      backgroundColor: "#292b2f", // Màu nền tùy chỉnh
                      color: "#d7d7d8", // Màu chữ tùy chỉnh
                    }}
                    className={`w-full m-2 ${
                      errors.visibility ? "border-red-500" : "border-[#4c4e52]"
                    }`}
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
            </div>

            {/* Exif Field */}
            <div>
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
                    <p className="text-white lg:text-sm text-xs my-2">
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

            {/* Watermark Field */}
            <div>
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
            </div>
          </div>

          <div className="h-24"></div>
        </ConfigProvider>
      </form>
    </div>
  );
}
