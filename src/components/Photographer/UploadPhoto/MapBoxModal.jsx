import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { SearchBox } from "@mapbox/search-js-react";
import { v4 as uuidv4 } from "uuid"; // For session token
import MapBoxApi from "../../../apis/MapBoxApi";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Set your mapbox token here

export default function MapBoxModal() {
  const {
    isOpenMapModal,
    setIsOpenMapModal,
    selectedPhoto,
    updatePhotoPropertyByUid,
  } = useUploadPhotoStore();

  const [selectedLocate, setSelectedLocate] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 11.16667,
    longitude: 106.66667,
    zoom: 14,
  });
  const sessionToken = uuidv4(); // Generate a session token

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
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
              title: "Vị trí hiện tại của bạn",
            });
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
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
  };

  const handleOk = async () => {
    if (selectedLocate) {
      updatePhotoPropertyByUid(selectedPhoto, "gps", {
        latitude: selectedLocate.latitude,
        longitude: selectedLocate.longitude,
      });
      updatePhotoPropertyByUid(selectedPhoto, "address", selectedLocate.title);
    }
    setIsOpenMapModal(false);
    //
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
          <div className="absolute w-1/4 top-3 right-3 flex flex-col items-center z-10">
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
