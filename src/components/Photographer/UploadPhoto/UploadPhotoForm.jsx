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
import Map, { Marker, Popup } from "react-map-gl";
import MapBoxApi from "../../../apis/MapBoxApi";
import ExifList from "./ExifList";

export default function UploadPhotoForm({ selectedPhoto }) {
  const { updatePhotoPropertyByUid, isOpenMapModal, setIsOpenMapModal } =
    useUploadPhotoStore();
  const [categories, setCategories] = useState([]);
  const [viewState, setViewState] = useState({
    latitude: selectedPhoto?.exif?.latitude ?? 10.762622,
    longitude: selectedPhoto?.exif?.longitude ?? 106.66667,
    zoom: 14,
  });
  const [selectedLocate, setSelectedLocate] = useState({
    latitude: selectedPhoto?.exif?.latitude ?? 10.762622,
    longitude: selectedPhoto?.exif?.longitude ?? 106.66667,
  });

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

  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
      // console.log("address", data);
      setSelectedLocate({
        ...selectedLocate,
        address: data.features[0].properties.full_address,
      });
    },
    onError: (error) => {
      console.error("Error fetching address:", error);
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
    // setIsOpenDraftModal(true);
  };

  useEffect(() => {
    reset(getDefaultPhoto(selectedPhoto));
    getAllCategories.mutate();

    if (
      selectedPhoto?.exif &&
      selectedPhoto?.exif?.longitude !== undefined &&
      selectedPhoto?.exif?.latitude !== undefined
    ) {
      searchByCoordinate.mutate({
        longitude: selectedPhoto.exif.longitude,
        latitude: selectedPhoto.exif.latitude,
      });
      setViewState((prev) => ({
        ...prev,
        latitude: selectedPhoto.exif.latitude,
        longitude: selectedPhoto.exif.longitude,
      }));
      setSelectedLocate({
        latitude: selectedPhoto.exif.latitude,
        longitude: selectedPhoto.exif.longitude,
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [selectedPhoto, isOpenMapModal, reset]);

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
                colorPrimary: "#292b2f",
                controlItemBgActive: "#e3e3e3",
                colorText: "e0e0e0",
                colorTextPlaceholder: "e0e0e0",
                controlItemBgHover: "rgba(0, 0, 0, 0.04)",
                fontSize: 14,
                optionSelectedFontWeight: 400,
                optionSelectedColor: "black",
              },
            },
          }}
        >
          {/* Trường Tựa đề */}
          <div className="p-2">
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
          </div>

          {/* Trường Mô tả */}
          <div className="p-2">
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
                  placeholder="Nhập mô tả"
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
          </div>

          {/* Trường Thể loại */}
          <div className="p-2">
            <p>Thể loại</p>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  mode="multiple" // Cho phép chọn nhiều
                  showSearch
                  placeholder="Chọn thể loại"
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
                  className={`w-full m-2 cursor-pointer  ${
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
          </div>

          {/* Trường Gắn thẻ */}
          <div className="p-2">
            <p>Gắn thẻ</p>
            <Controller
              name="photoTags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  mode="tags" // Cho phép gắn thẻ
                  placeholder="Gắn thẻ cho ảnh"
                  onChange={(value) => {
                    field.onChange(value);
                    updatePhotoPropertyByUid(
                      selectedPhoto.file.uid,
                      "photoTags",
                      value
                    );
                  }}
                  options={[]} // Các tùy chọn thẻ, nếu có sẵn
                  open={false} // Không mở dropdown
                  suffixIcon={null} // Xóa biểu tượng mũi tên mặc định
                  className="w-full m-2 "
                />
              )}
            />
            {errors.photoTags && (
              <p className="text-red-500 text-sm p-1">
                {errors.photoTags.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 w-full mt-1">
            {/* Trường Hiển thị */}
            <div className="col-span-2">
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Quyền riêng tư của ảnh"
                    options={[
                      { label: "Công khai", value: "PUBLIC" },
                      { label: "Riêng tư", value: "PRIVATE" },
                    ]}
                    className={`photo-privacy-select w-full m-2 ${
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

            {/* Trường Nhãn */}
            <div className="col-span-1">
              <Controller
                name="watermark"
                control={control}
                render={({ field: controllerField }) => (
                  <Tooltip
                    placement="bottom"
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
          {/* Trường Vị trí */}
          <p>Vị trí</p>
          <div className="m-2">
            {selectedPhoto.exif.latitude && selectedPhoto.exif.longitude ? (
              <div className="relative w-full h-[40vh]">
                <Map
                  {...viewState}
                  mapStyle="mapbox://styles/mapbox/streets-v9"
                  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                  style={{ width: "100%", height: "100%" }}
                >
                  {selectedLocate && (
                    <>
                      <Marker
                        latitude={selectedLocate.latitude}
                        longitude={selectedLocate.longitude}
                        anchor="bottom"
                      >
                        <div
                          className="marker-btn"
                          style={{ cursor: "pointer" }}
                        >
                          <IoLocationSharp fontSize={39} color="red" />
                        </div>
                      </Marker>
                      <Popup
                        latitude={selectedLocate.latitude}
                        longitude={selectedLocate.longitude}
                        anchor="top"
                        closeOnClick={false}
                        closeButton={false}
                      >
                        <div style={{ cursor: "pointer" }}>
                          <h2 className="text-black">
                            {selectedLocate.address}
                          </h2>
                        </div>
                      </Popup>
                    </>
                  )}
                </Map>
              </div>
            ) : (
              <button
                onClick={() => setIsOpenMapModal(true)}
                className={`border-[#4c4e52] w-full flex flex-row justify-center text-white py-1 rounded-lg bg-[#292b2f] hover:border-[#e0e0e0] focus:bg-[#292b2f] border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] `}
              >
                <IoLocationSharp color="red" size={22} />
                Nhấn để thêm vị trí bức ảnh
              </button>
            )}
          </div>
          <ExifList exifData={selectedPhoto.exif} />
          <div className="h-24"></div>
        </ConfigProvider>
      </form>
    </div>
  );
}
