import React, { useEffect, useState } from "react";
import NotificationApi from "../../apis/NotificationApi";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";
import useNotificationStore from "../../states/UseNotificationStore";
import { notificationApi } from "../../Notification/Notification";
import { useKeycloak } from "@react-keycloak/web";
import BookingNotification from "./BookingNotification";
import PhotoNotification from "./PhotoNotification";
import PhotoBuyNotification from "./PhotoBuyNotification";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const NotificationModal = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const queryClient = useQueryClient();

  const { initSocket, socket } = useNotificationStore();

  const { keycloak } = useKeycloak();

  const showUpNotification = (data) => {
    notificationApi("info", data.title, data.content);
    console.log(data);
  };

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

  useEffect(() => {
    if (keycloak?.tokenParsed?.sub) {
      initSocket(keycloak.token);
    }
  }, [keycloak.tokenParsed]);

  useEffect(() => {
    async function showNotification(data) {
      showUpNotification(data);

      if (data.referenceType === "BAN") {
        keycloak.logout();
      }

      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["get-all-customer-bookings"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["customer-booking-detail"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["customer-booking-bill-items"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["get-all-photographer-booking"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["photographer-booking-detail"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["getTransactionById"],
      });
    }
    if (!socket) return;

    socket.on("notification-event", showNotification);

    return () => {
      socket.off("notification-event", showNotification);
    };
  }, [socket]);

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
  // const { data, isLoading, isError } = useQuery({
  //   queryKey: ["notifications"],
  //   queryFn: fetchNotifications,
  //   staleTime: 6000,
  //   cacheTime: 12000,
  // });
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: fetchNotifications,
      getNextPageParam: (lastPage, pages) => {
        // Số trang đã fetch
        const currentPage = pages.length;
        // Trả về số trang tiếp theo nếu còn ảnh
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });

  const notificationList = data?.pages
    ? data.pages.flatMap((page) => page.objects)
    : [];

  // const notificationList = data?.objects;

  console.log(notificationList);
  const renderContent = (notification) => {
    switch (notification.referenceType) {
      case "BOOKING":
        return (
          <BookingNotification
            onClose={onClose}
            notification={notification}
            key={notification.id}
          />
        );
      case "PHOTO_BUY":
        return (
          <PhotoBuyNotification
            notification={notification}
            key={notification.id}
          />
        );
      case "PHOTO":
        return (
          <PhotoNotification
            notification={notification}
            key={notification.id}
          />
        );
      default:
        return (
          <span className="text-gray-500">
            {notification.content} - Loại không xác định
          </span>
        );
    }
  };
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
        {isError && <div>Có gì đó đã sai, vui lòng thử lại</div>}
        <div
          id="modal-notification"
          className="font-normal px-1 flex-1 overflow-y-auto custom-scrollbar"
        >
          <InfiniteScroll
            dataLength={notificationList.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            scrollableTarget="modal-notification"
            endMessage={
              <p className="text-center">Không còn thông báo nào nữa</p>
            }
          >
            {notificationList.map((notification) =>
              renderContent(notification)
            )}
          </InfiniteScroll>
        </div>
        {isLoading && <Spin indicator={<LoadingOutlined spin />} />}
      </div>
    </div>
  ) : null;
};
export default NotificationModal;
