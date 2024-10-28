import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import MapBoxApi from "../../../apis/MapBoxApi";
import { TbLocationSearch } from "react-icons/tb";
import { set } from "react-hook-form";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here

export default function MapBoxModal() {
  const {
    isOpenMapModal,
    setIsOpenMapModal,
    selectedPhoto,
    updatePhotoPropertyByUid,
  } = useUploadPhotoStore();

  const [selectedLocate, setSelectedLocate] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [viewState, setViewState] = useState({
    latitude: 11.16667,
    longitude: 106.66667,
    zoom: 14,
  });

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
      console.log(
        "Address data fetched successfully:",
        data.features[0].properties
      );
    },
    onError: (error) => {
      console.error("Error fetching address:", error);
    },
  });

  const searchByAddresss = useMutation({
    mutationFn: (address) => MapBoxApi.getCoordinateByAddress(address),
    onSuccess: (data) => {
      setSearchResult(data?.features);
      console.log("Address data fetched successfully:", data);
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
    // setSelectedLocate(null);
    setSearchInput("");
    setSearchResult([]);
    setIsOpenMapModal(false);
  };

  const handleCancel = () => {
    setIsOpenMapModal(false);
  };

  const handleSearch = () => {
    searchByAddresss.mutate(searchInput);
  };

  return (
    <Modal
      title="Chọn vị trí"
      visible={isOpenMapModal}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex w-full h-full">
        <div className="relative w-full h-[80vh] max-h-[600px]">
          <Map
            {...viewState} // Spread the current viewState for controlling the map
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            onMove={(evt) => setViewState(evt.viewState)} // Update viewState on map movement
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
                  closeOnClick={false} // Prevent closing on map click
                  closeButton={false} // Remove the close button
                >
                  <div style={{ cursor: "pointer" }}>
                    <h2>{selectedLocate.title}</h2>
                  </div>
                </Popup>
              </>
            )}
          </Map>
          {/* Search bar and results */}
          <div className="absolute w-1/4 top-3 right-3 flex flex-col items-center justify-center">
            <div className="flex flex-row items-center w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded-l-lg bg-opacity-80"
                placeholder="Search location"
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white rounded-r-xl"
              >
                <TbLocationSearch />
              </button>
            </div>
            {searchResult.length > 0 && (
              <div className="w-full flex flex-col items-center justify-center">
                {searchResult.map((result) => (
                  <div
                    key={result.id}
                    className="w-full p-1 bg-white hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSearchResult([]);
                      setSearchInput("");
                      setSelectedLocate({
                        latitude: result.geometry.coordinates[1],
                        longitude: result.geometry.coordinates[0],
                        title: result.properties.full_address,
                      });
                    }}
                  >
                    <div className="    flex flex-row justify-center items-center px-1">
                      <div className="w-1/12 flex justify-center items-center h-full">
                        <IoLocationSharp fontSize={19} color="red" />
                      </div>
                      <div className="w-11/12">
                        <p className="">{result.properties.full_address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
