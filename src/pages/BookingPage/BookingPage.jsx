import React from "react";
import { useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();

  const handleBooking = (id) => {
    // Implement the booking logic here
    navigate(`/explore/booking-package/${id}`);
  };
  return (
    <div className="flex flex-col md:flex-row bg-gray-900 text-white p-6 md:p-8 rounded-lg space-y-6 md:space-y-0 md:space-x-8">
      {/* Image Section */}
      <div className="flex-1">
        <img
          src="https://faceinch.vn/upload/elfinder/%E1%BA%A2nh/studio-nhiep-anh-3.jpg" // Replace with the actual image path
          alt="Photography Package"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Details Section */}
      <div className="flex-1 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">GÓI CHỤP CÁ NHÂN</h2>
        <p className="text-2xl text-green-400 font-semibold mb-4">1.000.000đ</p>
        <p className="mb-2">
          <span className="font-bold">12 lượt</span>
        </p>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Trang phục</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>2 Váy Cưới</li>
            <li>2 Bộ Vest</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Dịch vụ</h3>
          <p>Trang điểm và làm tóc tại Studio</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Sản Phẩm</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>1 Album khổ 20×30 (hoặc 25×35)</li>
            <li>1 Ảnh cổng ép gỗ 60×90 cm</li>
            <li>1 Slideshow trình chiếu nhà hàng</li>
          </ul>
        </div>

        <button
          onClick={() => handleBooking("96db5cc6-ab32-490e-be65-b87507b22af0")}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Đặt lịch
        </button>
      </div>

      {/* Review Section */}
      <div className="flex flex-col items-start space-y-4">
        <h3 className="font-semibold mb-2">Review</h3>
        <div className="flex space-x-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-gray-800 p-4 rounded-lg"
            >
              <p className="text-yellow-400 text-2xl">★★★★★</p>
              <p>Đẹp</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
