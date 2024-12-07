import React, { useEffect, useImperativeHandle, useState } from "react";
import useSellPhotoStore from "../../../states/UseSellPhotoState";
import { CategoryApi } from "../../../apis/CategoryApi";
import { useMutation } from "@tanstack/react-query";
import MapBoxApi from "../../../apis/MapBoxApi";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { uploadPhotoSellInput } from "../../../yup/UploadPhotoSellInput";
import { ConfigProvider, Input, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { IoLocationSharp } from "react-icons/io5";
import Map, { Marker, Popup } from "react-map-gl";
import ExifList from "../../../components/Photographer/UploadPhoto/ExifList";
import getDefaultPhoto from "../../../entities/DefaultPhoto";
import PhotoApi from "../../../apis/PhotoApi";
import PhotoExchange from "../../../apis/PhotoExchange";
import { useNotification } from "../../../Notification/Notification";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";
export default function UploadPhotoSellInfoBar({ reference, selectedPhoto }) {
  useImperativeHandle(reference, () => ({
    submitForm() {
      console.log("form.submitform");
      handleSubmit(onSubmit)();
    },
  }));
  const navigate = useNavigate();
  const { notificationApi } = useNotification();

  const {
    updatePhotoPropertyByUid,
    // updateArrayElementByUid,
    isOpenMapModal,
    setIsOpenMapModal,
    photoArray,
    setPriceByUidAndPricetagIndex,
    disableUpload,
    setDisableUpload,
    clearState,
  } = useSellPhotoStore();
  const isDisableUpdatePhoto =
    !selectedPhoto || selectedPhoto.status !== "done";
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
      console.log("address", data);
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
    resolver: yupResolver(uploadPhotoSellInput),
    defaultValues: getDefaultPhoto(),
    mode: "onSubmit", // Enable validation onSubmit
    reValidateMode: "onChange", // Revalidate onChange
  });

  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
  });
  const sellPhoto = useMutation({
    mutationFn: async (photos) =>
      await PhotoExchange.sellPhotoByPhotoId(photos),
    onError: (photos, data) => {
      console.error("Error selling photos:", photos);
    },
  });
  const onSubmit = async () => {
    setDisableUpload(true);
    console.log("get in submit");
    // Filter out photos with status "done"
    const photosToUpdate = photoArray.filter(
      (photo) => photo.status === "done"
    );

    if (photosToUpdate.length === 0) {
      console.log("all photo done");

      // If there are no photos with "done" status, show a message or handle accordingly
      setDisableUpload(false);
      notificationApi(
        "info",
        "Không có ảnh phù hợp để đăng tải",
        "Danh sách hiện tại không có ảnh nào phù hợp để bán"
      );

      return;
    }

    // Check if any photo's pricetags does not have at least one valid price
    const invalidPricePhotos = photosToUpdate.filter(
      (photo) => !photo.pricetags.some((tag) => tag.price >= 1000)
    );

    if (invalidPricePhotos.length > 0) {
      console.log("all photo done");

      // If there are photos with invalid pricetags, show a message and return early
      setDisableUpload(false);
      notificationApi(
        "info",
        "Không có giá hợp lệ",
        "Danh sách ảnh có tồn tại ảnh chưa có giá bán, vui lòng kiểm tra lại"
      );

      return;
    }

    // Loop over each photo with status "done" and update them individually
    const updatePromises = photosToUpdate.map(async (photo) => {
      const photoToUpdate = {
        id: photo.response.id,
        categoryId: photo.categoryId,
        title: photo.title,
        description: photo.description,
        categoryIds: photo.categoryIds,
        visibility: photo.visibility,
        photoTags: photo.photoTags,
        gps: photo.gps,
      };
      const photoToSell = {
        id: photo.response.id,
        pricetags: photo.pricetags.filter((tag) => tag.price >= 1000),
      };

      // Call the API to update a single photo and add watermark concurrently
      return Promise.all([
        updatePhotos.mutateAsync(photoToUpdate),
        sellPhoto.mutateAsync(photoToSell),
      ]);
    });

    try {
      console.log("updatePromises", updatePromises);
      // Wait for all update and watermark operations to complete
      await Promise.all(updatePromises);
      setDisableUpload(false);
      navigate("/profile/photo-selling");
      // Clear state after successful updates
      clearState();
      // Display success message
      notificationApi(
        "success",
        "Đăng tải ảnh bán thành công",
        "Ảnh của bạn đã được đăng tải để bán thành công"
      );
    } catch (error) {
      // Handle errors if any of the updates fail
      setDisableUpload(false);
      console.error("Error updating photos:", error);
      message.error("Có lỗi xảy ra trong quá trình cập nhật!");
    }
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
      setSelectedLocate({});
    }
  }, [selectedPhoto, isOpenMapModal, reset]);
  console.log("selectedPhoto", selectedPhoto, photoArray);
  return (
    <div className="relative w-full h-full mx-auto overflow-y-auto custom-scrollbar">
      {/* Overlay Layer */}
      {isDisableUpdatePhoto && (
        <div
          className="absolute inset-0 bg-black h-screen bg-opacity-50 z-20 flex items-center justify-center cursor-not-allowed"
          style={{ top: 0, left: 0 }}
        />
      )}

      {/* Your form content */}
      <div className="relative z-10">
        <p className="text-white text-lg font-semibold p-3">
          Thông tin bức ảnh
        </p>
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
              {/* Title Field */}
              <p>Tựa đề</p>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                      errors.title
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#4c4e52] focus:border-[#e0e0e0]"
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
                <p className="text-red-500 text-sm p-1">
                  {errors.title.message}
                </p>
              )}
              {!isDisableUpdatePhoto && (
                <>
                  {/* Description Field */}
                  <p>Mô tả</p>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                          errors.description
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#4c4e52] focus:border-[#e0e0e0]"
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
                        disabled={isDisableUpdatePhoto}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm p-1">
                      {errors.description.message}
                    </p>
                  )}
                </>
              )}
              {!isDisableUpdatePhoto && (
                <>
                  {/* Category Field */}
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
                          errors.categoryIds
                            ? "border-red-500"
                            : "border-[#4c4e52]"
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
                                  style={{
                                    marginLeft: "8px",
                                    cursor: "pointer",
                                  }}
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
                        disabled={isDisableUpdatePhoto}
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
                </>
              )}

              {/* Pricetags Field */}
              <Controller
                name="pricetags"
                control={control}
                defaultValue={[]} // Ensure defaultValue is an empty array
                render={({ field }) =>
                  !isDisableUpdatePhoto && (
                    <div className="bg-[#292b2f] p-4 rounded-md">
                      <h3 className="text-lg text-gray-100">
                        Chỉnh giá theo Kích thước
                      </h3>

                      {errors.pricetags && (
                        <p className="text-red-500 text-sm p-1">
                          {errors.pricetags.message}
                        </p>
                      )}

                      {/* Ensure field.value is always an array */}
                      {(Array.isArray(field.value) ? field.value : []).map(
                        (_, index) => (
                          <div>
                            <div
                              key={index}
                              className={`flex items-center gap-4 cursor-pointer `}
                            >
                              <span
                                className={`text-gray-100 w-32 p-2  rounded bg-gray-700`}
                              >
                                {field.value[index]?.width || ""} x{" "}
                                {field.value[index]?.height || ""}{" "}
                              </span>

                              {/* Migrate NumericFormat here */}
                              <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                suffix=" ₫"
                                className={`w-full rounded-md p-2 m-2 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] border-[1px] lg:text-base text-xs focus:outline-none hover:border-[#e0e0e0] placeholder:text-[#bababa] ${
                                  errors.pricetags?.[index]?.price
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[#4c4e52] focus:border-[#e0e0e0]"
                                }`}
                                placeholder="Nhập giá"
                                value={field.value[index]?.price || ""}
                                onValueChange={(values) => {
                                  const updatedPricetags = [
                                    ...(field.value || []),
                                  ];
                                  console.log(
                                    "values",
                                    values,
                                    parseInt(values.value, 10)
                                  );
                                  updatedPricetags[index] = {
                                    ...updatedPricetags[index],
                                    price: parseInt(values.value, 10) || 0,
                                  };
                                  setPriceByUidAndPricetagIndex(
                                    selectedPhoto.file.uid,
                                    index,
                                    parseInt(values.value, 10) || 0
                                  );
                                  field.onChange(updatedPricetags);
                                }}
                                disabled={isDisableUpdatePhoto}
                              />
                            </div>
                            {/* Displaying individual error message for the price field */}
                            {errors.pricetags?.[index]?.price && (
                              <p className="text-red-500 text-xs text-right pr-4">
                                {errors.pricetags[index].price.message}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )
                }
              />

              {/* Description Location */}
              <p className="my-2">Vị trí</p>

              <div className="m-2">
                {selectedLocate &&
                selectedLocate?.latitude &&
                selectedLocate?.longitude ? (
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
                            latitude={selectedLocate?.latitude}
                            longitude={selectedLocate?.longitude}
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
                            latitude={selectedLocate?.latitude}
                            longitude={selectedLocate?.longitude}
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
              <ExifList exifData={selectedPhoto?.exif} />
              <div className="h-24"></div>
            </ConfigProvider>
          </form>
        </div>{" "}
      </div>
    </div>
  );
}
