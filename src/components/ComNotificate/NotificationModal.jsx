import React, { useEffect, useState } from "react";
import NotificationApi from "../../apis/NotificationApi";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";
import BookingNotificate from "./BookingNotificate";
import BookingNotification from "./BookingNotification";

const NotificationModal = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      // Thêm timeout để đảm bảo modal đã render trước khi thêm lớp hiệu ứng
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Đợi một chút trước khi ẩn hoàn toàn modal để hoàn thành hiệu ứng
      const timeout = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };
  const limit = 10; // Tổng số ảnh
  const fetchNotifications = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const response = await NotificationApi.getAllNotifactions(
      validLimit,
      validPage
    );
    return response;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 60000,
    cacheTime: 300000,
  });

  const notificationList = data?.objects;

  return showModal ? (
    <div
      id="modal-overlay"
      className={`absolute inset-0 bg-black bg-opacity-50 z-40 flex justify-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClickOutside}
    >
      <div
        className={`bg-[#1b1b1b] text-[#eee] w-[300px] lg:w-[400px] h-full flex flex-col transform transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <h2 className="text-xl font-semibold p-3">Thông báo</h2>
          <hr className="border-gray-500" />
        </div>
        <div className="font-normal px-1 flex-1 overflow-y-auto custom-scrollbar">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {isError && <div>Something went wrong</div>}
          {notificationList.map((notification) => (
            <div
              className="border-b border-gray-500 px-1 py-2"
              key={notification.id}
            >
              {notification.referenceType === "BOOKING" ? (
                <BookingNotification notification={notification} />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-sm hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200">
                  <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
                    <img
                      src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-[225px] lg:w-[335px] text-sm lg:text-base">
                    {/* <span className="font-bold">{notification.name}</span> đã bắt
                  đầu theo dõi bạn */}
                    {notification.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;
};

export default NotificationModal;
