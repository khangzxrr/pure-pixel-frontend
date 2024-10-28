import React from "react";
import { Modal, List, message } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here

export default function MapBoxModal() {
  const {
    isOpenMapModal,
    setIsOpenMapModal,
    selectedPhoto,
    updatePhotoPropertyByUid,
  } = useUploadPhotoStore();
  const { selectedLocate, setSelectedLocate } = useState();
  const navigate = useNavigate();
  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat; // Extract longitude and latitude
    console.log("Longitude:", lng, "Latitude:", lat); // Log the coordinates
    setSelectedLocate({
      // Set the selectedLocate to the new coordinates
      id: 0,
      latitude: lat,
      longitude: lng,
      title: `Selected Location`,
      photo_url:
        "https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,h_128,dpr_3/https://assets.app.engoo.com/images/46KeGlDhxPjBnsp2yMivAh.png", // Placeholder image
    });
  };
  const handleOk = async () => {
    message.success("saved all uploaded photos!");
    navigate("/my-photo/photo/all");
    setIsOpenMapModal(false);
  };

  const handleCancel = () => {
    setIsOpenMapModal(false);
  };

  return (
    <div>
      <Modal
        title="Bản thảo"
        visible={isOpenMapModal}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <div className="relative w-full h-screen">
          <Map
            initialViewState={{
              latitude: 11.16667,
              longitude: 106.66667,
              zoom: 14,
            }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            onClick={handleMapClick} // Handle map click
          >
            {selectedLocate ? (
              <Marker
                key={selectedLocate.id}
                latitude={selectedLocate.latitude}
                longitude={selectedLocate.longitude}
                anchor="bottom"
              >
                <div className="marker-btn" style={{ cursor: "pointer" }}>
                  <IoLocationSharp fontSize={39} color="yellow" />
                </div>
              </Marker>
            ) : null}
          </Map>

          {selectedLocate ? (
            <div className="absolute w-1/6 h-1/3 bottom-1/3 right-3 bg-white flex items-center justify-center p-2 shadow-lg bg-opacity-80">
              <div className="flex flex-row items-center">
                <div
                  className="flex flex-col h-full m-2 cursor-pointer text-gray-600"
                  onClick={() => {
                    navigate(`/explore/inspiration`);
                  }} // Navigate to another route
                >
                  <p className="font-normal">{selectedLocate.title}</p>

                  <img
                    className="h-full w-full"
                    src={selectedLocate.photo_url}
                    alt={selectedLocate.title}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
