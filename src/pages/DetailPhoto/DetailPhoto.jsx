import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import PhotoApi from "../../apis/PhotoApi";

import { useNavigate, useParams } from "react-router-dom";
import DetailUser from "../DetailUser/DetailUser";
import { useModalState } from "./../../hooks/useModalState";
import ComModal from "../../components/ComModal/ComModal";
import ComSharePhoto from "../../components/ComSharePhoto/ComSharePhoto";
import CommentPhoto from "../../components/CommentPhoto/CommentPhoto";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ComReport from "../../components/ComReport/ComReport";
import LikeButton from "./../../components/ComLikeButton/LikeButton";
import ExifList from "../../components/Photographer/UploadPhoto/ExifList";
import { Blurhash } from "react-blurhash";
import { motion } from "framer-motion";
import { useParentSize } from "@cutting/use-get-parent-size";
import LoginWarningModal from "../../components/ComLoginWarning/LoginWarningModal";
import { ConfigProvider, Modal, Skeleton } from "antd";
import { useKeycloak } from "@react-keycloak/web";
import { FaRegHeart } from "react-icons/fa6";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import TextWithShowMore from "./components/TextWithShowMore";
import UserService from "../../services/Keycloak";
import LoadingOval from "./../../components/LoadingSpinner/LoadingOval";
import usePhotoMapStore from "../../states/UsePhotoMapStore";
import Map, { Marker, Popup } from "react-map-gl";
import { IoLocationSharp } from "react-icons/io5";
import MapBoxApi from "../../apis/MapBoxApi";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";

