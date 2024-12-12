import React, { useEffect, useState } from "react";
import { Modal, Spin, Tooltip } from "antd";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { SearchBox } from "@mapbox/search-js-react";
import { v4 as uuidv4 } from "uuid"; // For session token
import MapBoxApi from "../../../apis/MapBoxApi";
import { notificationApi } from "../../../Notification/Notification";
import { FaDotCircle } from "react-icons/fa";
import useSellPhotoStore from "../../../states/UseSellPhotoState";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Set your mapbox token here

export default function MapBoxModal() {
  const {
    isOpenMapModal,
    setIsOpenMapModal,
    selectedPhoto,
    updatePhotoPropertyByUid,
  } = useSellPhotoStore();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [selectedLocate, setSelectedLocate] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 11.16667,
    longitude: 106.66667,
    zoom: 14,
  });
  const sessionToken = uuidv4(); // Generate a session token

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
    // console.log("currentLocate", currentLocate, viewState);
    if (
      currentLocation.latitude === viewState.latitude &&
      currentLocation.longitude === viewState.longitude
    )
      return;
    if (currentLocation) {
      setViewState((prev) => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        zoom: 13,
      }));
      setPage(1);
    } else {
      notificationApi(
        "info",
        "Thông báo",
        "Vui lòng cho phép vị trí để có trải nghiệm tốt hơn",
        "",
        0,
        "get-current-location-noti"
      );
    }
  };
  // Get user's current location
  useEffect(() => {
    getCurrentLocation();
    if (currentLocation) {
      setViewState((prev) => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }));
    }
  }, []);

  // Update viewState whenever selectedLocate changes
  useEffect(() => {
    if (selectedLocate) {
      setViewState((prev) => ({
        ...prev,
        latitude: selectedLocate.latitude,
        longitude: selectedLocate.longitude,
      }));
    }
  }, [selectedLocate]);
  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
      setSelectedLocate({
        ...selectedLocate,
        title: data.features[0].properties.full_address,
      });
    },
    onError: (error) => {
      console.error("Error fetching address:", error);
    },
  });

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    searchByCoordinate.mutate({ longitude: lng, latitude: lat });
    setSelectedLocate({ latitude: lat, longitude: lng });
    setViewState((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleOk = async () => {
    if (selectedLocate) {
      console.log("Selected location:", selectedLocate);
      // Update photo properties with new location data
      await updatePhotoPropertyByUid(
        selectedPhoto,
        "exif.latitude",
        selectedLocate.latitude
      );
      await updatePhotoPropertyByUid(
        selectedPhoto,
        "exif.longitude",
        selectedLocate.longitude
      );

      await updatePhotoPropertyByUid(
        selectedPhoto,
        "address",
        selectedLocate.title
      );
    }

    // Close the map modal
    setIsOpenMapModal(false);
  };

  const handleCancel = () => {
    setIsOpenMapModal(false);
  };

  const handleRetrieve = (res) => {
    console.log("Selected location:", res);

    if (res && res.features && res.features.length > 0) {
      const feature = res.features[0];
      const { coordinates } = feature.geometry;
      const { full_address } = feature.properties;

      // Set the selected location based on retrieved data
      setSelectedLocate({
        latitude: coordinates[1],
        longitude: coordinates[0],
        title: full_address,
      });

      // Adjust the map view to the selected location
      setViewState((prev) => ({
        ...prev,
        latitude: coordinates[1],
        longitude: coordinates[0],
      }));
    }
  };

  return (
    <Modal
      title="Chọn vị trí"
      visible={isOpenMapModal}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      centered={true}
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex w-full h-full">
        <div className="relative w-full h-[80vh] max-h-[600px]">
          {/* Add SearchBox for location search */}
          <div className="absolute w-1/3 top-3 right-3 flex flex-row items-center z-10">
            <Tooltip
              title={
                isLoadingCurrentLocation
                  ? "Đang trở về vị trí hiện tại"
                  : "Nhấn để về vị trí hiện tại"
              }
              color="red"
              placement="left"
            >
              <div
                className=" bg-white flex items-center justify-center mx-3 p-2 shadow-md rounded-lg cursor-pointer"
                onClick={() => {
                  backToCurrentLocate(); // Explicitly call the function onClick
                }}
              >
                <div className="flex flex-row h-full text-gray-600">
                  {isLoadingCurrentLocation ? (
                    <Spin />
                  ) : (
                    <IoLocationSharp fontSize={22} color="red" />
                  )}
                </div>
              </div>
            </Tooltip>
            <SearchBox
              accessToken={MAPBOX_TOKEN}
              onRetrieve={handleRetrieve} // Handle the selection of a suggestion
              options={{
                language: "vi",
                country: "vn",
                proximity: {
                  lng: viewState.longitude,
                  lat: viewState.latitude,
                },
              }}
              placeholder="Tìm kiếm địa điểm..."
              value={selectedLocate?.title || ""}
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
            {currentLocation && (
              <>
                <Marker
                  latitude={currentLocation.latitude}
                  longitude={currentLocation.longitude}
                  anchor="bottom"
                >
                  <div className="marker-btn cursor-pointer shadow-lg">
                    <FaDotCircle
                      fontSize={viewState.zoom * 2}
                      color="#13b9f0"
                    />
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
            {selectedLocate && (
              <>
                <Marker
                  latitude={selectedLocate.latitude}
                  longitude={selectedLocate.longitude}
                  anchor="bottom"
                >
                  <div className="marker-btn" style={{ cursor: "pointer" }}>
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
                    <h2>{selectedLocate.title}</h2>
                  </div>
                </Popup>
              </>
            )}
          </Map>
        </div>
      </div>
    </Modal>
  );
}
