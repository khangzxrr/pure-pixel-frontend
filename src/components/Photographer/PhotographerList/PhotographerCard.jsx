import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlOptions } from "react-icons/sl";
import PhotoApi from "../../../apis/PhotoApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegMessage } from "react-icons/fa6";
import { MdBlock, MdReport } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import UseUserOtherStore from "../../../states/UseUserOtherStore";
import { useKeycloak } from "@react-keycloak/web";
import FollowButton from "../../ComFollow/FollowButton";
import { useModalState } from "../../../hooks/useModalState";
import ComReport from "../../ComReport/ComReport";
import { ConfigProvider, Modal } from "antd";
import LoginWarningModal from "../../ComLoginWarning/LoginWarningModal";

// Hàm để cắt ngắn câu quote nếu quá dài
const truncateQuote = (quote, maxLength) => {
  if (!quote) return "Không xác định";
  return quote.length > maxLength
    ? `${quote.substring(0, maxLength)}...`
    : quote;
};

const PhotographerCard = ({ photographer, maxQuoteLength = 30 }) => {
  const navigate = useNavigate();
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);

  const { keycloak } = useKeycloak();

  const userId = keycloak.tokenParsed?.sub;
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const queryClient = useQueryClient();
  const popupReport = useModalState();
  const {
    data: photoData = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["photographerPhotos", photographer.id],
    queryFn: () =>
      PhotoApi.getPublicPhotos(
        4,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        photographer.id
      ),
    staleTime: 300000,
    // enabled: !!userId,
  });

  const photos = photoData.objects || [];

  // Kiểm tra kiểu dữ liệu trước khi xử lý
  const randomPhotos =
    Array.isArray(photos) && photos.length > 0
      ? photos
      : Array(4).fill({
          signedUrl: {
            thumbnail:
              "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg",
          },
        }); // Thay thế bằng ảnh mặc định nếu không có ảnh
  const handleChatOnClick = () => {
    navigate(`/message?to=${photographer.id}`);
  };

  const handleLoginWarning = () => {
    setIsOpenLoginModal(true);
  };
  const handleCloseLoginWarning = () => {
    setIsOpenLoginModal(false);
  };
  return (
    <>
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
      {popupReport.isModalOpen && (
        <ComReport
          onclose={popupReport.handleClose}
          tile="Báo cáo nhiếp ảnh gia"
          id={photographer?.id}
          // reportType =USER, PHOTO, BOOKING, COMMENT;
          reportType={"USER"}
        />
      )}
      <div className=" flex flex-col w-full max-w-[340px] h-[450px] rounded-lg text-[#eee] bg-[#2f3136] group hover:cursor-pointer mx-auto">
        <div className="relative flex flex-col gap-3 p-5">
          <div className="grid grid-cols-2 grid-rows-2 gap-2 ">
            {randomPhotos.map((item, index) => (
              <div
                key={index}
                className="flex h-[100px] w-full justify-center items-center overflow-hidden rounded-lg"
              >
                <img
                  src={item.signedUrl?.thumbnail}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
            ))}
            <div className="absolute overflow-hidden outline outline-2 outline-[#202225] bg-[#eee] left-1/2 bottom-[43%] sm:left-[40%] transform -translate-x-1/2 md:translate-x-0  rounded-full w-[64px] h-[64px]">
              <img
                src={photographer.avatar}
                alt={photographer.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <div className="text-xl font-bold mt-8 text-center">
              <div
                onClick={() => {
                  navigate(`/user/${photographer.id}/photos`);
                  setNameUserOther(photographer.name);
                  setUserOtherId(photographer.id);
                }}
                className="hover:underline underline-offset-2 truncate max-w-[200px]"
              >
                {photographer.name || "Không xác định"}
              </div>
            </div>
            <div className="text-center text-sm font-normal">
              <div>“{truncateQuote(photographer.quote, maxQuoteLength)}”</div>
            </div>
            <div className="mt-5">
              <FollowButton userId={userId} photographer={photographer} />
            </div>
          </div>
          <div className="flex justify-end">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-full hover:bg-[#6b7280]  p-1 text-sm font-semibold text-gray-900 transition-colors duration-200">
                  <SlOptions className="text-[#eee] text-lg" />
                </MenuButton>
              </div>
              {keycloak.authenticated ? (
                <MenuItems
                  transition
                  className="absolute -right-4 top-7 z-10 mt-2 w-32 origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <div className="py-1">
                    <MenuItem>
                      <div
                        onClick={() => handleChatOnClick()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#36393f] transition-colors duration-200 data-[focus]:text-[#eee]"
                      >
                        <FaRegMessage className="font-bold text-lg" />
                        Nhắn tin
                      </div>
                    </MenuItem>
                    <MenuItem>
                      <div
                        onClick={() => {
                          popupReport.handleOpen();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 transition-colors duration-200 data-[focus]:text-[#eee]"
                      >
                        <MdReport className="font-bold text-xl" />
                        Báo cáo
                      </div>
                    </MenuItem>
                  </div>
                </MenuItems>
              ) : (
                <MenuItems
                  transition
                  className="absolute -right-4 top-7 z-10 mt-2 w-32 origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <div className="py-1">
                    <MenuItem>
                      <div
                        onClick={() => handleLoginWarning()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#36393f] transition-colors duration-200 data-[focus]:text-[#eee]"
                      >
                        <FaRegMessage className="font-bold text-lg" />
                        Nhắn tin
                      </div>
                    </MenuItem>
                    <MenuItem>
                      <div
                        onClick={() => handleLoginWarning()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 transition-colors duration-200 data-[focus]:text-[#eee]"
                      >
                        <MdReport className="font-bold text-xl" />
                        Báo cáo
                      </div>
                    </MenuItem>
                  </div>
                </MenuItems>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotographerCard;