const Icon = ({ children, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

function calculateTimeFromNow(dateString) {
  const startDate = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  if (!diffInMinutes) {
    return ``;
  }
  if (diffInDays >= 1) {
    return `${diffInDays} ngày`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} giờ`;
  } else {
    if (diffInMinutes < 0) {
      return `0 phút`;
    }
    return `${diffInMinutes} phút`;
  }
}

export default function DetailedPhotoView({ onClose, onCloseToMap, photo }) {
  const popup = useModalState();
  const popupReport = useModalState();
  const popupShare = useModalState();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const { id } = useParams();
  const [photoAddress, setPhotoAddress] = useState("");
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  const setNamePhotographer = UsePhotographerFilterStore(
    (state) => state.setNamePhotographer
  );
  const { setSelectedPhoto, setIsFromPhotoDetailPage } = usePhotoMapStore(); // Use Zustand store
  const { beforeRoute, setBeforeRoute } = useBeforeRouteDetailPhoto();
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setActiveTitle = UseUserProfileStore((state) => state.setActiveTitle);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const ref = useRef(null);
  const { width, height } = useParentSize(ref);
  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();
  const userData = UserService.getTokenParsed();

  const [currentPhoto, setCurrentPhoto] = useState(
    photo
      ? photo
      : {
          id,
        }
  );

  const photographerId = currentPhoto?.photographer?.id;
  const meId = userData?.sub;

  window.history.replaceState({}, null, `/photo/${currentPhoto.id}`);

  const [isOriginalPhotoLoaded, setIsOriginalPhotoLoaded] = useState(false);
  const [isThumbnailPhotoLoaded, setIsThumbnailPhotoLoaded] = useState(false);

  const { data, isPending, error, isError, isLoading } = useQuery({
    queryKey: ["getPhotoDetail", currentPhoto.id],
    queryFn: () => PhotoApi.getPhotoById(currentPhoto.id),
    enabled: !!currentPhoto?.id,
    retry: 1,
  });

  useEffect(() => {
    if (
      error?.response?.data?.message.includes("PrivatedException") ||
      error?.response?.data?.message.includes("BannedException")
    ) {
      navigate("/private-exception");
    }
  }, [isError, error]);

  const { data: previousPhotoData } = useQuery({
    queryKey: ["getPreviousPhoto", currentPhoto.id],
    queryFn: () => PhotoApi.getPreviousPublicById(currentPhoto.id),
    enabled: !!currentPhoto?.id,
  });

  const { data: nextPhotoData } = useQuery({
    queryKey: ["getNextPhoto", currentPhoto.id],
    queryFn: () => PhotoApi.getNextPublicById(currentPhoto.id),
    enabled: !!currentPhoto?.id,
  });

  // console.log(currentPhoto);

  useEffect(() => {
    if (!isPending && data !== currentPhoto) {
      setCurrentPhoto(data);

      const image = new Image();
      image.src = data?.signedUrl?.url;
      image.onload = () => onLoadedPhoto();

      const thumbnailImage = new Image();
      thumbnailImage.src = data?.signedUrl?.thumbnail;
      thumbnailImage.onload = () => onThumbnailPhotoLoaded();
    }
  }, [data, isPending]);

  useEffect(() => {
    if (currentPhoto.id) {
      // Khi modal mở, thêm lớp `overflow-hidden` vào body
      document.body.style.overflow = "hidden";
    } else {
      // Khi modal đóng, khôi phục lại cuộn
      document.body.style.overflow = "auto";
    }
    // Cleanup khi component bị unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentPhoto]);

  const refreshPhoto = () => {
    // console.log(`trigger refresh`);

    queryClient.invalidateQueries(["getPhotoDetail", currentPhoto.id]);
  };

  const handleGoBack = () => {
    if (beforeRoute === "") {
      navigate("/");
    } else {
      navigate(beforeRoute);
    }
  };

  const handleNextButtonOnClick = () => {
    if (nextPhotoData?.objects.length > 0) {
      setIsOriginalPhotoLoaded(false);
      setIsThumbnailPhotoLoaded(false);

      const nextPhoto = nextPhotoData.objects[0];

      setCurrentPhoto(nextPhoto);
    }
  };
  const handleFullScreen = () => {
    if (imageRef?.current?.requestFullscreen) {
      imageRef?.current?.requestFullscreen();
    } else if (imageRef?.current?.webkitRequestFullscreen) {
      /* Safari */
      imageRef?.current?.webkitRequestFullscreen();
    } else if (imageRef?.current?.msRequestFullscreen) {
      /* IE11 */
      imageRef?.current?.msRequestFullscreen();
    }
  };
  const handlePreviousButtonOnClick = () => {
    if (previousPhotoData?.objects.length > 0) {
      setIsOriginalPhotoLoaded(false);
      setIsThumbnailPhotoLoaded(false);
      setCurrentPhoto(previousPhotoData.objects[0]);
    }
  };

  const heightRatio = currentPhoto.height / height;

  let blurhashWidth = currentPhoto.width / heightRatio;
  if (blurhashWidth > width) {
    blurhashWidth = width;
  }

  const onThumbnailPhotoLoaded = () => {
    setIsThumbnailPhotoLoaded(true);
  };

  const onLoadedPhoto = () => {
    setIsOriginalPhotoLoaded(true);
  };

  const handleChatOnClick = () => {
    navigate(`/message?to=${currentPhoto?.photographer.id}`);
  };

  const handleLoginWarning = () => {
    setIsOpenLoginModal(true);
  };
  const handleCloseLoginWarning = () => {
    setIsOpenLoginModal(false);
  };
  const searchByCoordinate = useMutation({
    mutationFn: ({ longitude, latitude }) =>
      MapBoxApi.getAddressByCoordinate(longitude, latitude),
    onSuccess: (data) => {
      setPhotoAddress(data.features[0].properties.full_address);
    },
    onError: (error) => {
      console.error("Error fetching address:", error);
    },
  });
  useEffect(() => {
    if (currentPhoto?.exif?.longitude && currentPhoto?.exif?.latitude) {
      searchByCoordinate.mutate({
        longitude: currentPhoto.exif.longitude,
        latitude: currentPhoto.exif.latitude,
      });
    }
  }, [currentPhoto]);

  return (
    <div className={""}>
      <div
        className={`fixed inset-0 bg-black bg-opacity-80 md:flex justify-center items-center z-50 w-screen ${
          isPending ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div
          className={isError ? "hidden" : `md:flex justify-center items-center`}
        >
          <ComModal
            isOpen={popupShare.isModalOpen}
            onClose={popupShare.handleClose}
          >
            <ComSharePhoto
              photoId={currentPhoto?.id}
              userId={currentPhoto?.photographer?.id}
              onClose={popupShare.handleClose}
            />
          </ComModal>

          <ConfigProvider
            theme={{
              components: {
                Modal: {
                  contentBg: "#292b2f",
                  headerBg: "#292b2f",
                  titleColor: "white",
                },
              },
            }}
          >
            <Modal
              title=""
              visible={isOpenLoginModal} // Use state from Zustand store
              onCancel={handleCloseLoginWarning} // Close the modal on cancel
              footer={null}
              width={500} // Set the width of the modal
              centered={true}
              className="custom-close-icon"
            >
              <LoginWarningModal onCloseLogin={handleCloseLoginWarning} />
            </Modal>
          </ConfigProvider>
          <div className="flex flex-col md:flex-row bg-black text-white md:h-screen  w-screen">
            {/* Left side - Image */}

            <div className="flex-1 md:relative md:h-screen h-[50vh]">
              {onClose ? (
                <button
                  onClick={onClose}
                  className="z-10 absolute top-4 left-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
                >
                  <Icon>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </Icon>
                </button>
              ) : (
                <button
                  onClick={handleGoBack}
                  className="z-10 absolute top-4 left-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
                >
                  <Icon>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </Icon>
                </button>
              )}
              <button
                onClick={handleFullScreen}
                className="z-10 absolute top-4 right-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
              >
                <Icon>
                  <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
                </Icon>
                {/* nút phóng to ảnh */}
              </button>
              {isPending && (
                <div className="z-0 flex justify-center items-center h-[100vh] relative">
                  <LoadingOval />
                </div>
              )}
              <div
                ref={ref}
                className="z-0 flex justify-center items-center md:h-screen h-[50vh] relative"
              >
                {currentPhoto?.blurHash && (
                  <Blurhash
                    className="absolute"
                    hash={currentPhoto.blurHash}
                    height={height}
                    width={blurhashWidth}
                  />
                )}

                <img
                  src={
                    isOriginalPhotoLoaded ? currentPhoto?.signedUrl?.url : ""
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isThumbnailPhotoLoaded ? 1 : 0 }}
                  transition={{ opacity: { delay: 0.1, duration: 0.1 } }}
                  className="h-auto max-h-screen absolute w-auto"
                  lazy="lazy"
                />
                <img
                  ref={imageRef}
                  src={
                    !isOriginalPhotoLoaded
                      ? currentPhoto?.signedUrl?.placeholder
                      : currentPhoto?.signedUrl?.url
                  }
                  // alt={currentPhoto.title}
                  className="w-0 h-0"
                />
              </div>

              <button
                style={{
                  display:
                    previousPhotoData?.objects.length === 0 ? "none" : null,
                }}
                onClick={() => handlePreviousButtonOnClick()}
                className="absolute md:top-1/2 top-[27%] left-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
              >
                <Icon>
                  <path d="M15 18l-6-6 6-6" />
                </Icon>
              </button>
              <button
                style={{
                  display: nextPhotoData?.objects.length === 0 ? "none" : null,
                }}
                onClick={() => handleNextButtonOnClick()}
                className="absolute md:top-1/2 top-[27%] right-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
              >
                <Icon>
                  <path d="M9 18l6-6-6-6" />
                </Icon>
              </button>
            </div>

            {/* Right side - Details */}

            {isPending ? (
              <div className="w-full flex flex-col gap-5 md:w-96 p-6 bg-zinc-900 custom-scrollbar">
                <Skeleton.Input
                  style={{ opacity: 30, width: 350, height: 50 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
                <Skeleton.Input
                  style={{ opacity: 30, width: 350 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
                <Skeleton.Input
                  style={{ opacity: 30, width: 350 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
                <Skeleton.Input
                  style={{ opacity: 30, width: 350 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
                <Skeleton.Input
                  style={{ opacity: 30, width: 350, height: 300 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
                <Skeleton.Input
                  style={{ opacity: 30, width: 350, height: 100 }}
                  active={true}
                  size="small"
                  className="custom-skeleton-input"
                />
              </div>
            ) : (
              <div className="w-full md:w-96 p-6 bg-zinc-900 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentPhoto?.photographer?.avatar}
                      alt="GueM"
                      // onClick={popup.handleOpen}
                      className="w-10 h-10 rounded-full cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg"
                    />
                    <div>
                      <h2
                        className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300"
                        onClick={() => {
                          setNamePhotographer(currentPhoto?.photographer.name);
                          setNameUserOther(currentPhoto?.photographer.name);
                          setActiveTitle(null);
                          navigate(
                            `/user/${currentPhoto?.photographer.id}/photos`
                          );
                          setUserOtherId(currentPhoto?.photographer.id);
                        }}
                      >
                        {currentPhoto?.photographer?.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {calculateTimeFromNow(currentPhoto?.createdAt)} -{" "}
                        {currentPhoto.visibility === "PUBLIC"
                          ? "Công khai"
                          : "Riêng tư"}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {/* icon tin nhắn */}
                    {photographerId !== userData?.sub && (
                      <button
                        className="p-2 rounded-full hover:bg-gray-800"
                        onClick={() =>
                          keycloak.authenticated
                            ? handleChatOnClick()
                            : handleLoginWarning()
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          viewBox="0 0 50 50"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            d="M 25 2 C 12.347656 2 2 11.597656 2 23.5 C 2 30.007813 5.132813 35.785156 10 39.71875 L 10 48.65625 L 11.46875 47.875 L 18.6875 44.125 C 20.703125 44.664063 22.800781 45 25 45 C 37.652344 45 48 35.402344 48 23.5 C 48 11.597656 37.652344 2 25 2 Z M 25 4 C 36.644531 4 46 12.757813 46 23.5 C 46 34.242188 36.644531 43 25 43 C 22.835938 43 20.742188 42.6875 18.78125 42.125 L 18.40625 42.03125 L 18.0625 42.21875 L 12 45.375 L 12 38.8125 L 11.625 38.53125 C 6.960938 34.941406 4 29.539063 4 23.5 C 4 12.757813 13.355469 4 25 4 Z M 22.71875 17.71875 L 10.6875 30.46875 L 21.5 24.40625 L 27.28125 30.59375 L 39.15625 17.71875 L 28.625 23.625 Z"
                            fill="white"
                          ></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="my-2">{currentPhoto.title}</div>
                <div className="my-2 font-normal">
                  <TextWithShowMore description={currentPhoto.description} />
                </div>

                {/* <div className="my-2">{categoryName ? `#${categoryName}` : ""}</div> */}

                <div className="flex items-center space-x-6 mb-6">
                  {keycloak.authenticated ? (
                    <div className="flex items-center gap-2">
                      <LikeButton
                        size="size-5"
                        reloadData={() => refreshPhoto()}
                        photoId={currentPhoto.id}
                        key={currentPhoto.id}
                      />
                      <span>{currentPhoto?._count?.votes}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaRegHeart
                        className="size-5"
                        onClick={() => handleLoginWarning()}
                      />
                      <span>{currentPhoto?._count?.votes}</span>
                    </div>
                  )}

                  <button className="flex items-center hover:text-blue-500">
                    <Icon className="mr-2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </Icon>

                    <span>{currentPhoto?._count?.comments}</span>
                  </button>
                  {/* <div className="flex items-center">
                <Icon className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </Icon>
                <span>{currentPhoto?.viewCount}</span>
              </div> */}
                  <button
                    className="hover:text-green-500"
                    onClick={popupShare.handleOpen}
                  >
                    <Icon>
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </Icon>
                  </button>
                  {currentPhoto?.photographer?.id !== userData?.sub ? (
                    <Menu as="div" className="relative">
                      <MenuButton className="-m-1.5 flex items-center p-1.5">
                        <button className="hover:text-gray-400">
                          <Icon>
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </Icon>
                        </button>
                      </MenuButton>
                      {keycloak.authenticated ? (
                        <MenuItems
                          transition
                          className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                          {/* <MenuItem>
                      <button
                        onClick={() => {}}
                        className="block w-full px-3 text-left py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Lưu bài viết
                      </button>
                    </MenuItem> */}

                          <MenuItem>
                            <button
                              onClick={() => {
                                popupReport.handleOpen();
                              }}
                              className="block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                            >
                              Báo cáo bài viết
                            </button>
                          </MenuItem>
                        </MenuItems>
                      ) : (
                        <MenuItems
                          transition
                          className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                          {/* <MenuItem>
                      <button
                        onClick={() => {
                          handleLoginWarning();
                        }}
                        className="block w-full px-3 text-left py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Lưu bài viết
                      </button>
                    </MenuItem> */}

                          <MenuItem>
                            <button
                              onClick={() => {
                                handleLoginWarning();
                              }}
                              className="block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                            >
                              Báo cáo bài viết
                            </button>
                          </MenuItem>
                        </MenuItems>
                      )}
                    </Menu>
                  ) : (
                    ""
                  )}
                </div>

                <h1 className="text-2xl font-bold mb-4">Thông số chi tiết</h1>

                {currentPhoto?.exif && (
                  <div className="space-y-2 mb-6">
                    <ExifList exifData={currentPhoto?.exif} />
                  </div>
                )}
                {currentPhoto?.exif?.longitude &&
                  currentPhoto?.exif?.latitude && (
                    <div
                      className="relative p-4 my-4 w-full h-[40vh]"
                      onClick={() => {
                        setSelectedPhoto(currentPhoto);
                        setIsFromPhotoDetailPage(true);
                        navigate(`/explore/photo-map`);
                        onCloseToMap();
                        // onClose();
                      }}
                    >
                      <Map
                        viewState={{
                          latitude: currentPhoto?.exif.latitude,
                          longitude: currentPhoto?.exif.longitude,
                          zoom: 13,
                        }}
                        mapStyle="mapbox://styles/mapbox/streets-v9"
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                        style={{ width: "100%", height: "100%" }}
                        className="rounded-lg"
                      >
                        <>
                          <Marker
                            latitude={currentPhoto.exif.latitude}
                            longitude={currentPhoto.exif.longitude}
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
                            latitude={currentPhoto.exif.latitude}
                            longitude={currentPhoto.exif.longitude}
                            anchor="top"
                            closeOnClick={false}
                            closeButton={false}
                          >
                            <div style={{ cursor: "pointer" }}>
                              <h2 className="text-black">{photoAddress}</h2>
                            </div>
                          </Popup>
                        </>
                      </Map>
                    </div>
                  )}
                <div className="mb-6">
                  <CommentPhoto id={currentPhoto.id} reload={refreshPhoto} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {popup.isModalOpen && (
        <div className="fixed inset-0 flex items-stretch justify-between z-50 overflow-y-auto">
          <div
            className="w-full h-auto bg-[rgba(0,0,0,0.5)]"
            onClick={popup.handleClose}
          ></div>
          <div className="w-[700px]">
            <DetailUser
              id={currentPhoto.photographer.id}
              data={currentPhoto.photographer}
            />
          </div>
        </div>
      )}

      {popupReport.isModalOpen && (
        <ComReport
          onclose={popupReport.handleClose}
          tile="Báo cáo bài viết"
          id={currentPhoto?.id}
          // reportType =USER, PHOTO, BOOKING, COMMENT;
          reportType={"PHOTO"}
        />
      )}
    </div>
  );
}
