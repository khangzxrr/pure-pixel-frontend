import { useKeycloak } from "@react-keycloak/web";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import PhotoApi from "../../apis/PhotoApi";
import UserService from "../../services/Keycloak";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import DetailUser from "../DetailUser/DetailUser";
import { useModalState } from "./../../hooks/useModalState";
import ComModal from "../../components/ComModal/ComModal";
import ComSharePhoto from "../../components/ComSharePhoto/ComSharePhoto";
import CommentPhoto from "../../components/CommentPhoto/CommentPhoto";
import { getData } from "../../apis/api";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ComReport from "../../components/ComReport/ComReport";
import LikeButton from "./../../components/ComLikeButton/LikeButton";
import { Blurhash, BlurhashCanvas } from "react-blurhash";

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

export default function DetailedPhotoView({ onClose, photo }) {
  const popup = useModalState();
  const popupReport = useModalState();
  const popupShare = useModalState();
  const navigate = useNavigate();

  const [blurhashWidth, setBlurhashWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [isExpanded, setIsExpanded] = useState(false);

  const [currentPhoto, setCurrentPhoto] = useState(photo);

  //this state will be true when original photo (signedUrk.url) fully isOriginalPhotoLoaded
  //then we will replace thumbnail image to original photo
  const [isOriginalPhotoLoaded, setIsOriginalphotoLoaded] = useState(false);

  const [isThumbnailPhotoLoaded, setIsThumbnailPhotoLoaded] = useState(false);

  const { data, isError, error } = useQuery({
    queryKey: ["getPhotoDetail", currentPhoto.id],
    queryFn: () => PhotoApi.getPhotoById(photo.id),
  });

  const { data: previousPhotoData } = useQuery({
    queryKey: ["getPreviousPhoto", currentPhoto.id],
    queryFn: () => PhotoApi.getPreviousPublicById(currentPhoto.id),
    enabled: !!currentPhoto.id,
  });

  const { data: nextPhotoData } = useQuery({
    queryKey: ["getNextPhoto", currentPhoto.id],
    queryFn: () => PhotoApi.getNextPublicById(currentPhoto.id),
    enabled: !!currentPhoto.id,
  });

  if (isError) {
    console.log(error);
    navigate("/404");
  }

  const imageDisplayDiv = useCallback((node) => {
    if (node != null) {
      console.log(node.getBoundingClientRect().height);
      setViewportHeight(node.getBoundingClientRect().height);
    }
  });

  useEffect(() => {
    console.log(`current photo changed!`);

    if (currentPhoto?.height) {
      const ratio = currentPhoto.height / viewportHeight;
      setBlurhashWidth(currentPhoto.width / ratio);
    }

    setIsThumbnailPhotoLoaded(false);
    setIsOriginalphotoLoaded(false);

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

  //PRELOAD: this is a workaround to prevent slow loading issue
  useEffect(() => {
    if (!previousPhotoData?.signedUrl) {
      return;
    }

    const image = new Image();
    image.src = previousPhotoData.signedUrl.thumbnail;
  }, [previousPhotoData]);

  //PRELOAD: this is a workaround to prevent slow loading issue
  useEffect(() => {
    if (!nextPhotoData?.signedUrl) {
      return;
    }

    const image = new Image();

    image.src = nextPhotoData.signedUrl.thumbnail;
  }, [nextPhotoData]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // Quay lại trang trước đó
    } else {
      navigate("/"); // Nếu không có trang trước, về trang chủ
    }
  };

  const handleNextButtonOnClick = () => {
    if (nextPhotoData?.objects.length > 0) {
      setCurrentPhoto(nextPhotoData.objects[0]);
    }
  };

  const handlePreviousButtonOnClick = () => {
    if (previousPhotoData?.objects.length > 0) {
      setCurrentPhoto(previousPhotoData.objects[0]);
    }
  };

  // Chuyển đổi đối tượng details thành mảng cặp khóa-giá trị
  const allDetails = Object?.entries(currentPhoto.exif || {});

  // // Lấy 3 thông số đầu tiên để hiển thị
  const mainDetails = allDetails?.slice(0, 3);

  const extraDetails = allDetails.slice(3);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 md:flex justify-center items-center z-50 w-screen overflow-y-auto">
        <ComModal
          isOpen={popupShare.isModalOpen}
          onClose={popupShare.handleClose}
        >
          <ComSharePhoto
            photoId={data?.id}
            userId={data?.photographer.id}
            onClose={popupShare.handleClose}
          />
        </ComModal>

        <div className="flex flex-col md:flex-row bg-black text-white md:h-screen w-screen">
          {/* Left side - Image */}
          <div className="flex-1 md:relative h-screen">
            {onClose ? (
              <button
                onClick={onClose}
                className="absolute top-4 left-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
              >
                <Icon>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </Icon>
              </button>
            ) : (
              <button
                onClick={handleGoBack}
                className="absolute top-4 left-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
              >
                <Icon>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </Icon>
              </button>
            )}
            <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px]  bg-opacity-50 hover:bg-opacity-75 hover:scale-110">
              <Icon>
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
              </Icon>
            </button>
            <div
              className="flex  justify-center items-center  h-screen"
              ref={imageDisplayDiv}
            >
              <Blurhash
                style={{
                  display:
                    isThumbnailPhotoLoaded || isOriginalPhotoLoaded
                      ? "none"
                      : null,
                }}
                hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                width={blurhashWidth}
                height={"100%"}
                punch={1}
              />
              <img
                src={currentPhoto.signedUrl.thumbnail}
                alt="Traunfall waterfall"
                className="w-auto h-full max-h-screen"
                style={{
                  display:
                    isOriginalPhotoLoaded || !isThumbnailPhotoLoaded
                      ? "none"
                      : null,
                }}
                onLoad={() => setIsThumbnailPhotoLoaded(true)}
              />

              {/* <img */}
              {/*   src={currentPhoto.signedUrl.url} */}
              {/*   alt="Traunfall waterfall" */}
              {/*   className="w-auto h-full max-h-screen" */}
              {/*   style={{ */}
              {/*     display: isOriginalPhotoLoaded ? null : "none", */}
              {/*   }} */}
              {/*   onLoad={() => { */}
              {/*     setIsThumbnailPhotoLoaded(true); */}
              {/*     setIsOriginalphotoLoaded(true); */}
              {/*   }} */}
              {/* /> */}
            </div>

            <button
              style={{
                display:
                  previousPhotoData?.objects.length === 0 ? "none" : null,
              }}
              onClick={() => handlePreviousButtonOnClick()}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
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
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
            >
              <Icon>
                <path d="M9 18l6-6-6-6" />
              </Icon>
            </button>
          </div>

          {/* Right side - Details */}
          <div className="w-full md:w-96 p-6 bg-zinc-900 overflow-y-auto scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={currentPhoto.photographer.avatar}
                  alt="GueM"
                  onClick={popup.handleOpen}
                  className="w-10 h-10 rounded-full cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg"
                />
                <div>
                  <h2
                    className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300"
                    onClick={popup.handleOpen}
                  >
                    {currentPhoto.photographer.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {calculateTimeFromNow(data?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex">
                {/* icon tin nhắn */}

                <button className="p-2 rounded-full hover:bg-gray-800">
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
              </div>
            </div>

            <div className="my-2">{currentPhoto.title}</div>
            <div className="my-2">{currentPhoto.description}</div>

            {/* <div className="my-2">{categoryName ? `#${categoryName}` : ""}</div> */}
            {/* TODO: add category */}

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center gap-2">
                {/* TODO: refresh Image */}
                {/* <LikeButton */}
                {/*   size="size-5" */}
                {/*   reloadData={getImage} */}
                {/*   photoId={selectedImage} */}
                {/*   key={selectedImage} */}
                {/* /> */}
                <span>{currentPhoto._count.votes}</span>
              </div>

              <button className="flex items-center hover:text-blue-500">
                <Icon className="mr-2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </Icon>

                {/* TODO: add comment count */}
                <span>{0}</span>
              </button>
              <div className="flex items-center">
                <Icon className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </Icon>
                <span>{currentPhoto.viewCount}</span>
              </div>
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
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem>
                    <button
                      onClick={() => {}}
                      className="block w-full px-3 text-left py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                    >
                      Lưu bài viết
                    </button>
                  </MenuItem>

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
              </Menu>
            </div>

            {/* <div className="space-y-4 mb-6">
              {["COMPOSITION", "CONTENT", "CREATIVITY", "TECHNIQUE"].map(
                (category, index) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm font-medium">{37 - index}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                            ? "bg-pink-500"
                            : index === 2
                            ? "bg-purple-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${37 - index}%` }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div> */}

            <h1 className="text-2xl font-bold mb-4">Thông số chi tiết</h1>
            <div className="space-y-2 mb-6">
              {/* Hiển thị 3 thông số đầu tiên */}
              {mainDetails.map(([key, value], index) => (
                <div className="flex items-start" key={index}>
                  <span className="font-semibold mr-2">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}

              {/* Hiển thị thông số còn lại khi mở rộng */}
              {isExpanded &&
                extraDetails.map(([key, value], index) => (
                  <div className="flex items-start" key={index}>
                    <span className="font-semibold mr-2">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>

            {/* Nút Xem thêm/Ẩn bớt */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className=" text-white rounded-md"
              >
                {isExpanded ? "Ẩn bớt" : "Xem thêm"}
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{0} Bình luận</h2>

              {/* TODO: refesh image */}
              {/* <CommentPhoto id={selectedImage} reload={getImage} /> */}
            </div>
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
          id={data?.id}
          // reportType =USER, PHOTO, BOOKING, COMMENT;
          reportType={"PHOTO"}
        />
      )}
    </>
  );
}
