import React, { useEffect, useState } from "react";
import { Modal, Button, Spin, Tooltip } from "antd";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { SearchBox } from "@mapbox/search-js-react";
import useModalStore from "../../states/UseModalStore";
import MapBoxApi from "../../apis/MapBoxApi";
import { notificationApi } from "../../Notification/Notification";
import { FaDotCircle } from "react-icons/fa";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function UpdateMapModal() {
  const {
    isUpdateOpenMapModal,
    setIsUpdateOpenMapModal,
    setIsUpdatePhotoModal,
    selectedUpdatePhoto,
    updateSelectedUpdatePhotoField,
  } = useModalStore();

  const [selectedLocate, setSelectedLocate] = useState();
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [currentLocation, setCurrentLocation] = useState();
  const [viewState, setViewState] = useState({
    latitude: 10.762622,
    longitude: 106.66667,
    zoom: 14,
  });

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

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    // console.log("Clicked on:", lng, lat);
    searchByCoordinate.mutate({ longitude: lng, latitude: lat });
    setSelectedLocate({ latitude: lat, longitude: lng });
    setViewState((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleOk = () => {
    if (selectedLocate) {
      updateSelectedUpdatePhotoField("exif.latitude", selectedLocate.latitude);
      updateSelectedUpdatePhotoField(
        "exif.longitude",
        selectedLocate.longitude
      );

      updateSelectedUpdatePhotoField("address", selectedLocate.address);
    }
    setIsUpdateOpenMapModal(false);
    setIsUpdatePhotoModal(true);
  };

  const handleCancel = () => {
    setIsUpdateOpenMapModal(false);
    setIsUpdatePhotoModal(true);
  };

  const handleRetrieve = (res) => {
    if (res && res.features && res.features.length > 0) {
      // console.log("Retrieved:", res.features[0]);
      const feature = res.features[0];
      const { coordinates } = feature.geometry;
      const { full_address } = feature.properties;

      setSelectedLocate({
        latitude: coordinates[1],
        longitude: coordinates[0],
        address: full_address,
      });

      setViewState((prev) => ({
        ...prev,
        latitude: coordinates[1],
        longitude: coordinates[0],
      }));
    }
  };
  function getCurrentLocation() {
    setIsLoadingCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setViewState((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          setIsLoadingCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsLoadingCurrentLocation(false);
          if (currentLocation || isOpenMapModal) return;
          notificationApi(
            "error",
            "Lỗi",
            "Không thể xác định vị trí hiện tại của bạn",
            "",
            0,
            "get-current-location-error"
          );
        }
      );
    } else {
      setIsLoadingCurrentLocation(false);
      notificationApi(
        "error",
        "Lỗi",
        "Trình duyệt không hỗ trợ xác định vị trí hiện tại",
        "",
        0,
        "get-current-location-error"
      );
    }
  }
  const backToCurrentLocate = () => {
    setViewState((prev) => ({
      ...prev,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }));
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);
  return (
    <Modal
      title="Chọn vị trí"
      visible={isUpdateOpenMapModal}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      centered={true}
      bodyStyle={{ padding: 0 }}
    >
      <div className="relative w-full h-[80vh] max-h-[600px]">
        <div className="absolute w-full md:w-1/4 top-3 right-3 flex flex-row items-center z-10">
          <Tooltip
            title={
              isLoadingCurrentLocation
                ? "Đang xác định vị trí hiện tại"
                : "Nhấn để xác định vị trí hiện tại"
            }
          >
            <Button
              className="bg-white shadow-md flex items-center justify-center mx-2"
              onClick={() => backToCurrentLocate()}
              icon={
                isLoadingCurrentLocation ? (
                  <Spin size="small" />
                ) : (
                  <IoLocationSharp fontSize={22} color="red" />
                )
              }
            />
          </Tooltip>
          <SearchBox
            accessToken={MAPBOX_TOKEN}
            onRetrieve={handleRetrieve}
            options={{
              language: "vi",
              country: "vn",
              proximity: {
                lng: viewState.longitude,
                lat: viewState.latitude,
              },
            }}
            placeholder="Tìm kiếm địa điểm..."
            value={selectedLocate?.address || ""}
          />
        </div>
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
        >
          {selectedLocate && (
            <>
              <Marker
                latitude={selectedLocate.latitude}
                longitude={selectedLocate.longitude}
                anchor="bottom"
              >
                <div></div>
                <IoLocationSharp fontSize={39} color="red" />
              </Marker>
              <Popup
                latitude={selectedLocate.latitude}
                longitude={selectedLocate.longitude}
                anchor="top"
                closeOnClick={false}
                closeButton={false}
              >
                <div className="-my-2">
                  <h2>{selectedLocate.address}</h2>
                </div>
              </Popup>
            </>
          )}
          {currentLocation && (
            <>
              <Marker
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                anchor="bottom"
              >
                <div className="marker-btn cursor-pointer shadow-lg">
                  <FaDotCircle fontSize={viewState.zoom * 2} color="#13b9f0" />
                </div>
              </Marker>
              <Popup
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                anchor="top"
                closeOnClick={false}
                closeButton={false}
              >
                <div className="-my-2">
                  <h2>Vị trí hiện tại của bạn</h2>
                </div>
              </Popup>
            </>
          )}
        </Map>
      </div>
    </Modal>
  );
}
