import React, { useEffect, useState } from "react";

const notifications = [
  { id: 1, name: "PurePixel" },
  { id: 2, name: "John Doe" },
  { id: 3, name: "Jane Smith" },
  { id: 4, name: "Alice Johnson Alice Johnson Alice Johnson" },
  { id: 5, name: "Bob Brown" },
  { id: 6, name: "Bob Brown" },
  { id: 7, name: "Bob Brown" },
  { id: 8, name: "Bob Brown" },
];

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

  return showModal ? (
    <div
      id="modal-overlay"
      className={`absolute inset-0 bg-black bg-opacity-50 z-40 flex justify-start transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClickOutside}
    >
      <div
        className={`bg-[#1b1b1b] text-[#eee] w-[400px] h-full flex flex-col transform transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <h2 className="text-xl font-semibold p-3">Thông báo</h2>
          <hr className="border-gray-500" />
        </div>
        <div className="font-normal px-1 flex-1 overflow-y-auto scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
          {notifications.map((notification) => (
            <div
              className="border-b border-gray-500 px-1 py-2"
              key={notification.id}
            >
              <div className="flex items-center gap-2 p-2 rounded-sm hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200">
                <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
                  <img
                    src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-[325px]">
                  <span className="font-bold">{notification.name}</span> đã bắt
                  đầu theo dõi bạn
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;
};

export default NotificationModal;
