import React, { useRef, useEffect, useState } from "react";
import { Camera, Users, Image, Flame } from "lucide-react";

export default function DetailUser() {
  const scrollContainerRef = useRef(null);
  const [selectedButton, setSelectedButton] = useState(1);

  const handleButtonClick = (buttonIndex) => {
    setSelectedButton(buttonIndex);
  };
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

  return (
    <div className="bg-[#373737] text-white max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="relative h-48 ">
        <img
          src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
          alt="Profile banner"
          className="w-full h-full object-cover px-3 pb-3 rounded-b-3xl"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" /> */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 flex items-center">
          <Camera className="w-5 h-5 mr-1" />
          <img
            src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
            alt="Dopa"
            className="w-24 h-24 rounded-full border-4 border-black"
          />
          <div className="ml-2 flex">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pt-16 pb-6">
        <h1 className="text-2xl font-bold text-center">Dopa</h1>
        <p className="text-gray-400 text-center">@Dopamontage2019</p>
        <div className="flex justify-center items-center mt-2 space-x-4">
          <div className="flex bg-[#4d4d4d] border-[#4c4c4c] px-4 py-1 justify-center border  items-center rounded-lg space-x-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-1" />
              <span>12,953</span>
            </div>
            <div className="flex items-center">
              <Image className="w-5 h-5 mr-1" />
              <span>153</span>
            </div>
          </div>
          <button className="bg-[#414141] text-[#fefefe] border border-[#4c4c4c] px-4 py-1 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-[#5a5a5a] hover:border-[#6a6a6a]">
            + Follow
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-3 bg-[#424242] rounded-lg pl-2 pt-2 ">
        <div className="flex border-b mr-2 mt-2 border-gray-800 bg-[#232325] rounded-lg p-1">
          <button
            className={`rounded-lg flex-1 py-2 px-4 text-center font-medium ${
              selectedButton === 1
                ? "bg-[#fefefe] bg-opacity-10"
                : "bg-transparent"
            }`}
            onClick={() => handleButtonClick(1)}
          >
            1. Packages
            <span
              className={`ml-1 px-1.5 py-1 rounded-lg text-xs ${
                selectedButton === 1 ? "bg-[#b7b7b7]" : "bg-[#2c2c2c]"
              }`}
            >
              06
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
            Photos
            <span
              className={`ml-1 px-1.5 py-1 rounded-lg text-xs ${
                selectedButton === 2 ? "bg-[#b7b7b7]" : "bg-[#2c2c2c]"
              }`}
            >
              2,095
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
        <div className="ml-4">
          <h2 className="text-2xl font-bold mb-2 text-center px-8">
            DISCOVER OUR SIX PACKAGES
          </h2>
          <p className="text-gray-400 mb-6 text-center px-8">
            Grand Opening. Voucher 15% for the first 10 Customers. Come with Us
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
              {/* Package 1 */}
              {[1, 2, 3, 4, 5, 6].map(() => (
                <div className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden select-none">
                  <img
                    src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
                    alt="Gói chụp Cá nhân"
                    draggable="false"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Gói chụp Cá nhân
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry...
                    </p>
                    <button className="text-blue-400 flex items-center">
                      <span className="mr-2">Book a Call</span>
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
              <div className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden select-none">
                <img
                  src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
                  alt="Gói chụp Cá nhân"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Gói chụp Cá nhân
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry...
                  </p>
                  <button className="text-blue-400 flex items-center">
                    <span className="mr-2">Book a Call</span>
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

              {/* Package 2 */}
              <div className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden select-none">
                <img
                  src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
                  alt="Gói chụp Kỷ yếu"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Gói chụp Kỷ yếu
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typeset...
                  </p>
                  <button className="text-blue-400 flex items-center">
                    <span className="mr-2">Book a Call</span>
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

              {/* Package 3 */}
              <div className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden select-none">
                <img
                  src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp"
                  alt="Gói chụp Sản phẩm"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Gói chụp Sản phẩm
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typeset...
                  </p>
                  <button className="text-blue-400 flex items-center">
                    <span className="mr-2">Book a Call</span>
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

              {/* Add more packages here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
