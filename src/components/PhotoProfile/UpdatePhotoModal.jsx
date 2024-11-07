import {
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  Select,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextArea from "antd/es/input/TextArea";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useModalStore from "../../states/UseModalStore";
import { CategoryApi } from "../../apis/CategoryApi";
import { updatePhotoInputSchema } from "../../yup/UpdatePhotoInput";
import getDefaultPhoto from "../../entities/DefaultPhoto";
import PhotoApi from "../../apis/PhotoApi";
import "./PhotoProfile.css";
import MapBoxApi from "../../apis/MapBoxApi";
import Map, { Marker, Popup } from "react-map-gl";
import { useNotification } from "../../Notification/Notification";
import { LoadingOutlined } from "@ant-design/icons";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here

export default function UpdatePhotoModal() {
  const {
    isUpdatePhotoModal,
    setIsUpdatePhotoModal,
    setIsUpdateOpenMapModal,
    selectedUpdatePhoto,
    updateSelectedUpdatePhotoField,
  } = useModalStore();
  const [categories, setCategories] = useState([]);
  const [viewState, setViewState] = useState({
    latitude: 10.762622,
    longitude: 106.66667,
    zoom: 14,
  });
  const [selectedLocate, setSelectedLocate] = useState();
  const { notificationApi } = useNotification();
  const queryClient = useQueryClient();

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
  const updatePhotos = useMutation({
    mutationKey: "update-photo",
    mutationFn: async (photos) => await PhotoApi.updatePhotos(photos),
    onSuccess: (data) => {
      notificationApi(
        "success",
        "Cập nhật ảnh thành công",
        "Thông tin ảnh đã được cập nhật.",
        "",
        0,
        "update-photo-success"
      );
      queryClient.invalidateQueries("my-photo");

      setIsUpdatePhotoModal(false);
    },
    onError: (error) => {
      notificationApi(
        "error",
        "Cập nhật ảnh thất bại",
        "Vui lòng thử lại sau.",
        "",
        0,
        "update-photo-error"
      );
    },
  });
  const { isPending: updatePhotosLoading } = updatePhotos;

  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
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
    resolver: yupResolver(updatePhotoInputSchema),
    defaultValues: getDefaultPhoto(selectedUpdatePhoto),
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const handleFinish = async (data) => {
    // Call the onSubmit function with form data
    if (data.isChangeGPS) {
      updatePhotos.mutate(data);
    } else {
      const { gps, ...dataWithoutgps } = data;
      updatePhotos.mutate(dataWithoutgps);
    }
    console.log("Updated photo data:", data);
  };

  const openUpdateMapModal = () => {
    setIsUpdateOpenMapModal(true);
    setIsUpdatePhotoModal(false);
  };
  useEffect(() => {
    reset(getDefaultPhoto(selectedUpdatePhoto));
    getAllCategories.mutate();
    searchByCoordinate.mutate({
      longitude: selectedUpdatePhoto.gps.longitute,
      latitude: selectedUpdatePhoto.gps.latitude,
    });
    if (
      selectedUpdatePhoto.gps.longitute !== undefined &&
      selectedUpdatePhoto.gps.latitude !== undefined
    ) {
      setViewState((prev) => ({
        ...prev,
        latitude: selectedUpdatePhoto.gps.latitude,
        longitude: selectedUpdatePhoto.gps.longitute,
      }));
      setSelectedLocate({
        latitude: selectedUpdatePhoto.gps.latitude,
        longitude: selectedUpdatePhoto.gps.longitute,
      });
    } else if (navigator.geolocation) {
      console.log("navigator.geolocation", navigator.geolocation);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          if (!selectedLocate) {
            setSelectedLocate({
              latitude,
              longitude,
              address: "Vị trí hiện tại của bạn",
            });
          }
          console.log("Current location:", position.coords);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [isUpdatePhotoModal, reset]);
  return (
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
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        title="Sửa thông tin ảnh"
        visible={isUpdatePhotoModal} // Use state from Zustand store
        onCancel={() => setIsUpdatePhotoModal(false)} // Close the modal on cancel
        footer={null}
        width={1000} // Set the width of the modal
        style={{ top: 22 }} // Set the top position of the modal
      >
        <div className="px-2 grid grid-cols-10 lg:px-2 text-[#d7d7d8] font-normal lg:text-base text-xs gap-2 h-[86vh]">
          <div className="col-span-10 md:col-span-5 flex justify-center my-auto">
            <img
              src={selectedUpdatePhoto.originalPhotoUrl}
              className="h-[200px] md:h-full md:w-[400px] shadow-gray-600 shadow-xl drop-shadow-none z-0 mx-auto"
              alt={selectedUpdatePhoto.thumbnailPhotoUrl}
            />
          </div>

          <div className="col-span-10 md:col-span-5 w-full overflow-scroll custom-scrollbar">
            <form onSubmit={handleSubmit(handleFinish)}>
              {/* Title Field */}
              <p>Tựa đề</p>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                      errors.title ? "border-red-500" : "border-[#4c4e52]"
                    }`}
                    placeholder="Tựa đề của ảnh"
                    onChange={(e) => {
                      field.onChange(e);
                      updateSelectedUpdatePhotoField("title", e.target.value);
                    }}
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-sm p-1">
                  {errors.title.message}
                </p>
              )}
              {/* Description Field */}
              <p>Mô tả</p>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    className={`w-11/12 text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 m-2 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] ${
                      errors.description ? "border-red-500" : "border-[#4c4e52]"
                    }`}
                    placeholder="Mô tả của ảnh"
                    onChange={(e) => {
                      field.onChange(e);
                      updateSelectedUpdatePhotoField(
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
                    mode="multiple"
                    showSearch
                    placeholder="Chọn thể loại"
                    options={categories}
                    className={`w-11/12 m-2  ${
                      errors.categoryIds ? "border-red-500" : "border-[#4c4e52]"
                    }`}
                    onChange={(value) => {
                      field.onChange(value);
                      updateSelectedUpdatePhotoField("categoryIds", value);
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
                name="photoTags" // The name of the field in the form
                control={control}
                render={({ field }) => (
                  <Select
                    {...field} // Bind field props to the Select component
                    mode="tags" // Enables tag mode for multiple values
                    placeholder="Gắn thẻ cho ảnh"
                    onChange={(value) => {
                      field.onChange(value); // Update the field's value in react-hook-form
                      updateSelectedUpdatePhotoField("photoTags", value); // Update the tags in the selected photo
                    }}
                    options={[]} // Options for tags, if you have predefined ones
                    open={false} // Keep dropdown closed if you don’t want it to open
                    suffixIcon={null} // Remove the default dropdown arrow icon
                    className="w-11/12 m-2 "
                  />
                )}
              />
              {errors.photoTags && (
                <p className="text-red-500 text-sm p-1">
                  {errors.photoTags.message}
                </p>
              )}

              <div className="grid grid-cols-3  gap-4 w-11/12 mt-1">
                {/* Visibility Field */}
                <div className="col-span-2">
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
                        className="photo-privacy-select w-full m-2 lg:text-sm text-xs"
                        style={{ backgroundColor: "#292b2f" }}
                        onChange={(value) => {
                          field.onChange(value);
                          updateSelectedUpdatePhotoField("visibility", value);
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

                {/* Watermark Field */}
                <div className="col-span-1">
                  <Controller
                    name="watermark"
                    control={control}
                    render={({ field }) => (
                      <Tooltip
                        placement="left"
                        color="geekblue"
                        title={
                          selectedUpdatePhoto?.watermark
                            ? "Gỡ nhãn"
                            : "Gắn nhãn"
                        }
                      >
                        <Checkbox
                          {...field}
                          className="m-2"
                          checked={selectedUpdatePhoto?.watermark}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            field.onChange(checked);
                            updateSelectedUpdatePhotoField(
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
              {/* Location Field */}
              <p>Vị trí</p>
              <div className="m-2 w-11/12 h-full overflow-hidden">
                <div className="relative w-full h-[40vh]">
                  {/* Adjust height as needed */}
                  <Map
                    {...viewState}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: "100%", height: "100%" }}
                    onClick={() => openUpdateMapModal()}
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
              </div>

              {/* Submit Button */}
              <div className="mt-4 flex justify-center">
                <button
                  type="submit"
                  className="w-4/5 bg-green-600 hover:bg-green-500 rounded-lg text-white py-1"
                  disabled={updatePhotosLoading}
                >
                  {updatePhotosLoading ? (
                    <Spin
                      indicator={<LoadingOutlined spin />}
                      className="text-[#e0e0e0]"
                    />
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
