import * as React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import MapBoxApi from "../../apis/MapBoxApi";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModalState } from "../../hooks/useModalState";
import DetailedPhotoView from "../DetailPhoto/DetailPhoto";
import { Spin, Tooltip } from "antd";
import { notificationApi } from "../../Notification/Notification";
import { FaDotCircle } from "react-icons/fa";
import PhotoListByMap from "./components/PhotoListByMap";
import usePhotoMapStore from "../../states/UsePhotoMapStore";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Set your mapbox token here

function getZoomValue(zoom) {
  switch (true) {
    case zoom >= 17:
    case zoom >= 14:
      return 50; // Smallest value for highest zoom
    case zoom > 12:
      return 100;
    case zoom > 8:
      return 200;
    case zoom > 6:
      return 300;
    case zoom > 4:
      return 500;
    case zoom > 2:
      return 600;
    default:
      return 1000; // Largest value for the smallest zoom
  }
}

export default function PhotoMap() {
  const {
    addMultiplePhotosToList,
    setPhotoList,
    selectedPhoto,
    setSelectedPhoto,
    photoList,
    isFromPhotoDetailPage,
    setIsFromPhotoDetailPage,
  } = usePhotoMapStore(); // Use Zustand store
  const [isAddNewPhotoList, setIsAddNewPhotoList] = useState(false);
  const { setBeforeRoute } = useBeforeRouteDetailPhoto();
  const [totalPage, setTotalPage] = useState(1);
  const [selectedPhotoRatio, setSelectedPhotoRatio] = useState(0);
  const [currentLocate, setCurrentLocate] = useState(null);
  const limit = 88; // Set limit to 10
  const [page, setPage] = useState(1); // Set page to 0

  const [isStopped, setIsStopped] = useState(true);

  // Initialize viewState dynamically
  const [viewState, setViewState] = useState(() => ({
    latitude: selectedPhoto ? selectedPhoto.latitude : 10.844706068296105,
    longitude: selectedPhoto ? selectedPhoto.longitude : 106.79257343412127,
    zoom: 13,
  }));
  const navigate = useNavigate(); // Initialize useNavigate
  const queryClient = useQueryClient(); // Initialize the QueryClient
  const popupDetail = useModalState();
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const {
    data: photos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["photo-by-coordinates", limit, page, viewState], // Include viewState in queryKey
    queryFn: () =>
      MapBoxApi.getPhotoListByCoorddinate(
        page - 1,
        limit,
        viewState.longitude,
        viewState.latitude,
        getZoomValue(viewState.zoom)
      ),
    enabled: isStopped,
    keepPreviousData: true,
  });
  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
      setSelectedPhoto({
        ...sel,
        address: data.features[0].properties.full_address,
      });
    },
    onError: (error) => {},
  });
  // Function to handle map click and get coordinates
  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat; // Extract longitude and latitude
    setViewState({ longitude: lng, latitude: lat });
  };
  const selectedIndex = photoList.findIndex(
    (photoCheck) => photoCheck.id === selectedPhoto?.id
  );
  const handleSelectPhoto = (photo) => {
    setIsStopped(false);
    setSelectedPhoto(photo);
    setViewState((prev) => ({
      ...prev,
      latitude: photo.exif.latitude,
      longitude: photo.exif.longitude,
    }));
    searchByCoordinate.mutate({
      longitude: photo.exif.longitude,
      latitude: photo.exif.latitude,
    });

    // console.log(
    //   "check selected photo",
    //   page,
    //   totalPage,
    //   selectedIndex,
    //   photoList.length - 1
    // );

    // Check if selectedPhoto is the second-to-last element in photoList
    if (selectedIndex === photoList.length - 2 && page < totalPage) {
      // console.log("Next Page");
      setPage(page + 1);
      setIsAddNewPhotoList(true);
      setIsStopped(true);
      queryClient.invalidateQueries(
        ["photo-by-coordinates"],
        limit,
        page,
        viewState
      );
      refetch();
    }
  };
  // console.log("check selected photo", page, isAddNewPhotoList, isStopped);
  const handleMapMove = (event) => {
    setIsStopped(false);
    setViewState(event.viewState);
  };

  const handleMapMoveEnd = (event) => {
    setPage(1);
    setIsStopped(true);
    queryClient.invalidateQueries(["photo-by-coordinates"]);
  };
  const getCurrentPosition = () => {
    setIsLoadingCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocate(position.coords);
          setIsLoadingCurrentLocation(false);
        },
        (error) => {
          setIsLoadingCurrentLocation(false);
        }
      );
    } else {
      // console.error("Geolocation is not supported by this browser.");
      setIsLoadingCurrentLocation(false);
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
  const backToCurrentLocate = () => {
    if (
      currentLocate.latitude === viewState.latitude &&
      currentLocate.longitude === viewState.longitude
    )
      return;
    if (currentLocate) {
      queryClient.invalidateQueries(["photo-by-coordinates"]);
      setViewState((prev) => ({
        ...prev,
        latitude: currentLocate.latitude,
        longitude: currentLocate.longitude,
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

  //Take the width and height of an image
  const handleImageLoad = (event) => {
    const { width, height } = event.target; // Get width and height from the loaded image
    setSelectedPhotoRatio(height / width);
  };
  useEffect(() => {
    getCurrentPosition();
    if (!selectedPhoto && currentLocate) {
      setViewState((prev) => ({
        ...prev,
        latitude: currentLocate.latitude,
        longitude: currentLocate.longitude,
        zoom: 13,
      }));
      setIsLoadingCurrentLocation(false);
    }
  }, []);
  useEffect(() => {
    if (selectedPhoto && isFromPhotoDetailPage) {
      const newViewState = {
        ...viewState,
        latitude: selectedPhoto.latitude,
        longitude: selectedPhoto.longitude,
      };

      // Update viewState
      setViewState(newViewState);
    }
  }, [isFromPhotoDetailPage]);
  useEffect(() => {
    queryClient.invalidateQueries(["photo-by-coordinates"]);
  }, [viewState && isFromPhotoDetailPage]);

  useEffect(() => {
    if (isAddNewPhotoList && photos) {
      // console.log("add new photo list", photos);
      addMultiplePhotosToList(photos.objects);
      setIsAddNewPhotoList(false);
      setTotalPage(photos.totalPage);
    } else if (photos) {
      setPhotoList(photos.objects);
      setTotalPage(photos.totalPage);
    }
  }, [photos, isAddNewPhotoList]);
  return (
    <div className="relative w-full h-screen">
      {/* <ComModal
          isOpen={popupDetail.isModalOpen}
          // width={800}
          // className={"bg-black"}
        >
          <ComSharePhoto
            photoId={selectedPhoto?.id}
            userId={selectedPhoto?.photographer_id}
            onClose={popupDetail.handleClose}
          />
        </ComModal> */}
      {popupDetail.isModalOpen && selectedPhoto && (
        <DetailedPhotoView
          photo={selectedPhoto}
          onClose={() => popupDetail.handleClose()}
          onCloseToMap={() => popupDetail.handleClose()}
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
        {photoList &&
          photoList.length > 0 &&
          photoList.map((photo) => (
            <Marker
              key={photo.id}
              latitude={photo.exif.latitude}
              longitude={photo.exif.longitude}
              anchor="bottom"
            >
              <div
                className="marker-btn"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior (if applicable)
                  e.stopPropagation(); // Prevent event from propagating to parent elements
                  handleSelectPhoto(photo);
                }}
                style={{ cursor: "pointer" }}
              >
                <IoLocationSharp
                  fontSize={39}
                  color={
                    selectedPhoto && selectedPhoto.id === photo.id
                      ? "blue"
                      : "red"
                  }
                />{" "}
              </div>
            </Marker>
          ))}
        {currentLocate && (
          <Marker
            latitude={currentLocate.latitude}
            longitude={currentLocate.longitude}
            anchor="bottom"
          >
            <div className="marker-btn cursor-pointer shadow-lg">
              <FaDotCircle fontSize={viewState.zoom * 2} color="#13b9f0" />
            </div>

            <Popup
              latitude={currentLocate.latitude}
              longitude={currentLocate.longitude}
              closeButton={false} // Optionally hide close button
              closeOnClick={false} // Optionally keep it open when clicking outside
              anchor="top" // Position the popup above the marker
            >
              <div className="text-[#7cc2d9] -m-2 font-semibold">
                <h3>Vị trí của bạn</h3>
              </div>
            </Popup>
          </Marker>
        )}
      </Map>

      <div className="absolute w-full h-1/6 bottom-9 bg-[#36393f] flex items-center justify-center p-2 shadow-lg bg-opacity-80">
        <PhotoListByMap
          page={page}
          setPage={setPage}
          totalPage={totalPage}
          totalRecords={photos?.totalRecords}
          selectedPhoto={selectedPhoto}
          setIsStopped={setIsStopped}
          isAddNewPhotoList={isAddNewPhotoList}
          setIsAddNewPhotoList={setIsAddNewPhotoList}
          handleSelectPhoto={handleSelectPhoto}
        />
      </div>

      {selectedPhoto && selectedPhoto.id ? (
        <div
          className={`absolute ${
            selectedPhotoRatio > 1
              ? "w-1/3 md:w-1/5 h-fit"
              : "w-1/2 md:w-1/4 h-fit"
          } top-20 right-3 bg-[#36393f] text-[#eee] flex items-center justify-center p-4 shadow-lg bg-opacity-80 rounded-lg`}
        >
          <div className="flex flex-row items-center">
            <div
              className="flex flex-col h-full cursor-pointer"
              onClick={() => {
                setBeforeRoute("/explore/photo-map");
                popupDetail.handleOpen();
                setIsFromPhotoDetailPage(false);
                setIsStopped(true);
              }}
            >
              <p className="font-normal text-base">
                {!selectedPhotoRatio && selectedPhoto?.title?.length > 20
                  ? `${selectedPhoto.title.substring(0, 17)}...`
                  : selectedPhoto?.title}
              </p>
              <p className="font-normal text-sm mb-4">
                {selectedPhoto.address}
              </p>
              <div className="h-full w-full flex">
                <img
                  className="h-full w-full"
                  onLoad={handleImageLoad}
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.title}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Tooltip
        title={
          isLoadingCurrentLocation
            ? "Đang lấy vị trí hiện tại"
            : "Nhấn để về vị trí hiện tại"
        }
        color="red"
        placement="left"
      >
        <div
          className="absolute top-4 right-3 bg-white flex items-center justify-center p-2 shadow-md rounded-lg cursor-pointer"
          onClick={() => backToCurrentLocate()}
        >
          <div className="flex flex-row h-full text-gray-600">
            {isLoadingCurrentLocation ? (
              <Spin />
            ) : (
              <IoLocationSharp fontSize={22} color="red" />
            )}{" "}
            <a className="font-normal text-base">
              {isLoadingCurrentLocation
                ? "Đang lấy vị trí hiện tại"
                : "Trở về Vị trí hiện tại"}
            </a>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
