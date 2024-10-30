import * as React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import data from "./FakeJson.json";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import useMapboxState from "../../states/UseMapboxState";
import MapBoxApi from "../../apis/MapBoxApi";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here

export default function PhotoMap() {
  const { selectedLocate, setSelectedLocate } = useMapboxState(); // Use Zustand store
  const [limit, setLimit] = useState(10); // Set limit to 10
  const [viewState, setViewState] = useState({
    latitude: 11.16667,
    longitude: 106.66667,
    zoom: 4,
  });
  const navigate = useNavigate(); // Initialize useNavigate
  const {
    data: photos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photo-by-coordinates"],
    queryFn: () =>
      MapBoxApi.getPhotoListByCoorddinate(
        limit,
        viewState.longitude,
        viewState.latitude,
        viewState.zoom * 1000
      ),
  });
  // Function to handle map click and get coordinates
  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat; // Extract longitude and latitude
    console.log("Longitude:", lng, "Latitude:", lat); // Log the coordinates
    // setSelectedLocate({
    //   // Set the selectedLocate to the new coordinates
    //   id: 0,
    //   latitude: lat,
    //   longitude: lng,
    //   title: `Selected Location`,
    //   photo_url:
    //     "https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,h_128,dpr_3/https://assets.app.engoo.com/images/46KeGlDhxPjBnsp2yMivAh.png", // Placeholder image
    // });
  };
  const handleMapMove = (event) => {
    setViewState(event.viewState);

    console.log("Current Zoom Level:", event); // Log the current zoom level
  };
  useEffect(() => {
    if (selectedLocate) {
      console.log("Selected Location:", photos.exif, photos);

      setViewState((prev) => ({
        ...prev,
        latitude: selectedLocate.latitude,
        longitude: selectedLocate.longitude,
      }));
    }
  }, [selectedLocate]);
  return (
    <div className="relative w-full h-screen">
      <Map
        {...viewState} // Spread the current viewState for controlling the map
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick} // Handle map click
        onMove={(evt) => handleMapMove(evt)}
      >
        {photos &&
          photos.objects.length > 0 &&
          photos.objects.map((photo) => (
            <Marker
              key={photo.id}
              latitude={photo.exif.latitude}
              longitude={photo.exif.longitude}
              anchor="bottom"
            >
              <div
                className="marker-btn"
                onClick={() =>
                  setSelectedLocate({
                    id: photo.id,
                    title: photo.title,
                    photo_url: photo.signedUrl.url,
                    latitude: photo.exif.latitude,
                    longitude: photo.exif.longitude,
                  })
                } // Set the selectedLocate to the current photo
                style={{ cursor: "pointer" }}
              >
                <IoLocationSharp fontSize={39} color="red" />
              </div>
            </Marker>
          ))}
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

      <div className="absolute w-full h-1/6 bottom-9 bg-white flex items-center justify-center p-4 shadow-lg bg-opacity-80">
        <div className="flex flex-row w-full items-center">
          {photos &&
            photos.objects.length > 0 &&
            photos.objects.map((photo) => (
              <div
                key={photo.id}
                className={`flex h-24 w-full m-2 cursor-pointer text-black rounded-md ${
                  photo.id === selectedLocate?.id
                    ? "border-4 border-gray-400 transition duration-300"
                    : ""
                }`}
                onClick={() =>
                  setSelectedLocate({
                    id: photo.id,
                    title: photo.title,
                    photo_url: photo.signedUrl.url,
                    latitude: photo.exif.latitude,
                    longitude: photo.exif.longitude,
                  })
                }
              >
                <img
                  className="h-full w-full rounded-sm"
                  src={photo.signedUrl.url}
                  alt={photo.title}
                />
              </div>
            ))}
        </div>
      </div>

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
  );
}
