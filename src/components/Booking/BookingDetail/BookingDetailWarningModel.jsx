import React from "react";

const BookingDetailWarningModel = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 w-screen overflow-y-auto ">
      <div className="w-[400px] md:w-auto bg-[#43474f] rounded-lg  flex flex-col ">
        <div className="flex items-center justify-center bg-[#2b2e33] rounded-t-lg h-[50px]">
          Cảnh báo
        </div>
        <div className="flex flex-col items-center h-full justify-center p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="font-normal">
              Hãy chắn chắn rằng khách hàng
              <span className="font-bold"> đã thanh toán hóa đơn </span>
              này!
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 items-center px-4 py-2">
          <button
            onClick={onClose}
            className=" w-full text-red-500 px-2 py-1 rounded border border-red-500 hover:bg-red-500 hover:text-[#eee] transition duration-200"
          >
            Hủy
          </button>
          <button className="bg-[#eee] w-full text-[#202225] px-2 py-1 rounded hover:bg-[#a8a8a8] transition duration-200">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailWarningModel;
