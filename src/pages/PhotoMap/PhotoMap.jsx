import * as React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import MapBoxApi from "../../apis/MapBoxApi";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModalState } from "../../hooks/useModalState";
import ComModal from "../../components/ComModal/ComModal";
import ComSharePhoto from "../../components/ComSharePhoto/ComSharePhoto";
import DetailedPhotoView from "../DetailPhoto/DetailPhoto";
import { set } from "react-hook-form";
import { Tooltip } from "antd";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here
const getMultiplier = (zoom) => {
  if (zoom <= 4) {
    return 600;
  } else if (zoom <= 8) {
    return 300;
  } else if (zoom <= 14) {
    return 100;
  } else {
    return 1000;
  }
};
export default function PhotoMap() {
  const [selectedLocate, setSelectedLocate] = useState(null); // Use Zustand store
  const [currentLocate, setCurrentLocate] = useState(null); // Use Zustand store
  const [limit, setLimit] = useState(10); // Set limit to 10
  const [page, setPage] = useState(0); // Set page to 0
  const [viewState, setViewState] = useState({
    latitude: 16.406507897299164,
    longitude: 107.44773411517099,
    zoom: 6,
  });
  const navigate = useNavigate(); // Initialize useNavigate
  const queryClient = useQueryClient(); // Initialize the QueryClient
  const popupDetail = useModalState();

  const {
    data: photos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photo-by-coordinates", limit, page],
    queryFn: () =>
      MapBoxApi.getPhotoListByCoorddinate(
        page,
        limit,
        viewState.longitude,
        viewState.latitude,
        viewState.zoom * getMultiplier(viewState.zoom)
      ),
    keepPreviousData: true, // Add this option to keep previous data while fetching
  });
  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
      console.log(
        "Data:",
        data,
        data.features[0].properties.full_address,
        selectedLocate
      );

      setSelectedLocate({
        ...selectedLocate,
        address: data.features[0].properties.full_address,
      });
    },
    onError: (error) => {
      console.error("Error fetching address:", error);
    },
  });
  // Function to handle map click and get coordinates
  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat; // Extract longitude and latitude
    console.log("Longitude:", lng, "Latitude:", lat); // Log the coordinates
    setViewState({ longitude: lng, latitude: lat, zoom: 9 });
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
  const handleSelectPhoto = (photo) => {
    console.log("Selected Photo:", photo); // Log the selected photo

    setSelectedLocate({
      id: photo.id,
      photo_id: photo.id,
      photographer_id: photo.photographer.id,
      title: photo.title,
      photo_url: photo.signedUrl.thumbnail,
      latitude: photo.exif.latitude,
      longitude: photo.exif.longitude,
    });

    searchByCoordinate.mutate({
      longitude: photo.exif.longitude,
      latitude: photo.exif.latitude,
    });
  };

  const handleMapMove = (event) => {
    setViewState(event.viewState);

    console.log("Current Zoom Level:", event); // Log the current zoom level
  };

  const handleMapMoveEnd = (event) => {
    queryClient.invalidateQueries(["photo-by-coordinates"]);

    console.log("map move end", event); // Log the current zoom level
  };
  function setToCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prev) => ({
            ...prev,
            latitude,
            longitude,
            zoom: 11,
          }));
          queryClient.invalidateQueries(["photo-by-coordinates"]);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }
  useEffect(() => {
    if (selectedLocate) {
      console.log("Selected Location:", photos?.exif, photos);

      setViewState((prev) => ({
        ...prev,
        latitude: selectedLocate.latitude,
        longitude: selectedLocate.longitude,
        zoom: 12,
      }));
    }
  }, [selectedLocate]);
  // Get user's current location
  useEffect(() => {
    setToCurrentLocation();
  }, []);
  return (
    <div className="relative w-full h-screen">
      {/* <ComModal
        isOpen={popupDetail.isModalOpen}
        // width={800}
        // className={"bg-black"}
      >
        <ComSharePhoto
          photoId={selectedLocate?.id}
          userId={selectedLocate?.photographer_id}
          onClose={popupDetail.handleClose}
        />
      </ComModal> */}
      {popupDetail.isModalOpen && selectedLocate && (
        <DetailedPhotoView
          photo={selectedLocate}
          onClose={() => popupDetail.handleClose()}
          listImg={photos?.objects.length > 0 ? photos.objects : []}
        />
      )}
      <Map
        {...viewState} // Spread the current viewState for controlling the map
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick} // Handle map click
        onMove={(evt) => handleMapMove(evt)}
        onMoveEnd={(evt) => handleMapMoveEnd(evt)}
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
                onClick={() => handleSelectPhoto(photo)}
                style={{ cursor: "pointer" }}
              >
                <IoLocationSharp
                  fontSize={39}
                  color={
                    selectedLocate && selectedLocate.id === photo.id
                      ? "blue"
                      : "red"
                  }
                />{" "}
              </div>
            </Marker>
          ))}
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
                onClick={() => handleSelectPhoto(photo)}
              >
                <img
                  className="h-full w-full rounded-sm"
                  src={photo.signedUrl.thumbnail}
                  alt={photo.title}
                />
              </div>
            ))}
        </div>
      </div>

      {selectedLocate ? (
        <div className="absolute w-1/6 h-fit top-1/4 right-3 bg-white flex items-center justify-center p-2 shadow-lg bg-opacity-80 ">
          <div className="flex flex-row items-center">
            <div
              className="flex flex-col h-full m-2 cursor-pointer text-gray-600"
              onClick={() => {
                console.log("Selected Location:", selectedLocate.id);
                popupDetail.handleOpen();
              }}
            >
              <p className="font-normal text-base">
                {selectedLocate?.title?.length > 20
                  ? `${selectedLocate.title.substring(0, 17)}...`
                  : selectedLocate?.title}
              </p>
              <p className="font-normal text-sm">{selectedLocate.address}</p>
              <div className="h-full w-full flex">
                <img
                  className="h-full w-full"
                  src={selectedLocate.photo_url}
                  alt={selectedLocate.title}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Tooltip title="Nhấn để về vị trí hiện tại" color="red" placement="left">
        <div
          className="absolute top-4 right-3 bg-white flex items-center justify-center p-2 shadow-md rounded-lg cursor-pointer"
          onClick={() => setToCurrentLocation()}
        >
          <div className="flex flex-row h-full text-gray-600">
            <IoLocationSharp fontSize={22} color="red" />
            <a className="font-normal text-base">Vị trí hiện tại</a>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
