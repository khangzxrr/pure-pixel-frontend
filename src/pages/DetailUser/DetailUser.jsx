import React, { useRef, useEffect, useState } from "react";
import { Camera, Users, Image, Flame } from "lucide-react";
import { getData } from "./../../apis/api";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaRegHeart } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import UseUserOtherStore from "../../states/UseUserOtherStore";

export default function DetailUser({ id, data }) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [selectedButton, setSelectedButton] = useState(1);
  const [dataUser, setDataUser] = useState({});
  const [packages, setPackage] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [numberPhoto, setNumberPhoto] = useState(0);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const handleButtonClick = (buttonIndex) => {
    setSelectedButton(buttonIndex);
  };

  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, []);
  useEffect(() => {
    setDataUser(data);
    getData(`/photoshoot-package/photographer/${id}?limit=10&page=0`)
      .then((e) => {
        setPackage(e?.data?.objects);
      })
      .catch((error) => {
        console.log(error);
      });
    const loadInitialData = async () => {
      const initialProducts = await getPhotos(page);
      setPhotos([...photos, ...initialProducts]);
    };
    loadInitialData();
  }, [id]);

  const getPhotos = async (page) => {
    try {
      const response = await getData(
        `/photo/public?limit=9999&page=${page}&photographerId=${id}`
      );
      setNumberPhoto(response?.data.totalRecord);

      return response?.data?.objects;
    } catch (error) {
      return [];
    }
  };
  const fetchMorePhotos = async () => {
    // console.log(123);

    const newProducts = await getPhotos(page + 1);
    if (newProducts.length === 0) {
      setHasMore(false); // No more data to load
    } else {
      setPhotos([...photos, ...newProducts]);
      setPage(page + 1);
    }
  };

  const handlePhotoOnClick = (photo) => {
    // console.log(photo);
    navigate(`/photo/${photo.id}`);
  };
  return (
    <div className="bg-[#373737] text-white h-screen overflow-y-auto w-[690px]">
      {/* Header */}
      <div className="relative h-48 ">
        <img
          src={dataUser?.cover}
          alt={dataUser?.name}
          className="w-full h-full object-cover px-3 pb-3 rounded-b-3xl"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" /> */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 flex items-center">
          <Camera className="w-5 h-5 mr-1" />
          <img
            src={dataUser?.avatar}
            alt={dataUser?.name}
            className="w-24 h-24 rounded-full border-4 border-black bg-black"
          />
          <div className="ml-2 flex">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pt-16 pb-6">
        <h1
          onClick={() => (
            navigate(`/user/${dataUser?.id}/photos`),
            setNameUserOther(dataUser?.name),
            setUserOtherId(dataUser?.id)
          )}
          className="text-2xl font-bold text-center hover:underline hover:cursor-pointer underline-offset-2"
        >
          {dataUser?.name}
        </h1>
        <p className="text-gray-400 text-center">{dataUser?.quote}</p>
        <div className="flex justify-center items-center mt-2 space-x-4">
          <div className="flex bg-[#4d4d4d] border-[#4c4c4c] px-4 py-1 justify-center border  items-center rounded-lg space-x-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-1" />
              <span>12,953</span>
            </div>
            <div className="flex items-center">
              <Image className="w-5 h-5 mr-1" />
              <span> {numberPhoto}</span>
            </div>
          </div>
          <button className="bg-[#414141] text-[#fefefe] border border-[#4c4c4c] px-4 py-1 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-[#5a5a5a] hover:border-[#6a6a6a]">
            + Follow
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-3 bg-[#424242] rounded-lg pl-2 pt-2 ">
        <div className="flex border-b mx-2 mt-2 border-gray-800 bg-[#232325] rounded-lg p-1">
          <button
            className={`rounded-lg flex-1 py-2 px-4 text-center font-medium ${
              selectedButton === 1
                ? "bg-[#fefefe] bg-opacity-10"
                : "bg-transparent"
            }`}
            onClick={() => handleButtonClick(1)}
          >
            Dịch vụ
            <span
              className={`ml-1 px-1.5 py-1 rounded-lg text-xs ${
                selectedButton === 1 ? "bg-[#b7b7b7]" : "bg-[#2c2c2c]"
              }`}
            >
              {packages.length}
            </span>
          </button>
          <button
            className={`rounded-lg flex-1 py-2 px-4 text-center font-medium ${
              selectedButton === 2
                ? "bg-[#fefefe] bg-opacity-10"
                : "bg-transparent"
            }`}
            onClick={() => handleButtonClick(2)}
          >
            Hình ảnh
            <span
              className={`ml-1 px-1.5 py-1 rounded-lg text-xs ${
                selectedButton === 2 ? "bg-[#b7b7b7]" : "bg-[#2c2c2c]"
              }`}
            >
              {numberPhoto}
            </span>
          </button>
          <button
            className={`rounded-lg flex-1 py-2 px-4 text-center font-medium ${
              selectedButton === 3
                ? "bg-[#fefefe] bg-opacity-10"
                : "bg-transparent"
            }`}
            onClick={() => handleButtonClick(3)}
          >
            Albums
            <span
              className={`ml-1 px-1.5 py-1 rounded-lg text-xs ${
                selectedButton === 3 ? "bg-[#b7b7b7]" : "bg-[#2c2c2c]"
              }`}
            >
              12
            </span>
          </button>
        </div>
        {/* Packages */}
        {selectedButton === 1 && (
          <div className="ml-4">
            <h2 className="text-2xl font-bold mb-2 text-center px-8 py-4">
              Các gói của chúng tôi
            </h2>
            <p className="text-gray-400 mb-6 text-center px-8">
              Grand Opening. Voucher 15% for the first 10 Customers. Come with
              Us
            </p>

            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-4 pb-4 cursor-grab active:cursor-grabbing"
                style={{
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {packages.map((e, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden select-none"
                  >
                    <img
                      src={e.thumbnail}
                      alt="Gói chụp Cá nhân"
                      draggable="false"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{e.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{e.subtitle}</p>
                      <button className="text-blue-400 flex items-center">
                        <span className="mr-2">Chi tiết</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {packages.length === 0 && (
                <>
                  <div className="text-center h-14">
                    Hiện tại chưa có dịch vụ nào
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {selectedButton === 2 && (
          <div className="mx-4 mt-2">
            {
              <InfiniteScroll
                dataLength={photos.length}
                next={fetchMorePhotos}
                hasMore={hasMore}
                scrollThreshold={0.1}
                scrollableTarget="inspiration"
                loader={
                  <div className="flex justify-center mt-4">
                    <LoadingSpinner />
                  </div>
                }
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden hover:cursor-pointer hover:shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-shadow duration-300"
                  >
                    <img
                      src={photo.signedUrl.thumbnail}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-auto object-cover"
                      onClick={() => handlePhotoOnClick(photo)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-16 ">
                      <div className="flex justify-between w-full px-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full overflow-hidden outline outline-1 outline-white">
                            <img
                              src={photo.photographer.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>{photo.photographer.name || "Tên tác giả"}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FaRegHeart className="size-7" />
                            {photo._count?.votes || 0}
                          </div>
                          <div className="flex items-center gap-2">
                            <FiShare2 className="size-7" />
                            {0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </InfiniteScroll>
            }
          </div>
        )}
        {selectedButton === 3 && (
          <div className="ml-4">
            <h2 className="text-2xl font-bold mb-2 text-center px-8 py-4">
              DISCOVER OUR SIX PACKAGES
            </h2>
            <p className="text-gray-400 mb-6 text-center px-8">
              Grand Opening. Voucher 15% for the first 10 Customers. Come with
              Us
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
